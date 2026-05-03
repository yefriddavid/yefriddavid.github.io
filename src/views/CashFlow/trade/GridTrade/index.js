import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as actions from 'src/actions/cashflow/gridTradeActions'
import { useIsDesktop, fmtUSD } from './utils'
import TradeCard from './TradeCard'
import TradeDetail from './TradeDetail'
import TradeSheet from './TradeSheet'
import GridInfoModal from './GridInfoModal'

export default function GridTrade() {
  const dispatch = useDispatch()
  const isDesktop = useIsDesktop()
  const { trades, loading, saving } = useSelector((s) => s.gridTrade)
  const [sheet, setSheet] = useState(null)
  const [expanded, setExpanded] = useState(null) // mobile inline expand
  const [selected, setSelected] = useState(null) // desktop right-panel selection
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch])

  // Auto-select first trade on desktop when data loads
  useEffect(() => {
    if (isDesktop && trades.length > 0 && !selected) {
      setSelected(trades[0].id)
    }
  }, [isDesktop, trades, selected])

  const handleSave = (trade) => {
    dispatch(actions.saveRequest(trade))
    setSheet(null)
  }

  const handleClone = (trade) => {
    const { id: _id, createdAt: _createdAt, ...rest } = trade
    setSheet({ ...rest, endDate: '' })
  }

  const handleDelete = (trade) => {
    if (window.confirm(`¿Eliminar grid trade "${trade.asset}"?`)) {
      dispatch(actions.deleteRequest({ id: trade.id }))
      if (selected === trade.id) setSelected(null)
    }
  }

  const totalInvested = trades.reduce((sum, t) => sum + (Number(t.investment) || 0), 0)
  const activeCount = trades.filter((t) => !t.endDate).length
  const selectedTrade = isDesktop ? trades.find((t) => t.id === selected) : null

  const spinner = (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <div
        style={{
          width: 32,
          height: 32,
          border: '3px solid #dee2e6',
          borderTopColor: '#0d1117',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  )

  const emptyState = (
    <div style={{ textAlign: 'center', padding: '56px 24px', color: '#adb5bd', fontSize: 14 }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>📈</div>
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#495057' }}>
        Sin estrategias de grid
      </div>
      <div>Presiona + para registrar tu primer grid trade</div>
    </div>
  )

  const headerBtns = (
    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
      <button
        onClick={() => setShowInfo(true)}
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          border: '1.5px solid #dee2e6',
          background: '#fff',
          color: '#868e96',
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'manipulation',
        }}
      >
        ?
      </button>
      <button
        onClick={() => setSheet('new')}
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          border: 'none',
          background: '#0d1117',
          color: '#fff',
          fontSize: 22,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'manipulation',
        }}
      >
        +
      </button>
    </div>
  )

  const summaryBanner = trades.length > 0 && (
    <div
      style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #1e293b 100%)',
        borderRadius: 16,
        padding: '16px 18px',
        marginBottom: 14,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.08em',
            marginBottom: 4,
          }}
        >
          TOTAL INVERTIDO
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{fmtUSD(totalInvested)}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.08em',
            marginBottom: 4,
          }}
        >
          ACTIVAS
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#4ade80' }}>{activeCount}</div>
      </div>
    </div>
  )

  const infoModal = showInfo && <GridInfoModal onClose={() => setShowInfo(false)} />

  const sheet_ = sheet && (
    <TradeSheet
      initial={sheet === 'new' ? null : sheet}
      saving={saving}
      onSave={handleSave}
      onClose={() => setSheet(null)}
    />
  )

  // ── Desktop two-column layout ─────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div
        style={{
          display: 'flex',
          gap: 24,
          padding: '0 28px 60px',
          maxWidth: 1400,
          margin: '0 auto',
          alignItems: 'flex-start',
        }}
      >
        {/* Left: card list */}
        <div style={{ width: 400, flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 0 14px',
            }}
          >
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0d1117' }}>Grid Trading</div>
              <div style={{ fontSize: 13, color: '#868e96', marginTop: 2 }}>
                {trades.length} estrategia{trades.length !== 1 ? 's' : ''}
                {activeCount > 0 && ` · ${activeCount} activa${activeCount !== 1 ? 's' : ''}`}
              </div>
            </div>
            {headerBtns}
          </div>
          {summaryBanner}
          {loading
            ? spinner
            : trades.length === 0
              ? emptyState
              : trades.map((trade) => (
                  <TradeCard
                    key={trade.id}
                    trade={trade}
                    desktop
                    isSelected={selected === trade.id}
                    onSelect={() => setSelected(trade.id)}
                    onEdit={setSheet}
                    onClone={handleClone}
                    onDelete={handleDelete}
                    expanded={false}
                    onToggle={() => {}}
                  />
                ))}
        </div>

        {/* Right: chart detail panel */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: 18 }}>
          {selectedTrade ? (
            <TradeDetail trade={selectedTrade} onEdit={setSheet} onDelete={handleDelete} />
          ) : !loading && trades.length === 0 ? null : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 24px',
                color: '#adb5bd',
                fontSize: 14,
                background: '#fff',
                borderRadius: 16,
                border: '1px dashed #dee2e6',
                marginTop: 18,
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>←</div>
              <div>Selecciona una estrategia para ver su grid</div>
            </div>
          )}
        </div>

        {sheet_}
        {infoModal}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Mobile single-column layout ───────────────────────────────────────────
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 12px 80px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 0 14px',
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0d1117' }}>Grid Trading</div>
          <div style={{ fontSize: 13, color: '#868e96', marginTop: 2 }}>
            {trades.length} estrategia{trades.length !== 1 ? 's' : ''}
            {activeCount > 0 && ` · ${activeCount} activa${activeCount !== 1 ? 's' : ''}`}
          </div>
        </div>
        {headerBtns}
      </div>

      {summaryBanner}

      {loading
        ? spinner
        : trades.length === 0
          ? emptyState
          : trades.map((trade) => (
              <TradeCard
                key={trade.id}
                trade={trade}
                expanded={expanded === trade.id}
                onToggle={() => setExpanded((v) => (v === trade.id ? null : trade.id))}
                onEdit={setSheet}
                onClone={handleClone}
                onDelete={handleDelete}
              />
            ))}

      {sheet_}
      {infoModal}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
