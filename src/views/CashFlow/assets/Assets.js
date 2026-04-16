import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Column, Summary, TotalItem } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import * as actions from 'src/actions/cashflow/assetActions'

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n ?? 0)

const fmtNum = (n, decimals = 6) =>
  n != null && n !== ''
    ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: decimals }).format(n)
    : '—'

// ── Seed data from Excel ──────────────────────────────────────────────────────
// unitPrice stored as effective COP/unit so valueCOP = quantity × unitPrice matches Excel
const SEED_ASSETS = [
  {
    name: 'BTC/ARG',
    quantity: 0.18101424,
    unitPrice: 244718000,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: 'mediano',
    monthlyGain: 0,
    archived: false,
    notes: 'Precio original ARS ~12,402',
  },
  {
    name: 'BTC/COL',
    quantity: 0.0003,
    unitPrice: 244740000,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: 'largo',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'LDG',
    quantity: 0.341704,
    unitPrice: 244738000,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: 'largo',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'WS',
    quantity: 11773,
    unitPrice: 1,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: 'largo',
    monthlyGain: 0,
    archived: false,
    notes: 'yriosmor@gmail.com',
  },
  {
    name: 'ML 403',
    quantity: 1,
    unitPrice: 183750000,
    type: 'fixed',
    liquid: false,
    projection: false,
    horizon: '',
    monthlyGain: 1300000,
    archived: false,
    notes: '',
  },
  {
    name: 'Gld',
    quantity: 150,
    unitPrice: 600000,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: 'largo',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'QT 201',
    quantity: 1,
    unitPrice: 300000000,
    type: 'fixed',
    liquid: false,
    projection: false,
    horizon: 'corto',
    monthlyGain: 900000,
    archived: false,
    notes: '',
  },
  {
    name: 'QT 200',
    quantity: 1,
    unitPrice: 150000000,
    type: 'fixed',
    liquid: false,
    projection: false,
    horizon: 'corto',
    monthlyGain: 334000,
    archived: false,
    notes: '',
  },
  {
    name: 'ML 106',
    quantity: 1,
    unitPrice: 175000000,
    type: 'fixed',
    liquid: false,
    projection: false,
    horizon: 'corto',
    monthlyGain: 1350000,
    archived: false,
    notes: '',
  },
  {
    name: 'CDT July 2024',
    quantity: 0,
    unitPrice: 0,
    type: 'financial',
    liquid: true,
    projection: false,
    horizon: 'mediano',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'Carro KMR636',
    quantity: 1,
    unitPrice: 20000000,
    type: 'fixed',
    liquid: false,
    projection: false,
    horizon: '',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'ETH/ARG',
    quantity: 0,
    unitPrice: 0,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: 'largo',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'DollarApp',
    quantity: 134.31,
    unitPrice: 3572,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: 'largo',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'Deel rest of year',
    quantity: 0,
    unitPrice: 0,
    type: 'financial',
    liquid: true,
    projection: true,
    horizon: '',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'work rest of year',
    quantity: 0,
    unitPrice: 1,
    type: 'financial',
    liquid: true,
    projection: true,
    horizon: '',
    monthlyGain: 0,
    archived: true,
    notes: '',
  },
  {
    name: 'Alquileres rest of year',
    quantity: 0,
    unitPrice: 9,
    type: 'financial',
    liquid: true,
    projection: true,
    horizon: '',
    monthlyGain: 0,
    archived: true,
    notes: '',
  },
  {
    name: 'btc rest of year',
    quantity: 0,
    unitPrice: 3000,
    type: 'financial',
    liquid: false,
    projection: true,
    horizon: '',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'Neverless plazo fijo',
    quantity: 0,
    unitPrice: 0,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: '',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'Hyundai',
    quantity: 1,
    unitPrice: 2000000,
    type: 'financial',
    liquid: true,
    projection: false,
    horizon: '',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'fdusd 1742',
    quantity: 0,
    unitPrice: 3572,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: 'corto',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'CDT bcol 13/NOV/2024 (90)',
    quantity: 0,
    unitPrice: 0,
    type: 'financial',
    liquid: true,
    projection: false,
    horizon: '',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'CDT pichincha a mi nombre',
    quantity: 0,
    unitPrice: 0,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: '',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'aqua wallet',
    quantity: 0,
    unitPrice: 0,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: '',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'Neverless btc',
    quantity: 0.008611,
    unitPrice: 244738000,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: '',
    monthlyGain: 0,
    archived: false,
    notes: 'Precio original USD ~$589.99',
  },
  {
    name: 'trazor eth',
    quantity: 1.408,
    unitPrice: 7621238,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: '',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'Neverless rest',
    quantity: 1000,
    unitPrice: 3572,
    type: 'financial',
    liquid: false,
    projection: false,
    horizon: '',
    monthlyGain: 0,
    archived: false,
    notes: '',
  },
  {
    name: 'taxi TPV655',
    quantity: 1,
    unitPrice: 15000000,
    type: 'fixed',
    liquid: false,
    projection: false,
    horizon: '',
    monthlyGain: 1000000,
    archived: false,
    notes: '',
  },
  {
    name: 'Taxi TSK086',
    quantity: 1,
    unitPrice: 18000000,
    type: 'fixed',
    liquid: false,
    projection: false,
    horizon: '',
    monthlyGain: 1000000,
    archived: false,
    notes: '',
  },
  {
    name: 'ph wallet short',
    quantity: 0.00295713,
    unitPrice: 244741000,
    type: 'financial',
    liquid: true,
    projection: false,
    horizon: 'largo',
    monthlyGain: 0,
    archived: false,
    notes: 'Precio original USD ~$202.61',
  },
  {
    name: 'ph wallet long',
    quantity: 0.01453002,
    unitPrice: 244737000,
    type: 'financial',
    liquid: true,
    projection: false,
    horizon: 'largo',
    monthlyGain: 0,
    archived: false,
    notes: 'Precio original USD ~$995.54',
  },
]

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPES = ['financial', 'fixed']
const HORIZONS = ['largo', 'mediano', 'corto']

