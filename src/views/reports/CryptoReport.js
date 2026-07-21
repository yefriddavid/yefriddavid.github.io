import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from 'src/components/shared/Spinner'
import EmptyState from 'src/components/shared/EmptyState'
import { CRYPTO_PURCHASE_SYMBOLS } from 'src/constants/finance'
import { useCryptoPrices } from 'src/views/Finance/trade/Prices/useCryptoPrices'
import { useUsdCopRate } from 'src/hooks/useUsdCopRate'
import * as actions from 'src/actions/finance/cryptoPurchaseActions'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import {
  isSale,
  symbolLabel,
  fmtUSD,
  fmt as fmtCOP,
} from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'
import CryptoLotModal from './CryptoLotModal'
import './CryptoReport.scss'

const amountClass = (value) =>
  `crypto-report__amount${value >= 0 ? ' crypto-report__amount--positive' : ' crypto-report__amount--negative'}`

const CryptoReport = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { purchases, loading } = useSelector((s) => s.cryptoPurchase)
  const { prices } = useCryptoPrices()
  const { rate: liveUsdCopRate } = useUsdCopRate()
  const [selectedSymbol, setSelectedSymbol] = useState(null)
  const [modalPrice, setModalPrice] = useState(null)

  // Freeze the price at the moment the modal opens — the modal reads a live
  // websocket feed via `prices`, and re-deriving it on every tick made the
  // chart flicker/redraw every few seconds while the user was reading it.
  const openLotModal = (symbol) => {
    setSelectedSymbol(symbol)
    setModalPrice(prices[symbol]?.price ?? null)
  }
  const closeLotModal = useCallback(() => setSelectedSymbol(null), [])

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  const bySymbol = useMemo(() => {
    return CRYPTO_PURCHASE_SYMBOLS.map((s) => {
      const rows = purchases.filter((p) => p.symbol === s.value)
      let qty = 0
      let investedUSD = 0
      let costWeightSum = 0
      let costWeightBase = 0

      rows.forEach((p) => {
        const q = Number(p.quantity) || 0
        const price = Number(p.purchasePrice) || 0
        const sign = isSale(p) ? -1 : 1
        qty += sign * q
        investedUSD += sign * q * price
        if (!isSale(p) && p.usdCopRate) {
          costWeightSum += q * price * p.usdCopRate
          costWeightBase += q * price
        }
      })

      const avgTrm = costWeightBase > 0 ? costWeightSum / costWeightBase : null
      const investedCOP = avgTrm != null ? investedUSD * avgTrm : null
      const livePrice = prices[s.value]?.price ?? null
      const currentValueUSD = livePrice != null ? qty * livePrice : null
      const currentValueCOP =
        currentValueUSD != null && liveUsdCopRate != null ? currentValueUSD * liveUsdCopRate : null
      const gainLossUSD = currentValueUSD != null ? currentValueUSD - investedUSD : null
      const gainLossPct =
        gainLossUSD != null && investedUSD > 0 ? (gainLossUSD / investedUSD) * 100 : null
      const gainLossCOP =
        investedCOP != null && currentValueCOP != null ? currentValueCOP - investedCOP : null

      return {
        symbol: s.value,
        label: symbolLabel(s.value),
        count: rows.length,
        qty,
        investedUSD,
        investedCOP,
        currentValueUSD,
        currentValueCOP,
        gainLossUSD,
        gainLossPct,
        gainLossCOP,
      }
    }).filter((r) => r.count > 0)
  }, [purchases, prices, liveUsdCopRate])

  const totals = useMemo(() => {
    const invested = bySymbol.reduce((s, r) => s + r.investedUSD, 0)
    const current = bySymbol.reduce((s, r) => s + (r.currentValueUSD ?? 0), 0)
    const gainLoss = current - invested
    const gainLossPct = invested > 0 ? (gainLoss / invested) * 100 : null
    return { invested, current, gainLoss, gainLossPct }
  }, [bySymbol])

  const lossesCOP = useMemo(
    () =>
      bySymbol
        .filter((r) => r.gainLossCOP != null && r.gainLossCOP < 0)
        .sort((a, b) => a.gainLossCOP - b.gainLossCOP),
    [bySymbol],
  )
  const totalLossCOP = lossesCOP.reduce((s, r) => s + r.gainLossCOP, 0)

  const modalPurchases = useMemo(
    () => purchases.filter((p) => p.symbol === selectedSymbol),
    [purchases, selectedSymbol],
  )

  if (loading) return <Spinner mode="section" />
  if (bySymbol.length === 0) return <EmptyState message="Sin compras registradas para analizar." />

  return (
    <div className="crypto-report">
      <div className="crypto-report__sheet">
        <h1 className="crypto-report__title">Análisis de Cripto</h1>
        <div className="crypto-report__subtitle">Desglose por moneda — datos en vivo</div>

        <div className="crypto-report__summary">
          <div className="crypto-report__summary-card">
            <div className="crypto-report__summary-label">INVERTIDO</div>
            <div className="crypto-report__summary-value">{fmtUSD(totals.invested)}</div>
          </div>
          <div className="crypto-report__summary-card">
            <div className="crypto-report__summary-label">VALOR ACTUAL</div>
            <div className="crypto-report__summary-value">{fmtUSD(totals.current)}</div>
          </div>
          <div className="crypto-report__summary-card">
            <div className="crypto-report__summary-label">GANANCIA / PÉRDIDA</div>
            <div
              className={`crypto-report__summary-value${totals.gainLoss >= 0 ? ' crypto-report__summary-value--positive' : ' crypto-report__summary-value--negative'}`}
            >
              {fmtUSD(totals.gainLoss)}
            </div>
          </div>
          <div className="crypto-report__summary-card">
            <div className="crypto-report__summary-label">RENDIMIENTO</div>
            <div
              className={`crypto-report__summary-value${(totals.gainLossPct ?? 0) >= 0 ? ' crypto-report__summary-value--positive' : ' crypto-report__summary-value--negative'}`}
            >
              {totals.gainLossPct != null ? `${totals.gainLossPct.toFixed(2)}%` : '—'}
            </div>
          </div>
        </div>

        <div className="crypto-report__scroll">
          <table className="crypto-report__table">
            <thead>
              <tr>
                <th>Moneda</th>
                <th>Cantidad neta</th>
                <th>Invertido (USD)</th>
                <th>Invertido (COP · TRM histórica)</th>
                <th>Valor actual (USD)</th>
                <th>Valor actual (COP · TRM hoy)</th>
                <th>Ganancia / Pérdida</th>
                <th>Rendimiento</th>
              </tr>
            </thead>
            <tbody>
              {bySymbol.map((r) => (
                <tr
                  key={r.symbol}
                  className="crypto-report__row--clickable"
                  onClick={() => openLotModal(r.symbol)}
                >
                  <td className="crypto-report__row-label">{r.label}</td>
                  <td>{r.qty.toFixed(8)}</td>
                  <td>{fmtUSD(r.investedUSD)}</td>
                  <td>{r.investedCOP != null ? fmtCOP(r.investedCOP) : '—'}</td>
                  <td>{r.currentValueUSD != null ? fmtUSD(r.currentValueUSD) : '—'}</td>
                  <td>{r.currentValueCOP != null ? fmtCOP(r.currentValueCOP) : '—'}</td>
                  <td>
                    {r.gainLossUSD == null ? (
                      <span className="crypto-report__muted">—</span>
                    ) : (
                      <span className={amountClass(r.gainLossUSD)}>
                        {r.gainLossUSD >= 0 ? '+' : ''}
                        {fmtUSD(r.gainLossUSD)}
                      </span>
                    )}
                  </td>
                  <td>
                    {r.gainLossPct == null ? (
                      <span className="crypto-report__muted">—</span>
                    ) : (
                      <span className={amountClass(r.gainLossPct)}>
                        {r.gainLossPct >= 0 ? '+' : ''}
                        {r.gainLossPct.toFixed(2)}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="crypto-report__note">
          Sin costeo FIFO por lote: el invertido neto es compras menos ventas (a precio real, o $0
          en ajustes de saldo). «Invertido (COP)» usa la TRM promedio ponderada de tus compras;
          «Valor actual (COP)» usa la TRM de hoy.
        </div>

        <h2 className="crypto-report__section-title">Pérdidas en COP</h2>
        {lossesCOP.length === 0 ? (
          <div className="crypto-report__muted">Ninguna moneda está en pérdida ahora mismo.</div>
        ) : (
          <div className="crypto-report__scroll">
            <table className="crypto-report__table">
              <thead>
                <tr>
                  <th>Moneda</th>
                  <th>Pérdida (COP)</th>
                </tr>
              </thead>
              <tbody>
                {lossesCOP.map((r) => (
                  <tr
                    key={r.symbol}
                    className="crypto-report__row--clickable"
                    onClick={() => openLotModal(r.symbol)}
                  >
                    <td className="crypto-report__row-label">{r.label}</td>
                    <td>
                      <span className={amountClass(-1)}>{fmtCOP(r.gainLossCOP)}</span>
                    </td>
                  </tr>
                ))}
                <tr className="crypto-report__total-row">
                  <td>Total</td>
                  <td>
                    <span className={amountClass(-1)}>{fmtCOP(totalLossCOP)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSymbol && (
        <CryptoLotModal
          symbol={selectedSymbol}
          label={symbolLabel(selectedSymbol)}
          livePrice={modalPrice}
          purchases={modalPurchases}
          onClose={closeLotModal}
        />
      )}
    </div>
  )
}

export default CryptoReport
