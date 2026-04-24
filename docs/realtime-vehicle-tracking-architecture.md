# Arquitectura de Ubicación en Tiempo Real

Este documento describe la arquitectura para la gestión de ubicaciones de vehículos en tiempo real, combinando datos de WebSockets (baja latencia) y Firebase (persistencia y fuente secundaria via app móvil).

---

## Motivación y Principios de Diseño

### Por qué esta arquitectura

La implementación anterior en `MapLocation.js` importaba `db`, `onSnapshot` y otras utilidades de Firebase directamente en el componente. Esto genera varios problemas:

- **Acoplamiento fuerte:** el componente conoce detalles de infraestructura (Firestore, colecciones, queries) que no le corresponden.
- **Imposibilidad de testear:** un componente con Firebase embebido no se puede probar en aislamiento sin mockear la capa de infraestructura.
- **Violación de capas:** la vista mezcla responsabilidades de UI con acceso a datos.
- **Loop de escritura silencioso:** WSS escribe en Firebase, Firebase notifica al componente, el componente vuelve a actualizar el estado — sin una separación clara, este ciclo es difícil de detectar y controlar.

### Regla fundamental

> **Los componentes de vista (`src/views/`) nunca importan desde `src/services/providers/firebase/` ni acceden directamente a Firestore.**

Todo acceso a Firebase ocurre en sagas, hooks especializados o servicios de la capa de datos. El componente solo despacha acciones y lee del store de Redux.

---

## Componentes Principales

### 1. WebSocketService (`src/services/websocketService.js`)
Encapsula la conexión, reconexión automática y distribución de mensajes.
- **Responsabilidad:** Mantener una conexión persistente al servidor WSS y notificar a los suscriptores.
- **Patrón:** Observador — los componentes se suscriben y reciben cada mensaje de posición.
- **Reconexión:** Backoff exponencial con jitter, máximo 30 segundos entre intentos. Se reconecta también al recuperar el foco de ventana.
- **Ciclo de vida:** `subscribe()` inicia la conexión y retorna una función de limpieza. El componente suscriptor **debe llamar a `disconnect()` en el cleanup del `useEffect`** cuando ya no hay suscriptores activos; de lo contrario el socket queda abierto al navegar a otras vistas.

### 2. Capa de UI (`src/views/taxis/MapLocation/MapLocation.js`)
Responsable de la visualización y de coordinar las fuentes de datos.
- **Estado efímero:** Lee posiciones actuales del slice `currentPositions` de Redux (no gestiona `locations` localmente).
- **Sin acceso directo a Firebase:** Toda interacción con Firestore se delega a sagas o a un hook dedicado; el componente no importa `db` ni `onSnapshot`.
- **Dispatch:** Despacha acciones de Redux al recibir datos del WebSocket.

### 3. Slice de Posiciones Actuales (`src/reducers/taxi/currentPositionsReducer.js`)
Slice dedicado exclusivamente al mapa `vehicleId → posición actual`.
- **Responsabilidad:** Mantener la última posición conocida de cada vehículo, con su fuente (`wss` o `app`) y timestamp.
- **Separación de concerns:** Completamente independiente del histórico de ubicaciones (CRUD).
- **Lógica de precedencia (anti-jitter):** Centralizada aquí, aplica la regla: WSS siempre gana; Firebase/app solo actualiza si el dato entrante es más reciente que el existente y la fuente actual no es `wss`.

### 4. Sagas y Servicios (`src/sagas/taxi/vehicleLocationHistorySagas.js`)
Responsables de la persistencia y del histórico paginado.
- **Responsabilidad:** Coordinar escrituras a Firebase y consultar el histórico para la tabla de registros.
- **No gestionan la conexión WebSocket** para evitar problemas de ciclo de vida.
- **No pueblan el mapa:** La carga de posiciones para el mapa es responsabilidad del `onSnapshot` hook, no de la saga.

### 5. Hook de Posiciones en Tiempo Real (`src/hooks/useVehicleLocationSnapshot.js`)
Encapsula el listener `onSnapshot` de Firestore para la fuente secundaria (app móvil).
- **Responsabilidad:** Escuchar en tiempo real los documentos con `source: 'app'` y despachar actualizaciones al slice `currentPositions`.
- **Filtro crítico:** Solo procesa documentos donde `source !== 'wss'`. Los registros originados en el WebSocket se ignoran deliberadamente para cortar el loop de escritura (`WSS → Firebase write → onSnapshot → re-update`).

