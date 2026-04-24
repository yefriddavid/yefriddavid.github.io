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
Encapsula la conexión, reconexión automática y distribución de mensajes. **Responsabilidad exclusiva: transporte.** No toma decisiones de persistencia.
- **Patrón:** Observador — los componentes se suscriben y reciben cada mensaje de posición.
- **Reconexión:** Backoff exponencial con jitter, máximo 30 segundos entre intentos. Se reconecta también al recuperar el foco de ventana.
- **Ciclo de vida:** `subscribe()` inicia la conexión y retorna una función de limpieza. `disconnect()` debe llamarse cuando ya no hay suscriptores activos; de lo contrario el socket queda abierto al navegar a otras vistas. El servicio expone `listenerCount` para que el cleanup pueda tomar esa decisión.

### 2. Capa de UI (`src/views/taxis/MapLocation/MapLocation.js`)
Responsable exclusivamente de la visualización y de coordinar las fuentes de datos.
- **Sin estado de posiciones local:** Lee posiciones actuales del slice `currentPositions` de Redux.
- **Sin acceso directo a Firebase:** Toda interacción con Firestore se delega a sagas o al hook `useVehicleLocationSnapshot`.
- **`vehiclesRef`:** El handler del WebSocket necesita resolver `plate → vehicleId` consultando el inventario de vehículos. Como el handler vive en un closure de `useEffect`, leer `vehicles` directamente capturaría el valor del primer render (stale closure). Por eso se mantiene un `vehiclesRef = useRef(vehicles)` sincronizado en un `useEffect` separado, y el handler lee `vehiclesRef.current`.
- **`refreshTime` interval:** `formatTimeAgo` es una función que depende del tiempo actual. Para que el texto "hace X min" se actualice visualmente sin nuevos datos del servidor, el componente mantiene un `setInterval` local de 5 segundos que incrementa un contador de estado. Esto fuerza re-renders periódicos sin afectar el store de Redux.
- **Dispatch al recibir datos del WebSocket:** despacha `updateFromWss` a `currentPositions` y delega la decisión de persistir al utilitario `locationThrottle`.

### 3. Slice de Posiciones Actuales (`src/reducers/taxi/currentPositionsReducer.js`)
Slice dedicado exclusivamente al mapa `vehicleId → posición actual`.
- **Responsabilidad:** Mantener la última posición conocida de cada vehículo, con su fuente (`wss` o `app`) y timestamp.
- **Separación de concerns:** Completamente independiente del histórico de ubicaciones (CRUD).
- **Lógica de precedencia (anti-jitter):** Centralizada aquí — ver sección correspondiente.

### 4. Sagas (`src/sagas/taxi/vehicleLocationHistorySagas.js`)
Responsables únicamente de la persistencia y del histórico paginado.
- **Responsabilidad:** Coordinar escrituras a Firebase y consultar el histórico para la tabla de registros.
- **No gestionan la conexión WebSocket** para evitar problemas de ciclo de vida.
- **No pueblan el mapa:** La carga de posiciones para el mapa es responsabilidad del hook `useVehicleLocationSnapshot`.

### 5. Hook de Posiciones en Tiempo Real (`src/hooks/useVehicleLocationSnapshot.js`)
Encapsula el listener `onSnapshot` de Firestore para la fuente secundaria (app móvil).
- **Responsabilidad:** Escuchar en tiempo real documentos con `source: 'app'` y despachar actualizaciones al slice `currentPositions`.
- **Filtro de fuente:** El filtro `source !== 'wss'` se aplica en el **callback de JavaScript**, no en la query de Firestore. Firestore soporta `!=` pero no permite combinarlo con `orderBy` en un campo diferente — intentar añadirlo al `where` causaría un error en tiempo de ejecución.
- **Excepción a `firestoreCall`:** Este hook es el único lugar del proyecto donde `onSnapshot` se usa sin pasar por el wrapper `firestoreCall` de `firebaseClient.js`. Eso es intencional: `firestoreCall` envuelve promesas de una sola llamada; `onSnapshot` es un listener persistente y no puede adaptarse a ese patrón. El manejo de errores de auth (`permission-denied`, `unauthenticated`) se implementa en el callback `onError` del propio listener, que debe redirigir a `/login` de forma consistente con el resto del proyecto.

### 6. Utilitario de Throttle (`src/utils/locationThrottle.js`)
Gestiona la decisión de cuándo persistir una posición recibida por WebSocket.
- **Responsabilidad:** Exponer una función `shouldPersist(vehicleId): boolean` que retorna `true` si han pasado ≥ 30 segundos desde la última escritura de ese vehículo.
- **Por qué no en `WebSocketService`:** El servicio de transporte no debe tomar decisiones de persistencia. Mezclar ambas responsabilidades haría el servicio más difícil de mantener y de testear.
- **Por qué no en `useRef`:** Un `useRef` se resetea cuando el componente se desmonta. Al regresar al mapa se perdería el historial de throttle y se generaría una ráfaga de escrituras simultáneas. Al vivir como un `Map` a nivel de módulo, el throttle sobrevive entre mounts.

