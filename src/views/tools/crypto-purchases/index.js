import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilCloudUpload, cilSync } from '@coreui/icons'
import StandardCard, { SC } from 'src/components/shared/StandardCard/Index'
import Spinner from 'src/components/shared/Spinner'
import IconClone from 'src/components/shared/IconClone'
import AppModal from 'src/components/shared/AppModal'
import { CRYPTO_PURCHASE_SYMBOLS, CRYPTO_PURCHASE_TYPES } from 'src/constants/finance'
import { useCryptoPrices } from 'src/views/Finance/trade/Prices/useCryptoPrices'
import { useUsdCopRate } from 'src/hooks/useUsdCopRate'
import * as actions from 'src/actions/finance/cryptoPurchaseActions'
import { triggerHook } from 'src/reducers/system/programHookSlice'
import CryptoPurchaseForm, { EMPTY_PURCHASE } from './CryptoPurchaseForm'
import {
  fmtUSD,
  fmt,
  fmtQty,
  symbolLabel,
  platformLabel,
  computePurchaseMetrics,
  isSale,
  isAdjustment,
} from './cryptoPurchaseHelpers'
import { SEED_PURCHASES } from './cryptoPurchaseSeed'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import './CryptoPurchases.scss'

const amountClass = (value) =>
  `cpu-amount${value == null ? ' cpu-amount--muted' : value >= 0 ? ' cpu-amount--positive' : ' cpu-amount--negative'}`