---

## Fuentes de Datos y sus Roles

| Fuente | Tipo | Rol |
|---|---|---|
| WebSocket (WSS) | Antena GPS | Posición en tiempo real, prioridad absoluta |
| Firebase `onSnapshot` | App móvil del conductor | Posición en tiempo real, fuente secundaria |
| Firebase histórico (Saga) | Registros guardados | Tabla de historial paginado, NO el mapa |

La carga inicial del mapa la realiza el `onSnapshot`: al conectarse, el listener recibe los documentos recientes existentes antes de que lleguen nuevas actualizaciones. No se necesita una precarga adicional por Saga para el mapa.

---

## Flujo de Datos

### Fuente primaria — WebSocket
```
Antena GPS → WebSocketService → MapLocation
  → dispatch(currentPositionsActions.updateFromWss(payload))
    → currentPositionsReducer actualiza el mapa
  → dispatch(vehicleLocationHistoryActions.createRequest(payload))  [throttled]
    → Saga escribe en Firebase con source: 'wss'
```

### Fuente secundaria — App móvil
```
App conductor → Firebase write (source: 'app')
  → onSnapshot (filtra source !== 'wss')
    → dispatch(currentPositionsActions.updateFromApp(payload))
      → currentPositionsReducer aplica lógica de precedencia
```

---

## Reglas de Precedencia en `currentPositionsReducer`

Para cada actualización entrante de un vehículo:

1. Si `source === 'wss'`: actualizar siempre, sin condición.
2. Si `source === 'app'`:
   - Si el vehículo no tiene posición previa: actualizar.
   - Si la posición existente tiene `source === 'wss'`: descartar.
   - Si la posición existente tiene `source === 'app'` y el timestamp entrante es más reciente: actualizar.

Esta lógica elimina la dependencia de ventanas de tiempo (el antiguo "5 segundos") reemplazándola por una regla determinista basada en la fuente del dato.

---

## Throttle de Persistencia

Cada mensaje del WebSocket **no genera una escritura en Firebase**. Antes del `dispatch(createRequest)` se aplica un throttle **por vehículo** con una ventana de 30 segundos:

- Si han pasado menos de 30 s desde la última escritura de ese vehículo: se omite.
- Si han pasado 30 s o más: se persiste.

Esto reduce el volumen de escrituras de O(mensajes/s × vehículos) a O(vehículos / 30s), manteniendo una traza de trayecto útil sin saturar Firestore.

El estado del throttle (último timestamp persistido por vehículo) se gestiona en un `useRef` dentro del componente, ya que es dato efímero de sesión, no de store.

---

## Velocidad

El campo `speed` se calcula en el cliente a partir de la delta de coordenadas y tiempo entre dos mensajes consecutivos del mismo vehículo:

```
speed = haversineDistance(prevCoords, newCoords) / deltaTime  [km/h]
```

No se confía en que el servidor WSS envíe este valor. Si el servidor lo provee en el payload, se usa directamente y se omite el cálculo.

---

## Proyección de Flota Completa

El `useMemo` en el componente proyecta el inventario completo de vehículos sobre el estado de `currentPositions`. Los vehículos sin posición conocida se incluyen en la lista lateral con `lat/lng: null` para garantizar visibilidad de toda la flota, diferenciando entre "activo en mapa" y "sin reporte".

---

## Ciclo de Vida y Limpieza

```
Montar MapLocation
  → useEffect: taxiWebSocket.subscribe(handler)  → retorna unsubscribe
  → useEffect: useVehicleLocationSnapshot()      → retorna unsubscribe de onSnapshot

Desmontar MapLocation
  → cleanup: unsubscribe WSS listener
  → cleanup: unsubscribe onSnapshot
  → if (taxiWebSocket.listenerCount === 0) taxiWebSocket.disconnect()
```

El `WebSocketService` expone `listenerCount` para que el cleanup pueda decidir si cerrar la conexión o solo eliminar el listener (en caso de que otra vista también esté suscrita).
