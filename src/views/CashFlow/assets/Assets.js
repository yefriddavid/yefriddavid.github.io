import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as actions from 'src/actions/cashflow/assetActions'
import { uid, now, fmt, applyLivePricing } from './assetHelpers'
import {
  TYPES,
  HORIZONS,
  TYPE_COLOR,
  TYPE_BG,
  HORIZON_COLOR,
  HORIZON_BG,
  SEED_ASSETS,
  LIVE_PRICE_SYMBOLS,
} from './assetConstants'
import AssetCard from './AssetCard'
import AssetSheet from './AssetSheet'
import AssetsTable from './AssetsTable'
import AssetsAnalytics from './AssetsAnalytics'
import SummaryCard from './SummaryCard'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import { useCryptoPrices } from 'src/views/Finance/trade/Prices/useCryptoPrices'
import { useUsdCopRate } from 'src/hooks/useUsdCopRate'

export default function Assets() {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { assets, loading, saving, syncing, syncingAll, importing } = useSelector((s) => s.asset)
  const { prices } = useCryptoPrices()
  const { rate: usdCopRate } = useUsdCopRate()
  const pricedAssets = useMemo(
    () => applyLivePricing(assets, prices, usdCopRate),
    [assets, prices, usdCopRate],
  )

  const [sheet, setSheet] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [filterHorizon, setFilterHorizon] = useState('all')
  const [filterLiquid, setFilterLiquid] = useState('all')
  const [filterSymbols, setFilterSymbols] = useState([])
  const toggleSymbolFilter = (val) =>
    setFilterSymbols((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    )
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('assets_viewMode') ?? 'cards')
  const [groupByType, setGroupByType] = useState(
    () => localStorage.getItem('assets_groupByType') !== 'false',
  )
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('assets_tab') ?? 'grid')

  const switchTab = (tab) => {
    setActiveTab(tab)
    localStorage.setItem('assets_tab', tab)
  }

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  const filtered = useMemo(() => {
    return pricedAssets.filter((a) => {
      if (a.archived !== showArchived) return false
      if (filterType !== 'all' && a.type !== filterType) return false
      if (filterHorizon !== 'all' && a.horizon !== filterHorizon) return false
      if (filterLiquid === 'yes' && !a.liquid) return false
      if (filterLiquid === 'no' && a.liquid) return false
      if (filterSymbols.length > 0 && !filterSymbols.includes(a.liveSymbol || 'manual'))
        return false
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [pricedAssets, filterType, filterHorizon, filterLiquid, filterSymbols, search, showArchived])

  const presentSymbols = useMemo(
    () => [...new Set(pricedAssets.map((a) => a.liveSymbol).filter(Boolean))].sort(),
    [pricedAssets],
  )

  const totals = useMemo(() => {
    let total = 0,
      financial = 0,
      fixed = 0,
      crypto = 0,
      liquid = 0,
      monthly = 0
    pricedAssets.forEach((a) => {
      if (a.archived) return
      const v = (Number(a.quantity) || 0) * (Number(a.unitPrice) || 0)
      total += v
      if (a.type === 'financial') financial += v
      if (a.type === 'fixed') fixed += v
      if (a.type === 'crypto') crypto += v
      if (a.liquid) liquid += v
      monthly += Number(a.monthlyGain) || 0
    })
    return { total, financial, fixed, crypto, liquid, monthly }
  }, [pricedAssets])

  const gridData = useMemo(
    () =>
      filtered
        .map((a) => ({
          ...a,
          valueCOP: (Number(a.quantity) || 0) * (Number(a.unitPrice) || 0),
        }))
        .sort(
          (a, b) => TYPES.indexOf(a.type) - TYPES.indexOf(b.type) || a.name.localeCompare(b.name),
        ),
    [filtered],
  )

  const handleSave = (asset) => {
    dispatch(actions.saveRequest(asset))
    setSheet(null)
  }

  const handleQuickUpdate = (asset, patch) => {
    dispatch(actions.saveRequest({ ...asset, ...patch, updatedAt: now() }))
  }

  const handleDelete = (asset) => {
    if (window.confirm(`¿Eliminar "${asset.name}"?`))
      dispatch(actions.deleteRequest({ id: asset.id }))
  }

  const handleClone = (asset) => {
    const {
      id: _id,
      syncedAt: _syncedAt,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      valueCOP: _valueCOP,
      ...fields
    } = asset
    const ts = now()
    dispatch(
      actions.saveRequest({
        ...fields,
        id: uid(),
        name: `${asset.name} (copia)`,
        createdAt: ts,
        updatedAt: ts,
      }),
    )
  }

  const handleSeedImport = () => {
    const ts = now()
    const seeded = SEED_ASSETS.map((a) => ({ ...a, id: uid(), createdAt: ts, updatedAt: ts }))
    seeded.forEach((a) => dispatch(actions.saveRequest(a)))
    setTimeout(() => dispatch(actions.syncAllRequest(seeded)), 800)
  }

  const handleSync = (asset) => dispatch(actions.syncRequest(asset))
  const handleSyncAll = () => dispatch(actions.syncAllRequest(assets.filter((a) => !a.syncedAt)))
  const handleImport = () => dispatch(actions.importRequest())

  const unsyncedCount = assets.filter((a) => !a.syncedAt).length
  const activeFilters =
    filterType !== 'all' ||
    filterHorizon !== 'all' ||
    filterLiquid !== 'all' ||
    filterSymbols.length > 0 ||
    !!search

  const toggleView = () => {
    const next = viewMode === 'cards' ? 'grid' : 'cards'
    setViewMode(next)
    localStorage.setItem('assets_viewMode', next)
  }

  const toggleGroupByType = () => {
    setGroupByType((v) => {
      const next = !v
      localStorage.setItem('assets_groupByType', String(next))
      return next
    })
  }

  const btnStyle = (active, activeBg, activeColor) => ({
    padding: '5px 12px',
    borderRadius: 20,
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
    background: active ? activeBg : '#f8f9fa',
    color: active ? activeColor : '#6c757d',
  })

  return (
    <div
      style={{
        maxWidth: viewMode === 'grid' ? '100%' : 680,
        margin: '0 auto',
        padding: '0 12px 60px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: 'max-width 0.2s',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0 14px',
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>Assets 📊</div>
          <div style={{ fontSize: 13, color: '#6c757d', marginTop: 2 }}>
            {filtered.length}/{assets.filter((a) => !a.archived).length} activos
            {activeFilters && ' · filtrado'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleImport}
            disabled={importing}
            title="Importar desde Firebase"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid #dee2e6',
              background: '#fff',
              color: importing ? '#adb5bd' : '#1e3a5f',
              fontSize: 18,
              cursor: importing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {importing ? '…' : '☁️'}
          </button>
          {viewMode === 'grid' && (
            <button
              onClick={toggleGroupByType}
              title={groupByType ? 'Desagrupar' : 'Agrupar por tipo'}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: groupByType ? '2px solid #1e3a5f' : '2px solid #dee2e6',
                background: groupByType ? '#eef4ff' : '#fff',
                color: groupByType ? '#1e3a5f' : '#6c757d',
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              🗂
            </button>
          )}
          <button
            onClick={toggleView}
            title={viewMode === 'cards' ? 'Ver tabla' : 'Ver tarjetas'}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '2px solid #dee2e6',
              background: '#fff',
              color: '#6c757d',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {viewMode === 'cards' ? '⊞' : '▤'}
          </button>
          <button
            onClick={() => setSheet('new')}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 'none',
              background: '#1e3a5f',
              color: '#fff',
              fontSize: 22,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          background: '#f1f3f5',
          borderRadius: 12,
          padding: 4,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: 4,
            width: 'calc(50% - 4px)',
            borderRadius: 8,
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            transform: activeTab === 'chart' ? 'translateX(100%)' : 'translateX(0)',
            transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        {[
          { key: 'grid', label: '📋 Datos' },
          { key: 'chart', label: '📊 Análisis' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            style={{
              flex: 1,
              position: 'relative',
              zIndex: 1,
              border: 'none',
              background: 'transparent',
              padding: '8px 0',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              color: activeTab === t.key ? '#1a1a2e' : '#868e96',
              transition: 'color 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Portfolio summary */}
      {!loading && assets.length > 0 && (
        <>
          <div
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #1e3a5f 100%)',
              borderRadius: 16,
              padding: '20px 20px',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.08em',
                marginBottom: 6,
              }}
            >
              PORTFOLIO TOTAL
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
              {fmt(totals.total)}
            </div>
            {totals.monthly > 0 && (
              <div style={{ fontSize: 13, color: '#86efac', marginTop: 6, fontWeight: 600 }}>
                +{fmt(totals.monthly)} / mes
              </div>
            )}
          </div>
          {activeTab === 'grid' && (
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}
            >
              <SummaryCard
                label="FINANCIERO"
                value={fmt(totals.financial)}
                sub={`${assets.filter((a) => !a.archived && a.type === 'financial').length} activos`}
                color={TYPE_COLOR.financial}
                bg={TYPE_BG.financial}
                border="#c5d8ff"
              />
              <SummaryCard
                label="FIJO"
                value={fmt(totals.fixed)}
                sub={`${assets.filter((a) => !a.archived && a.type === 'fixed').length} activos`}
                color={TYPE_COLOR.fixed}
                bg={TYPE_BG.fixed}
                border="#ffe69c"
              />
              {totals.crypto > 0 && (
                <SummaryCard
                  label="CRIPTO (en vivo)"
                  value={fmt(totals.crypto)}
                  sub={`${assets.filter((a) => !a.archived && a.type === 'crypto').length} activos`}
                  color={TYPE_COLOR.crypto}
                  bg={TYPE_BG.crypto}
                  border="#d0bfff"
                />
              )}
              {totals.liquid > 0 && (
                <SummaryCard
                  label="LÍQUIDO"
                  value={fmt(totals.liquid)}
                  sub={`${assets.filter((a) => !a.archived && a.liquid).length} activos`}
                  color="#2f9e44"
                  bg="#f0fdf4"
                  border="#86efac"
                />
              )}
              {totals.monthly > 0 && (
                <SummaryCard
                  label="GANANCIA MENSUAL"
                  value={fmt(totals.monthly)}
                  color="#2f9e44"
                  bg="#f0fdf4"
                  border="#86efac"
                />
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'chart' && <AssetsAnalytics assets={pricedAssets} />}

      {/* Search */}
      {activeTab === 'grid' && (
        <>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <span
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#adb5bd',
                fontSize: 15,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar activo…"
              style={{
                width: '100%',
                padding: '9px 10px 9px 34px',
                borderRadius: 10,
                border: '1px solid #dee2e6',
                background: '#fff',
                fontSize: 14,
                outline: 'none',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#adb5bd',
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Filters */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 4,
              marginBottom: 12,
            }}
          >
            {['all', ...TYPES].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                style={btnStyle(filterType === t, TYPE_BG[t] ?? '#1a1a2e', TYPE_COLOR[t] ?? '#fff')}
              >
                {t === 'all' ? 'Todos' : t}
              </button>
            ))}
            <div style={{ width: 1, background: '#dee2e6', flexShrink: 0 }} />
            {HORIZONS.map((h) => (
              <button
                key={h}
                onClick={() => setFilterHorizon(filterHorizon === h ? 'all' : h)}
                style={btnStyle(filterHorizon === h, HORIZON_BG[h], HORIZON_COLOR[h])}
              >
                {h}
              </button>
            ))}
            {presentSymbols.length > 0 && (
              <>
                <div style={{ width: 1, background: '#dee2e6', flexShrink: 0 }} />
                <button
                  onClick={() => toggleSymbolFilter('manual')}
                  style={btnStyle(filterSymbols.includes('manual'), '#f3f0ff', '#6741d9')}
                >
                  manual
                </button>
                {presentSymbols.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => toggleSymbolFilter(sym)}
                    style={btnStyle(filterSymbols.includes(sym), '#f3f0ff', '#6741d9')}
                  >
                    {LIVE_PRICE_SYMBOLS.find((s) => s.value === sym)?.label ??
                      sym.replace(/USDT$/, '')}
                  </button>
                ))}
              </>
            )}
            <div style={{ width: 1, background: '#dee2e6', flexShrink: 0 }} />
            <button
              onClick={() => setFilterLiquid(filterLiquid === 'yes' ? 'all' : 'yes')}
              style={btnStyle(filterLiquid === 'yes', '#f0fdf4', '#2f9e44')}
            >
              liquid
            </button>
            <button
              onClick={() => setShowArchived((v) => !v)}
              style={btnStyle(showArchived, '#fff5f5', '#e03131')}
            >
              archivados
            </button>
          </div>

          {/* Sync all */}
          {unsyncedCount > 0 && (
            <button
              onClick={handleSyncAll}
              disabled={syncingAll}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 12,
                marginBottom: 12,
                border: syncingAll ? '1px solid #dee2e6' : '1px solid #86efac',
                background: syncingAll ? '#e9ecef' : '#f0fdf4',
                color: syncingAll ? '#adb5bd' : '#2f9e44',
                fontSize: 14,
                fontWeight: 700,
                cursor: syncingAll ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {syncingAll
                ? '… Sincronizando'
                : `☁️ Sincronizar todo (${unsyncedCount} pendiente${unsyncedCount !== 1 ? 's' : ''})`}
            </button>
          )}

          {/* List / Grid / Empty */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: '3px solid #dee2e6',
                  borderTopColor: '#1e3a5f',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{ textAlign: 'center', padding: '48px 24px', color: '#adb5bd', fontSize: 14 }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Sin activos</div>
              {assets.length === 0 ? (
                <div>
                  <div style={{ marginBottom: 16 }}>Presiona + para agregar tu primer activo</div>
                  <button
                    onClick={handleSeedImport}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 12,
                      border: 'none',
                      background: '#1e3a5f',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    📥 Importar datos del Excel
                  </button>
                </div>
              ) : (
                <div>Ajusta los filtros</div>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh' }}>
              <AssetsTable
                data={gridData}
                groupByType={groupByType}
                onEdit={setSheet}
                onDelete={handleDelete}
                onClone={handleClone}
                onQuickUpdate={handleQuickUpdate}
              />
            </div>
          ) : (
            filtered.map((a) => (
              <AssetCard
                key={a.id}
                asset={a}
                onEdit={setSheet}
                onDelete={handleDelete}
                onSync={handleSync}
                syncing={syncing}
              />
            ))
          )}
        </>
      )}

      {sheet && (
        <AssetSheet
          initial={sheet === 'new' ? null : sheet}
          saving={saving}
          onSave={handleSave}
          onClose={() => setSheet(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
