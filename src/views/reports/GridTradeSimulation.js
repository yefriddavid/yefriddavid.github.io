import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TRADE_PRICE_ASSETS } from 'src/constants/finance'
import AppModal from 'src/components/shared/AppModal'
import SaveViewForm from 'src/components/shared/SaveViewForm'
import SavedViewsList from 'src/components/shared/SavedViewsList'
import useSavedViews from 'src/hooks/useSavedViews'
import GridSimulationChart from './GridSimulationChart'
import {
  computeGridLevels,
  buildWaveTrades,
  pairMarkers,
  pairMarkersByPrice,
  fmtPrice,
  fmtUSD,
} from './gridSimulationHelpers'
import './GridTradeSimulation.scss'

const SAVED_VIEWS_KEY = 'gridSimulation.savedViews'

const GridTradeSimulation = () => {
  const {
    showViewModal,
    setShowViewModal,
    savedViews,
    saveViewFormKey,
    saveView,
    deleteView,
    loadView,
  } = useSavedViews(SAVED_VIEWS_KEY)

  // Filters live in the URL (not useState) so a page refresh — or a saved
  // view, which is just a named URL snapshot — restores exactly what was set.
  const [searchParams, setSearchParams] = useSearchParams()

  const setParam = (key, value, opts) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === '' || value == null || value === false) next.delete(key)
      else next.set(key, String(value))
      return next
    }, opts)

  const symbol = searchParams.get('symbol') || TRADE_PRICE_ASSETS[0].symbol
  const setSymbol = (v) => setParam('symbol', v)
  const hypoPrice = searchParams.get('hypo') || ''
  const setHypoPrice = (v) => setParam('hypo', v)
  const gridCount = searchParams.get('grids') || '8'
  const setGridCount = (v) => setParam('grids', v)
  const investment = searchParams.get('invest') || '1000'
  const setInvestment = (v) => setParam('invest', v)
  const rangePct = searchParams.get('range') || '15'
  const setRangePct = (v) => setParam('range', v)
  const cycles = searchParams.get('cycles') || '1'
  const setCycles = (v) => setParam('cycles', v)
  const invert = searchParams.get('invert') === '1'
  const setInvert = (v) => setParam('invert', v ? '1' : '')
  const pairByPrice = searchParams.get('pair') !== '0'
  const setPairByPrice = (v) => setParam('pair', v ? '' : '0')

  const [lastPrice, setLastPrice] = useState(null)
  const [loadingPrice, setLoadingPrice] = useState(false)

  const fetchPrice = () => {
    setLoadingPrice(true)
    fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
      .then((r) => r.json())
      .then((data) => {
        const price = Number(data.price)
        if (price > 0) setLastPrice(price)
      })
      .catch(() => {})
      .finally(() => setLoadingPrice(false))
  }

  useEffect(() => {
    setLastPrice(null)
    setHypoPrice('')
    fetchPrice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol])

  const centerPrice = hypoPrice !== '' && Number(hypoPrice) > 0 ? Number(hypoPrice) : lastPrice

  const gridData = useMemo(
    () => (centerPrice ? computeGridLevels({ centerPrice, gridCount, rangePct }) : null),
    [centerPrice, gridCount, rangePct],
  )

  // Grid lines can be dragged individually (see GridSimulationChart), which
  // overrides the evenly-spaced default — persisted in the URL so a saved
  // view reproduces exactly how the lines were left. Reset whenever the
  // inputs that define the grid change (but not on the initial load, so
  // dragged levels coming from a saved view survive the first price fetch).
  const customLevels = useMemo(() => {
    const raw = searchParams.get('lvls')
    return raw ? raw.split(',').map(Number) : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('lvls')])

  const gridInitRef = useRef(false)
  const gridKeyRef = useRef(null)
  useEffect(() => {
    if (!centerPrice) return
    const key = `${centerPrice}|${gridCount}|${rangePct}`
    if (gridInitRef.current && gridKeyRef.current !== key) setParam('lvls', '')
    gridKeyRef.current = key
    gridInitRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerPrice, gridCount, rangePct])

  const levels = useMemo(() => customLevels || gridData?.levels || [], [customLevels, gridData])

  const handleLevelChange = (index, newPrice) => {
    const arr = [...(customLevels || gridData.levels)]
    arr[index] = newPrice
    setParam('lvls', arr.join(','), { replace: true })
  }

  // The chart's pixel scale is padded beyond the default range and kept
  // fixed to the (un-dragged) gridData — if it tracked the live levels
  // instead, the top/bottom dots (which define the scale's own edges) could
  // never visibly move, since their value would always map to the same
  // fixed edge pixel.
  const domain = useMemo(() => {
    if (!gridData) return null
    const pad = gridData.step * 1.5
    return { lower: gridData.lower - pad, upper: gridData.upper + pad }
  }, [gridData])

  const wave = useMemo(
    () =>
      gridData && domain
        ? buildWaveTrades({
            levels,
            centerPrice,
            upper: domain.upper,
            lower: domain.lower,
            cycles: Math.max(1, Number(cycles) || 1),
            samples: Math.min(4000, 500 * Math.max(1, Number(cycles) || 1)),
            invert,
          })
        : null,
    [gridData, domain, levels, centerPrice, cycles, invert],
  )

  // The buy/sell markers on the wave are also draggable (both axes) — once
  // touched, they stop being crossing points derived from the generated sine
  // and become freeform control points; the wave path is then redrawn as a
  // smooth curve through them instead of the plain sine. Persisted in the
  // URL like customLevels above, with the same "skip the initial load" guard.
  const customMarkers = useMemo(() => {
    const raw = searchParams.get('mkrs')
    if (!raw) return null
    return raw.split(',').map((pair) => {
      const [frac, price] = pair.split(':').map(Number)
      return { frac, price }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('mkrs')])

  const markersInitRef = useRef(false)
  const markersKeyRef = useRef(null)
  useEffect(() => {
    if (!centerPrice) return
    const key = `${centerPrice}|${gridCount}|${rangePct}|${cycles}|${invert}`
    if (markersInitRef.current && markersKeyRef.current !== key) setParam('mkrs', '')
    markersKeyRef.current = key
    markersInitRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerPrice, gridCount, rangePct, cycles, invert])

  const markers = useMemo(() => {
    const base = customMarkers || wave?.markers.map((m) => ({ frac: m.frac, price: m.price })) || []
    return base.map((m) => ({ ...m, type: m.price > centerPrice ? 'sell' : 'buy' }))
  }, [customMarkers, wave, centerPrice])

  const pairs = useMemo(
    () => (pairByPrice ? pairMarkersByPrice(markers) : pairMarkers(markers)),
    [markers, pairByPrice],
  )

  const handleMarkerChange = (index, next) => {
    const base = customMarkers || wave.markers.map((m) => ({ frac: m.frac, price: m.price }))
    const arr = [...base]
    arr[index] = next
    setParam('mkrs', arr.map((m) => `${m.frac}:${m.price}`).join(','), { replace: true })
  }

  const perGrid = investment > 0 && gridData ? investment / gridData.gridCount : 0
  const ticker = TRADE_PRICE_ASSETS.find((a) => a.symbol === symbol)?.ticker || symbol

  return (
    <div className="gts">
      <div className="gts__header">
        <div>
          <h1 className="gts__title">Simulación Grid Trading</h1>
          <p className="gts__subtitle">
            Visualiza cómo se distribuyen las órdenes de compra/venta de una estrategia de grid
            trading sobre un rango de precio hipotético — es ilustrativo, no un backtest contra
            precio real.
          </p>
        </div>
        <button type="button" className="gts__view-btn" onClick={() => setShowViewModal(true)}>
          ⭐ Vista
        </button>
      </div>

      <div className="gts__filters">
        <div className="gts__field">
          <label>Activo</label>
          <select className="gts__input" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            {TRADE_PRICE_ASSETS.map((a) => (
              <option key={a.symbol} value={a.symbol}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div className="gts__field">
          <label>Último precio</label>
          <div className="gts__price-row">
            <span className="gts__price">{loadingPrice ? '…' : fmtPrice(lastPrice)}</span>
            <button
              type="button"
              className="gts__refresh-btn"
              onClick={fetchPrice}
              title="Actualizar precio"
            >
              ↻
            </button>
          </div>
        </div>

        <div className="gts__field">
          <label>Precio hipotético</label>
          <input
            type="number"
            step="any"
            className="gts__input"
            placeholder={lastPrice ? String(lastPrice) : '—'}
            value={hypoPrice}
            onChange={(e) => setHypoPrice(e.target.value)}
          />
        </div>

        <div className="gts__field">
          <label>Rango (%)</label>
          <input
            type="number"
            min="1"
            step="any"
            className="gts__input"
            value={rangePct}
            onChange={(e) => setRangePct(e.target.value)}
          />
        </div>

        <div className="gts__field">
          <label>Número de curvas</label>
          <input
            type="number"
            min="1"
            step="1"
            className="gts__input"
            value={cycles}
            onChange={(e) => setCycles(e.target.value)}
          />
        </div>

        <div className="gts__field">
          <label>Invert</label>
          <label className="gts__checkbox">
            <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} />
            Invertir curva
          </label>
        </div>

        <div className="gts__field">
          <label>Emparejamiento</label>
          <label className="gts__checkbox">
            <input
              type="checkbox"
              checked={pairByPrice}
              onChange={(e) => setPairByPrice(e.target.checked)}
            />
            Por precio (evita cruces)
          </label>
        </div>

        <div className="gts__field">
          <label>Número de grids</label>
          <input
            type="number"
            min="1"
            step="1"
            className="gts__input"
            value={gridCount}
            onChange={(e) => setGridCount(e.target.value)}
          />
        </div>

        <div className="gts__field">
          <label>Valor a invertir</label>
          <input
            type="number"
            min="0"
            step="any"
            className="gts__input"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
          />
        </div>
      </div>

      {!gridData ? (
        <p className="gts__empty">Esperando precio de {ticker}…</p>
      ) : (
        <>
          <div className="gts__kpis">
            <div className="gts__kpi">
              <div className="gts__kpi-label">Precio usado</div>
              <div className="gts__kpi-value">{fmtPrice(centerPrice)}</div>
            </div>
            <div className="gts__kpi">
              <div className="gts__kpi-label">Rango de la grid</div>
              <div className="gts__kpi-value gts__kpi-value--sm">
                {fmtPrice(levels[0])} – {fmtPrice(levels[levels.length - 1])}
              </div>
            </div>
            <div className="gts__kpi">
              <div className="gts__kpi-label">Inversión por grid</div>
              <div className="gts__kpi-value">{fmtUSD(perGrid)}</div>
            </div>
            <div className="gts__kpi">
              <div className="gts__kpi-label">Operaciones simuladas</div>
              <div className="gts__kpi-value">{markers.length}</div>
            </div>
          </div>

          <div className="gts__chart">
            <p className="gts__hint">
              Arrastra los puntos de las líneas para moverlas, o los de compra/venta para
              deslizarlos sobre la curva.
            </p>
            <div className="gts__scroll">
              <GridSimulationChart
                levels={levels}
                upper={domain.upper}
                lower={domain.lower}
                centerPrice={centerPrice}
                lastPrice={lastPrice}
                points={wave.points}
                markers={markers}
                pairs={pairs}
                perGrid={perGrid}
                onLevelChange={handleLevelChange}
                onMarkerChange={handleMarkerChange}
              />
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
          <SavedViewsList views={savedViews} onLoad={loadView} onDelete={deleteView} />
        </AppModal>
      )}
    </div>
  )
}

export default GridTradeSimulation
