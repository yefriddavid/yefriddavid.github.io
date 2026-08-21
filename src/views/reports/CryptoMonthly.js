import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { CFormSelect } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'
import MultiSelectDropdown from 'src/components/shared/MultiSelectDropdown'
import AppModal from 'src/components/shared/AppModal'
import SaveViewForm from 'src/components/shared/SaveViewForm'
import SavedViewsList from 'src/components/shared/SavedViewsList'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import useLocaleData from 'src/hooks/useLocaleData'
import useMultiParam from 'src/hooks/useMultiParam'
import useSavedViews from 'src/hooks/useSavedViews'
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
  fmtUSD,
} from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'
import './CryptoMonthly.scss'

const CURRENT_YEAR = new Date().getFullYear()
const monthOf = (dateStr) => Number((dateStr || '').slice(5, 7)) || null

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
]

const SAVED_VIEWS_KEY = 'cryptoMonthly.savedViews'

const CryptoMonthly = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { purchases, loading } = useSelector((s) => s.cryptoPurchase)
  const { monthLabels } = useLocaleData()

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
  // what was applied instead of resetting to defaults — same pattern as CryptoQuery.
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
  // by the selected months below.
  const { dateFrom, dateTo } =
    dateMode === 'month' || dateMode === 'year'
      ? { dateFrom: `${year}-01-01`, dateTo: `${year}-12-31` }
      : { dateFrom: rangeFrom, dateTo: rangeTo }

  const filtered = useMemo(() => {
    const priceFloor = priceMin !== '' ? Number(priceMin) : null
    const priceCeil = priceMax !== '' ? Number(priceMax) : null
    const totalFloor = totalMin !== '' ? Number(totalMin) : null
    const totalCeil = totalMax !== '' ? Number(totalMax) : null
    return purchases
      .filter((p) => p.symbol === symbol && !isAdjustment(p))
      .map((p) => ({ ...p, total: (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0) }))
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
  ])

  const totals = useMemo(() => {
    const buys = filtered.filter((p) => !isSale(p))
    const sells = filtered.filter((p) => isSale(p))
    const buysQty = buys.reduce((s, p) => s + (Number(p.quantity) || 0), 0)
    const sellsQty = sells.reduce((s, p) => s + (Number(p.quantity) || 0), 0)
    const invested = buys.reduce((s, p) => s + p.total, 0)
    const proceeds = sells.reduce((s, p) => s + p.total, 0)
    return {
      buysCount: buys.length,
      sellsCount: sells.length,
      buysQty,
      sellsQty,
      invested,
      proceeds,
      avgBuyPrice: buysQty ? invested / buysQty : 0,
      avgSellPrice: sellsQty ? proceeds / sellsQty : 0,
      net: invested - proceeds,
    }
  }, [filtered])

  // One row per calendar month (YYYY-MM), grouping buys and sells separately
  // — mirrors "Total por mes y moneda" in CryptoActivityDashboard, but scoped
  // to the same filters as CryptoQuery instead of a fixed year.
  const monthlyRows = useMemo(() => {
    const map = new Map()
    filtered.forEach((p) => {
      const key = (p.purchaseDate || '').slice(0, 7)
      if (!key) return
      const g = map.get(key) || {
        key,
        year: Number(key.slice(0, 4)),
        month: Number(key.slice(5, 7)),
        buysCount: 0,
        buysQty: 0,
        invested: 0,
        sellsCount: 0,
        sellsQty: 0,
        proceeds: 0,
      }
      const qty = Number(p.quantity) || 0
      if (isSale(p)) {
        g.sellsCount += 1
        g.sellsQty += qty
        g.proceeds += p.total
      } else {
        g.buysCount += 1
        g.buysQty += qty
        g.invested += p.total
      }
      map.set(key, g)
    })
    return [...map.values()]
      .map((g) => ({
        ...g,
        avgBuyPrice: g.buysQty ? g.invested / g.buysQty : 0,
        avgSellPrice: g.sellsQty ? g.proceeds / g.sellsQty : 0,
        net: g.invested - g.proceeds,
      }))
      .sort((a, b) => b.key.localeCompare(a.key))
  }, [filtered])

  const monthLabel = (r) => `${monthLabels[r.month - 1]} ${r.year}`

  const exportToExcel = () => {
    const aoa = [
      [
        'Mes',
        'Compras',
        'Cant. comprada',
        'Invertido',
        'Precio prom. compra',
        'Ventas',
        'Cant. vendida',
        'Recibido',
        'Precio prom. venta',
        'Neto',
      ],
      ...monthlyRows.map((r) => [
        monthLabel(r),
        r.buysCount,
        r.buysQty,
        r.invested,
        r.avgBuyPrice,
        r.sellsCount,
        r.sellsQty,
        r.proceeds,
        r.avgSellPrice,
        r.net,
      ]),
    ]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Datos')
    XLSX.writeFile(wb, `crypto_mensual_${symbol}_${dateMode}.xlsx`)
  }

  return (
    <div className="cm">
      <h1 className="cm__title">Compras/Ventas por Mes</h1>
      <p className="cm__subtitle">
        Filtra un activo por rango de fechas y de precio para ver sus operaciones agrupadas mes a
        mes.
      </p>

      <div className="cm__mode-toggle">
        <button
          type="button"
          className={`cm__mode-btn${dateMode === 'range' ? ' cm__mode-btn--active' : ''}`}
          onClick={() => setDateMode('range')}
        >
          Rango de fechas
        </button>
        <button
          type="button"
          className={`cm__mode-btn${dateMode === 'month' ? ' cm__mode-btn--active' : ''}`}
          onClick={() => setDateMode('month')}
        >
          Año y mes
        </button>
        <button
          type="button"
          className={`cm__mode-btn${dateMode === 'year' ? ' cm__mode-btn--active' : ''}`}
          onClick={() => setDateMode('year')}
        >
          Año
        </button>
      </div>

      <div className="cm__filters">
        <div className="cm__field">
          <label>Activo</label>
          <CFormSelect size="sm" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            {CRYPTO_PURCHASE_SYMBOLS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </CFormSelect>
        </div>
        <div className="cm__field">
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
        <div className="cm__field">
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
        <div className="cm__field">
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
            <div className="cm__field">
              <label>Fecha desde</label>
              <input
                type="date"
                className="cm__input"
                value={rangeFrom}
                onChange={(e) => setRangeFrom(e.target.value)}
              />
            </div>
            <div className="cm__field">
              <label>Fecha hasta</label>
              <input
                type="date"
                className="cm__input"
                value={rangeTo}
                onChange={(e) => setRangeTo(e.target.value)}
              />
            </div>
          </>
        ) : dateMode === 'year' ? (
          <div className="cm__field">
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
            <div className="cm__field">
              <label>Año</label>
              <CFormSelect size="sm" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="cm__field">
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
        <div className="cm__field">
          <label>Precio mínimo</label>
          <input
            type="number"
            step="any"
            className="cm__input"
            placeholder="0.00"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
        </div>
        <div className="cm__field">
          <label>Precio máximo</label>
          <input
            type="number"
            step="any"
            className="cm__input"
            placeholder="0.00"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>
        <div className="cm__field">
          <label>Total ≥</label>
          <input
            type="number"
            step="any"
            className="cm__input"
            placeholder="0.00"
            value={totalMin}
            onChange={(e) => setTotalMin(e.target.value)}
          />
        </div>
        <div className="cm__field">
          <label>Total ≤</label>
          <input
            type="number"
            step="any"
            className="cm__input"
            placeholder="0.00"
            value={totalMax}
            onChange={(e) => setTotalMax(e.target.value)}
          />
        </div>
        {hasFilters && (
          <div className="cm__field cm__field--clear">
            <label>&nbsp;</label>
            <button type="button" className="cm__clear-btn" onClick={clearFilters}>
              ✕ Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <Spinner mode="section" />
      ) : (
        <>
          <div className="cm__kpis">
            <div className="cm__kpi cm__kpi--buy">
              <div className="cm__kpi-label">Compras</div>
              <div className="cm__kpi-value">{totals.buysCount}</div>
              <div className="cm__kpi-sub">{fmtUSD(totals.invested)} invertidos</div>
            </div>
            <div className="cm__kpi cm__kpi--sell">
              <div className="cm__kpi-label">Ventas</div>
              <div className="cm__kpi-value">{totals.sellsCount}</div>
              <div className="cm__kpi-sub">{fmtUSD(totals.proceeds)} recibidos</div>
            </div>
            <div className="cm__kpi">
              <div className="cm__kpi-label">Neto (Ventas − Compras)</div>
              <div className="cm__kpi-value cm__kpi-value--neutral">
                {fmtUSD(Math.abs(totals.net))}
              </div>
            </div>
          </div>

          <div className="cm__ledger">
            <div className="cm__panel-header">
              <p className="cm__panel-title">
                {symbolLabel(symbol)} — {monthlyRows.length} meses
              </p>
              <div className="cm__group-controls">
                <button type="button" className="cm__export-btn" onClick={exportToExcel}>
                  ↓ Excel
                </button>
                <button
                  type="button"
                  className="cm__export-btn"
                  onClick={() => setShowViewModal(true)}
                >
                  ⭐ Vista
                </button>
              </div>
            </div>
            <div className="cm__scroll">
              <table className="cm__table">
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th className="num">Compras</th>
                    <th className="num">Cant. comprada</th>
                    <th className="num">Invertido</th>
                    <th className="num">Precio prom. compra</th>
                    <th className="num">Ventas</th>
                    <th className="num">Cant. vendida</th>
                    <th className="num">Recibido</th>
                    <th className="num">Precio prom. venta</th>
                    <th className="num">Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRows.map((r) => (
                    <tr key={r.key}>
                      <td>{monthLabel(r)}</td>
                      <td className="num">{r.buysCount}</td>
                      <td className="num">{r.buysQty.toFixed(8)}</td>
                      <td className="num">{fmtUSD(r.invested)}</td>
                      <td className="num">{fmtUSD(r.avgBuyPrice)}</td>
                      <td className="num">{r.sellsCount}</td>
                      <td className="num">{r.sellsQty.toFixed(8)}</td>
                      <td className="num">{fmtUSD(r.proceeds)}</td>
                      <td className="num">{fmtUSD(r.avgSellPrice)}</td>
                      <td
                        className={`num${r.net >= 0 ? ' cm__amount--positive' : ' cm__amount--negative'}`}
                      >
                        {r.net >= 0 ? '+' : ''}
                        {fmtUSD(r.net)}
                      </td>
                    </tr>
                  ))}
                  {monthlyRows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="cm__empty">
                        Sin operaciones para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
                {monthlyRows.length > 0 && (
                  <tfoot>
                    <tr className="cm__total-row">
                      <td>Total</td>
                      <td className="num">{totals.buysCount}</td>
                      <td className="num">{totals.buysQty.toFixed(8)}</td>
                      <td className="num">{fmtUSD(totals.invested)}</td>
                      <td className="num">{fmtUSD(totals.avgBuyPrice)}</td>
                      <td className="num">{totals.sellsCount}</td>
                      <td className="num">{totals.sellsQty.toFixed(8)}</td>
                      <td className="num">{fmtUSD(totals.proceeds)}</td>
                      <td className="num">{fmtUSD(totals.avgSellPrice)}</td>
                      <td
                        className={`num${totals.net >= 0 ? ' cm__amount--positive' : ' cm__amount--negative'}`}
                      >
                        {totals.net >= 0 ? '+' : ''}
                        {fmtUSD(totals.net)}
                      </td>
                    </tr>
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
          subtitle="Guardá los filtros actuales con un nombre, para volver a ellos después."
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
    </div>
  )
}

export default CryptoMonthly
