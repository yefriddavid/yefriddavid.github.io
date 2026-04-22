# Arquitectura de Ubicación en Tiempo Real

Este documento describe la arquitectura para la gestión de ubicaciones de vehículos en tiempo real, que combina datos de WebSockets (baja latencia) y Firebase (persistencia histórica).

## Componentes Principales

### 1. WebSocketService (`src/services/websocketService.js`)
Encapsula la lógica de conexión, reconexión automática y suscripción.
- **Responsabilidad:** Mantener una conexión persistente a la fuente de datos en tiempo real (WSS).
- **Patrón:** Implementa un patrón Observador donde los componentes se suscriben para recibir actualizaciones.

### 2. Capa de UI (`src/views/taxis/MapLocation/MapLocation.js`)
Responsable de la visualización y el estado efímero.
- **Responsabilidad:** Suscribirse al `WebSocketService` para pintar posiciones en el mapa con mínima latencia y gestionar el estado `locations` local.
- **Integración:** Dispatch de acciones de Redux cuando se requiere persistir una nueva posición en el histórico.

### 3. Sagas y Servicios (`src/sagas/taxi/vehicleLocationHistorySagas.js`)
Responsables de la persistencia y recuperación histórica.
- **Responsabilidad:** Coordinar la interacción asíncrona con Firebase para guardar y consultar el histórico de ubicaciones.
- **Nota:** Los Sagas no gestionan la conexión directa al WebSocket para evitar problemas de ciclo de vida y recursos en la aplicación.

## Flujo de Datos

1.  **Proyección de Inventario:** El componente `MapLocation` recorre el inventario completo de vehículos (`vehicles`) y lo proyecta sobre el estado de ubicaciones actuales (`locations`). Si un vehículo no tiene una ubicación activa, se representa con valores nulos para garantizar que siempre esté presente en la lista de flota.
2.  **Actualización Instantánea:** El WebSocket recibe nuevas coordenadas -> `WebSocketService` notifica a `MapLocation` -> El componente actualiza el estado `locations` -> La UI refleja el cambio en tiempo real.
3.  **Persistencia:** `MapLocation` despacha una acción de Redux (`createRequest`) -> `vehicleLocationHistorySagas` intercepta la acción -> El Saga invoca el servicio de Firebase para guardar el registro.
4.  **Carga Inicial:** Al cargar la vista, el Saga recupera el histórico reciente de Firebase, que puebla `locations` antes de que lleguen las primeras actualizaciones del WebSocket.

## Reglas de Precedencia y Sincronización de Datos

Para garantizar la integridad del mapa y evitar condiciones de carrera, el sistema aplica las siguientes reglas:

1.  **Estado Base (Firebase):** Al cargar la vista, el historial recuperado de Firebase establece la posición inicial.
2.  **Estado Vivo (WebSocket):** Los datos recibidos por WSS tienen prioridad absoluta sobre los de Firebase.
3. **Lógica de Precedencia (Anti-Jitter) en Reducer:**
    - La lógica para decidir si una actualización (Firebase o WSS) es válida se centraliza en `src/reducers/taxi/vehicleLocationHistoryReducer.js`.
    - El Reducer compara el timestamp entrante con el existente.
    - Si el vehículo tiene `source: 'wss'` y su `lastUpdate` es menor a 5 segundos, el Reducer descarta cualquier actualización entrante de Firebase para prevenir sobrescritura de datos frescos.

4.  **Persistencia:** Toda actualización recibida por WSS es despachada inmediatamente a la capa de persistencia (Firebase) vía `createRequest`.
5.  **Optimización de Rendimiento:** La UI utiliza un `useMemo` proyectado sobre el inventario completo de vehículos para asegurar que toda la flota esté representada, incluso sin datos activos, indexando la información para evitar re-renderizados costosos.