---

## Fuentes de Datos y sus Roles

| Fuente | Tipo | Rol |
|---|---|---|
| WebSocket (WSS) | Antena GPS | Posición en tiempo real, prioridad absoluta |
| Firebase `onSnapshot` | App móvil del conductor | Posición en tiempo real, fuente secundaria |
| Firebase histórico (Saga) | Registros guardados | Tabla de historial paginado, NO el mapa |

La carga inicial del mapa la realiza el `onSnapshot`: al suscribirse, Firestore entrega inmediatamente los documentos existentes que coinciden con la query (evento `added` para cada uno), antes de que lleguen nuevas actualizaciones. No se necesita una precarga adicional por Saga para el mapa.

---

## Flujo de Datos

### Fuente primaria — WebSocket
```
Antena GPS → WebSocketService → handler en MapLocation
  → vehiclesRef.current resuelve plate → vehicleId
  → dispatch(currentPositionsActions.updateFromWss(payload))
      → currentPositionsReducer actualiza el mapa (prioridad absoluta)
  → locationThrottle.shouldPersist(vehicleId)?
      → sí: dispatch(vehicleLocationHistoryActions.createRequest(payload))
              → Saga escribe en Firebase con source: 'wss'
      → no: omitir
```

### Fuente secundaria — App móvil
```
App conductor → Firebase write (source: 'app')
  → onSnapshot dispara (en useVehicleLocationSnapshot)
      → callback JS filtra: if (doc.source === 'wss') return
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

Esta lógica elimina la dependencia de ventanas de tiempo reemplazándola por una regla determinista basada en la fuente del dato.

---

## Throttle de Persistencia (`src/utils/locationThrottle.js`)

Cada mensaje del WebSocket **no genera una escritura en Firebase**. La función `shouldPersist(vehicleId)` retorna `true` solo si han pasado ≥ 30 segundos desde la última escritura registrada para ese vehículo.

Esto reduce el volumen de escrituras de O(mensajes/s × vehículos) a O(vehículos / 30s), manteniendo una traza de trayecto útil sin saturar Firestore.

```js
// src/utils/locationThrottle.js
const lastPersistTime = new Map()
const THROTTLE_MS = 30_000

export function shouldPersist(vehicleId) {
  const last = lastPersistTime.get(vehicleId) ?? 0
  if (Date.now() - last >= THROTTLE_MS) {
    lastPersistTime.set(vehicleId, Date.now())
    return true
  }
  return false
}
```

---

## Manejo de Errores en `useVehicleLocationSnapshot`

El hook debe implementar el callback `onError` de `onSnapshot` para manejar fallos del listener:

- **`permission-denied` / `unauthenticated`:** Llamar a `signOut()` y redirigir a `/login`, igual que hace `firestoreCall` en el resto del proyecto.
- **`unavailable` / `deadline-exceeded`:** Loggear el error. Firestore reintenta la conexión automáticamente — no es necesario reiniciar el listener manualmente.
- **Cualquier otro error:** Loggear y mantener el último estado conocido en el mapa sin limpiar las posiciones.

---

## Velocidad

El campo `speed` se calcula en el cliente a partir de la delta de coordenadas y tiempo entre dos mensajes consecutivos del mismo vehículo:

```
speed = haversineDistance(prevCoords, newCoords) / deltaTime  [km/h]
```

Si el servidor WSS incluye `speed` en el payload, se usa directamente y se omite el cálculo.

---

## Proyección de Flota Completa

El `useMemo` en el componente proyecta el inventario completo de vehículos sobre el estado de `currentPositions`. Los vehículos sin posición conocida se incluyen en la lista lateral con `lat/lng: null` para garantizar visibilidad de toda la flota, diferenciando entre "activo en mapa" y "sin reporte".

---

## Antigüedad de Posición (Staleness)

Una posición no actualizada durante más de N minutos no indica necesariamente que el vehículo esté detenido — puede significar pérdida de señal. El componente calcula `minutesSinceLastUpdate` y aplica una clase visual al ícono:

- **< 5 min:** normal (verde/gris según fuente)
- **5–15 min:** advertencia (ícono atenuado)
- **> 15 min:** sin señal (ícono gris oscuro, tooltip "Sin reporte hace X min")

Los vehículos en estado "sin señal" **no se eliminan del mapa** — siguen mostrando la última posición conocida para no perder el rastro de la flota.

---

## Filtro de Antigüedad en `onSnapshot`

El `onSnapshot` entrega los documentos existentes al suscribirse, incluyendo potencialmente registros de días anteriores. La query del hook debe excluirlos filtrando por `timestamp >= inicio del día operativo actual`:

```js
const startOfDay = new Date()
startOfDay.setHours(0, 0, 0, 0)

