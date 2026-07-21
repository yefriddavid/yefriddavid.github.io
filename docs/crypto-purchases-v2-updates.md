# Crypto Purchases v2 — TRM, ventas, sync con Binance, reconciliación y reporte de análisis

Documenta el trabajo hecho sobre `src/views/tools/crypto-purchases/` (ruta `/finance/tools/v2/adjustments`) y el nuevo reporte `/finance/management/crypto-report` en una sesión de mejoras. Cubre: captura de TRM histórica, soporte de ventas, sincronización automática con Binance, reconciliación manual de saldos reales, un reporte de análisis por moneda con modal de detalle/gráfico, y un bug de costo promedio encontrado y corregido a partir de una pregunta hipotética del usuario.

## 1. TRM (USD/COP) por registro

**Objetivo:** guardar la tasa de cambio oficial vigente en la fecha de cada compra/venta, para tener histórico de conversión a COP.

### Cambios de código
- `src/views/tools/crypto-purchases/CryptoPurchaseForm.js`: nuevo campo "TRM USD/COP" junto a la fecha. En registros nuevos se autocompleta con la tasa en vivo (hook `useUsdCopRate` de `src/hooks/useUsdCopRate.js`, ya usado en el módulo Assets), pero queda editable. En edición conserva el valor guardado.
- `src/views/tools/crypto-purchases/index.js`: pasa `liveUsdCopRate` al form; muestra "TRM $X" en la tarjeta de cada registro.
- `src/services/firebase/finance/cryptoPurchase.js`: `fetchAll()` normaliza `usdCopRate` (antes no estaba en la lista blanca de campos leídos — se guardaba pero nunca se leía de vuelta).
- No se creó ninguna action/saga nueva — el campo viaja dentro del objeto genérico que ya usan `saveRequest`/`updateRequest`.

### Backfill de datos existentes
`scripts/backfill-crypto-purchase-usd-cop-rate.mjs` (Node, patrón dry-run/`--apply`/`--test` como el resto de `scripts/*.mjs`):
- Fuente: **TRM oficial de Colombia** (Banco de la República, dataset `mcec-87by` publicado en `datos.gov.co`, sin API key), no una API genérica de forex — es la tasa certificada real.
- Busca por rango de vigencia (`vigenciadesde <= fecha <= vigenciahasta`), lo que cubre fines de semana/festivos donde el valor publicado el viernes sigue vigente.
- Aplicado sobre los 105 registros que existían en ese momento: **105/105 con TRM encontrada**, 54 fechas únicas consultadas.

### Backfill de plataforma
`scripts/backfill-crypto-purchase-platform.mjs`: mismo patrón, setea `platform: 'binance_col'` en los registros que no tenían plataforma asignada (104 de 105).

## 2. Soporte de ventas (compra/venta)

**Decisión de diseño** (confirmada con el usuario): mismo formulario/colección con un campo `type: 'buy' | 'sell'`, sin cálculo de FIFO por ahora, y las ventas restan de los totales/holdings mostrados.

### Modelo
- `src/constants/finance.js`: nuevo `CRYPTO_PURCHASE_TYPES = [{value:'buy',...},{value:'sell',...}]`.
- Campo `type` en el documento de Firestore (default `'buy'` si no existe, para compatibilidad con los registros viejos — normalizado en `fetchAll()`).
- `cryptoPurchaseHelpers.js`: `isSale(p)`, `computePurchaseMetrics()` extendido — para una venta no hay `investedUSD`/`gainLoss` (no hay FIFO), solo `proceedsUSD = quantity * purchasePrice`.

### Formulario (`CryptoPurchaseForm.js`)
- Toggle "Compra"/"Venta" arriba del todo (`watch`/`setValue`, no `useState` — sigue el patrón de toggles booleanos del proyecto).
- Labels dinámicos: "Precio de compra/venta", "Fecha de compra/venta", caja de resumen "Invertido"/"Recibido".

