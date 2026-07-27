import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import * as XLSX from 'xlsx'
import { CFormSelect } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'
import MultiSelectDropdown from 'src/components/shared/MultiSelectDropdown'
import AppModal from 'src/components/shared/AppModal'
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

const DEFAULT_SORT = [{ key: 'purchaseDate', dir: 'desc' }]
const parseSort = (raw) => {
  if (!raw) return DEFAULT_SORT
  const parsed = raw
    .split(',')
    .map((part) => {
      const [key, dir] = part.split(':')
      return key ? { key, dir: dir === 'asc' ? 'asc' : 'desc' } : null
    })
    .filter(Boolean)
  return parsed.length > 0 ? parsed : DEFAULT_SORT
}
const serializeSort = (sort) => sort.map((s) => `${s.key}:${s.dir}`).join(',')

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

// Named URL snapshots — every filter/sort/mode above already lives in the URL,
// so "saving a view" is just naming the current pathname+search string.
const SAVED_VIEWS_KEY = 'cryptoQuery.savedViews'
const loadSavedViews = () => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_VIEWS_KEY)) || []
  } catch {
    return []
  }
}

const SaveViewForm = ({ onSave }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { name: '' } })
  return (
    <form className="cq__view-save" onSubmit={handleSubmit(({ name }) => onSave(name.trim()))}>
      <input
        className="cq__input"
        placeholder="Nombre de la vista"
        {...register('name', { required: 'Ponele un nombre' })}
      />
      <button type="submit" className="cq__export-btn">
        Guardar vista actual
      </button>
      {errors.name && <span className="cq__view-error">{errors.name.message}</span>}
    </form>
  )
}

