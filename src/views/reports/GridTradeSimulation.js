import React, { useEffect, useMemo, useState } from 'react'
import { TRADE_PRICE_ASSETS } from 'src/constants/finance'
import GridSimulationChart from './GridSimulationChart'
import { computeGridLevels, buildWaveTrades, fmtPrice, fmtUSD } from './gridSimulationHelpers'
import './GridTradeSimulation.scss'

const GridTradeSimulation = () => {
  const [symbol, setSymbol] = useState(TRADE_PRICE_ASSETS[0].symbol)
  const [lastPrice, setLastPrice] = useState(null)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const [hypoPrice, setHypoPrice] = useState('')
  const [gridCount, setGridCount] = useState(8)
  const [investment, setInvestment] = useState(1000)
  const [rangePct, setRangePct] = useState(15)

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

  const wave = useMemo(
    () =>
      gridData
        ? buildWaveTrades({
            levels: gridData.levels,
            centerPrice,
            upper: gridData.upper,
            lower: gridData.lower,
          })
        : null,
    [gridData, centerPrice],
  )

  const perGrid = investment > 0 && gridData ? investment / gridData.gridCount : 0
  const ticker = TRADE_PRICE_ASSETS.find((a) => a.symbol === symbol)?.ticker || symbol

  return (
    <div className="gts">
      <h1 className="gts__title">Simulación Grid Trading</h1>
      <p className="gts__subtitle">
        Visualiza cómo se distribuyen las órdenes de compra/venta de una estrategia de grid trading
        sobre un rango de precio hipotético — es ilustrativo, no un backtest contra precio real.
      </p>

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
                {fmtPrice(gridData.lower)} – {fmtPrice(gridData.upper)}
              </div>
            </div>
            <div className="gts__kpi">
              <div className="gts__kpi-label">Inversión por grid</div>
              <div className="gts__kpi-value">{fmtUSD(perGrid)}</div>
            </div>
            <div className="gts__kpi">
              <div className="gts__kpi-label">Operaciones simuladas</div>
              <div className="gts__kpi-value">{wave.markers.length}</div>
            </div>
          </div>

          <div className="gts__chart">
            <div className="gts__scroll">
              <GridSimulationChart
                levels={gridData.levels}
                upper={gridData.upper}
                lower={gridData.lower}
                centerPrice={centerPrice}
                points={wave.points}
                markers={wave.markers}
                pairs={wave.pairs}
                perGrid={perGrid}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default GridTradeSimulation