### Vista (`index.js`)
- Filtro adicional "Todas/Compras/Ventas" (chips), junto al filtro por symbol ya existente.
- `renderBadge`: "Venta" (variant info) vs "Ganancia"/"Pérdida"/"Sin precio" para compras.
- `renderRows`: fila distinta para venta (Cantidad vendida, Precio de venta, Recibido, Plataforma, TRM) vs compra (igual que antes).
- **Totales del resumen** (`Invertido`, `Valor actual`, `Ganancia/Pérdida`, `Rendimiento`): se recalculan como posición neta por symbol —
  - `Invertido` = Σ(compras) − Σ(ventas), es decir, flujo de caja neto puesto en cripto (no requiere FIFO).
  - `Valor actual` = cantidad neta por symbol (compras − ventas) × precio en vivo.
  - Esto evita sobre-contar valor de monedas que ya se vendieron.

## 3. Sincronización con Binance (`scripts/sync-crypto-purchases`)

Módulo Go standalone (su propio `go.mod`), basado en `~/sources/cards/golang/list_buys_and_sells.go` (mismo patrón: `go-binance/v2`, `NewListTradesService`, `t.IsBuyer` para clasificar compra/venta).

### Historia de cómo se construyó (por qué quedó así)
1. **Primera versión**: un solo `ListTrades` por symbol con `StartTime`, sin `Limit` explícito → Binance defaultea a 500 filas por respuesta. Funcionó para el primer corte (550 trades, luego 319 más yendo hasta 2020) porque ninguna llamada individual llegó a tocar el tope.
2. **Bug encontrado**: al pedirle al usuario confirmar por qué "lo más viejo es 2024-06-11", se probó `ListTrades("BTCUSDT")` con `startTime=2024-01-01` sin `Limit` → devolvió **exactamente 500** (el tope, no el total real). Es decir, la primera versión truncaba silenciosamente en cualquier ventana de fechas con más de 500 trades.
3. **Fix de paginación**: se reescribió con paginación por `fromId` (cursor ascendente de trade id, `Limit(1000)` por página, se sigue pidiendo hasta que una página devuelve menos de 1000). `--since` pasó a ser un filtro client-side sobre la fecha, no un parámetro enviado a Binance (evita el conflicto `startTime`+`fromId`).
4. **Segundo bug encontrado** (al comparar contra el saldo real de Binance, ver sección 4): BTC también se tranza contra **USDC** y **FDUSD**, no solo USDT. El script original solo consultaba el par `BTCUSDT`. Se generalizó para recorrer cada moneda base (`BTC/ETH/SOL/LINK/BNB`) contra cada quote conocido (`USDT/USDC/FDUSD`), descartando silenciosamente los pares que no existen (error "Invalid symbol" de Binance).
5. **Normalización de symbol**: el `symbol` guardado en Firestore siempre es la forma canónica `<BASE>USDT` (para no romper los filtros de la UI ni el lookup de precio en vivo, que solo conocen esa forma). Si el trade real fue contra USDC/FDUSD, se anota en `notes` (ej. `"vía USDC"`).
6. **Reconstrucción completa**: se decidió (con el usuario) borrar los 105 registros manuales/seed originales (`scripts/delete-crypto-purchases.mjs`) y reemplazarlos por el historial real y completo de Binance, en vez de tratar de fusionar/deduplicar contra datos curados a mano.

### Cómo evita duplicados
Cada trade se guarda con `binanceTradeId: "<PAR>-<tradeId>"` (ej. `"BTCUSDC-123"`) — el id de Binance es único solo dentro de un mismo par, así que el tradeKey incluye el par real, no el symbol normalizado. En cada corrida se lee qué `binanceTradeId` ya existen en Firestore y se saltan. **Correr el script las veces que quieras es seguro** — solo inserta lo nuevo.

