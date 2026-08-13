import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import {
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CFormSelect,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import Spinner from 'src/components/shared/Spinner'
import moment from 'src/utils/moment'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import useLocaleData from 'src/hooks/useLocaleData'
import * as actions from 'src/actions/finance/cryptoPurchaseActions'
import { CRYPTO_PURCHASE_SYMBOLS, CRYPTO_PURCHASE_SYMBOL_COLORS } from 'src/constants/finance'
import {
  isSale,
  isAdjustment,
  symbolLabel,
  fmtUSD,
} from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'
import './CryptoDcaReport.scss'

const CURRENT_YEAR = new Date().getFullYear()
const fmtDate = (date) => (date ? moment(date).format('D MMM YYYY') : '')

// Weighted-average cost basis, recomputed chronologically over the FULL
// purchase history (never just the filtered window) — a sell doesn't change
// the average cost of what's left, it only shrinks the position, so slicing
// by date range must not reset the running total or every point after the
// window start would understate real cost basis.
const buildDcaSeries = (allPurchases, symbol) => {
  const sorted = [...allPurchases]
    .filter((p) => p.symbol === symbol && !isAdjustment(p))
    .sort((a, b) =>
      `${a.purchaseDate}${a.purchaseTime || ''}`.localeCompare(
        `${b.purchaseDate}${b.purchaseTime || ''}`,
      ),
    )
  let qty = 0
  let cost = 0
  return sorted.map((p) => {
    const q = Number(p.quantity) || 0
    const price = Number(p.purchasePrice) || 0
    if (isSale(p)) {
      const avgBefore = qty > 0 ? cost / qty : 0
      cost -= q * avgBefore
      qty -= q
    } else {
      cost += q * price
      qty += q
    }
    const avgCost = qty > 0 ? cost / qty : 0
    return { ...p, positionQty: qty, avgCost }
  })
}

const FILTER_PARAM_KEYS = ['symbol', 'dateMode', 'from', 'to', 'year', 'month']

const CryptoDcaReport = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { purchases, loading } = useSelector((s) => s.cryptoPurchase)
  const { monthLabels } = useLocaleData()

  const [searchParams, setSearchParams] = useSearchParams()
  const setParam = (key, value) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === '' || value == null) next.delete(key)
      else next.set(key, String(value))
      return next
    })

  const symbol = searchParams.get('symbol') || CRYPTO_PURCHASE_SYMBOLS[0].value
  const setSymbol = (v) => setParam('symbol', v)
  const dateMode = searchParams.get('dateMode') || 'range' // 'range' | 'month' | 'year'
  const setDateMode = (v) => setParam('dateMode', v)
  const rangeFrom = searchParams.get('from') || ''
  const setRangeFrom = (v) => setParam('from', v)
  const rangeTo = searchParams.get('to') || ''
  const setRangeTo = (v) => setParam('to', v)
  const year = Number(searchParams.get('year')) || CURRENT_YEAR
  const setYear = (v) => setParam('year', v)
  const month = Number(searchParams.get('month')) || null
  const setMonth = (v) => setParam('month', v)

  const clearFilters = () =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      FILTER_PARAM_KEYS.forEach((k) => next.delete(k))
      return next
    })
  const hasFilters = FILTER_PARAM_KEYS.some((k) => searchParams.has(k))

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  // Fetched once per symbol (not a live ticker) — a constantly moving number
  // next to a historical trend line is distracting, and this screen is about
  // the trend, not the current tick.
  const [livePrice, setLivePrice] = useState(null)
  useEffect(() => {
    setLivePrice(null)
    fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
      .then((r) => r.json())
      .then((data) => {
        const price = Number(data.price)
        if (price > 0) setLivePrice(price)
      })
      .catch(() => {})
  }, [symbol])

  const years = useMemo(() => {
    const set = new Set(
      purchases.map((p) => Number((p.purchaseDate || '').slice(0, 4))).filter(Boolean),
    )
    set.add(CURRENT_YEAR)
    return [...set].sort((a, b) => b - a)
  }, [purchases])

  const { dateFrom, dateTo } = useMemo(() => {
    if (dateMode === 'year') return { dateFrom: `${year}-01-01`, dateTo: `${year}-12-31` }
    if (dateMode === 'month' && month) {
      const from = moment(`${year}-${String(month).padStart(2, '0')}-01`)
      return {
        dateFrom: from.format('YYYY-MM-DD'),
        dateTo: from.endOf('month').format('YYYY-MM-DD'),
      }
    }
    if (dateMode === 'month') return { dateFrom: `${year}-01-01`, dateTo: `${year}-12-31` }
    return { dateFrom: rangeFrom, dateTo: rangeTo }
  }, [dateMode, year, month, rangeFrom, rangeTo])

  const fullSeries = useMemo(() => buildDcaSeries(purchases, symbol), [purchases, symbol])

  const visibleSeries = useMemo(
    () =>
      fullSeries
        .filter((p) => !dateFrom || (p.purchaseDate || '') >= dateFrom)
        .filter((p) => !dateTo || (p.purchaseDate || '') <= dateTo),
    [fullSeries, dateFrom, dateTo],
  )

  const latest = visibleSeries[visibleSeries.length - 1] ?? fullSeries[fullSeries.length - 1]
  const gainLossPct =
    latest && latest.avgCost > 0 && livePrice != null
      ? ((livePrice - latest.avgCost) / latest.avgCost) * 100
      : null

  const color = CRYPTO_PURCHASE_SYMBOL_COLORS[symbol] || '#2a78d6'

  return (
    <div className="cdr">
      <h1 className="cdr__title">Costo Promedio (DCA)</h1>
      <p className="cdr__subtitle">
        Evolución del costo promedio ponderado de compra frente al precio en vivo.
      </p>

      <CAccordion className="cdr__help">
        <CAccordionItem itemKey="help">
          <CAccordionHeader>ℹ️ ¿Qué muestra este reporte y para qué sirve?</CAccordionHeader>
          <CAccordionBody>
            <p className="cdr__help-p">
              Este reporte responde una pregunta que ningún otro reporte de Cripto responde
              directamente:{' '}
              <strong>
                ¿en promedio, a cuánto me está saliendo cada unidad del activo que tengo, tomando en
                cuenta TODAS mis compras y ventas históricas?
              </strong>{' '}
              Y a partir de ahí, si el precio de hoy está por encima o por debajo de ese promedio.
            </p>

            <p className="cdr__help-title">Cómo se calcula el costo promedio</p>
            <p className="cdr__help-p">
              Se usa el método de <strong>costo promedio ponderado</strong> (el mismo que usan la
              mayoría de exchanges y apps de portafolio): cada compra suma su costo total (cantidad
              × precio) al costo acumulado y suma su cantidad a la posición. Cada venta{' '}
              <strong>no cambia el costo promedio de lo que queda</strong> — solo reduce la cantidad
              en posición, restando proporcionalmente el costo de lo vendido. El costo promedio en
              cada punto es <code>costo acumulado ÷ cantidad en posición</code>.
            </p>

            <p className="cdr__help-title">El cálculo siempre usa TODO el historial</p>
            <p className="cdr__help-p">
              Los filtros de fecha (Rango / Año y mes / Año){' '}
              <strong>solo recortan qué se muestra</strong> en el gráfico y la tabla — nunca
              reinician el cálculo. Si el cálculo arrancara desde la ventana filtrada, el costo
              promedio quedaría subestimado porque ignoraría compras anteriores que también forman
              parte de tu posición actual. Por eso, aunque filtres “Año: 2026”, el costo promedio
              que ves en cada fila de 2026 sigue reflejando compras de años anteriores si esas
              unidades siguen en tu posición.
            </p>

            <p className="cdr__help-title">Qué significa cada KPI</p>
            <ul className="cdr__help-list">
              <li>
                <strong>Costo promedio actual</strong>: el costo promedio ponderado al último
                movimiento dentro del periodo filtrado (o de todo el historial si no hay movimientos
                en el periodo).
              </li>
              <li>
                <strong>Precio en vivo</strong>: precio actual del activo en Binance, obtenido con
                una sola consulta al cargar la pantalla o al cambiar de Activo — a propósito no se
                actualiza solo, para no distraer de la tendencia histórica.
              </li>
              <li>
                <strong>Ganancia / Pérdida no realizada</strong>: cuánto por encima o por debajo
                está el precio en vivo respecto al costo promedio actual, en porcentaje. Es “no
                realizada” porque nada se ha vendido — es una foto de cómo estarías si vendieras
                todo ahora mismo.
              </li>
              <li>
                <strong>En posición</strong>: cantidad neta del activo que tienes ahora mismo
                (compras acumuladas menos ventas acumuladas, de todo el historial).
              </li>
            </ul>

            <p className="cdr__help-title">Qué muestran el gráfico y la tabla</p>
            <p className="cdr__help-p">
              La línea sólida es el costo promedio después de cada compra o venta; la línea punteada
              gris es el precio en vivo (constante, como referencia). La tabla debajo lista cada
              movimiento con su fecha, tipo, cantidad, precio, el costo promedio resultante y la
              cantidad en posición en ese momento — es el detalle fila por fila detrás del gráfico.
            </p>

            <p className="cdr__help-title">Qué NO incluye</p>
            <p className="cdr__help-p">
              Se excluyen los ajustes de saldo (<code>isAdjustment</code>) — ventas ficticias usadas
              para cuadrar la cantidad registrada contra el saldo real del exchange, sin precio de
              mercado real. Incluirlas distorsionaría el costo promedio con un “precio” que nunca
              existió. Es el mismo criterio que usan Consulta de Compras/Ventas y Totales por
              Plataforma.
            </p>

            <p className="cdr__help-title">Para qué sirve en la práctica</p>
            <p className="cdr__help-p">
              Para saber si tus compras recientes están{' '}
              <strong>subiendo o bajando tu promedio</strong> (comprar caro cuando ya vas verde te
              sube el promedio; comprar barato cuando vas rojo te lo baja), y para decidir con datos
              reales — no con la memoria de “a cuánto compré la última vez” — si conviene seguir
              acumulando, esperar, o si ya estás por encima del punto de equilibrio.
            </p>
          </CAccordionBody>
        </CAccordionItem>
      </CAccordion>

      <div className="cdr__mode-toggle">
        <button
          type="button"
          className={`cdr__mode-btn${dateMode === 'range' ? ' cdr__mode-btn--active' : ''}`}
          onClick={() => setDateMode('range')}
        >
          Rango de fechas
        </button>
        <button
          type="button"
          className={`cdr__mode-btn${dateMode === 'month' ? ' cdr__mode-btn--active' : ''}`}
          onClick={() => setDateMode('month')}
        >
          Año y mes
        </button>
        <button
          type="button"
          className={`cdr__mode-btn${dateMode === 'year' ? ' cdr__mode-btn--active' : ''}`}
          onClick={() => setDateMode('year')}
        >
          Año
        </button>
      </div>

      <div className="cdr__filters">
        <div className="cdr__field">
          <label>Activo</label>
          <CFormSelect size="sm" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            {CRYPTO_PURCHASE_SYMBOLS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </CFormSelect>
        </div>
        {dateMode === 'range' && (
          <>
            <div className="cdr__field">
              <label>Fecha desde</label>
              <input
                type="date"
                className="cdr__input"
                value={rangeFrom}
                onChange={(e) => setRangeFrom(e.target.value)}
              />
            </div>
            <div className="cdr__field">
              <label>Fecha hasta</label>
              <input
                type="date"
                className="cdr__input"
                value={rangeTo}
                onChange={(e) => setRangeTo(e.target.value)}
              />
            </div>
          </>
        )}
        {dateMode === 'year' && (
          <div className="cdr__field">
            <label>Año</label>
            <CFormSelect size="sm" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </CFormSelect>
          </div>
        )}
        {dateMode === 'month' && (
          <>
            <div className="cdr__field">
              <label>Año</label>
              <CFormSelect size="sm" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="cdr__field">
              <label>Mes</label>
              <CFormSelect
                size="sm"
                value={month || ''}
                onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Todos</option>
                {monthLabels.map((label, i) => (
                  <option key={label} value={i + 1}>
                    {label}
                  </option>
                ))}
              </CFormSelect>
            </div>
          </>
        )}
        {hasFilters && (
          <div className="cdr__field cdr__field--clear">
            <label>&nbsp;</label>
            <button type="button" className="cdr__clear-btn" onClick={clearFilters}>
              ✕ Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <Spinner mode="section" />
      ) : (
        <>
          <div className="cdr__kpis">
            <div className="cdr__kpi">
              <div className="cdr__kpi-label">Costo promedio actual</div>
              <div className="cdr__kpi-value">{latest ? fmtUSD(latest.avgCost) : '—'}</div>
            </div>
            <div className="cdr__kpi">
              <div className="cdr__kpi-label">Precio en vivo</div>
              <div className="cdr__kpi-value">{livePrice != null ? fmtUSD(livePrice) : '—'}</div>
            </div>
            <div className="cdr__kpi">
              <div className="cdr__kpi-label">Ganancia / Pérdida no realizada</div>
              <div
                className={`cdr__kpi-value${
                  gainLossPct == null
                    ? ''
                    : gainLossPct >= 0
                      ? ' cdr__kpi-value--positive'
                      : ' cdr__kpi-value--negative'
                }`}
              >
                {gainLossPct == null
                  ? '—'
                  : `${gainLossPct >= 0 ? '+' : ''}${gainLossPct.toFixed(2)}%`}
              </div>
            </div>
            <div className="cdr__kpi">
              <div className="cdr__kpi-label">En posición</div>
              <div className="cdr__kpi-value">{(latest?.positionQty ?? 0).toFixed(8)}</div>
            </div>
          </div>

          {visibleSeries.length === 0 ? (
            <p className="cdr__empty">
              Sin compras de {symbolLabel(symbol)} en el periodo seleccionado.
            </p>
          ) : (
            <>
              <div className="cdr__chart">
                <CChartLine
                  style={{ maxHeight: 320 }}
                  data={{
                    labels: visibleSeries.map((p) => fmtDate(p.purchaseDate)),
                    datasets: [
                      {
                        label: 'Costo promedio',
                        data: visibleSeries.map((p) => p.avgCost),
                        borderColor: color,
                        backgroundColor: color,
                        borderWidth: 2,
                        pointRadius: 3,
                        tension: 0.2,
                        fill: false,
                      },
                      ...(livePrice != null
                        ? [
                            {
                              label: 'Precio en vivo',
                              data: visibleSeries.map(() => livePrice),
                              borderColor: 'rgba(128,128,128,0.6)',
                              borderDash: [6, 4],
                              borderWidth: 1.5,
                              pointRadius: 0,
                              tension: 0,
                              fill: false,
                            },
                          ]
                        : []),
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 12 } },
                      tooltip: {
                        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmtUSD(ctx.raw)}` },
                      },
                    },
                    scales: {
                      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                      y: {
                        grid: { color: 'rgba(0,0,0,0.06)' },
                        ticks: { font: { size: 10 }, callback: (v) => fmtUSD(v) },
                      },
                    },
                  }}
                />
              </div>

              <div className="cdr__ledger">
                <div className="cdr__scroll">
                  <table className="cdr__table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th className="num">Cantidad</th>
                        <th className="num">Precio</th>
                        <th className="num">Costo promedio</th>
                        <th className="num">En posición</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleSeries.map((p) => (
                        <tr key={p.id}>
                          <td>{fmtDate(p.purchaseDate)}</td>
                          <td>
                            <span
                              className={`cdr__pill${isSale(p) ? ' cdr__pill--sell' : ' cdr__pill--buy'}`}
                            >
                              {isSale(p) ? 'Venta' : 'Compra'}
                            </span>
                          </td>
                          <td className="num">{p.quantity}</td>
                          <td className="num">{fmtUSD(p.purchasePrice)}</td>
                          <td className="num">{fmtUSD(p.avgCost)}</td>
                          <td className="num">{p.positionQty.toFixed(8)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default CryptoDcaReport
