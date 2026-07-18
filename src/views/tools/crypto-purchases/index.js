import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilCloudUpload } from '@coreui/icons'
import StandardCard, { SC } from 'src/components/shared/StandardCard/Index'
import Spinner from 'src/components/shared/Spinner'
import IconClone from 'src/components/shared/IconClone'
import AppModal from 'src/components/shared/AppModal'
import { CRYPTO_PURCHASE_SYMBOLS } from 'src/constants/finance'
import { useCryptoPrices } from 'src/views/Finance/trade/Prices/useCryptoPrices'
import * as actions from 'src/actions/finance/cryptoPurchaseActions'
import CryptoPurchaseForm, { EMPTY_PURCHASE } from './CryptoPurchaseForm'
import { fmtUSD, symbolLabel, platformLabel, computePurchaseMetrics } from './cryptoPurchaseHelpers'
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

  const [sheet, setSheet] = useState(null)
  const [filterSymbol, setFilterSymbol] = useState('all')

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  const filtered = useMemo(
    () =>
      [...purchases]
        .filter((p) => filterSymbol === 'all' || p.symbol === filterSymbol)
        .sort((a, b) => (b.purchaseDate || '').localeCompare(a.purchaseDate || '')),
    [purchases, filterSymbol],
  )

  const totals = useMemo(() => {
    let invested = 0
    let current = 0
    purchases.forEach((p) => {
      const currentPrice = prices[p.symbol]?.price ?? null
      const { investedUSD, currentValueUSD } = computePurchaseMetrics(p, currentPrice)
      invested += investedUSD
      current += currentValueUSD ?? investedUSD
    })
    const gainLoss = current - invested
    const gainLossPct = invested > 0 ? (gainLoss / invested) * 100 : 0
    return { invested, current, gainLoss, gainLossPct }
  }, [purchases, prices])

  const handleSave = (purchase) => {
    if (purchase.id) dispatch(actions.updateRequest(purchase))
    else dispatch(actions.saveRequest(purchase))
    setSheet(null)
  }

  const handleDelete = (purchase) => {
    if (window.confirm(`¿Eliminar la compra de ${symbolLabel(purchase.symbol)}?`))
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
        `¿Eliminar las ${purchases.length} compras registradas? Esta acción no se puede deshacer.`,
      )
    )
      return
    purchases.forEach((p) => dispatch(actions.deleteRequest({ id: p.id })))
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
            {filtered.length}/{purchases.length} compras
          </div>
        </div>
        <div className="cpu-header__actions">
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
          emptyText="Sin compras registradas — toca + para agregar la primera."
          renderTitle={(p) => (
            <>
              <span className={SC.tag}>{symbolLabel(p.symbol)}</span>
              {p.purchaseDate}
            </>
          )}
          renderValue={(p) => {
            const currentPrice = prices[p.symbol]?.price ?? null
            const { currentValueUSD } = computePurchaseMetrics(p, currentPrice)
            return (
              <span className={amountClass(currentValueUSD)}>
                {currentValueUSD != null ? fmtUSD(currentValueUSD) : '—'}
              </span>
            )
          }}
          renderBadge={(p) => {
            const currentPrice = prices[p.symbol]?.price ?? null
            const { gainLossUSD } = computePurchaseMetrics(p, currentPrice)
            if (gainLossUSD == null) return { label: 'Sin precio', variant: 'default' }
            return gainLossUSD >= 0
              ? { label: 'Ganancia', variant: 'active' }
              : { label: 'Pérdida', variant: 'warning' }
          }}
          renderRows={(p) => {
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
        />
      </AppModal>
    </div>
  )
}

export default CryptoPurchases