### Uso
```bash
cd scripts/sync-crypto-purchases
go build -o sync-crypto-purchases .   # ya compilado, normalmente no hace falta

BINANCE_API_KEY=... BINANCE_SECRET_KEY=... ./sync-crypto-purchases            # dry run
BINANCE_API_KEY=... BINANCE_SECRET_KEY=... ./sync-crypto-purchases --apply    # escribe en Firestore
```
Flags: `--since YYYY-MM-DD` (default `2020-01-01`), `--symbol BTC` (limita a una moneda base), `--sa path/service-account.json`.

El binario compilado (`sync-crypto-purchases`) está en `.gitignore` — no se commitea (igual que `scripts/sync-firebase-auth/sync-firebase-auth`).

### Resultado final del rebuild
- 869 trades tras la primera reconstrucción (USDT únicamente, historial completo desde 2024-06-11).
- +72 trades más al agregar USDC/FDUSD → **941 registros** sincronizados desde Binance.
- Descubrimiento importante: agregar más pares **empeoró** la comparación contra el saldo real (ver sección 4) — el problema no eran pares faltantes, sino retiros/transferencias que `/myTrades` no puede ver.

## 4. Reconciliación de saldo real (ajustes manuales)

**Problema:** el saldo neto calculado a partir de trades (compras − ventas) no coincidía con el saldo real mostrado en la app de Binance, incluso después de cubrir todos los pares. La API de trades (`/myTrades`) no ve: retiros a otra wallet, operaciones de "Convert", transferencias a Earn/Funding, ni movimientos entre sub-cuentas.

**Solución acordada con el usuario:** un "asiento de ajuste" — una venta ficticia con precio **$0** (no infla ni desinfla `Invertido`, solo descuenta cantidad) marcada con un flag para distinguirla de una venta real.

### Cambios de esquema/UI
- Nuevo campo `isAdjustment: boolean` en el documento.
- `cryptoPurchaseHelpers.js`: `isAdjustment(p) = isSale(p) && !!p.isAdjustment`.
- `CryptoPurchaseForm.js`: checkbox "Es un ajuste de saldo (no una venta real)" visible solo cuando el tipo es Venta.
- `index.js`:
  - Badge: **"Ajuste de saldo"** (variant `warning`) en vez de "Venta".
  - `renderValue`: muestra `-<cantidad> <SYMBOL>` en vez de un monto en USD (no hubo "recibido" real).
  - `renderRows`: solo "Cantidad ajustada" + notas (sin precio/recibido/plataforma).
- `services/firebase/finance/cryptoPurchase.js`: `fetchAll()` normaliza `isAdjustment`.

### Ajustes aplicados (fecha `2024-04-01`, plataforma `binance_col`, notas "Retiro — cuadre manual de saldo...")

| Symbol | Neto sincronizado | Saldo real (Binance) | Ajuste (venta ficticia) | Script |
|---|---|---|---|---|
| BTC | 0.50916 | 0.289048872 | 0.220111128 | `scripts/add-btc-balance-adjustment.mjs` |
| BNB | 2.084 | 2.0341985453 | 0.0498014547 | `scripts/add-crypto-balance-adjustments.mjs` |
| ETH | 1.0770999999999995 | 0.3040052464 | 0.7730947536 (corregido a mano tras un error de redondeo de 0.0001 en el primer intento) | ídem |
| LINK | 84.28 | 81.5082006518 | 2.7717993482 | ídem |

Tras aplicar los 4 ajustes, el neto por symbol en Firestore coincide exactamente con el saldo real reportado por el usuario.

**Pendiente / fuera de alcance:**
- **SOL**: no se reconcilió — el usuario no proporcionó el saldo real (no aparecía en la captura de pantalla compartida).
- **XRP, PAXG (PAX Gold), ADA**: no están en `CRYPTO_PURCHASE_SYMBOLS`, este módulo no los trackea en absoluto. PAX Gold en particular se relaciona con el módulo Assets (tasa de oro manual), no con Crypto Purchases.

Los scripts de ajuste (`add-btc-balance-adjustment.mjs`, `add-crypto-balance-adjustments.mjs`) son de un solo uso (valores hardcodeados de la reconciliación puntual) — no están pensados para reutilizarse, quedan como registro auditable de lo que se escribió y por qué.

