import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import StandardCard, { SC } from 'src/components/shared/StandardCard/Index'
import Spinner from 'src/components/shared/Spinner'
import MultiSelectDropdown from 'src/components/shared/MultiSelectDropdown'
import * as actions from 'src/actions/finance/cryptoWithdrawalActions'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import { fmtAmount, statusLabel, statusVariant, splitApplyTime } from './cryptoWithdrawalHelpers'
import './CryptoWithdrawals.scss'

const truncateTxId = (txId) =>
  txId && txId.length > 18 ? `${txId.slice(0, 10)}…${txId.slice(-6)}` : txId

const CryptoWithdrawals = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { withdrawals, loading } = useSelector((s) => s.cryptoWithdrawal)

  const [filterCoin, setFilterCoin] = useState('all')
  const [filterPlatform, setFilterPlatform] = useState(new Set())

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  const coins = useMemo(() => [...new Set(withdrawals.map((w) => w.coin))].sort(), [withdrawals])
  const platforms = useMemo(
    () => [...new Set(withdrawals.map((w) => w.platform).filter(Boolean))].sort(),
    [withdrawals],
  )

  const filtered = useMemo(
    () =>
      [...withdrawals]
        .filter((w) => filterCoin === 'all' || w.coin === filterCoin)
        .filter((w) => filterPlatform.size === 0 || filterPlatform.has(w.platform))
        .sort((a, b) => (b.applyTime || '').localeCompare(a.applyTime || '')),
    [withdrawals, filterCoin, filterPlatform],
  )

  const totalsByCoin = useMemo(() => {
    const totals = {}
    withdrawals.forEach((w) => {
      totals[w.coin] = (totals[w.coin] ?? 0) + (Number(w.amount) || 0)
    })
    return totals
  }, [withdrawals])

  return (
    <div className="cwd-page">
      <div className="cwd-header">
        <div className="cwd-header__title">Crypto Withdrawals</div>
        <div className="cwd-header__subtitle">
          {filtered.length}/{withdrawals.length} registros — sincronizados desde Binance
        </div>
      </div>

      <div className="cwd-summary">
        {Object.entries(totalsByCoin).map(([coin, total]) => (
          <div className="cwd-summary__card" key={coin}>
            <div className="cwd-summary__label">{coin} RETIRADO</div>
            <div className="cwd-summary__value">{fmtAmount(total, coin)}</div>
          </div>
        ))}
      </div>

      <div className="cwd-filters">
        <button
          className={`cwd-filters__chip${filterCoin === 'all' ? ' cwd-filters__chip--active' : ''}`}
          onClick={() => setFilterCoin('all')}
        >
          Todas
        </button>
        {coins.map((coin) => (
          <button
            key={coin}
            className={`cwd-filters__chip${filterCoin === coin ? ' cwd-filters__chip--active' : ''}`}
            onClick={() => setFilterCoin(coin)}
          >
            {coin}
          </button>
        ))}
      </div>

      <div className="cwd-filters cwd-filters--wrap">
        <MultiSelectDropdown
          label={(size) => (size > 0 ? `Plataforma (${size})` : 'Plataforma: Todas')}
          options={platforms.map((p) => ({ value: p, label: p }))}
          selected={filterPlatform}
          onToggle={(p) =>
            setFilterPlatform((prev) => {
              const next = new Set(prev)
              next.has(p) ? next.delete(p) : next.add(p)
              return next
            })
          }
          onClearAll={() => setFilterPlatform(new Set())}
        />
      </div>

      {loading ? (
        <Spinner mode="section" />
      ) : (
        <StandardCard
          data={filtered}
          keyExpr="id"
          emptyText="Sin retiros sincronizados todavía."
          renderTitle={(w) => {
            const { date } = splitApplyTime(w.applyTime)
            return (
              <>
                <span className={SC.tag}>{w.coin}</span>
                {date}
              </>
            )
          }}
          renderValue={(w) => <span className="cwd-amount">{fmtAmount(w.amount, w.coin)}</span>}
          renderBadge={(w) => ({ label: statusLabel(w.status), variant: statusVariant(w.status) })}
          renderRows={(w) => {
            const { time } = splitApplyTime(w.applyTime)
            return [
              [
                time && (
                  <>
                    <span className={SC.label}>Hora </span>
                    {time}
                  </>
                ),
                w.network && (
                  <>
                    <span className={SC.label}>Red </span>
                    <span className={SC.mono}>{w.network}</span>
                  </>
                ),
                w.platform && (
                  <>
                    <span className={SC.label}>Plataforma </span>
                    <span className={SC.muted}>{w.platform}</span>
                  </>
                ),
              ],
              [w.txId && <span className={SC.muted}>{truncateTxId(w.txId)}</span>],
            ]
          }}
        />
      )}
    </div>
  )
}

export default CryptoWithdrawals