const CryptoPurchases = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { purchases, loading, saving } = useSelector((s) => s.cryptoPurchase)
  const { prices, connected } = useCryptoPrices()
  const { rate: liveUsdCopRate } = useUsdCopRate()

  const [sheet, setSheet] = useState(null)
  const [filterSymbol, setFilterSymbol] = useState('all')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  const filtered = useMemo(
    () =>
      [...purchases]
        .filter((p) => filterSymbol === 'all' || p.symbol === filterSymbol)
        .filter((p) => filterType === 'all' || (p.type ?? 'buy') === filterType)
        .sort((a, b) => (b.purchaseDate || '').localeCompare(a.purchaseDate || '')),
    [purchases, filterSymbol, filterType],
  )

  // Net position per symbol (buys minus sells) — no FIFO lot matching yet, so "invertido"
  // is simply cash put in minus cash recovered from sales, and "valor actual" values the
  // net remaining quantity at the live price.
  const totals = useMemo(() => {
    let invested = 0
    const qtyBySymbol = {}
    purchases.forEach((p) => {
      const qty = Number(p.quantity) || 0
      const price = Number(p.purchasePrice) || 0
      const sign = isSale(p) ? -1 : 1
      invested += sign * qty * price
      qtyBySymbol[p.symbol] = (qtyBySymbol[p.symbol] ?? 0) + sign * qty
    })
    let current = 0
    Object.entries(qtyBySymbol).forEach(([symbol, qty]) => {
      const price = prices[symbol]?.price ?? null
      if (price != null) current += qty * price
    })
    const gainLoss = current - invested
    const gainLossPct = invested > 0 ? (gainLoss / invested) * 100 : 0
    return { invested, current, gainLoss, gainLossPct, qtyBySymbol }
  }, [purchases, prices])

  const qtySymbol = filterSymbol === 'all' ? 'BTCUSDT' : filterSymbol
  const qtyValue = totals.qtyBySymbol[qtySymbol] ?? 0

  const handleSave = (purchase) => {
    if (purchase.id) dispatch(actions.updateRequest(purchase))
    else dispatch(actions.saveRequest(purchase))
    setSheet(null)
  }

  const handleDelete = (purchase) => {
    const kind = isSale(purchase) ? 'venta' : 'compra'
    if (window.confirm(`¿Eliminar la ${kind} de ${symbolLabel(purchase.symbol)}?`))
      dispatch(actions.deleteRequest({ id: purchase.id }))
  }

  const handleClone = (purchase) => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = purchase
    dispatch(actions.saveRequest(rest))
  }

  const handleSeedImport = () => {
    if (!window.confirm(`¿Importar ${SEED_PURCHASES.length} compras históricas?`)) return
    SEED_PURCHASES.forEach((p) => dispatch(actions.saveRequest(p)))
  }

  const handleDeleteAll = () => {
    if (!purchases.length) return
    if (
      !window.confirm(
        `¿Eliminar los ${purchases.length} registros? Esta acción no se puede deshacer.`,
      )
    )
      return
    purchases.forEach((p) => dispatch(actions.deleteRequest({ id: p.id })))
  }

  const handleSync = () => {
    dispatch(triggerHook({ tag: 'cryptoPurchase.sync', context: {} }))
  }

  return (
    <div className="cpu-page">
      <div className="cpu-header">
        <div>
          <div className="cpu-header__title">
            Crypto Purchases
            <span
              className={`cpu-status-dot${connected ? ' cpu-status-dot--connected' : ''}`}
              title={connected ? 'Precios en vivo conectados' : 'Sin conexión de precios'}
            />
          </div>
          <div className="cpu-header__subtitle">
            {filtered.length}/{purchases.length} registros
          </div>
        </div>
        <div className="cpu-header__actions">
          <button
            className="cpu-text-btn"
            title="Dispara el hook cryptoPurchase.sync (configúralo en /system/programs)"
            onClick={handleSync}
          >
            <CIcon icon={cilSync} className="me-1" />
            Sync
          </button>
          <button className="cpu-icon-btn" title="Importar histórico" onClick={handleSeedImport}>
            <CIcon icon={cilCloudUpload} />
          </button>
          <button
            className="cpu-icon-btn cpu-icon-btn--danger"
            title="Eliminar todos los registros"
            disabled={!purchases.length}
            onClick={handleDeleteAll}
          >
            <CIcon icon={cilTrash} />
          </button>
          <button className="cpu-icon-btn cpu-icon-btn--primary" onClick={() => setSheet('new')}>
            <CIcon icon={cilPlus} />
          </button>
        </div>
      </div>

      <div className="cpu-summary">
        <div className="cpu-summary__card">
          <div className="cpu-summary__label">INVERTIDO</div>
          <div className="cpu-summary__value">{fmtUSD(totals.invested)}</div>
        </div>
        <div className="cpu-summary__card">
          <div className="cpu-summary__label">VALOR ACTUAL</div>
          <div className="cpu-summary__value">{fmtUSD(totals.current)}</div>
        </div>
        <div className="cpu-summary__card">
          <div className="cpu-summary__label">GANANCIA / PÉRDIDA</div>
          <div
            className={`cpu-summary__value${totals.gainLoss >= 0 ? ' cpu-summary__value--positive' : ' cpu-summary__value--negative'}`}
          >
            {fmtUSD(totals.gainLoss)}
          </div>
        </div>
        <div className="cpu-summary__card">
          <div className="cpu-summary__label">RENDIMIENTO</div>
          <div
            className={`cpu-summary__value${totals.gainLossPct >= 0 ? ' cpu-summary__value--positive' : ' cpu-summary__value--negative'}`}
          >
            {totals.gainLossPct.toFixed(2)}%
          </div>
        </div>
        <div className="cpu-summary__card">
          <div className="cpu-summary__label">{symbolLabel(qtySymbol)} EN CARTERA</div>
          <div className="cpu-summary__value">{fmtQty(qtyValue, qtySymbol)}</div>
        </div>
      </div>

      <div className="cpu-filters">
        <button
          className={`cpu-filters__chip${filterType === 'all' ? ' cpu-filters__chip--active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          Todas
        </button>
        {CRYPTO_PURCHASE_TYPES.map((t) => (
          <button
            key={t.value}
            className={`cpu-filters__chip${filterType === t.value ? ' cpu-filters__chip--active' : ''}`}
            onClick={() => setFilterType(t.value)}
          >
            {t.label}s
          </button>
        ))}
      </div>

      <div className="cpu-filters">
        <button
          className={`cpu-filters__chip${filterSymbol === 'all' ? ' cpu-filters__chip--active' : ''}`}
          onClick={() => setFilterSymbol('all')}
        >
          Todas
        </button>
        {CRYPTO_PURCHASE_SYMBOLS.map((s) => (
          <button
            key={s.value}
            className={`cpu-filters__chip${filterSymbol === s.value ? ' cpu-filters__chip--active' : ''}`}
            onClick={() => setFilterSymbol(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner mode="section" />
      ) : (
        <StandardCard
          data={filtered}
          keyExpr="id"
          emptyText="Sin registros — toca + para agregar el primero."
          renderTitle={(p) => (
            <>
              <span className={SC.tag}>{symbolLabel(p.symbol)}</span>
              {p.purchaseDate}
            </>
          )}
          renderValue={(p) => {
            if (isAdjustment(p)) {
              return (
                <span className="cpu-amount cpu-amount--muted">
                  -{p.quantity} {symbolLabel(p.symbol)}
                </span>
              )
            }
            if (isSale(p)) {
              const { proceedsUSD } = computePurchaseMetrics(p, null)
              return <span className="cpu-amount">{fmtUSD(proceedsUSD)}</span>
            }
            const currentPrice = prices[p.symbol]?.price ?? null
            const { currentValueUSD } = computePurchaseMetrics(p, currentPrice)
            return (
              <span className={amountClass(currentValueUSD)}>
                {currentValueUSD != null ? fmtUSD(currentValueUSD) : '—'}
              </span>
            )
          }}
          renderBadge={(p) => {
            if (isAdjustment(p)) return { label: 'Ajuste de saldo', variant: 'warning' }
            if (isSale(p)) return { label: 'Venta', variant: 'info' }
            const currentPrice = prices[p.symbol]?.price ?? null
            const { gainLossUSD } = computePurchaseMetrics(p, currentPrice)
            if (gainLossUSD == null) return { label: 'Sin precio', variant: 'default' }
            return gainLossUSD >= 0
              ? { label: 'Ganancia', variant: 'active' }
              : { label: 'Pérdida', variant: 'warning' }
          }}
          renderRows={(p) => {
            if (isAdjustment(p)) {
              return [
                [
                  <>
                    <span className={SC.label}>Cantidad ajustada </span>
                    <span className={SC.mono}>{p.quantity}</span>
                  </>,
                ],
                [p.notes && <span className={SC.muted}>{p.notes}</span>],
              ]
            }
            if (isSale(p)) {
              const { proceedsUSD } = computePurchaseMetrics(p, null)
              return [
                [
                  <>
                    <span className={SC.label}>Cantidad vendida </span>
                    <span className={SC.mono}>{p.quantity}</span>
                  </>,
                  <>
                    <span className={SC.label}>Precio de venta </span>
                    {fmtUSD(p.purchasePrice)}
                  </>,
                ],
                [
                  <>
                    <span className={SC.label}>Recibido </span>
                    {fmtUSD(proceedsUSD)}
                  </>,
                  p.usdCopRate && (
                    <>
                      <span className={SC.label}>TRM </span>
                      {fmt(p.usdCopRate)}
                    </>
                  ),
                ],
                [
                  <>
                    <span className={SC.label}>Plataforma </span>
                    {platformLabel(p.platform)}
                  </>,
                ],
                [p.notes && <span className={SC.muted}>{p.notes}</span>],
              ]
            }
            const currentPrice = prices[p.symbol]?.price ?? null
            const { investedUSD, gainLossUSD, gainLossPct } = computePurchaseMetrics(
              p,
              currentPrice,
            )
            return [
              [
                <>
                  <span className={SC.label}>Cantidad </span>
                  <span className={SC.mono}>{p.quantity}</span>
                </>,
                <>
                  <span className={SC.label}>Precio compra </span>
                  {fmtUSD(p.purchasePrice)}
                </>,
              ],
              [
                <>
                  <span className={SC.label}>Invertido </span>
                  {fmtUSD(investedUSD)}
                </>,
                <>
                  <span className={SC.label}>Precio actual </span>
                  {currentPrice != null ? fmtUSD(currentPrice) : '—'}
                </>,
              ],
              [
                <>
                  <span className={SC.label}>Plataforma </span>
                  {platformLabel(p.platform)}
                </>,
                p.usdCopRate && (
                  <>
                    <span className={SC.label}>TRM </span>
                    {fmt(p.usdCopRate)}
                  </>
                ),
              ],
              [
                gainLossPct != null && (
                  <>
                    <span className={SC.label}>Rendimiento </span>
                    <span className={amountClass(gainLossUSD)}>
                      {gainLossUSD >= 0 ? '+' : ''}
                      {fmtUSD(gainLossUSD)} ({gainLossPct >= 0 ? '+' : ''}
                      {gainLossPct.toFixed(2)}%)
                    </span>
                  </>
                ),
                p.notes && <span className={SC.muted}>{p.notes}</span>,
              ],
            ]
          }}
          renderActions={(p) => [
            { icon: cilPencil, color: 'primary', title: 'Editar', onClick: () => setSheet(p) },
            { label: <IconClone />, color: 'info', title: 'Clonar', onClick: () => handleClone(p) },
            { icon: cilTrash, color: 'danger', title: 'Eliminar', onClick: () => handleDelete(p) },
          ]}
        />
      )}

      <AppModal visible={!!sheet} onClose={() => setSheet(null)} variant="bottom" size="md">
        <CryptoPurchaseForm
          initial={sheet === 'new' ? EMPTY_PURCHASE : sheet}
          onSave={handleSave}
          onCancel={() => setSheet(null)}
          saving={saving}
          liveUsdCopRate={liveUsdCopRate}
        />
      </AppModal>
    </div>
  )
}

export default CryptoPurchases
