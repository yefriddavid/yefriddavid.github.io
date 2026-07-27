# BTC — Lotes sin vender (análisis 2026-07-27)

Análisis hecho a partir de un Excel exportado desde `/finance/management/crypto-query`
(símbolo BTCUSDT, año 2025, todas las plataformas), emparejando compras y ventas por
FIFO (primero en comprar, primero en vender).

Se ignoraron 2 ventas iniciales (2025-05-27 y 2025-07-09, 0.02307 BTC en total) por no
tener compra previa dentro de ese Excel — no afectan el resultado, ya que no llegaron a
consumir ninguno de los lotes listados abajo.

## Lotes que quedaron en cartera

| Fecha compra | Cantidad BTC | Precio compra (USD) | Costo (USD) |
|---|---|---|---|
| 2025-08-17 | 0.00334 (parcial) | 117,389.98 | 392.08 |
| 2025-08-18 | 0.01735 | 115,236.61 | 1,999.36 |
| 2025-08-19 | 0.00878 | 113,822.74 | 999.36 |
| 2025-10-10 | 0.00833 | 120,000.00 | 999.60 |
| 2025-10-10 | 0.01407 | 111,527.53 | 1,569.19 |
| 2025-10-10 | 0.01713 | 116,810.92 | 2,000.97 |
| 2025-10-13 | 0.00868 | 115,150.11 | 999.50 |
| 2025-10-14 | 0.01799 | 111,133.56 | 1,999.29 |
| 2025-10-28 | 0.00887 | 112,739.15 | 1,000.00 *(nota: nunca se vendió)* |

**Total: 0.10454 BTC — costo total $11,959.36 — precio promedio ponderado $114,399.82**

## Pendiente

Marcar estos 9 registros en Firestore (`Finance_Crypto_Purchases`) con la nota
"analisis IA, compras sin ventas" (agregada, no reemplazando notas existentes). Script
listo en `scripts/annotate-btc-remaining-lots.mjs` — bloqueado por cuota de Firestore
agotada el 2026-07-27, pendiente de reintentar (ver memoria del proyecto).
