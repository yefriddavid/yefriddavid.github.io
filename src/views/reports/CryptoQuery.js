import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { CFormSelect } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'
import MultiSelectDropdown from 'src/components/shared/MultiSelectDropdown'
import {
  FeatherSortHead,
  FeatherColumnToggle,
  useFeatherColumns,
  parseFeatherSort,
  serializeFeatherSort,
  toggleFeatherSort,
  sortFeatherRows,
} from 'src/components/shared/FeatherGrid'
import AppModal from 'src/components/shared/AppModal'
import SaveViewForm from 'src/components/shared/SaveViewForm'
import SavedViewsList from 'src/components/shared/SavedViewsList'
import moment from 'src/utils/moment'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import useLocaleData from 'src/hooks/useLocaleData'
import useMultiParam from 'src/hooks/useMultiParam'
import useSavedViews from 'src/hooks/useSavedViews'
import { useCryptoPrices } from 'src/views/Finance/trade/Prices/useCryptoPrices'
import * as actions from 'src/actions/finance/cryptoPurchaseActions'
import {
  CRYPTO_PURCHASE_SYMBOLS,
  CRYPTO_PURCHASE_PLATFORMS,
  CRYPTO_PURCHASE_TYPES,
  CRYPTO_PURCHASE_LINK_STATUS,
  CRYPTO_PURCHASE_PROFIT_STATUS,
  CRYPTO_PURCHASE_REPURCHASE_STATUS,
} from 'src/constants/finance'
import {
  isSale,
  isAdjustment,
  isLoanFunded,
  isProfitPending,
  isRepurchasePending,
  symbolLabel,
  platformLabel,
  fmtUSD,
} from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'
import './CryptoQuery.scss'

const CURRENT_YEAR = new Date().getFullYear()
const fmtDateLong = (date) => (date ? moment(date).format('D [de] MMMM [de] YYYY') : '')
const fmtDateTime = (p) =>
  p.purchaseTime ? `${fmtDateLong(p.purchaseDate)} ${p.purchaseTime}` : fmtDateLong(p.purchaseDate)
const monthOf = (dateStr) => Number((dateStr || '').slice(5, 7)) || null

// EA = tasa efectiva anual (compound), not a simple/linear split — converts
// the annual rate to whatever day-count sits between the two dates.
export const loanCostBetween = (principal, fromDate, toDate, ratePct) => {
  if (!fromDate || !toDate || !principal) return null
  const days = moment(toDate).diff(moment(fromDate), 'days')
  if (days <= 0) return 0
  return principal * (Math.pow(1 + ratePct / 100, days / 365) - 1)
}

const LEDGER_COLUMNS = [
  { key: 'purchaseDate', label: 'Fecha' },
  { key: 'type', label: 'Tipo' },
  { key: 'quantity', label: 'Cantidad', align: 'num' },
  { key: 'purchasePrice', label: 'Precio', align: 'num' },
  { key: 'total', label: 'Total', align: 'num' },
  { key: 'pnl', label: 'PnL / P&L', align: 'num' },
  { key: 'notes', label: 'Notas' },
]

// Binance splits some orders into several partial fills that share the same
// orderId (e.g. "buy 5" executes as 1 + 2 + 1.5 + 0.5) — group those fills
// back into the single purchase the user actually made. binanceOrderId (like
// every Binance-derived field: binanceTradeId, purchaseTime) is read-only —
// it's written only by scripts/sync-crypto-purchases, never by an edit form —
// so a synthetic group row here can never go stale from a manual edit.
const buildLedgerEntries = (records) => {
  const orderMap = new Map()
  const entries = []
  records.forEach((p) => {
    if (!p.binanceOrderId) {
      entries.push({ ...p, isGroup: false, records: [p] })
      return
    }
    const key = `${p.platform}|${p.symbol}|${p.binanceOrderId}`
    const arr = orderMap.get(key) || []
    arr.push(p)
    orderMap.set(key, arr)
  })
  orderMap.forEach((recs, key) => {
    if (recs.length === 1) {
      entries.push({ ...recs[0], isGroup: false, records: recs })
      return
    }
    const quantity = recs.reduce((s, r) => s + (Number(r.quantity) || 0), 0)
    const total = recs.reduce((s, r) => s + (Number(r.total) || 0), 0)
    const pnl = recs.every((r) => r.pnl != null) ? recs.reduce((s, r) => s + r.pnl, 0) : null
    const last = [...recs]
      .sort((a, b) =>
        `${a.purchaseDate}${a.purchaseTime || ''}`.localeCompare(
          `${b.purchaseDate}${b.purchaseTime || ''}`,
        ),
      )
      .pop()
    entries.push({
      id: `order:${key}`,
      isGroup: true,
      key,
      type: recs[0].type,
      platform: recs[0].platform,
      symbol: recs[0].symbol,
      quantity,
      purchasePrice: quantity ? total / quantity : 0,
      total,
      pnl,
      purchaseDate: last.purchaseDate,
      purchaseTime: last.purchaseTime,
      notes: '',
      // Linking a group writes the same matchGroupId to every fill in it
      // (see handleRowClick), so any one fill's value represents the group.
      matchGroupId: recs[0].matchGroupId ?? null,
      style: recs[0].style ?? null,
      records: recs,
    })
  })
  return entries
}