where('timestamp', '>=', Timestamp.fromDate(startOfDay))
```

Esta restricción aplica solo al mapa. La tabla de historial paginado usa su propio rango de fechas, gestionado por la saga.

---

## Ciclo de Vida y Limpieza

```
Montar MapLocation
  → useEffect: taxiWebSocket.subscribe(handler)     → retorna unsubscribe
  → useEffect: useVehicleLocationSnapshot()         → retorna unsubscribe de onSnapshot
  → useEffect: setInterval(refreshTime, 5000)       → retorna clearInterval

Desmontar MapLocation
  → cleanup: unsubscribe WSS listener
  → cleanup: unsubscribe onSnapshot
  → cleanup: clearInterval refreshTime
  → if (taxiWebSocket.listenerCount === 0) taxiWebSocket.disconnect()
```

El `WebSocketService` expone `listenerCount` para que el cleanup pueda decidir si cerrar la conexión o solo eliminar el listener (en caso de que otra vista también esté suscrita).

---

## Glosario

### WebSocket / WSS
Protocolo de comunicación que mantiene una **conexión bidireccional persistente** entre el servidor y el cliente. A diferencia de HTTP (donde el cliente pregunta y el servidor responde), WebSocket permite que el servidor envíe datos al cliente en cualquier momento sin que este los solicite. `WSS` es la variante segura (cifrada con TLS), equivalente a HTTPS pero para WebSockets.

En este sistema, la antena GPS de cada vehículo reporta su posición al servidor WSS, que la reenvía instantáneamente a todos los clientes conectados. Esto hace que la latencia sea de milisegundos, versus los segundos que tomaría hacer polling periódico a Firebase.

---

### Backoff Exponencial
Estrategia de reintento donde el tiempo de espera entre intentos **crece exponencialmente** en lugar de ser fijo. Si la primera reconexión espera 1 segundo, la segunda espera 2, la tercera 4, la cuarta 8, y así sucesivamente hasta un máximo (30 segundos en este sistema). El **jitter** (ruido aleatorio sumado al delay) evita que múltiples clientes que perdieron conexión al mismo tiempo intenten reconectarse todos a la vez, lo que saturaría el servidor.

Sin backoff, un corte de red haría que todos los clientes bombardeen el servidor con reconexiones simultáneas al volver la señal.

---

### Anti-jitter
En el contexto de este sistema, "jitter" no se refiere a variación en coordenadas GPS sino a **actualizaciones de datos fuera de orden** que llegan por distintas fuentes. Cuando el WebSocket envía una posición y la persiste en Firebase, el listener `onSnapshot` puede recibir ese mismo dato segundos después y sobrescribir la posición en el mapa con información "más vieja" que la que ya tenemos.

La lógica anti-jitter en `currentPositionsReducer` previene esto mediante reglas de precedencia deterministas: WSS siempre gana, y Firebase solo puede actualizar si su dato es más reciente y la fuente actual no es WSS.

---

### Stale Closure
Problema de JavaScript donde una función "recuerda" el valor de una variable del momento en que fue creada, en lugar del valor actual. En React, los callbacks dentro de `useEffect` capturan el estado y las props del render en que se crearon — si el estado cambia después, el callback sigue viendo el valor antiguo (stale = rancio/viejo).

En este sistema, el handler del WebSocket se crea una sola vez (el `useEffect` tiene `[]` como dependencias). Si leyera `vehicles` directamente, siempre vería el valor del primer render, incluso si la lista de vehículos se cargó después. El `vehiclesRef` resuelve esto: es un objeto mutable cuyo `.current` se actualiza en cada render, y el handler lee `vehiclesRef.current` en lugar de `vehicles` directamente.

---

### Throttle
Técnica que limita con qué frecuencia se ejecuta una operación costosa. En este sistema, cada mensaje del WebSocket podría generar una escritura en Firestore — lo que con 10 vehículos reportando cada segundo se traduciría en 10 escrituras/segundo. El throttle por vehículo garantiza que, sin importar cuántos mensajes lleguen, se persiste **como máximo una vez cada 30 segundos por vehículo**. Los mensajes intermedios se usan para actualizar el mapa en tiempo real pero se descartan para efectos de persistencia.

El estado del throttle vive en un `Map` a nivel de módulo (`locationThrottle.js`) para que sobreviva entre montajes y desmontajes del componente.

### `onSnapshot`
Función de Firestore que abre un **listener en tiempo real** sobre una colección. A diferencia de `getDocs` (consulta única), `onSnapshot` mantiene una conexión abierta y ejecuta el callback en dos momentos:

1. **Al conectarse:** entrega inmediatamente todos los documentos existentes que coinciden con la query (evento `added` por cada uno). Esto reemplaza la necesidad de una carga inicial separada.
2. **Ante cada cambio:** cuando se agrega, modifica o elimina un documento en Firestore, el callback se dispara con los cambios incrementales.

En este sistema se usa para recibir posiciones reportadas por la app móvil del conductor (`source: 'app'`). Retorna una función `unsubscribe` que debe llamarse al desmontar el componente para cerrar la conexión y evitar memory leaks.