## 5. Card "EN CARTERA" dinámica por symbol

- `src/views/tools/crypto-purchases/index.js`: quinta card en el grid de resumen (2 columnas), agregada al final de la lista → cae justo debajo de "Ganancia/Pérdida" en el layout de 2 columnas.
- Es **dinámica**: muestra la cantidad neta del symbol seleccionado en el filtro de pestañas (Todas/BTC/ETH/SOL/LINK/BNB). Con el filtro en "Todas" muestra BTC por defecto.
- `cryptoPurchaseHelpers.js`: `fmtQty(n, symbol)` — formatea con 8 decimales + el símbolo corto (ej. `"0.28904887 BTC"`).

## 6. Botón "Sync" → integración con `/system/programs`

El proyecto ya tiene un sistema de hooks/automatizaciones locales (`src/reducers/system/programHookSlice.js` + `src/sagas/misc/hookExecutorSaga.js` + `src/views/pages/system/Programs/`): cualquier saga puede `dispatch(triggerHook({ tag, context }))`, y eso ejecuta (vía una extensión de Chrome / native host) los "Programs" que el usuario configuró en `/system/programs` con ese tag — cada Program es un binario local + argumentos.

- `src/constants/programHooks.js`: nuevo tag `cryptoPurchase.sync` ("Crypto Purchases — sincronizar").
- `src/views/tools/crypto-purchases/index.js`: botón "Sync" (ícono `cilSync`) en el header, junto a los íconos existentes (importar histórico, borrar todo, agregar). Dispara `dispatch(triggerHook({ tag: 'cryptoPurchase.sync', context: {} }))` directamente desde la vista — no hay saga de por medio porque no hay ninguna escritura a Firestore asociada al click, solo se dispara el evento.
- `src/views/tools/crypto-purchases/CryptoPurchases.scss`: nueva clase `.cpu-text-btn` (botón con texto, reutilizable, mismo estilo base que `.cpu-icon-btn`).

**Para activarlo**, el usuario debe crear un Program en `/system/programs`:
- Binario: `scripts/sync-crypto-purchases/sync-crypto-purchases` (ruta absoluta)
- Argumentos: `--apply`
- Hook: `Crypto Purchases — sincronizar`

Las credenciales de Binance se toman de las variables de entorno `BINANCE_API_KEY`/`BINANCE_SECRET_KEY` del proceso que lanza el binario (confirmado que el entorno local del usuario ya las expone) — no están incrustadas en el binario ni en el repo.

## 7. Reporte "Análisis de Cripto" (`/finance/management/crypto-report`)

Nueva página bajo el grupo de nav **Reportes** (junto a "Estado de Resultados" y "Análisis"), a pedido del usuario: quería un desglose por moneda para analizar su cripto, en la misma sección de reportes existente.

### Archivos
- `src/views/reports/CryptoReport.js` + `.scss` — página nueva.
- `src/routes.finance.js`: ruta `/management/crypto-report` → `CryptoReport`.
- `src/_nav.js`: ítem "Cripto" (ícono `cibBitcoin`) dentro del `CNavGroup` "Reportes".

### Contenido
- 4 cards de resumen (Invertido, Valor actual, Ganancia/Pérdida, Rendimiento) agregando **todos** los symbols.
- Tabla principal por symbol: Cantidad neta, Invertido (USD y COP), Valor actual (USD y COP), Ganancia/Pérdida, Rendimiento.
  - **Invertido (COP)** usa la **TRM promedio ponderada** de las compras de ese symbol (ponderada por `quantity × purchasePrice` de cada compra con `usdCopRate` capturado).
  - **Valor actual (COP)** usa la TRM en vivo de hoy (`useUsdCopRate`).
- Segunda tabla, **"Pérdidas en COP"** (pedido explícito del usuario): solo las monedas con `gainLossCOP < 0`, ordenadas de mayor a menor pérdida, con fila de total.
- Reutiliza `cryptoPurchaseHelpers.js` (del módulo Crypto Purchases) para `isSale`, `symbolLabel`, `fmtUSD`, `fmt` — no se duplicó la lógica de posición neta.

