import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { CFormSelect } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'
import MultiSelectDropdown from 'src/components/shared/MultiSelectDropdown'
import moment from 'src/utils/moment'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import useLocaleData from 'src/hooks/useLocaleData'
import { useCryptoPrices } from 'src/views/Finance/trade/Prices/useCryptoPrices'
import * as actions from 'src/actions/finance/cryptoPurchaseActions'
import {
  CRYPTO_PURCHASE_SYMBOLS,
  CRYPTO_PURCHASE_PLATFORMS,
  CRYPTO_PURCHASE_TYPES,
  CRYPTO_PURCHASE_LINK_STATUS,
} from 'src/constants/finance'
import {
  isSale,
  isAdjustment,
  symbolLabel,
  platformLabel,
  fmtUSD,
} from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'
import './CryptoQuery.scss'

const CURRENT_YEAR = new Date().getFullYear()
const fmtDateLong = (date) => (date ? moment(date).format('D [de] MMMM [de] YYYY') : '')
const monthOf = (dateStr) => Number((dateStr || '').slice(5, 7)) || null
const identity = (v) => v

// MultiSelectDropdown represents "Todos unchecked to none" with an internal Symbol
// added to the Set — fine for plain useState, but Array#join throws on a Symbol,
// so a URL-backed Set needs its own URL-safe stand-in for that "none" state.
const NONE_MARKER = 'crypto-query:none'

const parseMultiParam = (raw, parse) =>
  raw === NONE_MARKER
    ? new Set([NONE_MARKER])
    : new Set((raw || '').split(',').filter(Boolean).map(parse))

// Backs a MultiSelectDropdown filter with a comma-joined URL param instead of useState.
// `parse` converts each raw string back to its real type (e.g. Number for months).
const useMultiParam = (searchParams, setSearchParams, key, parse = identity) => {
  const selected = useMemo(
    () => parseMultiParam(searchParams.get(key), parse),
    [searchParams, key, parse],
  )

  const setSelected = (updater) =>
    setSearchParams((prev) => {
      const current = parseMultiParam(prev.get(key), parse)
      const updated = typeof updater === 'function' ? updater(current) : updater
      const next = new URLSearchParams(prev)
      const realValues = [...updated].filter((v) => typeof v !== 'symbol')
      if (realValues.length !== updated.size) next.set(key, NONE_MARKER)
      else if (updated.size === 0) next.delete(key)
      else next.set(key, realValues.join(','))
      return next
    })
  return [selected, setSelected]
}

const FILTER_PARAM_KEYS = [
  'symbol',
  'platform',
  'types',
  'link',
  'dateMode',
  'from',
  'to',
  'year',
  'months',
  'priceMin',
  'priceMax',
  'totalMin',
  'totalMax',
  'groupByQty',
  'minGroupCount',
]