const CryptoQuery = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const activeTenantId = useActiveTenantId()
  const { purchases, loading } = useSelector((s) => s.cryptoPurchase)
  const { monthLabels } = useLocaleData()
  const { prices } = useCryptoPrices()

  const [showViewModal, setShowViewModal] = useState(false)
  const [savedViews, setSavedViews] = useState(loadSavedViews)
  const [saveViewFormKey, setSaveViewFormKey] = useState(0)

  const persistSavedViews = (views) => {
    setSavedViews(views)
    localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views))
  }
  const handleSaveView = (name) => {
    if (!name) return
    const view = {
      id: crypto.randomUUID(),
      name,
      url: window.location.pathname + window.location.search,
      createdAt: new Date().toISOString(),
    }
    persistSavedViews([view, ...savedViews])
    setSaveViewFormKey((k) => k + 1)
  }
  const handleDeleteView = (id) => persistSavedViews(savedViews.filter((v) => v.id !== id))
  const handleLoadView = (view) => {
    navigate(view.url)
    setShowViewModal(false)
  }

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
  const editMode = searchParams.get('edit') === '1'
  const setEditMode = (v) => setParam('edit', v ? '1' : '')
  const showSubtotals = searchParams.get('subtotals') === '1'
  const setShowSubtotals = (v) => setParam('subtotals', v ? '1' : '')
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
  const [selectedForLink, setSelectedForLink] = useState(null)

  // Purely local scratch-marking of rows — not persisted anywhere (not the URL,
  // not Firestore), just a visual aid that resets on refresh.
  const [markedIds, setMarkedIds] = useState(new Set())
  const toggleMarked = (id) =>
    setMarkedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // Array of { key, dir } in priority order — plain click sorts by that column
  // alone; shift-click adds/toggles it as an extra tiebreaker level (like a
  // spreadsheet's multi-column sort) without discarding the earlier columns.
  // Persisted in the URL (like the other filters) so a refresh keeps the order.
  const sort = useMemo(() => parseSort(searchParams.get('sort')), [searchParams])
  const toggleSort = (key, additive) =>
    setSearchParams((prev) => {
      const current = parseSort(prev.get('sort'))
      const existing = current.find((s) => s.key === key)
      let next
      if (!additive) {
        const dir =
          current.length === 1 && existing ? (existing.dir === 'asc' ? 'desc' : 'asc') : 'asc'
        next = [{ key, dir }]
      } else if (existing) {
        next = current.map((s) =>
          s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : s,
        )
      } else {
        next = [...current, { key, dir: 'asc' }]
      }
      const nextParams = new URLSearchParams(prev)
      nextParams.set('sort', serializeSort(next))
      return nextParams
    })

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

  // Each marked row carries the sum of "total" for the segment since the
  // previous marked row (or since the top of the table for the first mark).
  const rowsWithSubtotals = useMemo(() => {
    const empty = () => ({ qty: 0, total: 0 })
    let all = empty()
    let buys = empty()
    let sells = empty()
    return sortedFiltered.map((p) => {
      const qty = Number(p.quantity) || 0
      all = { qty: all.qty + qty, total: all.total + p.total }
      if (isSale(p)) sells = { qty: sells.qty + qty, total: sells.total + p.total }
      else buys = { qty: buys.qty + qty, total: buys.total + p.total }

      if (!markedIds.has(p.id)) {
        return { ...p, subtotal: null, subtotalBuys: null, subtotalSells: null, subtotalNet: null }
      }
      const net = { qty: buys.qty - sells.qty, total: buys.total - sells.total }
      const result = {
        ...p,
        subtotal: all,
        subtotalBuys: buys,
        subtotalSells: sells,
        subtotalNet: net,
      }
      all = empty()
      buys = empty()
      sells = empty()
      return result
    })
  }, [sortedFiltered, markedIds])

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

  const markedSummary = useMemo(() => {
    const rows = filtered.filter((p) => markedIds.has(p.id))
    return {
      count: rows.length,
      quantity: rows.reduce((s, p) => s + (Number(p.quantity) || 0), 0),
      total: rows.reduce((s, p) => s + (Number(p.total) || 0), 0),
    }
  }, [filtered, markedIds])

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

  // Exports exactly what's on screen right now — whichever table mode is
  // active (grouped by quantity or the full ledger), respecting the current
  // filters and sort order.
  const exportToExcel = () => {
    const aoa = groupByQty
      ? [
          ['Cantidad', 'Compras', 'Ventas', 'Operaciones', 'Total'],
          ...groupedRows.map((g) => [g.quantity, g.buysCount, g.sellsCount, g.count, g.total]),
        ]
      : [
          ['Fecha', 'Tipo', 'Cantidad', 'Precio', 'Total', 'PnL', 'Vinculado', 'Notas'],
          ...sortedFiltered.map((p) => [
            p.purchaseDate,
            isSale(p) ? 'Venta' : 'Compra',
            p.quantity,
            p.purchasePrice,
            p.total,
            p.pnl ?? '',
            p.matchGroupId ? 'Sí' : '',
            p.notes ?? '',
          ]),
        ]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Datos')
    XLSX.writeFile(wb, `crypto_${symbol}_${dateMode}.xlsx`)
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
                    checked={showSubtotals}
                    onChange={(e) => setShowSubtotals(e.target.checked)}
                  />
                  Mostrar subtotales
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
                <button type="button" className="cq__export-btn" onClick={exportToExcel}>
                  ↓ Excel
                </button>
                <button
                  type="button"
                  className="cq__export-btn"
                  onClick={() => setShowViewModal(true)}
                >
                  ⭐ Vista
                </button>
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
                      <th className="cq__mark-col" />
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
                    : rowsWithSubtotals.map((p) => {
                        const total = p.total
                        const rowClass = [
                          editMode && 'cq__row--editable',
                          selectedForLink?.id === p.id && 'cq__row--selected',
                          p.matchGroupId && 'cq__row--linked',
                        ]
                          .filter(Boolean)
                          .join(' ')
                        return (
                          <React.Fragment key={p.id}>
                            <tr className={rowClass || undefined} onClick={() => handleRowClick(p)}>
                              <td className="cq__mark-col" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={markedIds.has(p.id)}
                                  onChange={() => toggleMarked(p.id)}
                                />
                                <button
                                  type="button"
                                  className="cq__edit-btn"
                                  title="Editar este registro (pestaña nueva)"
                                  onClick={() =>
                                    window.open(
                                      `/finance/tools/v2/adjustments?edit=${p.id}`,
                                      '_blank',
                                      'noopener,noreferrer',
                                    )
                                  }
                                >
                                  ✎
                                </button>
                              </td>
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
                            {showSubtotals && p.subtotal != null && (
                              <>
                                <tr className="cq__subtotal-row">
                                  <td colSpan={3}>Subtotal</td>
                                  <td className="num">{p.subtotal.qty}</td>
                                  <td className="num">—</td>
                                  <td className="num">{fmtUSD(p.subtotal.total)}</td>
                                  <td />
                                  <td />
                                </tr>
                                <tr className="cq__subtotal-row cq__subtotal-row--buy">
                                  <td colSpan={3}>Subtotal compras</td>
                                  <td className="num">{p.subtotalBuys.qty}</td>
                                  <td className="num">—</td>
                                  <td className="num">{fmtUSD(p.subtotalBuys.total)}</td>
                                  <td />
                                  <td />
                                </tr>
                                <tr className="cq__subtotal-row cq__subtotal-row--sell">
                                  <td colSpan={3}>Subtotal ventas</td>
                                  <td className="num">{p.subtotalSells.qty}</td>
                                  <td className="num">—</td>
                                  <td className="num">{fmtUSD(p.subtotalSells.total)}</td>
                                  <td />
                                  <td />
                                </tr>
                                <tr className="cq__subtotal-row cq__subtotal-row--net">
                                  <td colSpan={3}>Neto (Compras − Ventas)</td>
                                  <td className="num">{p.subtotalNet.qty}</td>
                                  <td className="num">—</td>
                                  <td
                                    className={`num${p.subtotalNet.total >= 0 ? ' cq__amount--positive' : ' cq__amount--negative'}`}
                                  >
                                    {p.subtotalNet.total >= 0 ? '+' : ''}
                                    {fmtUSD(p.subtotalNet.total)}
                                  </td>
                                  <td />
                                  <td />
                                </tr>
                              </>
                            )}
                          </React.Fragment>
                        )
                      })}
                  {(groupByQty ? groupedRows.length === 0 : filtered.length === 0) && (
                    <tr>
                      <td colSpan={groupByQty ? 5 : 8} className="cq__empty">
                        Sin operaciones para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
                {!groupByQty && (
                  <tfoot>
                    <tr className="cq__total-row">
                      <td colSpan={3}>Total compras ({totals.buysCount})</td>
                      <td className="num">{totals.buysQty.toFixed(8)}</td>
                      <td className="num">—</td>
                      <td className="num">{fmtUSD(totals.invested)}</td>
                      <td />
                      <td />
                    </tr>
                    <tr className="cq__total-row">
                      <td colSpan={3}>Total ventas ({totals.sellsCount})</td>
                      <td className="num">{totals.sellsQty.toFixed(8)}</td>
                      <td className="num">—</td>
                      <td className="num">{fmtUSD(totals.proceeds)}</td>
                      <td />
                      <td />
                    </tr>
                    <tr className="cq__total-row cq__total-row--net">
                      <td colSpan={5}>Neto (Ventas − Compras)</td>
                      <td className="num" colSpan={3}>
                        <span className="cq__amount cq__amount--neutral">
                          {fmtUSD(Math.abs(totals.net))}
                        </span>
                      </td>
                    </tr>
                    {markedSummary.count > 0 && (
                      <tr className="cq__total-row cq__total-row--marked">
                        <td colSpan={3}>Marcados ({markedSummary.count})</td>
                        <td className="num">{markedSummary.quantity}</td>
                        <td className="num">—</td>
                        <td className="num">{fmtUSD(markedSummary.total)}</td>
                        <td />
                        <td />
                      </tr>
                    )}
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}

      {showViewModal && (
        <AppModal
          visible
          onClose={() => setShowViewModal(false)}
          variant="center"
          size="md"
          title="Vistas guardadas"
          subtitle="Guardá los filtros y el orden actuales con un nombre, para volver a ellos después."
        >
          <SaveViewForm key={saveViewFormKey} onSave={handleSaveView} />
          {savedViews.length === 0 ? (
            <p className="cq__muted">Todavía no guardaste ninguna vista.</p>
          ) : (
            <ul className="cq__view-list">
              {savedViews.map((v) => (
                <li key={v.id} className="cq__view-item">
                  <button type="button" className="cq__view-link" onClick={() => handleLoadView(v)}>
                    {v.name}
                  </button>
                  <button
                    type="button"
                    className="cq__view-delete"
                    title="Eliminar vista"
                    onClick={() => handleDeleteView(v.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AppModal>
      )}
    </div>
  )
}

export default CryptoQuery
