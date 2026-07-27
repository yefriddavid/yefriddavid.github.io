# BTC — Lotes sin vender (análisis 2026-07-27)

Análisis hecho a partir de un Excel exportado desde `/finance/management/crypto-query`
(símbolo BTCUSDT, año 2025, todas las plataformas), emparejando compras y ventas por
FIFO (primero en comprar, primero en vender).

Se ignoraron 2 ventas iniciales (2025-05-27 y 2025-07-09, 0.02307 BTC en total) por no
tener compra previa dentro de ese Excel — no afectan el resultado, ya que no llegaron a
consumir ninguno de los lotes listados abajo.

## Lotes que quedaron en cartera

PnL calculado con precio actual de BTC = **$64,803** (USD) — el precio de referencia
que me pasó el usuario en el momento del análisis, no una cotización en vivo. Fórmula:
`(precio_actual - precio_compra) * cantidad`.

| Fecha compra | Cantidad BTC | Precio compra (USD) | Costo (USD) | PnL (USD) @ $64,803 |
|---|---|---|---|---|
| 2025-08-17 | 0.00334 (parcial) | 117,389.98 | 392.08 | -175.64 |
| 2025-08-18 | 0.01735 | 115,236.61 | 1,999.36 | -875.02 |
| 2025-08-19 | 0.00878 | 113,822.74 | 999.36 | -430.39 |
| 2025-10-10 | 0.00833 | 120,000.00 | 999.60 | -459.79 |
| 2025-10-10 | 0.01407 | 111,527.53 | 1,569.19 | -657.41 |
| 2025-10-10 | 0.01713 | 116,810.92 | 2,000.97 | -890.90 |
| 2025-10-13 | 0.00868 | 115,150.11 | 999.50 | -437.01 |
| 2025-10-14 | 0.01799 | 111,133.56 | 1,999.29 | -833.49 |
| 2025-10-28 | 0.00887 | 112,739.15 | 1,000.00 *(nota: nunca se vendió)* | -425.19 |
| **Total** | **0.10454** | — | **11,959.36** | **-5,184.85** |

**Total: 0.10454 BTC — costo total $11,959.36 — precio promedio ponderado $114,399.82 —
valor actual $6,774.51 — PnL -$5,184.85**

## Pendiente

Marcar estos 9 registros en Firestore (`Finance_Crypto_Purchases`) con la nota
"analisis IA, compras sin ventas" (agregada, no reemplazando notas existentes). Script
listo en `scripts/annotate-btc-remaining-lots.mjs` — bloqueado por cuota de Firestore
agotada el 2026-07-27, pendiente de reintentar (ver memoria del proyecto).
