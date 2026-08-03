# CalcList — Sync P2P vía RxDB + WebRTC

Este documento describe la migración de CalcList (`/trade/calc-list`) de un sync
manual hecho a mano (IndexedDB + `RTCPeerConnection` a pelo) al plugin oficial
`replicateWebRTC` de RxDB, con un `connectionHandlerCreator` custom que reutiliza
Firestore como transporte de señalización.

---

## Motivación y Principios de Diseño

### Qué había antes

- Datos en IndexedDB crudo (`services/indexeddb/finance/calcList.js`).
- `usePeerSync.js` abría un único `RTCPeerConnection`, usaba Firestore
  (`Finance_sync_sessions`) solo para el intercambio de offer/answer/ICE, y al
  conectar mandaba **todo el array `groups` una sola vez** por el data channel.
- El merge (last-write-wins por `updatedAt`) lo hacía la saga a mano
  (`mergeGroups`), a nivel de **grupo completo** — editar una fila hacía que
  todo el grupo ganara o perdiera como unidad frente a un peer.
- Emparejamiento manual: escanear QR o pegar un ID (`SyncModal.js`), o click
  en "Sincronizar" desde la lista de presencia (`PresenceModal.js`).

### Por qué se migró

El objetivo era reemplazar el motor de sync por uno que replique **documento
por documento, en vivo**, con resolución de conflictos automática — el mismo
patrón que ya usa `MyProjects` (`src/services/rxdb/cashflow/myProjects.js`)
contra Firestore, pero para P2P vía WebRTC.

`rxdb@17.4.0` ya trae el plugin `replication-webrtc` sin dependencias nuevas.
Su handler por defecto (`getConnectionHandlerSimplePeer`) depende de
`simple-peer` + un servidor de señalización externo (`signaling.rxdb.info`,
que sus propios docs advierten "no confiable, usá el tuyo"). En vez de eso se
escribió un `connectionHandlerCreator` custom que reutiliza el
`RTCPeerConnection` + Firestore que ya funcionaba — cero dependencias nuevas,
cero infraestructura nueva de señalización.

### Decisiones de diseño (explícitas, no reabrir sin motivo)

1. **Granularidad por grupo** — un documento RxDB = un grupo, mismo shape que
   antes. Se mantiene la limitación conocida (conflicto a nivel de grupo
   completo, no por fila) — aceptada, no es objetivo de esta migración.
2. **Sync automático con todos los peers en línea**, además del manual — cada
   dispositivo se une solo (sin click) y sincroniza en vivo con todo peer
   presente. Los botones manuales (`SyncModal`, "Sincronizar" en
   `PresenceModal`) se mantienen intactos como *fuerzo de conexión inmediata*
   sobre el mismo motor, no como mecanismo separado.
3. **Sin tenant scoping** — CalcList nunca tuvo `tenantId` (es dato 100%
   local por dispositivo, sin respaldo en Firestore), y se mantiene así.
4. **Sin TURN por defecto** — solo STUN de Google. Ver sección de
   limitaciones más abajo.

---

## Componentes Principales

### 1. `src/services/rxdb/finance/calcList.js`
Colección RxDB + replicación. Mismo patrón que `myProjects.js`.
- **`schema`** — v0, `primaryKey: 'id'`, `{ id, name, order, items[], updatedAt }`
  (idéntico al shape de grupo de siempre).
- **`conflictHandler`** — copiado de `myProjects.js`: `isEqual` normaliza a
  JSON antes de comparar (evita falsos conflictos por el flag interno
  `_deleted` de RxDB), `resolve` = last-write-wins por `updatedAt`.
- **`ensureReplication()`** — `replicateWebRTC({ collection, topic:
  'finance-calc-list', connectionHandlerCreator, pull: {}, push: {},
  retryTime: 5000 })`.
- **`subscribeSyncStatus(cb)`** — a diferencia de `replicateFirestore`, el pool
  de `replicateWebRTC` no expone un `active$` único; se deriva un estado de 3
  valores (`synced` / `no_peers` / `error`) a partir de `pool.peerStates$` (
  cuántos peers hay con conexión WebRTC real establecida) y `pool.error$`.
- **`subscribePeers(cb)` / `connectTo(id)` / `getMyId()`** — pasan a través
  del side-channel expuesto por `calcListWebrtcHandler.js` (ver abajo).