const CryptoQuery = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { purchases, loading } = useSelector((s) => s.cryptoPurchase)
  const { monthLabels } = useLocaleData()
  const { prices } = useCryptoPrices()

  // Filters live in the URL (not useState) so a page refresh restores exactly
  // what was applied instead of resetting to defaults.
  const [searchParams, setSearchParams] = useSearchParams()

  const setParam = (key, value) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === '' || value == null || value === false) next.delete(key)
      else next.set(key, String(value))
      return next
    })

  const symbol = searchParams.get('symbol') || CRYPTO_PURCHASE_SYMBOLS[0].value
  const setSymbol = (v) => setParam('symbol', v)
  const platform = searchParams.get('platform') || 'binance_arg'
  const setPlatform = (v) => setParam('platform', v)
  const dateMode = searchParams.get('dateMode') || 'range' // 'range' | 'month' | 'year'
  const setDateMode = (v) => setParam('dateMode', v)
  const rangeFrom = searchParams.get('from') || ''
  const setRangeFrom = (v) => setParam('from', v)
  const rangeTo = searchParams.get('to') || ''
  const setRangeTo = (v) => setParam('to', v)
  const year = Number(searchParams.get('year')) || CURRENT_YEAR
  const setYear = (v) => setParam('year', v)
  const priceMin = searchParams.get('priceMin') || ''
  const setPriceMin = (v) => setParam('priceMin', v)
  const priceMax = searchParams.get('priceMax') || ''
  const setPriceMax = (v) => setParam('priceMax', v)
  const totalMin = searchParams.get('totalMin') || ''
  const setTotalMin = (v) => setParam('totalMin', v)
  const totalMax = searchParams.get('totalMax') || ''
  const setTotalMax = (v) => setParam('totalMax', v)
  const groupByQty = searchParams.get('groupByQty') === '1'
  const setGroupByQty = (v) => setParam('groupByQty', v ? '1' : '')
  const minGroupCount = searchParams.get('minGroupCount') || ''
  const setMinGroupCount = (v) => setParam('minGroupCount', v)

  const [selectedTypes, setSelectedTypes] = useMultiParam(searchParams, setSearchParams, 'types')
  const [selectedLinkStatus, setSelectedLinkStatus] = useMultiParam(
    searchParams,
    setSearchParams,
    'link',
  )
  const [selectedMonths, setSelectedMonths] = useMultiParam(
    searchParams,
    setSearchParams,
    'months',
    Number,
  )

  const clearFilters = () =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      FILTER_PARAM_KEYS.forEach((k) => next.delete(k))
      return next
    })
  const hasFilters = FILTER_PARAM_KEYS.some((k) => searchParams.has(k))

  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [editMode, setEditMode] = useState(false)
  const [selectedForLink, setSelectedForLink] = useState(null)
  // Array of { key, dir } in priority order — plain click sorts by that column
  // alone; shift-click adds/toggles it as an extra tiebreaker level (like a
  // spreadsheet's multi-column sort) without discarding the earlier columns.
  const [sort, setSort] = useState([{ key: 'purchaseDate', dir: 'desc' }])
  const toggleSort = (key, additive) => {
    setSort((prev) => {
      const existing = prev.find((s) => s.key === key)
      if (!additive) {
        const dir =
          prev.length === 1 && existing ? (existing.dir === 'asc' ? 'desc' : 'asc') : 'asc'
        return [{ key, dir }]
      }
      if (existing) {
        return prev.map((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : s))
      }
      return [...prev, { key, dir: 'asc' }]
    })
  }

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

  // 'month' mode bounds the year like 'year' mode does, then narrows further
  // by the selected months below — a multiselect can't collapse to one
  // contiguous date range the way a single month picker could.
  const { dateFrom, dateTo } =
    dateMode === 'month' || dateMode === 'year'
      ? { dateFrom: `${year}-01-01`, dateTo: `${year}-12-31` }
      : { dateFrom: rangeFrom, dateTo: rangeTo }

  const livePrice = prices[symbol]?.price ?? null

  const filtered = useMemo(() => {
    const priceFloor = priceMin !== '' ? Number(priceMin) : null
    const priceCeil = priceMax !== '' ? Number(priceMax) : null
    const totalFloor = totalMin !== '' ? Number(totalMin) : null
    const totalCeil = totalMax !== '' ? Number(totalMax) : null
    return purchases
      .filter((p) => p.symbol === symbol && !isAdjustment(p))
      .map((p) => {
        const total = (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0)
        const pnl =
          livePrice != null && !isSale(p) ? (Number(p.quantity) || 0) * livePrice - total : null
        return { ...p, total, pnl }
      })
      .filter((p) => platform === 'all' || p.platform === platform)
      .filter((p) => selectedTypes.size === 0 || selectedTypes.has(isSale(p) ? 'sell' : 'buy'))
      .filter(
        (p) =>
          selectedLinkStatus.size === 0 ||
          selectedLinkStatus.has(p.matchGroupId ? 'linked' : 'unlinked'),
      )
      .filter((p) => !dateFrom || (p.purchaseDate || '') >= dateFrom)
      .filter((p) => !dateTo || (p.purchaseDate || '') <= dateTo)
      .filter(
        (p) =>
          dateMode !== 'month' ||
          selectedMonths.size === 0 ||
          selectedMonths.has(monthOf(p.purchaseDate)),
      )
      .filter((p) => priceFloor == null || (Number(p.purchasePrice) || 0) >= priceFloor)
      .filter((p) => priceCeil == null || (Number(p.purchasePrice) || 0) <= priceCeil)
      .filter((p) => totalFloor == null || p.total >= totalFloor)
      .filter((p) => totalCeil == null || p.total <= totalCeil)
  }, [
    purchases,
    symbol,
    platform,
    selectedTypes,
    selectedLinkStatus,
    dateMode,
    selectedMonths,
    dateFrom,
    dateTo,
    priceMin,
    priceMax,
    totalMin,
    totalMax,
    livePrice,
  ])

  const sortedFiltered = useMemo(() => {
    const compare = (a, b, key) =>
      key === 'purchaseDate' || key === 'type' || key === 'notes'
        ? String(a[key] || '').localeCompare(String(b[key] || ''))
        : (Number(a[key]) || 0) - (Number(b[key]) || 0)
    return [...filtered].sort((a, b) => {
      for (const { key, dir } of sort) {
        const cmp = compare(a, b, key)
        if (cmp !== 0) return dir === 'asc' ? cmp : -cmp
      }
      return 0
    })
  }, [filtered, sort])

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
        <div className="cq__field">
          <label>Tipo</label>
          <MultiSelectDropdown
            label={(size) => (size > 0 ? `Tipo (${size})` : 'Tipo: Todos')}
            options={CRYPTO_PURCHASE_TYPES}
            selected={selectedTypes}
            onToggle={(value) =>
              setSelectedTypes((prev) => {
                const next = new Set(prev)
                next.has(value) ? next.delete(value) : next.add(value)
                return next
              })
            }
            onClearAll={() => setSelectedTypes(new Set())}
          />
        </div>
        <div className="cq__field">
          <label>Vínculo</label>
          <MultiSelectDropdown
            label={(size) => (size > 0 ? `Vínculo (${size})` : 'Vínculo: Todos')}
            options={CRYPTO_PURCHASE_LINK_STATUS}
            selected={selectedLinkStatus}
            onToggle={(value) =>
              setSelectedLinkStatus((prev) => {
                const next = new Set(prev)
                next.has(value) ? next.delete(value) : next.add(value)
                return next
              })
            }
            onClearAll={() => setSelectedLinkStatus(new Set())}
          />
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
              <MultiSelectDropdown
                label={(size) => (size > 0 ? `Mes (${size})` : 'Mes: Todos')}
                options={monthLabels.map((label, i) => ({ value: i + 1, label }))}
                selected={selectedMonths}
                onToggle={(value) =>
                  setSelectedMonths((prev) => {
                    const next = new Set(prev)
                    next.has(value) ? next.delete(value) : next.add(value)
                    return next
                  })
                }
                onClearAll={() => setSelectedMonths(new Set())}
              />
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
        <div className="cq__field">
          <label>Total ≥</label>
          <input
            type="number"
            step="any"
            className="cq__input"
            placeholder="0.00"
            value={totalMin}
            onChange={(e) => setTotalMin(e.target.value)}
          />
        </div>
        <div className="cq__field">
          <label>Total ≤</label>
          <input
            type="number"
            step="any"
            className="cq__input"
            placeholder="0.00"
            value={totalMax}
            onChange={(e) => setTotalMax(e.target.value)}
          />
        </div>
        {hasFilters && (
          <div className="cq__field cq__field--clear">
            <label>&nbsp;</label>
            <button type="button" className="cq__clear-btn" onClick={clearFilters}>
              ✕ Limpiar filtros
            </button>
          </div>
        )}
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
                      {[
                        { key: 'purchaseDate', label: 'Fecha' },
                        { key: 'type', label: 'Tipo' },
                        { key: 'quantity', label: 'Cantidad', num: true },
                        { key: 'purchasePrice', label: 'Precio', num: true },
                        { key: 'total', label: 'Total', num: true },
                        { key: 'pnl', label: 'PnL / P&L', num: true },
                        { key: 'notes', label: 'Notas' },
                      ].map((col) => {
                        const sortIndex = sort.findIndex((s) => s.key === col.key)
                        const active = sortIndex !== -1
                        return (
                          <th
                            key={col.key}
                            className={`cq__th--sortable${col.num ? ' num' : ''}`}
                            onClick={(e) => toggleSort(col.key, e.shiftKey)}
                            title="Clic: ordenar por esta columna · Shift+clic: agregar como criterio adicional"
                          >
                            {col.label}
                            {active && (
                              <span className="cq__th-sort-arrow">
                                {sort.length > 1 && <sup>{sortIndex + 1}</sup>}
                                {sort[sortIndex].dir === 'asc' ? ' ▲' : ' ▼'}
                              </span>
                            )}
                          </th>
                        )
                      })}
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
                    : sortedFiltered.map((p) => {
                        const total = p.total
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
                            <td className="num">
                              {p.pnl == null ? (
                                <span className="cq__muted">—</span>
                              ) : (
                                <span
                                  className={`cq__amount${p.pnl >= 0 ? ' cq__amount--positive' : ' cq__amount--negative'}`}
                                >
                                  {p.pnl >= 0 ? '+' : ''}
                                  {fmtUSD(p.pnl)}
                                </span>
                              )}
                            </td>
                            <td className="cq__notes-cell" title={p.notes || undefined}>
                              {p.notes}
                            </td>
                          </tr>
                        )
                      })}
                  {(groupByQty ? groupedRows.length === 0 : filtered.length === 0) && (
                    <tr>
                      <td colSpan={groupByQty ? 5 : 7} className="cq__empty">
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
