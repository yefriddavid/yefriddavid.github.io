import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CFormSelect } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'
import moment from 'src/utils/moment'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import useLocaleData from 'src/hooks/useLocaleData'
import * as actions from 'src/actions/finance/cryptoPurchaseActions'
import { CRYPTO_PURCHASE_SYMBOLS, CRYPTO_PURCHASE_PLATFORMS } from 'src/constants/finance'
import {
  isSale,
  isAdjustment,
  symbolLabel,
  platformLabel,
  fmtUSD,
} from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'
import './CryptoQuery.scss'

const CURRENT_YEAR = new Date().getFullYear()
const pad2 = (n) => String(n).padStart(2, '0')
const lastDayOfMonth = (year, month) => new Date(year, month, 0).getDate()
const fmtDateLong = (date) => (date ? moment(date).format('D [de] MMMM [de] YYYY') : '')

const CryptoQuery = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { purchases, loading } = useSelector((s) => s.cryptoPurchase)
  const { monthLabels } = useLocaleData()

  const [symbol, setSymbol] = useState(CRYPTO_PURCHASE_SYMBOLS[0].value)
  const [platform, setPlatform] = useState('binance_arg')
  const [dateMode, setDateMode] = useState('range') // 'range' | 'month' | 'year'
  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [groupByQty, setGroupByQty] = useState(false)
  const [minGroupCount, setMinGroupCount] = useState('')
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [editMode, setEditMode] = useState(false)
  const [selectedForLink, setSelectedForLink] = useState(null)

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  const years = useMemo(() => {
    const set = new Set(
      purchases.map((p) => Number((p.purchaseDate || '').slice(0, 4))).filter(Boolean),
    )
    set.add(CURRENT_YEAR)
    return [...set].sort((a, b) => b - a)
  }, [purchases])

  const { dateFrom, dateTo } =
    dateMode === 'month'
      ? {
          dateFrom: `${year}-${pad2(month)}-01`,
          dateTo: `${year}-${pad2(month)}-${pad2(lastDayOfMonth(year, month))}`,
        }
      : dateMode === 'year'
        ? { dateFrom: `${year}-01-01`, dateTo: `${year}-12-31` }
        : { dateFrom: rangeFrom, dateTo: rangeTo }

  const filtered = useMemo(() => {
    const min = priceMin !== '' ? Number(priceMin) : null
    const max = priceMax !== '' ? Number(priceMax) : null
    return purchases
      .filter((p) => p.symbol === symbol && !isAdjustment(p))
      .filter((p) => platform === 'all' || p.platform === platform)
      .filter((p) => !dateFrom || (p.purchaseDate || '') >= dateFrom)
      .filter((p) => !dateTo || (p.purchaseDate || '') <= dateTo)
      .filter((p) => min == null || (Number(p.purchasePrice) || 0) >= min)
      .filter((p) => max == null || (Number(p.purchasePrice) || 0) <= max)
      .sort((a, b) => (b.purchaseDate || '').localeCompare(a.purchaseDate || ''))
  }, [purchases, symbol, platform, dateFrom, dateTo, priceMin, priceMax])

  const totals = useMemo(() => {
    const buys = filtered.filter((p) => !isSale(p))
    const sells = filtered.filter((p) => isSale(p))
    const buysQty = buys.reduce((s, p) => s + (Number(p.quantity) || 0), 0)
    const sellsQty = sells.reduce((s, p) => s + (Number(p.quantity) || 0), 0)
    const invested = buys.reduce(
      (s, p) => s + (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0),
      0,
    )
    const proceeds = sells.reduce(
      (s, p) => s + (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0),
      0,
    )
    return {
      buysCount: buys.length,
      sellsCount: sells.length,
      buysQty,
      sellsQty,
      invested,
      proceeds,
      net: proceeds - invested,
    }
  }, [filtered])

  const groupedRows = useMemo(() => {
    const map = new Map()
    filtered.forEach((p) => {
      const sale = isSale(p)
      const key = String(p.quantity)
      const total = (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0)
      const g = map.get(key) || {
        key,
        quantity: p.quantity,
        count: 0,
        total: 0,
        buysCount: 0,
        sellsCount: 0,
        records: [],
      }
      g.count += 1
      g.total += total
      if (sale) g.sellsCount += 1
      else g.buysCount += 1
      g.records.push(p)
      map.set(key, g)
    })
    const minCount = minGroupCount !== '' ? Number(minGroupCount) : null
    return [...map.values()]
      .filter((g) => minCount == null || g.count >= minCount)
      .sort((a, b) => Number(b.quantity) - Number(a.quantity))
  }, [filtered, minGroupCount])

  const toggleGroup = (key) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const handleRowClick = (p) => {
    if (!editMode) return

    if (p.matchGroupId) {
      if (window.confirm('¿Desvincular este par de compra/venta?')) {
        const partner = purchases.find((x) => x.id !== p.id && x.matchGroupId === p.matchGroupId)
        dispatch(actions.updateRequest({ ...p, matchGroupId: null }))
        if (partner) dispatch(actions.updateRequest({ ...partner, matchGroupId: null }))
      }
      return
    }

    if (!selectedForLink) {
      setSelectedForLink(p)
      return
    }

    if (selectedForLink.id === p.id) {
      setSelectedForLink(null)
      return
    }

    if (isSale(selectedForLink) === isSale(p)) {
      window.alert('Solo podés vincular una compra con una venta.')
      setSelectedForLink(null)
      return
    }

    const buy = isSale(selectedForLink) ? p : selectedForLink
    const sell = isSale(selectedForLink) ? selectedForLink : p
    const confirmed = window.confirm(
      '¿Vincular estos dos registros como compra/venta?\n\n' +
        `Compra: ${fmtDateLong(buy.purchaseDate)} — ${buy.quantity} @ ${fmtUSD(buy.purchasePrice)}\n` +
        `Venta: ${fmtDateLong(sell.purchaseDate)} — ${sell.quantity} @ ${fmtUSD(sell.purchasePrice)}`,
    )
    if (confirmed) {
      const matchGroupId = crypto.randomUUID()
      dispatch(actions.updateRequest({ ...selectedForLink, matchGroupId }))
      dispatch(actions.updateRequest({ ...p, matchGroupId }))
    }
    setSelectedForLink(null)
  }

  return (
    <div className="cq">
      <h1 className="cq__title">Consulta de Compras/Ventas</h1>
      <p className="cq__subtitle">
        Filtra un activo por rango de fechas y de precio para revisar sus operaciones.
      </p>

      <div className="cq__mode-toggle">
        <button
          type="button"
          className={`cq__mode-btn${dateMode === 'range' ? ' cq__mode-btn--active' : ''}`}
          onClick={() => setDateMode('range')}
        >
          Rango de fechas
        </button>
        <button
          type="button"
          className={`cq__mode-btn${dateMode === 'month' ? ' cq__mode-btn--active' : ''}`}
          onClick={() => setDateMode('month')}
        >
          Año y mes
        </button>
        <button
          type="button"
          className={`cq__mode-btn${dateMode === 'year' ? ' cq__mode-btn--active' : ''}`}
          onClick={() => setDateMode('year')}
        >
          Año
        </button>
      </div>

      <div className="cq__filters">
        <div className="cq__field">
          <label>Activo</label>
          <CFormSelect size="sm" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            {CRYPTO_PURCHASE_SYMBOLS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </CFormSelect>
        </div>
        <div className="cq__field">
          <label>Plataforma</label>
          <CFormSelect size="sm" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="all">Todas</option>
            {CRYPTO_PURCHASE_PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </CFormSelect>
        </div>
        {dateMode === 'range' ? (
          <>
            <div className="cq__field">
              <label>Fecha desde</label>
              <input
                type="date"
                className="cq__input"
                value={rangeFrom}
                onChange={(e) => setRangeFrom(e.target.value)}
              />
            </div>
            <div className="cq__field">
              <label>Fecha hasta</label>
              <input
                type="date"
                className="cq__input"
                value={rangeTo}
                onChange={(e) => setRangeTo(e.target.value)}
              />
            </div>
          </>
        ) : dateMode === 'year' ? (
          <div className="cq__field">
            <label>Año</label>
            <CFormSelect size="sm" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </CFormSelect>
          </div>
        ) : (
          <>
            <div className="cq__field">
              <label>Año</label>
              <CFormSelect size="sm" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="cq__field">
              <label>Mes</label>
              <CFormSelect
                size="sm"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {monthLabels.map((label, i) => (
                  <option key={i + 1} value={i + 1}>
                    {label}
                  </option>
                ))}
              </CFormSelect>
            </div>
          </>
        )}
        <div className="cq__field">
          <label>Precio mínimo</label>
          <input
            type="number"
            step="any"
            className="cq__input"
            placeholder="0.00"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
        </div>
        <div className="cq__field">
          <label>Precio máximo</label>
          <input
            type="number"
            step="any"
            className="cq__input"
            placeholder="0.00"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Spinner mode="section" />
      ) : (
        <>
          <div className="cq__kpis">
            <div className="cq__kpi cq__kpi--buy">
              <div className="cq__kpi-label">Compras</div>
              <div className="cq__kpi-value">{totals.buysCount}</div>
              <div className="cq__kpi-sub">{fmtUSD(totals.invested)} invertidos</div>
            </div>
            <div className="cq__kpi cq__kpi--sell">
              <div className="cq__kpi-label">Ventas</div>
              <div className="cq__kpi-value">{totals.sellsCount}</div>
              <div className="cq__kpi-sub">{fmtUSD(totals.proceeds)} recibidos</div>
            </div>
            <div className="cq__kpi">
              <div className="cq__kpi-label">Neto (Ventas − Compras)</div>
              <div className="cq__kpi-value cq__kpi-value--neutral">
                {fmtUSD(Math.abs(totals.net))}
              </div>
            </div>
          </div>

          <div className="cq__ledger">
            <div className="cq__panel-header">
              <p className="cq__panel-title">
                {symbolLabel(symbol)} — {filtered.length} operaciones
              </p>
              <div className="cq__group-controls">
                <label className="cq__group-toggle">
                  <input
                    type="checkbox"
                    checked={editMode}
                    onChange={(e) => {
                      setEditMode(e.target.checked)
                      setSelectedForLink(null)
                    }}
                  />
                  Modo edición
                </label>
                <label className="cq__group-toggle">
                  <input
                    type="checkbox"
                    checked={groupByQty}
                    onChange={(e) => setGroupByQty(e.target.checked)}
                  />
                  Agrupar por cantidad
                </label>
                {groupByQty && (
                  <label className="cq__group-toggle">
                    Mín. operaciones
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="cq__input cq__input--sm"
                      placeholder="1"
                      value={minGroupCount}
                      onChange={(e) => setMinGroupCount(e.target.value)}
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="cq__scroll">
              <table className="cq__table">
                <thead>
                  {groupByQty ? (
                    <tr>
                      <th className="cq__expand-col" />
                      <th className="num">Cantidad</th>
                      <th>Tipo</th>
                      <th className="num">Operaciones</th>
                      <th className="num">Total</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th className="num">Cantidad</th>
                      <th className="num">Precio</th>
                      <th className="num">Total</th>
                      <th>Plataforma</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {groupByQty
                    ? groupedRows.map((g) => {
                        const expanded = expandedGroups.has(g.key)
                        return (
                          <React.Fragment key={g.key}>
                            <tr className="cq__group-row" onClick={() => toggleGroup(g.key)}>
                              <td className="cq__expand-col">
                                <span
                                  className={`cq__chevron${expanded ? ' cq__chevron--open' : ''}`}
                                >
                                  ▸
                                </span>
                              </td>
                              <td className="num">{g.quantity}</td>
                              <td>
                                {g.buysCount > 0 && (
                                  <span className="cq__pill cq__pill--buy">
                                    <span className="cq__dot" />
                                    Compra ({g.buysCount})
                                  </span>
                                )}
                                {g.sellsCount > 0 && (
                                  <span className="cq__pill cq__pill--sell">
                                    <span className="cq__dot" />
                                    Venta ({g.sellsCount})
                                  </span>
                                )}
                              </td>
                              <td className="num">{g.count}</td>
                              <td className="num">{fmtUSD(g.total)}</td>
                            </tr>
                            {expanded && (
                              <tr className="cq__detail-row">
                                <td />
                                <td colSpan={4}>
                                  <table className="cq__detail-table">
                                    <thead>
                                      <tr>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th className="num">Precio</th>
                                        <th className="num">Total</th>
                                        <th>Plataforma</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {g.records.map((p) => (
                                        <tr key={p.id}>
                                          <td>{fmtDateLong(p.purchaseDate)}</td>
                                          <td>
                                            {isSale(p) ? (
                                              <span className="cq__pill cq__pill--sell">
                                                <span className="cq__dot" />
                                                Venta
                                              </span>
                                            ) : (
                                              <span className="cq__pill cq__pill--buy">
                                                <span className="cq__dot" />
                                                Compra
                                              </span>
                                            )}
                                          </td>
                                          <td className="num">{fmtUSD(p.purchasePrice)}</td>
                                          <td className="num">
                                            {fmtUSD(
                                              (Number(p.quantity) || 0) *
                                                (Number(p.purchasePrice) || 0),
                                            )}
                                          </td>
                                          <td>{platformLabel(p.platform)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })
                    : filtered.map((p) => {
                        const total = (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0)
                        const rowClass = [
                          editMode && 'cq__row--editable',
                          selectedForLink?.id === p.id && 'cq__row--selected',
                          p.matchGroupId && 'cq__row--linked',
                        ]
                          .filter(Boolean)
                          .join(' ')
                        return (
                          <tr
                            key={p.id}
                            className={rowClass || undefined}
                            onClick={() => handleRowClick(p)}
                          >
                            <td>{fmtDateLong(p.purchaseDate)}</td>
                            <td>
                              {isSale(p) ? (
                                <span className="cq__pill cq__pill--sell">
                                  <span className="cq__dot" />
                                  Venta
                                </span>
                              ) : (
                                <span className="cq__pill cq__pill--buy">
                                  <span className="cq__dot" />
                                  Compra
                                </span>
                              )}
                              {p.matchGroupId && (
                                <span className="cq__link-badge" title="Vinculado">
                                  🔗
                                </span>
                              )}
                            </td>
                            <td className="num">{p.quantity}</td>
                            <td className="num">{fmtUSD(p.purchasePrice)}</td>
                            <td className="num">{fmtUSD(total)}</td>
                            <td>{platformLabel(p.platform)}</td>
                          </tr>
                        )
                      })}
                  {(groupByQty ? groupedRows.length === 0 : filtered.length === 0) && (
                    <tr>
                      <td colSpan={groupByQty ? 5 : 6} className="cq__empty">
                        Sin operaciones para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
                {!groupByQty && (
                  <tfoot>
                    <tr className="cq__total-row">
                      <td colSpan={2}>Total compras ({totals.buysCount})</td>
                      <td className="num">{totals.buysQty.toFixed(8)}</td>
                      <td className="num">—</td>
                      <td className="num">{fmtUSD(totals.invested)}</td>
                      <td />
                    </tr>
                    <tr className="cq__total-row">
                      <td colSpan={2}>Total ventas ({totals.sellsCount})</td>
                      <td className="num">{totals.sellsQty.toFixed(8)}</td>
                      <td className="num">—</td>
                      <td className="num">{fmtUSD(totals.proceeds)}</td>
                      <td />
                    </tr>
                    <tr className="cq__total-row cq__total-row--net">
                      <td colSpan={4}>Neto (Ventas − Compras)</td>
                      <td className="num" colSpan={2}>
                        <span className="cq__amount cq__amount--neutral">
                          {fmtUSD(Math.abs(totals.net))}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CryptoQuery