- **`migrateFromIndexedDb()`** — corre una sola vez (se auto-detecta por
  `rxCollection.count() === 0`, no necesita flag aparte); lee la IndexedDB
  vieja, aplica la migración legacy de "listas sueltas → grupo General" que
  antes vivía en la saga, y hace `bulkUpsert`. La IndexedDB vieja **no se
  borra** — queda como camino de rollback.

### 2. `src/services/rxdb/finance/calcListWebrtcHandler.js`
El `connectionHandlerCreator` custom — el corazón de la migración.

- **Hallazgo clave:** `replicateWebRTC()` llama
  `collection.database.waitForLeadership()` **antes** de invocar el
  `connectionHandlerCreator`. Como toda la lógica de presencia/conexión vive
  *adentro* del handler (no en un `useEffect` del hook), esto resuelve gratis
  el problema de "una pestaña por dispositivo" — solo la pestaña líder toca
  Firestore/WebRTC, las demás quedan bloqueadas esperando liderazgo.
- **Rol dual por dispositivo:**
  - *Caller* (`doConnectTo`): crea `RTCPeerConnection`, escribe su offer en
    el buzón del peer destino (ver esquema de señalización), espera answer.
  - *Callee* (`handleIncoming`): escucha su propio buzón (`subscribeIncoming`)
    y responde a cualquier offer que llegue.
- **Auto-conexión con todos los peers en línea:** en cada snapshot de
  presencia, para cada peer fresco se aplica un *tie-break* — `if (myId >
  peer.id) doConnectTo(peer.id)` — para que solo un lado inicie la conexión
  por par (mismo criterio que usa el `connection-handler-simple-peer.js` de
  referencia de RxDB: `initiator: remotePeerId > ownPeerId`).
- **`connectTo(remoteId)` manual** — expuesto para `SyncModal`/`PresenceModal`:
  llama exactamente la misma función `doConnectTo`, de forma inmediata, en
  vez de esperar a que el tie-break automático la dispare.
- **Limpieza de sesiones viejas** (ver sección dedicada abajo).
- **TURN opcional vía Metered.ca** (ver sección de limitaciones).
- **Logging de diagnóstico** (`[calcList-sync]` en consola) — deliberado,
  quedó para poder debuggear handshakes WebRTC reales sin instrumentar de
  nuevo. Marcado `ponytail:` en el código para saber que es descartable.

### 3. `src/services/firebase/finance/syncSessions.js`
Señalización sobre Firestore, colección `Finance_sync_sessions`
(`COL_FINANCE_SYNC_SESSIONS` en `settings.js`).

**Esquema de señalización (rediseñado para esta migración):**

El diseño viejo permitía **una sola conexión activa a la vez** por
dispositivo — `offerSdp`/`answerSdp` vivían como campos únicos en
`Finance_sync_sessions/{miId}`. Como ahora un dispositivo debe conectarse con
**N peers simultáneos**, cada par de conexión necesita su propio slot:

```
Finance_sync_sessions/{targetId}              ← doc de presencia (heartbeat)
Finance_sync_sessions/{targetId}/incoming/{fromId}
    { offerSdp, answerSdp }                   ← un doc por CADA par que quiere
                                                 conectarse a {targetId}
    /offerCandidates/{...}                    ← ICE candidates del caller
    /answerCandidates/{...}                   ← ICE candidates del callee
```

El que inicia la conexión (`fromId`) escribe su offer en el "buzón" del
destino (`targetId`); el destino escucha su propio buzón completo
(`subscribeIncoming`) y responde ahí mismo. Esto permite que un dispositivo
reciba ofertas de varios peers a la vez sin pisarse.

### 4. `src/services/facade/finance/calcListFacade.js`
Re-export delgado, mismo patrón que los ~40 facades del resto del proyecto
(`myProjectFacade.js`, etc.) — la saga nunca importa el servicio RxDB
directamente.

### 5. `src/hooks/usePeerSync.js`
Mantiene el shape externo exacto de antes (`{ myId, status, error, peers,
myDataVersion, connectTo }`) para que `SyncModal`/`PresenceModal` no
necesiten cambios de props — por dentro ahora lee del facade en vez de
manejar `RTCPeerConnection` a mano.