const TYPE_COLOR = { financial: '#1e3a5f', fixed: '#e67700' }
const TYPE_BG = { financial: '#eef4ff', fixed: '#fff8e1' }
const HORIZON_COLOR = { largo: '#6741d9', mediano: '#1971c2', corto: '#e03131' }
const HORIZON_BG = { largo: '#f3f0ff', mediano: '#e7f5ff', corto: '#fff5f5' }

const EMPTY = {
  name: '',
  quantity: '',
  unitPrice: '',
  type: 'financial',
  liquid: false,
  projection: false,
  horizon: '',
  monthlyGain: '',
  archived: false,
  notes: '',
}

// ── Pill badge ────────────────────────────────────────────────────────────────
function Pill({ label, color, bg }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 10,
        background: bg,
        color,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

// ── Asset card ────────────────────────────────────────────────────────────────
function AssetCard({ asset, onEdit, onDelete, onSync, syncing }) {
  const valueCOP = (Number(asset.quantity) || 0) * (Number(asset.unitPrice) || 0)

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '13px 15px',
        marginBottom: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        borderLeft: `4px solid ${TYPE_COLOR[asset.type] ?? '#dee2e6'}`,
        opacity: asset.archived ? 0.5 : 1,
      }}
    >
      {/* Row 1: name + value */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 6,
        }}
      >
        <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#1a1a2e',
              textDecoration: asset.archived ? 'line-through' : 'none',
            }}
          >
            {asset.name}
          </div>
          {/* badges row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            <Pill label={asset.type} color={TYPE_COLOR[asset.type]} bg={TYPE_BG[asset.type]} />
            {asset.liquid && <Pill label="liquid" color="#2f9e44" bg="#f0fdf4" />}
            {asset.projection && <Pill label="proyección" color="#6c757d" bg="#f8f9fa" />}
            {asset.horizon && (
              <Pill
                label={asset.horizon}
                color={HORIZON_COLOR[asset.horizon]}
                bg={HORIZON_BG[asset.horizon]}
              />
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#1a1a2e' }}>{fmt(valueCOP)}</div>
          {asset.monthlyGain > 0 && (
            <div style={{ fontSize: 11, color: '#2f9e44', fontWeight: 700, marginTop: 2 }}>
              +{fmt(asset.monthlyGain)}/mes
            </div>
          )}
        </div>
      </div>

      {/* Row 2: quantity × unit price */}
      {(asset.quantity || asset.unitPrice) && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            alignItems: 'center',
            fontSize: 12,
            color: '#6c757d',
            marginBottom: 8,
          }}
        >
          <span>{fmtNum(asset.quantity)} unidades</span>
          {asset.unitPrice ? (
            <>
              <span style={{ color: '#dee2e6' }}>·</span>
              <span>precio {fmt(asset.unitPrice)}</span>
            </>
          ) : null}
        </div>
      )}

      {/* Row 3: notes */}
      {asset.notes && (
        <div style={{ fontSize: 11, color: '#adb5bd', fontStyle: 'italic', marginBottom: 8 }}>
          {asset.notes}
        </div>
      )}

      {/* Row 4: actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => onEdit(asset)}
          style={{
            flex: 1,
            padding: '7px',
            borderRadius: 8,
            border: '1px solid #dee2e6',
            background: '#fff',
            fontSize: 13,
            fontWeight: 600,
            color: '#1e3a5f',
            cursor: 'pointer',
          }}
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => onSync(asset)}
          disabled={syncing}
          style={{
            padding: '7px 12px',
            borderRadius: 8,
            border: 'none',
            background: '#eef4ff',
            fontSize: 13,
            fontWeight: 600,
            color: syncing ? '#adb5bd' : '#1e3a5f',
            cursor: syncing ? 'not-allowed' : 'pointer',
          }}
          title="Sincronizar a Firebase"
        >
          ☁️
        </button>
        <button
          onClick={() => onDelete(asset)}
          style={{
            padding: '7px 12px',
            borderRadius: 8,
            border: 'none',
            background: '#fff5f5',
            fontSize: 13,
            color: '#e03131',
            cursor: 'pointer',
          }}
        >
          🗑
        </button>
      </div>
      <div
        style={{
          fontSize: 10,
          color: asset.syncedAt ? '#2f9e44' : '#f59f00',
          marginTop: 4,
          textAlign: 'right',
        }}
      >
        {asset.syncedAt ? '● Firebase' : '○ Local'}
      </div>
    </div>
  )
}

// ── Form sheet ────────────────────────────────────────────────────────────────
function AssetSheet({ initial, saving, onSave, onClose }) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name ?? '',
          quantity: initial.quantity ?? '',
          unitPrice: initial.unitPrice ?? '',
          type: initial.type ?? 'financial',
          liquid: initial.liquid ?? false,
          projection: initial.projection ?? false,
          horizon: initial.horizon ?? '',
          monthlyGain: initial.monthlyGain ?? '',
          archived: initial.archived ?? false,
          notes: initial.notes ?? '',
        }
      : { ...EMPTY },
  )

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  const toggle = (field) => () => setForm((p) => ({ ...p, [field]: !p[field] }))

  const valueCOP = (Number(form.quantity) || 0) * (Number(form.unitPrice) || 0)

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave({
      id: initial?.id ?? uid(),
      name: form.name.trim(),
      quantity: Number(form.quantity) || 0,
      unitPrice: Number(form.unitPrice) || 0,
      type: form.type,
      liquid: form.liquid,
      projection: form.projection,
      horizon: form.horizon,
      monthlyGain: Number(form.monthlyGain) || 0,
      archived: form.archived,
      notes: form.notes.trim(),
      createdAt: initial?.createdAt ?? now(),
      updatedAt: now(),
    })
  }

  const inputStyle = {
    width: '100%',
    border: 'none',
    borderBottom: '2px solid #dee2e6',
    outline: 'none',
    padding: '4px 0 8px',
    background: 'transparent',
    fontSize: 15,
    color: '#1a1a2e',
  }
  const labelStyle = {
    fontSize: 11,
    fontWeight: 600,
    color: '#6c757d',
    display: 'block',
    marginBottom: 4,
    letterSpacing: '0.05em',
  }
  const toggleStyle = (active, color = '#1e3a5f', bg = '#eef4ff') => ({
    padding: '6px 14px',
    borderRadius: 20,
    border: 'none',
    cursor: 'pointer',
    background: active ? bg : '#f8f9fa',
    color: active ? color : '#adb5bd',
    fontSize: 12,
    fontWeight: 700,
  })

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 540,
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          padding: '20px 20px 36px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: '#dee2e6',
            margin: '0 auto 18px',
          }}
        />
        <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>
          {isEdit ? 'Editar activo' : 'Nuevo activo'}
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>NOMBRE *</label>
          <input
            style={inputStyle}
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="Ej: BTC/COL"
            autoFocus
          />
        </div>

        {/* Type */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>TIPO</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {TYPES.map((t) => (
              <button
                key={t}
                style={toggleStyle(form.type === t, TYPE_COLOR[t], TYPE_BG[t])}
                onClick={() => setForm((p) => ({ ...p, type: t }))}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity + Unit price */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>CANTIDAD</label>
            <input
              style={inputStyle}
              type="number"
              min="0"
              step="any"
              value={form.quantity}
              onChange={set('quantity')}
              placeholder="0"
            />
          </div>
          <div>
            <label style={labelStyle}>PRECIO UNITARIO (COP)</label>
            <input
              style={inputStyle}
              type="number"
              min="0"
              step="any"
              value={form.unitPrice}
              onChange={set('unitPrice')}
              placeholder="0"
            />
          </div>
        </div>

        {/* Computed value */}
        {valueCOP > 0 && (
          <div
            style={{
              background: '#eef4ff',
              border: '1px solid #c5d8ff',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 13, color: '#1e3a5f', fontWeight: 600 }}>Valor COP</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>{fmt(valueCOP)}</span>
          </div>
        )}

        {/* Horizon */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>HORIZONTE</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              style={toggleStyle(!form.horizon)}
              onClick={() => setForm((p) => ({ ...p, horizon: '' }))}
            >
              ninguno
            </button>
            {HORIZONS.map((h) => (
              <button
                key={h}
                style={toggleStyle(form.horizon === h, HORIZON_COLOR[h], HORIZON_BG[h])}
                onClick={() => setForm((p) => ({ ...p, horizon: h }))}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly gain */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>GANANCIA MENSUAL (COP)</label>
          <input
            style={inputStyle}
            type="number"
            min="0"
            value={form.monthlyGain}
            onChange={set('monthlyGain')}
            placeholder="0"
          />
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button style={toggleStyle(form.liquid, '#2f9e44', '#f0fdf4')} onClick={toggle('liquid')}>
            {form.liquid ? '✓' : '○'} Liquid
          </button>
          <button
            style={toggleStyle(form.projection, '#6c757d', '#f8f9fa')}
            onClick={toggle('projection')}
          >
            {form.projection ? '✓' : '○'} Proyección
          </button>
          <button
            style={toggleStyle(form.archived, '#e03131', '#fff5f5')}
            onClick={toggle('archived')}
          >
            {form.archived ? '✓' : '○'} Archivado
          </button>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>NOTAS</label>
          <textarea
            style={{
              ...inputStyle,
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: 13,
              lineHeight: 1.5,
            }}
            rows={2}
            value={form.notes}
            onChange={set('notes')}
            placeholder="Observaciones…"
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: '13px',
              borderRadius: 12,
              border: '1px solid #dee2e6',
              background: '#fff',
              fontSize: 14,
              fontWeight: 600,
              color: '#6c757d',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            style={{
              flex: 2,
              padding: '13px',
              borderRadius: 12,
              border: 'none',
              background: saving || !form.name.trim() ? '#e9ecef' : '#1e3a5f',
              color: saving || !form.name.trim() ? '#adb5bd' : '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: saving || !form.name.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {isEdit ? 'Guardar cambios' : 'Crear activo'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Summary card ──────────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  sub,
  color = '#1a1a2e',
  bg = '#f8f9fa',
  border = '#e9ecef',
  wide = false,
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: '10px 14px',
        gridColumn: wide ? '1 / -1' : undefined,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#adb5bd',
          letterSpacing: '0.05em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#6c757d', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Assets() {
  const dispatch = useDispatch()
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
  }, [dispatch])

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
    // sync all to Firebase right after seeding
    setTimeout(() => dispatch(actions.syncAllRequest(seeded)), 800)
  }

  const handleSync = (asset) => dispatch(actions.syncRequest(asset))
  const handleSyncAll = () => dispatch(actions.syncAllRequest(assets.filter((a) => !a.syncedAt)))
  const handleImport = () => dispatch(actions.importRequest())

  const unsyncedCount = assets.filter((a) => !a.syncedAt).length

  const toggleView = () => {
    const next = viewMode === 'cards' ? 'grid' : 'cards'
    setViewMode(next)
    localStorage.setItem('assets_viewMode', next)
  }

  const gridData = useMemo(
    () =>
      filtered.map((a) => ({
        ...a,
        valueCOP: (Number(a.quantity) || 0) * (Number(a.unitPrice) || 0),
      })),
    [filtered],
  )

  const activeFilters =
    filterType !== 'all' || filterHorizon !== 'all' || filterLiquid !== 'all' || !!search


  return (
    <div
      style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '0 12px 60px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ── Header ── */}
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
            title={viewMode === 'cards' ? 'Ver tabla' : 'Ver tarjetas'}
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

      {/* ── Portfolio summary ── */}
      {!loading && assets.length > 0 && (
        <>
          {/* Big total */}
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

          {/* Summary grid */}
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

      {/* ── Search ── */}
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

      {/* ── Filters ── */}
      <div
        style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}
      >
        {/* Type */}
        {['all', ...TYPES].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
              background: filterType === t ? (TYPE_BG[t] ?? '#1a1a2e') : '#f8f9fa',
              color: filterType === t ? (TYPE_COLOR[t] ?? '#fff') : '#6c757d',
            }}
          >
            {t === 'all' ? 'Todos' : t}
          </button>
        ))}
        <div style={{ width: 1, background: '#dee2e6', flexShrink: 0 }} />
        {/* Horizon */}
        {HORIZONS.map((h) => (
          <button
            key={h}
            onClick={() => setFilterHorizon(filterHorizon === h ? 'all' : h)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
              background: filterHorizon === h ? HORIZON_BG[h] : '#f8f9fa',
              color: filterHorizon === h ? HORIZON_COLOR[h] : '#6c757d',
            }}
          >
            {h}
          </button>
        ))}
        <div style={{ width: 1, background: '#dee2e6', flexShrink: 0 }} />
        {/* Liquid */}
        <button
          onClick={() => setFilterLiquid(filterLiquid === 'yes' ? 'all' : 'yes')}
          style={{
            padding: '5px 12px',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontSize: 12,
            fontWeight: 600,
            flexShrink: 0,
            background: filterLiquid === 'yes' ? '#f0fdf4' : '#f8f9fa',
            color: filterLiquid === 'yes' ? '#2f9e44' : '#6c757d',
          }}
        >
          liquid
        </button>
        {/* Archived toggle */}
        <button
          onClick={() => setShowArchived((v) => !v)}
          style={{
            padding: '5px 12px',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontSize: 12,
            fontWeight: 600,
            flexShrink: 0,
            background: showArchived ? '#fff5f5' : '#f8f9fa',
            color: showArchived ? '#e03131' : '#6c757d',
          }}
        >
          archivados
        </button>
      </div>

      {/* ── Sync all ── */}
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

      {/* ── List ── */}
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

      {/* ── Sheet ── */}
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