### Decisión de estilo: tabla plana, no StandardGrid
Primer intento: `StandardGrid` (DevExtreme), como manda la regla general de tablas del proyecto. El usuario pidió explícitamente cambiarlo por el estilo de `/finance/management/reports` (`views/reports/Reports.js` + `CategoryMonthStatement`), que usa una **tabla HTML plana** (`<table>` con BEM `cms__table`) en vez de DevExtreme — es una excepción ya establecida en el código para páginas de "reporte imprimible". Se replicó esa misma hoja de estilos (bordes finos, headers en gris, alineación derecha) bajo el bloque BEM `.crypto-report`, sin usar el componente compartido `CategoryMonthStatement` en sí (su forma es categoría×mes con expand/collapse; no encaja con datos symbol×métricas).

## 8. Modal de detalle por moneda + gráfico (`CryptoLotModal`)

A pedido del usuario ("si le doy click a algún activo, ¿por qué no me muestras un modal con un gráfico...?"). Se usó la skill `dataviz` para elegir la forma del gráfico y los colores.

### Archivo
`src/views/reports/CryptoLotModal.js` — modal (`AppModal` variant `center`), se abre al hacer click en cualquier fila de las dos tablas del reporte (`setSelectedSymbol`).

### Iteración de diseño del gráfico
1. **Primer intento**: barra por cada compra individual (`CChartBar`), % de esa compra vs precio actual. Para BTC (293 compras) el resultado fue una pared de barras ilegible — el "job" real no era "comparar N transacciones", era "tendencia en el tiempo".
2. **Fix**: se cambió a `CChartLine` con **un punto por mes** (precio promedio ponderado de compra ese mes) más una **línea de referencia punteada** con el precio actual — coincide con el patrón de la skill dataviz "Above/below a baseline; Δ to target → line vs baseline". Cada punto se colorea con la paleta de estado **fija** de la skill (`good #0ca30c` si el promedio de ese mes está por debajo del precio actual, `critical #d03b3b` si está por encima), nunca color solo — siempre acompañado de una leyenda manual con ícono + texto ("Compraste por debajo/encima del precio actual").
3. Debajo del gráfico, tabla plana (mismo estilo `.crypto-report__table`) con el detalle crudo de cada transacción (fecha, tipo, cantidad, precio, notas) — así no se pierde el detalle por lote aunque el gráfico esté agregado por mes.

### Bug de re-render (flicker) y fix
El modal recibía `livePrice={prices[selectedSymbol]?.price}` directo del hook de precios en vivo (websocket) — cada tick de precio (cada pocos segundos) recreaba el gráfico. Fix en `CryptoReport.js`:
- El precio se **congela al abrir el modal** (`modalPrice`, capturado en `openLotModal` junto con `selectedSymbol`), no se deriva reactivamente.
- `modalPurchases` memoizado (`useMemo` sobre `[purchases, selectedSymbol]`) en vez de un `.filter()` inline que creaba un array nuevo en cada render.
- `closeLotModal` estabilizado con `useCallback` (antes era un arrow function nuevo en cada render, rompía cualquier memoización de props).
- `CryptoLotModal` envuelto en `React.memo`.

## 9. Bug de costo promedio en los ajustes de saldo (encontrado por el usuario)

El usuario preguntó: *"si BTC llegara a $116,000, ¿estaría ganando o perdiendo?"*. La respuesta inicial (con los datos de ese momento) daba **pérdida de -16.88%**, lo cual el usuario cuestionó correctamente: $116,000 está cerca del precio más alto que pagó alguna vez por BTC, así que a ese precio debería estar en verde.