### 6. `src/sagas/finance/calcListSagas.js`
- `loadLists` corre `migrateFromIndexedDb()` una vez y después bridgea
  `subscribeGroups` (query reactiva de RxDB) a Redux vía `eventChannel` —
  mismo patrón `createProjectsChannel`/`loadProjects` de
  `myProjectSagas.js`. Cada cambio local o remoto re-emite la lista completa.
- Cada CRUD (`createGroup`, `saveRow`, etc.) cambia `idb.saveList` por
  `facade.saveGroup` — la lógica de armar el grupo actualizado no cambia.
- **`mergeGroups` se eliminó** — el merge ahora lo hace el `conflictHandler`
  de RxDB automáticamente, en cada documento, sin importar si la conexión
  fue automática o manual.

---

## Limpieza de sesiones huérfanas

`deleteSession()` solo corre en el `close()` del handler, que depende de un
`unmount` limpio de React — algo que el uso real casi nunca garantiza (cerrar
pestaña, poner el navegador en segundo plano en el celular, un crash,
navegar con el botón atrás). Sin esto, `Finance_sync_sessions` crece para
siempre y cada dispositivo tiene que descargar y filtrar la colección entera
en cada tick de presencia.

**Fix:** en cada snapshot de presencia, `calcListWebrtcHandler.js` borra
oportunistamente cualquier sesión con `lastSeen` más vieja que el umbral de
staleness (60s) — no hace falta un job de limpieza aparte, se auto-mantiene
mientras haya al menos un cliente con la pantalla abierta.

Se detectó y purgó manualmente una acumulación de **139 sesiones fantasma**
en producción (generadas en gran parte por pruebas automatizadas repetidas
durante el desarrollo de esta feature) antes de que el fix oportunista
entrara en juego.

---

## Limitaciones conocidas

### Sin TURN — falla en redes con aislamiento de clientes

Con solo STUN (Google, gratis), la conexión directa falla en redes que
bloquean tráfico dispositivo-a-dispositivo aunque compartan la misma WiFi
(AP/client isolation, común en redes mesh o de invitados) o detrás de NAT
simétrico/CGNAT. Confirmado en la práctica: el intercambio de señalización
(offer/answer/ICE) se completa bien, pero `iceConnectionState` pasa a
`disconnected`/`failed` — es una falla de red real, no de código.

**Cómo diagnosticarlo:** abrir la consola del navegador, filtrar por
`calcList-sync`. Si se ve `offer written` → `answer received` →
`iceConnectionState: checking` → `disconnected`/`failed`, es exactamente
este caso.

**Cómo activar TURN (ya está el código, falta la cuenta):**

En `calcListWebrtcHandler.js`, `getIceServers()` intenta pedir credenciales
TURN efímeras a Metered.ca vía REST (sin SDK nuevo) si están seteadas
`VITE_TURN_APP_NAME` y `VITE_TURN_API_KEY` en `.env.development`/
`.env.production` (gitignored). Si no están, o el fetch falla, cae
automáticamente a STUN-only — no hay dependencia dura de la cuenta TURN.

```
VITE_TURN_APP_NAME=<subdominio-de-metered, ej. "yefriddavid">
VITE_TURN_API_KEY=<API Key de la sección TURN Server del dashboard>
```

⚠️ La API Key debe ser la de la sección **TURN Server** del dashboard de
Metered, no la "Secret Key" general de la cuenta — son distintas.

**Alternativa self-hosted:** correr [coturn](https://github.com/coturn/coturn)
propio requiere un servidor con IP pública, el puerto 3478 (STUN/TURN) y un
rango de puertos UDP para el relay (típicamente 49152–65535) abiertos, más
credenciales con expiración (TURN REST API auth) para no quedar como relay
anónimo abierto. Quedó pendiente de decidir dónde alojarlo.

---

## Cómo debuggear un handshake que no conecta

1. Abrir DevTools → Console → filtrar por `calcList-sync`.
2. Buscar la secuencia esperada: `doConnectTo start` → `caller ICE candidate`
   (host/srflx/relay) → `offer written` → `answer received` →
   `iceConnectionState: checking` → `connected` → `dataChannel OPEN`.
3. Si se corta en `checking` → `disconnected`/`failed`: problema de red (ver
   limitaciones arriba), no de código.
4. El badge `👥N` (presencia) y el pill de estado (`pool.peerStates$`, WebRTC
   real) son señales **distintas a propósito** — presencia puede ver a un
   peer sin que el canal de datos haya abierto.
