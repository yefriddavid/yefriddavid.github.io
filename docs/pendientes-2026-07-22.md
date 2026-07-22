# Pendientes — 2026-07-22

Lista de lo que quedó sin terminar en la sesión del 2026-07-21 sobre Crypto Purchases v2 / reportes de cripto. Ver también `docs/crypto-purchases-v2-updates.md` para el detalle completo de lo ya hecho.

## 1. ✅ Correr los 2 scripts pendientes (Firestore agotó cuota) — HECHO 2026-07-22

Ambos corrieron con `--apply` exitosamente: los 4 ajustes (BTC/ETH/BNB/LINK) quedaron con el costo promedio correcto, y los 945 documentos de `Finance_Crypto_Purchases` quedaron con `active: true`.

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

## 4. ✅ Endpoint de retiros de Binance — HECHO 2026-07-22

Implementado: `scripts/sync-crypto-withdrawals/` (Go) llama `ListWithdrawsService` y escribe en la nueva colección `Finance_Crypto_Withdrawals`, y hay una pantalla de solo lectura "Crypto Withdrawals" junto a Crypto Purchases (v2) en `/finance/tools/crypto-withdrawals`.

- Confirmado: la API key sí tiene permiso de lectura sobre historial de retiros.
- Primera corrida (`--since 2023-01-01 --apply`): **38 retiros** insertados (BTC, ETH, SOL, USDT, USDC — redes BTC/LIGHTNING/ARBITRUM/ETH/SOL/MATIC).
- Limitación confirmada: **no reemplaza los ajustes manuales de BNB ni LINK** — ninguno de los dos aparece en el endpoint desde 2023, probablemente salieron por Binance Convert (`/sapi/v1/convert/tradeFlow`, endpoint aparte, no implementado) o transferencia interna. Los registros `isAdjustment` de BNB/LINK siguen siendo la única fuente para esos dos.
- Correr de nuevo cuando haga falta actualizar: `cd scripts/sync-crypto-withdrawals && go run . --apply` (dedupe automático por `binanceWithdrawId`, seguro de re-correr).

## 5. Lista de deseos (no iniciadas)

- Separar la ganancia/pérdida en "efecto cripto" vs "efecto TRM/FX" (usando el `usdCopRate` ya capturado por compra) — se mencionó como posible mejora futura del reporte "Análisis de Cripto", no se construyó.
- ~~**Withdraws**~~ — ✅ HECHO 2026-07-22, ver sección 4.
- **Loans** — crear un módulo/registro propio para préstamos. Falta definir alcance: ¿préstamos de cripto tipo Binance Crypto Loans (con colateral), préstamos personales dados/recibidos, o algo más? Aclarar antes de empezar a construir.
- Precio de equilibrio ("break-even") por moneda, formalizando el cálculo ad-hoc que se hizo para BTC con la pregunta hipotética de precio.
- Tracking de comisiones de Binance — no se registran en ningún lado hoy, y con cientos de trades podrían estar erosionando el rendimiento real de forma invisible.
- Análisis de patrón de trading (round-trips compra→venta, tiempo promedio de holding) — requeriría emparejamiento tipo FIFO, que se decidió no hacer para no complicar el modelo actual.