### Causa raíz
Los 4 ajustes de saldo (sección 4) se crearon con `purchasePrice: 0` para no alterar "Invertido". Eso funciona para la cantidad, pero **rompe el costo promedio implícito**: seguía dividiendo el mismo dinero invertido entre una cantidad neta mucho menor (la que quedó después de "retirar" la diferencia), inflando el costo promedio muy por encima de cualquier precio real de compra. Para BTC: costo promedio implícito **$139,560** — un número que nunca existió en el historial real (el máximo pagado fue ~$122,000).

### Fix
`scripts/fix-adjustment-cost-basis.mjs` (dry-run/`--apply`, mismo patrón): para cada ajuste, calcula el **costo promedio de la posición justo antes del ajuste** (invertido neto ÷ cantidad neta, usando compras y ventas reales, **excluyendo** el propio ajuste) y actualiza el `purchasePrice` del ajuste a ese valor en vez de `$0`. Esto "retira" las monedas a su costo real en vez de gratis, preservando el costo promedio correcto de lo que queda.

Valores calculados (dry-run confirmado, **pendiente de aplicar** — ver nota de cuota abajo):

| Symbol | `purchasePrice` anterior | `purchasePrice` corregido |
|---|---|---|
| BTC | $0 | $79,225.96 |
| ETH | $0 | $2,355.08 |
| BNB | $0 | $748.93 |
| LINK | $0 | $4.96 |

Con el costo corregido, a $116,000/BTC el resultado pasa de -$6,809 (-16.88%) a **+$10,635 aprox. (+46%)** — coincide con la intuición del usuario.

### Nota — cuota de Firestore agotada
Al intentar aplicar el fix (`--apply`), y también en un segundo intento con un script más liviano que solo actualizaba los 4 documentos por id directo, Firestore devolvió `RESOURCE_EXHAUSTED: Quota exceeded` incluso para una simple lectura de un documento — probablemente por la cantidad de escaneos completos de la colección hechos en la misma sesión (decenas de dry-runs/verificaciones sobre ~941 documentos). **El fix quedó listo pero sin aplicar.** Para aplicarlo cuando la cuota se libere (normalmente se resetea diario en el plan gratuito de Firebase):
```bash
node scripts/fix-adjustment-cost-basis.mjs             # dry run — confirmar valores
node scripts/fix-adjustment-cost-basis.mjs --apply     # aplicar
```

## Archivos nuevos

```
scripts/add-btc-balance-adjustment.mjs
scripts/add-crypto-balance-adjustments.mjs
scripts/backfill-crypto-purchase-platform.mjs
scripts/backfill-crypto-purchase-usd-cop-rate.mjs
scripts/delete-crypto-purchases.mjs
scripts/fix-adjustment-cost-basis.mjs
scripts/sync-crypto-purchases/main.go
scripts/sync-crypto-purchases/go.mod
scripts/sync-crypto-purchases/go.sum
src/views/reports/CryptoReport.js
src/views/reports/CryptoReport.scss
src/views/reports/CryptoLotModal.js
```

## Archivos modificados

```
.gitignore                                              (ignora el binario compilado)
src/constants/finance.js                                (CRYPTO_PURCHASE_TYPES)
src/constants/programHooks.js                            (hook cryptoPurchase.sync)
src/services/firebase/finance/cryptoPurchase.js          (fetchAll: usdCopRate, type, isAdjustment)
src/views/tools/crypto-purchases/CryptoPurchaseForm.js   (tipo, TRM, checkbox de ajuste)
src/views/tools/crypto-purchases/CryptoPurchases.scss    (toggle de tipo, checkbox, cpu-text-btn)
src/views/tools/crypto-purchases/cryptoPurchaseHelpers.js (isSale, isAdjustment, fmtQty, typeLabel)
src/views/tools/crypto-purchases/index.js                (filtros, totales netos, card dinámica, botón Sync)
src/routes.finance.js                                    (ruta /management/crypto-report)
src/_nav.js                                              (ítem "Cripto" bajo Reportes)
```

Commits: `b1e9bcc` (TRM/ventas/sync/ajustes) y `fe2b266` (reporte de análisis) — el modal de detalle, el fix de costo promedio y el fix de flicker todavía no se han commiteado al momento de escribir esto.
