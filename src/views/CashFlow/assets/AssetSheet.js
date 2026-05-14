import React, { useState } from 'react'
import { uid, now, fmt } from './assetHelpers'
import { TYPES, HORIZONS, TYPE_COLOR, TYPE_BG, HORIZON_COLOR, HORIZON_BG, EMPTY_ASSET } from './assetConstants'

export default function AssetSheet({ initial, saving, onSave, onClose }) {
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
      : { ...EMPTY_ASSET },
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

  const inputStyle = { width: '100%', border: 'none', borderBottom: '2px solid #dee2e6', outline: 'none', padding: '4px 0 8px', background: 'transparent', fontSize: 15, color: '#1a1a2e' }
  const labelStyle = { fontSize: 11, fontWeight: 600, color: '#6c757d', display: 'block', marginBottom: 4, letterSpacing: '0.05em' }
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
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1050, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 540, background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 20px 36px', boxShadow: '0 -4px 24px rgba(0,0,0,0.15)', maxHeight: '92vh', overflowY: 'auto' }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#dee2e6', margin: '0 auto 18px' }} />
        <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>
          {isEdit ? 'Editar activo' : 'Nuevo activo'}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>NOMBRE *</label>
          <input style={inputStyle} type="text" value={form.name} onChange={set('name')} placeholder="Ej: BTC/COL" autoFocus />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>TIPO</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {TYPES.map((t) => (
              <button key={t} style={toggleStyle(form.type === t, TYPE_COLOR[t], TYPE_BG[t])} onClick={() => setForm((p) => ({ ...p, type: t }))}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>CANTIDAD</label>
            <input style={inputStyle} type="number" min="0" step="any" value={form.quantity} onChange={set('quantity')} placeholder="0" />
          </div>
          <div>
            <label style={labelStyle}>PRECIO UNITARIO (COP)</label>
            <input style={inputStyle} type="number" min="0" step="any" value={form.unitPrice} onChange={set('unitPrice')} placeholder="0" />
          </div>
        </div>

        {valueCOP > 0 && (
          <div style={{ background: '#eef4ff', border: '1px solid #c5d8ff', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#1e3a5f', fontWeight: 600 }}>Valor COP</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>{fmt(valueCOP)}</span>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>HORIZONTE</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={toggleStyle(!form.horizon)} onClick={() => setForm((p) => ({ ...p, horizon: '' }))}>ninguno</button>
            {HORIZONS.map((h) => (
              <button key={h} style={toggleStyle(form.horizon === h, HORIZON_COLOR[h], HORIZON_BG[h])} onClick={() => setForm((p) => ({ ...p, horizon: h }))}>
                {h}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>GANANCIA MENSUAL (COP)</label>
          <input style={inputStyle} type="number" min="0" value={form.monthlyGain} onChange={set('monthlyGain')} placeholder="0" />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button style={toggleStyle(form.liquid, '#2f9e44', '#f0fdf4')} onClick={toggle('liquid')}>
            {form.liquid ? '✓' : '○'} Liquid
          </button>
          <button style={toggleStyle(form.projection, '#6c757d', '#f8f9fa')} onClick={toggle('projection')}>
            {form.projection ? '✓' : '○'} Proyección
          </button>
          <button style={toggleStyle(form.archived, '#e03131', '#fff5f5')} onClick={toggle('archived')}>
            {form.archived ? '✓' : '○'} Archivado
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>NOTAS</label>
          <textarea
            style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5 }}
            rows={2}
            value={form.notes}
            onChange={set('notes')}
            placeholder="Observaciones…"
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '13px', borderRadius: 12, border: '1px solid #dee2e6', background: '#fff', fontSize: 14, fontWeight: 600, color: '#6c757d', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: saving || !form.name.trim() ? '#e9ecef' : '#1e3a5f', color: saving || !form.name.trim() ? '#adb5bd' : '#fff', fontSize: 14, fontWeight: 700, cursor: saving || !form.name.trim() ? 'not-allowed' : 'pointer' }}
          >
            {isEdit ? 'Guardar cambios' : 'Crear activo'}
          </button>
        </div>
      </div>
    </div>
  )
}