const DEFAULT_SORT = [{ key: 'purchaseDate', dir: 'desc' }]

const FILTER_PARAM_KEYS = [
  'symbol',
  'platform',
  'types',
  'link',
  'profit',
  'repurchase',
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

const SAVED_VIEWS_KEY = 'cryptoQuery.savedViews'

const CryptoQuery = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { purchases, loading } = useSelector((s) => s.cryptoPurchase)
  const { monthLabels } = useLocaleData()
  const { prices } = useCryptoPrices()

  const {
    showViewModal,
    setShowViewModal,
    savedViews,
    saveViewFormKey,
    saveView,
    deleteView,
    updateView,
    loadView,
  } = useSavedViews(SAVED_VIEWS_KEY)

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
  const [selectedProfitStatus, setSelectedProfitStatus] = useMultiParam(
    searchParams,
    setSearchParams,
    'profit',
  )
  const [selectedRepurchaseStatus, setSelectedRepurchaseStatus] = useMultiParam(
    searchParams,
    setSearchParams,
    'repurchase',
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
  const advancedFilterCount = [
    priceMin !== '',
    priceMax !== '',
    totalMin !== '',
    totalMax !== '',
    selectedProfitStatus.size > 0,
    selectedTypes.size > 0,
  ].filter(Boolean).length

  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [expandedOrders, setExpandedOrders] = useState(new Set())
  const toggleOrderExpand = (key) =>
    setExpandedOrders((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  const [selectedForLink, setSelectedForLink] = useState(null)

  // Global, editable by hand — never persisted (not the URL, not Firestore).
  const [loanRateEA, setLoanRateEA] = useState(4)

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Uncontrolled color <input> per row (keyed by row id) so the OS color
  // panel's live drag never touches Redux/Firestore — "Aplicar" reads the
  // current DOM value on demand instead.
  const colorInputRefs = useRef(new Map())

  // Hides a column across the whole table (thead + every row) via a <colgroup>
  // instead of conditionally not rendering cells — that would desync the
  // column count between the header/body rows and the totals footer's
  // colSpan-based rows, which assume the full fixed 10-column layout.
  const {
    isVisible: isLedgerColVisible,
    selected: ledgerColSelected,
    toggle: toggleLedgerCol,
    clear: clearLedgerCols,
  } = useFeatherColumns(LEDGER_COLUMNS)

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
  const sort = useMemo(
    () => parseFeatherSort(searchParams.get('sort'), DEFAULT_SORT),
    [searchParams],
  )
  const toggleSort = (key, additive) =>
    setSearchParams((prev) => {
      const current = parseFeatherSort(prev.get('sort'), DEFAULT_SORT)
      const nextParams = new URLSearchParams(prev)
      nextParams.set('sort', serializeFeatherSort(toggleFeatherSort(current, key, additive)))
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
      .filter(
        (p) =>
          selectedProfitStatus.size === 0 ||
          !isSale(p) ||
          selectedProfitStatus.has(isProfitPending(p) ? 'pending' : 'used'),
      )
      .filter(
        (p) =>
          selectedRepurchaseStatus.size === 0 ||
          !isSale(p) ||
          selectedRepurchaseStatus.has(isRepurchasePending(p) ? 'pending' : 'done'),
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
    selectedProfitStatus,
    selectedRepurchaseStatus,
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

  const sortedFiltered = useMemo(() => sortFeatherRows(filtered, sort), [filtered, sort])

  // The main ledger renders one row per Binance order (see buildLedgerEntries)
  // instead of one row per raw purchase — built from `filtered` (not the
  // already-sorted `sortedFiltered`) so grouping happens before the user's
  // sort is applied, then re-sorted the same way so grouped and single rows
  // interleave correctly regardless of which column is sorted.
  const ledgerEntries = useMemo(() => buildLedgerEntries(filtered), [filtered])
  const sortedLedgerEntries = useMemo(
    () => sortFeatherRows(ledgerEntries, sort),
    [ledgerEntries, sort],
  )

  // For a linked buy/sell pair, lets each row show its counterpart's price
  // directly (e.g. a buy row shows what it was later sold at) instead of
  // making the user scroll down to "Pares vinculados" to compare them.
  const linkedPartner = useMemo(() => {
    const byGroup = new Map()
    ledgerEntries.forEach((e) => {
      if (!e.matchGroupId) return
      const arr = byGroup.get(e.matchGroupId) || []
      arr.push(e)
      byGroup.set(e.matchGroupId, arr)
    })
    const map = new Map()
    byGroup.forEach((entries) => {
      const buy = entries.find((e) => !isSale(e))
      const sell = entries.find((e) => isSale(e))
      if (buy && sell) {
        map.set(buy.id, sell)
        map.set(sell.id, buy)
      }
    })
    return map
  }, [ledgerEntries])

  // Same value on both sides of a linked pair: a loan-funded buy costs interest
  // from its purchase date to whenever it was sold (or to today if still open);
  // the paired sell just mirrors its buy partner's figure.
  const todayStr = moment().format('YYYY-MM-DD')
  const loanCostFor = (p) => {
    if (isSale(p)) {
      const buyPartner = linkedPartner.get(p.id)
      if (!buyPartner || !buyPartner.records.some((r) => isLoanFunded(r))) return null
      return loanCostBetween(buyPartner.total, buyPartner.purchaseDate, p.purchaseDate, loanRateEA)
    }
    if (!p.records.some((r) => isLoanFunded(r))) return null
    const sellPartner = linkedPartner.get(p.id)
    return loanCostBetween(
      p.total,
      p.purchaseDate,
      sellPartner ? sellPartner.purchaseDate : todayStr,
      loanRateEA,
    )
  }

  // Each marked row carries the sum of "total" for the segment since the
  // previous marked row (or since the top of the table for the first mark).
  const rowsWithSubtotals = useMemo(() => {
    const empty = () => ({ qty: 0, total: 0 })
    let all = empty()
    let buys = empty()
    let sells = empty()
    return sortedLedgerEntries.map((p) => {
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
  }, [sortedLedgerEntries, markedIds])

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
    const pnlLosses = filtered.reduce((s, p) => s + (p.pnl != null && p.pnl < 0 ? p.pnl : 0), 0)
    const pnlGains = filtered.reduce((s, p) => s + (p.pnl != null && p.pnl > 0 ? p.pnl : 0), 0)
    const investedLosses = filtered.reduce(
      (s, p) => s + (p.pnl != null && p.pnl < 0 ? p.total : 0),
      0,
    )
    const investedGains = filtered.reduce(
      (s, p) => s + (p.pnl != null && p.pnl > 0 ? p.total : 0),
      0,
    )
    const currentValue = livePrice != null ? buysQty * livePrice : null
    return {
      buysCount: buys.length,
      sellsCount: sells.length,
      buysQty,
      sellsQty,
      invested,
      proceeds,
      net: proceeds - invested,
      pnlLosses,
      pnlGains,
      investedLosses,
      investedGains,
      currentValue,
    }
  }, [filtered, livePrice])

  const markedSummary = useMemo(() => {
    const rows = filtered.filter((p) => markedIds.has(p.id))
    return {
      count: rows.length,
      quantity: rows.reduce((s, p) => s + (Number(p.quantity) || 0), 0),
      total: rows.reduce((s, p) => s + (Number(p.total) || 0), 0),
    }
  }, [filtered, markedIds])

  // Separate, read-only table — doesn't touch the main ledger's rows/logic.
  // Pairs up each matchGroupId's buy+sell and shows the realized PnL (actual
  // sell price, not the live-price estimate). Built from `ledgerEntries`
  // (already aggregated per Binance order by buildLedgerEntries), not the raw
  // `filtered` records — a linked buy or sell can itself be several partial
  // fills sharing one matchGroupId, and pairing off the raw records would
  // just overwrite g.buy/g.sell with whichever fill was seen last instead of
  // summing the group's real quantity/total.
  const linkedPairs = useMemo(() => {
    const groups = {}
    ledgerEntries.forEach((p) => {
      if (!p.matchGroupId) return
      const g = groups[p.matchGroupId] || {}
      if (isSale(p)) g.sell = p
      else g.buy = p
      groups[p.matchGroupId] = g
    })
    return Object.entries(groups)
      .filter(([, g]) => g.buy && g.sell)
      .map(([id, g]) => ({
        id,
        buy: g.buy,
        sell: g.sell,
        invested: g.buy.total,
        proceeds: g.sell.total,
        pnl: g.sell.total - g.buy.total,
      }))
      .sort((a, b) => (b.sell.purchaseDate || '').localeCompare(a.sell.purchaseDate || ''))
  }, [ledgerEntries])

  const linkedPairsTotals = useMemo(
    () =>
      linkedPairs.reduce(
        (acc, pair) => ({
          quantity: acc.quantity + (Number(pair.buy.quantity) || 0),
          invested: acc.invested + pair.invested,
          proceeds: acc.proceeds + pair.proceeds,
          pnl: acc.pnl + pair.pnl,
        }),
        { quantity: 0, invested: 0, proceeds: 0, pnl: 0 },
      ),
    [linkedPairs],
  )

  // Only linked pairs have a known realized PnL (unlinked sells have proceeds
  // but no matched cost basis), so the "pending" total can only count those.
  const pendingProfit = useMemo(() => {
    const pending = linkedPairs.filter((pair) => isProfitPending(pair.sell))
    return { count: pending.length, total: pending.reduce((s, pair) => s + pair.pnl, 0) }
  }, [linkedPairs])

  const pendingRepurchase = useMemo(() => {
    const pending = filtered.filter((p) => isRepurchasePending(p))
    return {
      count: pending.length,
      quantity: pending.reduce((s, p) => s + (Number(p.quantity) || 0), 0),
      total: pending.reduce((s, p) => s + p.total, 0),
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

  // `entry.records` is always the underlying raw Firestore doc(s) — 1 for a
  // normal row, N for an order group (see buildLedgerEntries) — so linking/
  // unlinking a group replicates matchGroupId to every fill in it, and a
  // normal row just updates its one doc. Always dispatch from `records`,
  // never spread `entry` itself — it carries synthetic isGroup/records/key
  // fields that must never reach Firestore.
  const handleRowClick = (entry) => {
    if (!editMode) return

    if (entry.matchGroupId) {
      if (window.confirm('¿Desvincular este par de compra/venta?')) {
        const groupIds = new Set(entry.records.map((r) => r.id))
        const partner = purchases.find(
          (x) => !groupIds.has(x.id) && x.matchGroupId === entry.matchGroupId,
        )
        entry.records.forEach((r) => dispatch(actions.updateRequest({ ...r, matchGroupId: null })))
        if (partner) dispatch(actions.updateRequest({ ...partner, matchGroupId: null }))
      }
      return
    }

    if (!selectedForLink) {
      setSelectedForLink(entry)
      return
    }

    if (selectedForLink.id === entry.id) {
      setSelectedForLink(null)
      return
    }

    if (isSale(selectedForLink) === isSale(entry)) {
      window.alert('Solo podés vincular una compra con una venta.')
      setSelectedForLink(null)
      return
    }

    const buyEntry = isSale(selectedForLink) ? entry : selectedForLink
    const sellEntry = isSale(selectedForLink) ? selectedForLink : entry
    const confirmed = window.confirm(
      '¿Vincular estos dos registros como compra/venta?\n\n' +
        `Compra: ${fmtDateLong(buyEntry.purchaseDate)} — ${buyEntry.quantity} @ ${fmtUSD(buyEntry.purchasePrice)}\n` +
        `Venta: ${fmtDateLong(sellEntry.purchaseDate)} — ${sellEntry.quantity} @ ${fmtUSD(sellEntry.purchasePrice)}`,
    )
    if (confirmed) {
      const matchGroupId = crypto.randomUUID()
      buyEntry.records.forEach((r) => dispatch(actions.updateRequest({ ...r, matchGroupId })))
      sellEntry.records.forEach((r) => dispatch(actions.updateRequest({ ...r, matchGroupId })))
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
            fmtDateTime(p),
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
        <div className="cq__field">
          <label>Recompra</label>
          <MultiSelectDropdown
            label={(size) => (size > 0 ? `Recompra (${size})` : 'Recompra: Todas')}
            options={CRYPTO_PURCHASE_REPURCHASE_STATUS}
            selected={selectedRepurchaseStatus}
            onToggle={(value) =>
              setSelectedRepurchaseStatus((prev) => {
                const next = new Set(prev)
                next.has(value) ? next.delete(value) : next.add(value)
                return next
              })
            }
            onClearAll={() => setSelectedRepurchaseStatus(new Set())}
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
          <label>&nbsp;</label>
          <button
            type="button"
            className="cq__export-btn"
            onClick={() => setShowAdvancedFilters(true)}
          >
            🔧 Filtros avanzados{advancedFilterCount > 0 ? ` (${advancedFilterCount})` : ''}
          </button>
        </div>
        <div
          className="cq__field"
          title="Tasa efectiva anual usada para estimar el costo de los préstamos (Binance Loans)"
        >
          <label>Tasa préstamo EA (%)</label>
          <input
            type="number"
            step="any"
            className="cq__input"
            value={loanRateEA}
            onChange={(e) => setLoanRateEA(Number(e.target.value))}
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
                {!groupByQty && (
                  <FeatherColumnToggle
                    columns={LEDGER_COLUMNS}
                    selected={ledgerColSelected}
                    onToggle={toggleLedgerCol}
                    onClearAll={clearLedgerCols}
                  />
                )}
                <button
                  type="button"
                  className="cq__export-btn"
                  onClick={() => dispatch(actions.loadRequest())}
                >
                  ↻ Refrescar
                </button>
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
                {!groupByQty && (
                  <colgroup>
                    <col />
                    <col />
                    {LEDGER_COLUMNS.map((col) => (
                      <col
                        key={col.key}
                        style={{ visibility: isLedgerColVisible(col.key) ? undefined : 'collapse' }}
                      />
                    ))}
                    <col />
                    <col />
                  </colgroup>
                )}
                {groupByQty ? (
                  <thead>
                    <tr>
                      <th className="cq__expand-col" />
                      <th className="num">Cantidad</th>
                      <th>Tipo</th>
                      <th className="num">Operaciones</th>
                      <th className="num">Total</th>
                    </tr>
                  </thead>
                ) : (
                  <FeatherSortHead
                    columns={LEDGER_COLUMNS}
                    sort={sort}
                    onSort={toggleSort}
                    leading={
                      <>
                        <th className="cq__index-col">#</th>
                        <th className="cq__mark-col">Acciones</th>
                      </>
                    }
                    trailing={
                      <>
                        <th
                          className="num"
                          title="Precio de la operación vinculada (compra ↔ venta)"
                        >
                          Precio vinculado
                        </th>
                        <th
                          className="num"
                          title="Costo estimado del préstamo (Binance Loans) a la tasa EA de arriba, desde la compra hasta la venta vinculada (o hasta hoy si aún no se vendió)"
                        >
                          Costo préstamo
                        </th>
                      </>
                    }
                  />
                )}
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
                                          <td>{fmtDateTime(p)}</td>
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
                    : rowsWithSubtotals.map((p, i) => {
                        const total = p.total
                        // A sold buy's PnL is frozen at the realized sale price instead of
                        // tracking the live price — it's no longer an open position.
                        const soldPartner = !isSale(p) ? linkedPartner.get(p.id) : null
                        const displayPnl = soldPartner ? soldPartner.total - p.total : p.pnl
                        const loanCost = loanCostFor(p)
                        const itemColor = p.style?.item?.background?.color
                        const rowClass = [
                          p.isGroup ? 'cq__group-row' : editMode && 'cq__row--editable',
                          selectedForLink?.id === p.id && 'cq__row--selected',
                          p.matchGroupId && 'cq__row--linked',
                        ]
                          .filter(Boolean)
                          .join(' ')
                        return (
                          <React.Fragment key={p.id}>
                            <tr
                              className={rowClass || undefined}
                              style={itemColor ? { backgroundColor: itemColor } : undefined}
                              onClick={() => handleRowClick(p)}
                            >
                              <td className="cq__index-col">{i + 1}</td>
                              <td
                                className="cq__mark-col"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (p.isGroup) toggleOrderExpand(p.key)
                                }}
                              >
                                {(() => {
                                  const loanFunded = p.records.some((r) => isLoanFunded(r))
                                  const loanCheckbox = !isSale(p) && (
                                    <button
                                      type="button"
                                      className={`cq__loan-toggle${loanFunded ? ' cq__loan-toggle--active' : ''}`}
                                      title="Comprado con dinero prestado (Binance Loans)"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        p.records.forEach((r) =>
                                          dispatch(
                                            actions.updateRequest({
                                              ...r,
                                              fundedByLoan: !loanFunded,
                                            }),
                                          ),
                                        )
                                      }}
                                    >
                                      🏦
                                    </button>
                                  )
                                  const applyColor = () => {
                                    const color = colorInputRefs.current.get(p.id)?.value
                                    if (!color) return
                                    p.records.forEach((r) =>
                                      dispatch(
                                        actions.updateRequest({
                                          ...r,
                                          style: { item: { background: { color } } },
                                        }),
                                      ),
                                    )
                                  }
                                  const colorPicker = (
                                    <span
                                      className="cq__color-picker"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <input
                                        // Remounts whenever the stored color changes (our own
                                        // apply, the clear button, or another session's edit) so
                                        // the swatch's defaultValue stays in sync — see the
                                        // uncontrolled-input note below.
                                        key={itemColor || 'none'}
                                        type="color"
                                        className="cq__color-input"
                                        // Uncontrolled on purpose: the OS color panel fires
                                        // input/onChange on every drag tick, not just on commit.
                                        // A controlled value would either fight that (React
                                        // reverting it) or, without onChange, lock the input
                                        // entirely. "Aplicar" reads the live DOM value instead —
                                        // nothing hits Firestore until the user clicks it.
                                        defaultValue={itemColor || '#ffffff'}
                                        title="Color de fondo de la fila"
                                        ref={(el) => {
                                          if (el) colorInputRefs.current.set(p.id, el)
                                          else colorInputRefs.current.delete(p.id)
                                        }}
                                      />
                                      <button
                                        type="button"
                                        className="cq__color-apply"
                                        title="Aplicar color"
                                        onClick={applyColor}
                                      >
                                        ✓
                                      </button>
                                      {itemColor && (
                                        <button
                                          type="button"
                                          className="cq__color-clear"
                                          title="Quitar color"
                                          onClick={() =>
                                            p.records.forEach((r) =>
                                              dispatch(
                                                actions.updateRequest({ ...r, style: null }),
                                              ),
                                            )
                                          }
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </span>
                                  )
                                  return p.isGroup ? (
                                    <>
                                      <span
                                        className={`cq__chevron${expandedOrders.has(p.key) ? ' cq__chevron--open' : ''}`}
                                      >
                                        ▸
                                      </span>
                                      {loanCheckbox}
                                      {colorPicker}
                                    </>
                                  ) : (
                                    <>
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
                                      {loanCheckbox}
                                      {colorPicker}
                                    </>
                                  )
                                })()}
                              </td>
                              <td>{fmtDateTime(p)}</td>
                              <td>
                                {isSale(p) ? (
                                  <span className="cq__pill cq__pill--sell">
                                    <span className="cq__dot" />
                                    Venta{p.isGroup ? ` (${p.records.length})` : ''}
                                  </span>
                                ) : (
                                  <span className="cq__pill cq__pill--buy">
                                    <span className="cq__dot" />
                                    Compra{p.isGroup ? ` (${p.records.length})` : ''}
                                  </span>
                                )}
                                {p.matchGroupId && (
                                  <span className="cq__link-badge" title="Vinculado">
                                    🔗
                                  </span>
                                )}
                                {p.records.some((r) => isLoanFunded(r)) && (
                                  <span
                                    className="cq__link-badge"
                                    title="Comprado con dinero prestado (Binance Loans)"
                                  >
                                    🏦
                                  </span>
                                )}
                                {isSale(p) &&
                                  (() => {
                                    const pending = p.records.some((r) => isProfitPending(r))
                                    return (
                                      <button
                                        type="button"
                                        className={`cq__profit-badge${pending ? ' cq__profit-badge--pending' : ''}`}
                                        title={
                                          pending
                                            ? 'Utilidad pendiente de usar — clic para marcar como utilizada'
                                            : 'Marcar utilidad como pendiente de usar'
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          p.records.forEach((r) =>
                                            dispatch(
                                              actions.updateRequest({
                                                ...r,
                                                profitPending: !pending,
                                              }),
                                            ),
                                          )
                                        }}
                                      >
                                        💰
                                      </button>
                                    )
                                  })()}
                                {isSale(p) &&
                                  (() => {
                                    const pending = p.records.some((r) => isRepurchasePending(r))
                                    return (
                                      <button
                                        type="button"
                                        className={`cq__profit-badge${pending ? ' cq__profit-badge--pending' : ''}`}
                                        title={
                                          pending
                                            ? 'Pendiente de recompra — clic para desmarcar'
                                            : 'Marcar como pendiente de recompra'
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          p.records.forEach((r) =>
                                            dispatch(
                                              actions.updateRequest({
                                                ...r,
                                                needsRepurchase: !pending,
                                              }),
                                            ),
                                          )
                                        }}
                                      >
                                        🔁
                                      </button>
                                    )
                                  })()}
                              </td>
                              <td className="num">{p.quantity}</td>
                              <td className="num">{fmtUSD(p.purchasePrice)}</td>
                              <td className="num">{fmtUSD(total)}</td>
                              <td className="num">
                                {displayPnl == null ? (
                                  <span className="cq__muted">—</span>
                                ) : (
                                  <span
                                    className={`cq__amount${
                                      soldPartner
                                        ? ' cq__amount--realized'
                                        : displayPnl >= 0
                                          ? ' cq__amount--positive'
                                          : ' cq__amount--negative'
                                    }`}
                                    title={
                                      soldPartner ? 'Ganancia realizada (ya vendido)' : undefined
                                    }
                                  >
                                    {displayPnl >= 0 ? '+' : ''}
                                    {fmtUSD(displayPnl)}
                                  </span>
                                )}
                              </td>
                              <td className="cq__notes-cell" title={p.notes || undefined}>
                                {p.notes}
                              </td>
                              <td className="num">
                                {linkedPartner.has(p.id) ? (
                                  fmtUSD(linkedPartner.get(p.id).purchasePrice)
                                ) : (
                                  <span className="cq__muted">—</span>
                                )}
                              </td>
                              <td className="num">
                                {loanCost == null ? (
                                  <span className="cq__muted">—</span>
                                ) : (
                                  <span className="cq__amount cq__amount--negative">
                                    {fmtUSD(loanCost)}
                                  </span>
                                )}
                              </td>
                            </tr>
                            {p.isGroup && expandedOrders.has(p.key) && (
                              <tr className="cq__detail-row">
                                <td />
                                <td />
                                <td colSpan={9}>
                                  <table className="cq__detail-table">
                                    <thead>
                                      <tr>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th className="num">Cantidad</th>
                                        <th className="num">Precio</th>
                                        <th className="num">Total</th>
                                        <th>Notas</th>
                                        <th />
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {p.records.map((r) => (
                                        <tr key={r.id}>
                                          <td>{fmtDateTime(r)}</td>
                                          <td>
                                            {isSale(r) ? (
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
                                          <td className="num">{r.quantity}</td>
                                          <td className="num">{fmtUSD(r.purchasePrice)}</td>
                                          <td className="num">
                                            {fmtUSD(
                                              (Number(r.quantity) || 0) *
                                                (Number(r.purchasePrice) || 0),
                                            )}
                                          </td>
                                          <td>{r.notes}</td>
                                          <td>
                                            <button
                                              type="button"
                                              className="cq__edit-btn"
                                              title="Editar este registro (pestaña nueva)"
                                              onClick={() =>
                                                window.open(
                                                  `/finance/tools/v2/adjustments?edit=${r.id}`,
                                                  '_blank',
                                                  'noopener,noreferrer',
                                                )
                                              }
                                            >
                                              ✎
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            )}
                            {showSubtotals && p.subtotal != null && (
                              <>
                                <tr className="cq__subtotal-row">
                                  <td colSpan={4}>Subtotal</td>
                                  <td className="num">{p.subtotal.qty}</td>
                                  <td className="num">—</td>
                                  <td className="num">{fmtUSD(p.subtotal.total)}</td>
                                  <td />
                                  <td />
                                  <td />
                                  <td />
                                </tr>
                                <tr className="cq__subtotal-row cq__subtotal-row--buy">
                                  <td colSpan={4}>Subtotal compras</td>
                                  <td className="num">{p.subtotalBuys.qty}</td>
                                  <td className="num">—</td>
                                  <td className="num">{fmtUSD(p.subtotalBuys.total)}</td>
                                  <td />
                                  <td />
                                  <td />
                                  <td />
                                </tr>
                                <tr className="cq__subtotal-row cq__subtotal-row--sell">
                                  <td colSpan={4}>Subtotal ventas</td>
                                  <td className="num">{p.subtotalSells.qty}</td>
                                  <td className="num">—</td>
                                  <td className="num">{fmtUSD(p.subtotalSells.total)}</td>
                                  <td />
                                  <td />
                                  <td />
                                  <td />
                                </tr>
                                <tr className="cq__subtotal-row cq__subtotal-row--net">
                                  <td colSpan={4}>Neto (Compras − Ventas)</td>
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
                      <td colSpan={groupByQty ? 5 : 11} className="cq__empty">
                        Sin operaciones para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
                {!groupByQty && (
                  <tfoot>
                    <tr className="cq__total-row">
                      <td colSpan={4}>Total compras ({totals.buysCount})</td>
                      <td className="num">{totals.buysQty.toFixed(8)}</td>
                      <td className="num">—</td>
                      <td className="num">{fmtUSD(totals.invested)}</td>
                      <td />
                      <td />
                      <td />
                      <td />
                    </tr>
                    <tr className="cq__total-row">
                      <td colSpan={4}>Total ventas ({totals.sellsCount})</td>
                      <td className="num">{totals.sellsQty.toFixed(8)}</td>
                      <td className="num">—</td>
                      <td className="num">{fmtUSD(totals.proceeds)}</td>
                      <td />
                      <td />
                      <td />
                      <td />
                    </tr>
                    <tr className="cq__total-row cq__total-row--net">
                      <td colSpan={6}>Neto (Ventas − Compras)</td>
                      <td className="num" colSpan={5}>
                        <span className="cq__amount cq__amount--neutral">
                          {fmtUSD(Math.abs(totals.net))}
                        </span>
                      </td>
                    </tr>
                    <tr className="cq__total-row">
                      <td colSpan={7}>Total pérdidas (PnL)</td>
                      <td className="num">
                        <span className="cq__amount cq__amount--negative">
                          {fmtUSD(totals.pnlLosses)}
                        </span>
                      </td>
                      <td />
                      <td />
                      <td />
                    </tr>
                    <tr className="cq__total-row">
                      <td colSpan={7}>Total ganancias (PnL)</td>
                      <td className="num">
                        <span className="cq__amount cq__amount--positive">
                          {totals.pnlGains > 0 ? '+' : ''}
                          {fmtUSD(totals.pnlGains)}
                        </span>
                      </td>
                      <td />
                      <td />
                      <td />
                    </tr>
                    {pendingProfit.count > 0 && (
                      <tr className="cq__total-row">
                        <td colSpan={7}>
                          Utilidad pendiente de usar (pares vinculados, {pendingProfit.count})
                        </td>
                        <td className="num">
                          <span
                            className={`cq__amount${pendingProfit.total >= 0 ? ' cq__amount--positive' : ' cq__amount--negative'}`}
                          >
                            {pendingProfit.total >= 0 ? '+' : ''}
                            {fmtUSD(pendingProfit.total)}
                          </span>
                        </td>
                        <td />
                        <td />
                        <td />
                      </tr>
                    )}
                    {pendingRepurchase.count > 0 && (
                      <tr className="cq__total-row">
                        <td colSpan={4}>Pendiente de recompra ({pendingRepurchase.count})</td>
                        <td className="num">{pendingRepurchase.quantity.toFixed(8)}</td>
                        <td className="num">—</td>
                        <td className="num">{fmtUSD(pendingRepurchase.total)}</td>
                        <td />
                        <td />
                        <td />
                        <td />
                      </tr>
                    )}
                    <tr className="cq__total-row">
                      <td colSpan={7}>Total invertido</td>
                      <td className="num">{fmtUSD(totals.invested)}</td>
                      <td />
                      <td />
                      <td />
                    </tr>
                    <tr className="cq__total-row">
                      <td colSpan={7}>Total invertido (perdiendo)</td>
                      <td className="num">
                        <span className="cq__amount cq__amount--negative">
                          {fmtUSD(totals.investedLosses)}
                        </span>
                      </td>
                      <td />
                      <td />
                      <td />
                    </tr>
                    <tr className="cq__total-row">
                      <td colSpan={7}>Total invertido (ganando)</td>
                      <td className="num">
                        <span className="cq__amount cq__amount--positive">
                          {fmtUSD(totals.investedGains)}
                        </span>
                      </td>
                      <td />
                      <td />
                      <td />
                    </tr>
                    <tr className="cq__total-row">
                      <td colSpan={4}>Valor actual (cantidad comprada)</td>
                      <td className="num">{totals.buysQty.toFixed(8)}</td>
                      <td className="num">{livePrice != null ? fmtUSD(livePrice) : '—'}</td>
                      <td className="num">
                        {totals.currentValue != null ? fmtUSD(totals.currentValue) : '—'}
                      </td>
                      <td />
                      <td />
                      <td />
                      <td />
                    </tr>
                    {markedSummary.count > 0 && (
                      <tr className="cq__total-row cq__total-row--marked">
                        <td colSpan={4}>Marcados ({markedSummary.count})</td>
                        <td className="num">{markedSummary.quantity}</td>
                        <td className="num">—</td>
                        <td className="num">{fmtUSD(markedSummary.total)}</td>
                        <td />
                        <td />
                        <td />
                        <td />
                      </tr>
                    )}
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {linkedPairs.length > 0 && (
            <div className="cq__ledger cq__linked">
              <div className="cq__panel-header">
                <p className="cq__panel-title">
                  Pares vinculados (compra + venta) — {linkedPairs.length}
                </p>
              </div>
              <div className="cq__scroll">
                <table className="cq__table">
                  <thead>
                    <tr>
                      <th>Fecha compra</th>
                      <th>Fecha venta</th>
                      <th className="num">Precio compra</th>
                      <th className="num">Precio venta</th>
                      <th className="num">Cantidad</th>
                      <th className="num">Invertido</th>
                      <th className="num">Recibido</th>
                      <th className="num">PnL realizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkedPairs.map((pair) => (
                      <tr key={pair.id}>
                        <td>{fmtDateTime(pair.buy)}</td>
                        <td>{fmtDateTime(pair.sell)}</td>
                        <td className="num">{fmtUSD(pair.buy.purchasePrice)}</td>
                        <td className="num">{fmtUSD(pair.sell.purchasePrice)}</td>
                        <td className="num">{pair.buy.quantity}</td>
                        <td className="num">{fmtUSD(pair.invested)}</td>
                        <td className="num">{fmtUSD(pair.proceeds)}</td>
                        <td
                          className={`num${pair.pnl >= 0 ? ' cq__amount--positive' : ' cq__amount--negative'}`}
                        >
                          {pair.pnl >= 0 ? '+' : ''}
                          {fmtUSD(pair.pnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="cq__total-row">
                      <td colSpan={4}>Total</td>
                      <td className="num">{linkedPairsTotals.quantity}</td>
                      <td className="num">{fmtUSD(linkedPairsTotals.invested)}</td>
                      <td className="num">{fmtUSD(linkedPairsTotals.proceeds)}</td>
                      <td
                        className={`num${linkedPairsTotals.pnl >= 0 ? ' cq__amount--positive' : ' cq__amount--negative'}`}
                      >
                        {linkedPairsTotals.pnl >= 0 ? '+' : ''}
                        {fmtUSD(linkedPairsTotals.pnl)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
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
          <SaveViewForm key={saveViewFormKey} onSave={saveView} />
          <SavedViewsList
            views={savedViews}
            onLoad={loadView}
            onDelete={deleteView}
            onUpdate={updateView}
          />
        </AppModal>
      )}

      {showAdvancedFilters && (
        <AppModal
          visible
          onClose={() => setShowAdvancedFilters(false)}
          variant="center"
          size="md"
          title="Filtros avanzados"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
            <div className="cq__field">
              <label>Utilidad</label>
              <MultiSelectDropdown
                label={(size) => (size > 0 ? `Utilidad (${size})` : 'Utilidad: Todas')}
                options={CRYPTO_PURCHASE_PROFIT_STATUS}
                selected={selectedProfitStatus}
                onToggle={(value) =>
                  setSelectedProfitStatus((prev) => {
                    const next = new Set(prev)
                    next.has(value) ? next.delete(value) : next.add(value)
                    return next
                  })
                }
                onClearAll={() => setSelectedProfitStatus(new Set())}
              />
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
          </div>
        </AppModal>
      )}
    </div>
  )
}

export default CryptoQuery
