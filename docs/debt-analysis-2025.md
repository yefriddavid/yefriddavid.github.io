# Análisis de deuda vs. inversión en BTC (2026-07-27)

Análisis puntual, no ligado a ninguna pantalla de la app — hecho a partir de datos que el
usuario dio directamente en conversación, más el análisis de lotes BTC ya documentado en
`docs/btc-remaining-lots-2025.md`.

## Datos de partida

| | Valor |
|---|---|
| Deuda año pasado | $12,000 USD |
| Deuda actual | $10,000 USD |
| Reducción de deuda en el año | -$2,000 (-16.7%) |
| Compras en BTC este año | $16,000 USD |
| Origen de esos $16,000 | Mezcla de ingresos **y deuda nueva** (no 100% ahorros propios) |
| Tasa de interés de la deuda | ~4.5% efectivo anual (EA) |

## Hallazgo 1 — La deuda no bajó, se reemplazó

Por cada $1 abonado a deuda, se pusieron **$8 en BTC** (16,000 / 2,000). No fue un año de
priorizar pagar deuda — la reducción de $2,000 fue casi incidental frente al volumen que entró
a comprar BTC. Además, una parte del dinero para comprar BTC fue deuda nueva, no ingresos
propios — es decir, hay apalancamiento: se pidió prestado para comprar un activo volátil.

**Costo de oportunidad:** si esos mismos $16,000 se hubieran destinado a la deuda en vez de a
BTC, la deuda original de $12,000 se habría cancelado por completo, con **$4,000 de sobrante**.
En cambio, hoy se siguen debiendo $10,000 **y además** se sostiene una posición en BTC que hoy
vale menos de lo que costó.

## Hallazgo 2 — La tasa de la deuda es barata; el problema es el activo

Al 4.5% EA sobre $10,000, el costo de la deuda es de **~$450/año** en intereses — una tasa
manejable, lejos de tarjeta de crédito o gota a gota informal.

Comparado contra la pérdida no realizada en los lotes de BTC que quedaron sin vender (ver
`docs/btc-remaining-lots-2025.md`):

| | Monto |
|---|---|
| Costo/año de la deuda (4.5% EA sobre $10,000) | ~$450 |
| Pérdida no realizada en BTC (costo $11,959.36 → valor hoy $6,774.51, a BTC=$64,803) | -$5,184.85 |

La pérdida en BTC es **~11.5 veces** más grande que un año entero de intereses de la deuda.
El problema no es haber usado deuda para invertir — la tasa (4.5%) es baja. El problema es que
el activo comprado con esa deuda cayó mucho más rápido de lo que la deuda cuesta.

## Hallazgo 3 — Punto de equilibrio

Precio promedio ponderado de compra de los lotes que quedan sin vender: **$114,399.82/BTC**
(ver `docs/btc-remaining-lots-2025.md`). Precio de BTC al momento del análisis: **$64,803**.

BTC necesita subir **~76.5%** desde el precio usado en el análisis solo para que esa posición
vuelva a estar en tablas — sin contar los ~$450/año que la deuda sigue costando mientras tanto.
Cada año que BTC se mantenga por debajo de $114,399.82, se suma otro ~4.5% de costo de deuda
encima de una posición que ya está ~43% abajo.

## Conclusión

- La tasa de la deuda (4.5% EA) **no es el problema urgente** — es barata y manejable por sí
  sola.
- El riesgo real es la **concentración y el apalancamiento**: se tomó deuda barata para comprar
  un activo volátil que hoy está en pérdida significativa.
- Mientras BTC no recupere ~$114k, cada mes que pasa suma un poco más de costo (el interés de
  la deuda) a una posición que ya perdió mucho más que eso.
- Si BTC se recupera por encima del costo promedio, el apalancamiento pudo haber sido una
  apuesta razonable dado lo barata que es la deuda (4.5% es un umbral bajo de superar). Si no
  se recupera, se pagan intereses **y** se pierde valor del activo al mismo tiempo.
