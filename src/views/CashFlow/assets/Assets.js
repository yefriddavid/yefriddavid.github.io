import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Column, Summary, TotalItem } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import * as actions from 'src/actions/cashflow/assetActions'
import { uid, now, fmt } from './assetHelpers'
import {
  TYPES,
  HORIZONS,
  TYPE_COLOR,
  TYPE_BG,
  HORIZON_COLOR,
  HORIZON_BG,
  SEED_ASSETS,
} from './assetConstants'
import AssetCard from './AssetCard'
import AssetSheet from './AssetSheet'
import SummaryCard from './SummaryCard'
import useActiveTenantId from 'src/hooks/useActiveTenantId'

export default function Assets() {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { assets, loading, saving, syncing, syncingAll, importing } = useSelector((s) => s.asset)

  const [sheet, setSheet] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [filterHorizon, setFilterHorizon] = useState('all')
  const [filterLiquid, setFilterLiquid] = useState('all')
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('assets_viewMode') ?? 'cards')

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (!showArchived && a.archived) return false
      if (filterType !== 'all' && a.type !== filterType) return false
      if (filterHorizon !== 'all' && a.horizon !== filterHorizon) return false
      if (filterLiquid === 'yes' && !a.liquid) return false
      if (filterLiquid === 'no' && a.liquid) return false
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [assets, filterType, filterHorizon, filterLiquid, search, showArchived])

  const totals = useMemo(() => {
    let total = 0,
      financial = 0,
      fixed = 0,
      liquid = 0,
      monthly = 0
    assets.forEach((a) => {
      if (a.archived) return
      const v = (Number(a.quantity) || 0) * (Number(a.unitPrice) || 0)
      total += v
      if (a.type === 'financial') financial += v
      if (a.type === 'fixed') fixed += v
      if (a.liquid) liquid += v
      monthly += Number(a.monthlyGain) || 0
    })
    return { total, financial, fixed, liquid, monthly }
  }, [assets])

  const gridData = useMemo(
    () =>
      filtered.map((a) => ({
        ...a,
        valueCOP: (Number(a.quantity) || 0) * (Number(a.unitPrice) || 0),
      })),
    [filtered],
  )

  const handleSave = (asset) => {
    dispatch(actions.saveRequest(asset))
    setSheet(null)
  }

  const handleDelete = (asset) => {
    if (window.confirm(`¿Eliminar "${asset.name}"?`))
      dispatch(actions.deleteRequest({ id: asset.id }))
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
    filterType !== 'all' || filterHorizon !== 'all' || filterLiquid !== 'all' || !!search

  const toggleView = () => {
    const next = viewMode === 'cards' ? 'grid' : 'cards'
    setViewMode(next)
    localStorage.setItem('assets_viewMode', next)
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
        maxWidth: 680,
        margin: '0 auto',
        padding: '0 12px 60px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
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
        </>
      )}

      {/* Search */}
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
        style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}
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
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#adb5bd', fontSize: 14 }}>
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
        <StandardGrid dataSource={gridData}>
          <Column dataField="name" caption="Nombre" width={80} />
          <Column
            dataField="type"
            caption="Tipo"
            width={80}
            cellRender={({ value }) => (
              <span style={{ color: TYPE_COLOR[value], fontWeight: 700, fontSize: 12 }}>
                {value}
              </span>
            )}
          />
          <Column
            dataField="quantity"
            caption="Cantidad"
            dataType="number"
            width={110}
            format={{ type: 'fixedPoint', precision: 1 }}
          />
          <Column
            dataField="unitPrice"
            caption="Precio unit."
            dataType="number"
            width={130}
            format={{ type: 'currency', currency: 'COP', precision: 0 }}
          />
          <Column
            dataField="valueCOP"
            caption="Valor COP"
            dataType="number"
            width={140}
            format={{ type: 'currency', currency: 'COP', precision: 0 }}
          />
          <Column dataField="liquid" caption="Liquid" dataType="boolean" width={70} />
          <Column
            dataField="horizon"
            caption="Horizonte"
            width={90}
            cellRender={({ value }) =>
              value ? (
                <span style={{ color: HORIZON_COLOR[value], fontWeight: 700, fontSize: 12 }}>
                  {value}
                </span>
              ) : null
            }
          />
          <Column
            dataField="monthlyGain"
            caption="Ganancia/mes"
            dataType="number"
            width={130}
            format={{ type: 'currency', currency: 'COP', precision: 0 }}
          />
          <Column dataField="projection" caption="Proyección" dataType="boolean" width={90} />
          <Column
            caption=""
            width={80}
            cellRender={({ data }) => (
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => setSheet(data)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: '#1e3a5f',
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(data)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: '#e03131',
                  }}
                >
                  🗑
                </button>
              </div>
            )}
          />
          <Summary>
            <TotalItem
              column="valueCOP"
              summaryType="sum"
              displayFormat="Total: {0}"
              valueFormat={{ type: 'currency', currency: 'COP', precision: 0 }}
            />
            <TotalItem
              column="monthlyGain"
              summaryType="sum"
              displayFormat="{0}/mes"
              valueFormat={{ type: 'currency', currency: 'COP', precision: 0 }}
            />
          </Summary>
        </StandardGrid>
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
