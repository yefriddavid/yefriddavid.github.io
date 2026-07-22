# Pendientes — 2026-07-22

Lista de lo que quedó sin terminar en la sesión del 2026-07-21 sobre Crypto Purchases v2 / reportes de cripto. Ver también `docs/crypto-purchases-v2-updates.md` para el detalle completo de lo ya hecho.

## 1. Correr los 2 scripts pendientes (Firestore agotó cuota)

Ambos ya están escritos, probados en dry-run (o listos para probarlo) y esperando que se libere la cuota de Firestore (normalmente resetea a medianoche hora del Pacífico en el plan gratuito de Firebase).

```bash
# 1. Corrige el costo promedio de los 4 ajustes de saldo (estaban en $0, inflaban
#    el costo promedio implícito de lo que queda). Ver sección 9 de crypto-purchases-v2-updates.md.
node scripts/fix-adjustment-cost-basis.mjs             # dry run — confirmar valores primero
node scripts/fix-adjustment-cost-basis.mjs --apply

# Valores ya confirmados en un dry-run exitoso:
#   BTC  → $79,225.96
#   ETH  → $2,355.08
#   BNB  → $748.93
#   LINK → $4.96

# 2. Agrega active: true a todos los documentos de Finance_Crypto_Purchases
node scripts/backfill-crypto-purchase-active.mjs       # dry run — no pudo correr aún por la cuota
node scripts/backfill-crypto-purchase-active.mjs --apply
```

**Antes de correr `fix-adjustment-cost-basis.mjs --apply`**: hacerlo primero, porque cualquier sync nuevo de Binance (botón Sync o `scripts/sync-crypto-purchases`) no toca los registros de ajuste (no tienen `binanceTradeId`), así que no hay urgencia de orden entre los dos scripts — pero mejor aplicar ambos antes de seguir agregando features nuevas sobre el módulo.

## 2. Commitear los cambios de código ya hechos (sin commitear todavía)

```
M  src/services/firebase/finance/cryptoPurchase.js        (fetchAll: active ?? true)
M  src/views/tools/crypto-purchases/CryptoPurchaseForm.js  (EMPTY_PURCHASE: active: true)
?? scripts/backfill-crypto-purchase-active.mjs
```

Estaba pendiente confirmar si se commitea antes o después de correr el backfill — el código ya funciona con o sin el backfill corrido (normaliza `active ?? true` al leer), así que se puede commitear ya.

## 3. SOL sin reconciliar

En la sesión de reconciliación de saldos (BTC, BNB, ETH, LINK) quedó pendiente **SOL** — el usuario no dio el saldo real de Binance para esa moneda (no aparecía en la captura compartida). Falta:
1. Pedir el saldo real de SOL en Binance.
2. Calcular el ajuste (neto sincronizado − saldo real) igual que se hizo para las otras 4.
3. Crear el registro de ajuste (`isAdjustment: true`, mismo patrón que `scripts/add-crypto-balance-adjustments.mjs`).

## 4. Explorar el endpoint de retiros de Binance (idea sin implementar)

Se discutió (sin ejecutar nada) reemplazar los 4-5 ajustes manuales por datos reales del endpoint `/sapi/v1/capital/withdraw/history` (`GetWithdrawHistoryService` en `go-binance`), que daría cantidad y fecha **exactas** de cada retiro real en vez de una cifra por diferencia de saldo con fecha aproximada.

Pendiente:
- Confirmar que la API key tiene permiso de lectura sobre historial de retiros.
- Si se implementa, reemplazaría (o complementaría) los registros `isAdjustment` actuales con retiros reales por fecha.
- Limitación conocida: ese endpoint no cubre Binance Convert (`/sapi/v1/convert/tradeFlow` es otro endpoint aparte) — puede seguir quedando un residuo que solo el ajuste manual explique.

## 5. Lista de deseos (no iniciadas)

- Separar la ganancia/pérdida en "efecto cripto" vs "efecto TRM/FX" (usando el `usdCopRate` ya capturado por compra) — se mencionó como posible mejora futura del reporte "Análisis de Cripto", no se construyó.
- **Withdraws** — crear un módulo/registro propio para retiros de cripto (relacionado con la idea de la sección 4: usar el endpoint `/sapi/v1/capital/withdraw/history` de Binance para traer retiros reales en vez de los ajustes manuales `isAdjustment`).
- **Loans** — crear un módulo/registro propio para préstamos. Falta definir alcance: ¿préstamos de cripto tipo Binance Crypto Loans (con colateral), préstamos personales dados/recibidos, o algo más? Aclarar antes de empezar a construir.
- Precio de equilibrio ("break-even") por moneda, formalizando el cálculo ad-hoc que se hizo para BTC con la pregunta hipotética de precio.
- Tracking de comisiones de Binance — no se registran en ningún lado hoy, y con cientos de trades podrían estar erosionando el rendimiento real de forma invisible.
- Análisis de patrón de trading (round-trips compra→venta, tiempo promedio de holding) — requeriría emparejamiento tipo FIFO, que se decidió no hacer para no complicar el modelo actual.
