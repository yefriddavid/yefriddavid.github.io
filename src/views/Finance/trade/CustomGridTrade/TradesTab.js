import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import * as actions from 'src/actions/finance/customGridTradeActions'

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = () => ({ price: '', quantity: '', fecha: today(), notes: '' })

const inputStyle = {
  width: '100%',
  border: 'none',
  borderBottom: '2px solid #dee2e6',
  outline: 'none',
  padding: '6px 0 10px',
  background: 'transparent',
  fontSize: 16,
  color: '#0d1117',
  boxSizing: 'border-box',
  WebkitAppearance: 'none',
}
const labelStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: '#868e96',
  display: 'block',
  marginBottom: 4,
  letterSpacing: '0.05em',
}
const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }

export default function TradesTab({ trades, saving }) {
  const dispatch = useDispatch()
  const [form, setForm] = useState(null) // null = closed, object = open (new or edit)

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const openNew = () => setForm(emptyForm())
  const openEdit = (trade) =>
    setForm({
      id: trade.id,
      price: trade.price,
      quantity: trade.quantity,
      fecha: trade.fecha ?? today(),
      notes: trade.notes ?? '',
    })
  const close = () => setForm(null)

  const handleSave = () => {
    if (!form.price || !form.quantity || !form.fecha) return
    dispatch(
      actions.saveRequest({
        id: form.id ?? null,
        price: Number(form.price),
        quantity: Number(form.quantity),
        fecha: form.fecha,
        notes: form.notes.trim(),
        createdAt: form.id ? undefined : new Date().toISOString(),
      }),
    )
    close()
  }

  const handleDelete = (trade) => {
    if (window.confirm(`¿Eliminar trade en $${trade.price}?`)) {
      dispatch(actions.deleteRequest({ id: trade.id }))
    }
  }

  const fmtK = (p) => `$${(p / 1000).toFixed(2)}K`
  const btnDisabled = saving || !form?.price || !form?.quantity || !form?.fecha

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0d1117' }}>
          {trades.length} trade{trades.length !== 1 ? 's' : ''}
        </div>
        <button
          onClick={openNew}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            background: '#0d1117',
            color: '#fff',
            fontSize: 20,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>
      </div>

      {/* List */}
      {trades.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#adb5bd', fontSize: 14 }}>
          Sin trades. Presiona + para agregar el primero.
        </div>
      ) : (
        trades.map((t) => (
          <div
            key={t.id}
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e9ecef',
              padding: '12px 14px',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0d1117' }}>{fmtK(t.price)}</div>
              <div style={{ fontSize: 12, color: '#868e96', marginTop: 2 }}>
                {t.quantity} unid · {t.fecha}
              </div>
              {t.notes && (
                <div style={{ fontSize: 11, color: '#adb5bd', fontStyle: 'italic', marginTop: 2 }}>
                  {t.notes}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => openEdit(t)}
                style={{
                  minHeight: 36,
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#eef4ff',
                  color: '#1e3a5f',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Editar
              </button>
              <button
                onClick={() => {
                  const { id: _id, ...rest } = t
                  setForm({ ...rest, fecha: today() })
                }}
                style={{
                  minHeight: 36,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#f8f9fa',
                  color: '#495057',
                  fontSize: 15,
                  cursor: 'pointer',
                }}
                title="Clonar"
              >
                ⧉
              </button>
              <button
                onClick={() => handleDelete(t)}
                style={{
                  minHeight: 36,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#fff5f5',
                  color: '#e03131',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ))
      )}

      {/* Form sheet overlay */}
      {form && (
        <div
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
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
              maxWidth: 480,
              background: '#fff',
              borderRadius: '20px 20px 0 0',
              padding: '18px 20px 36px',
              maxHeight: '90dvh',
              overflowY: 'auto',
              boxSizing: 'border-box',
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
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0d1117', marginBottom: 20 }}>
              {form.id ? 'Editar trade' : 'Nuevo trade'}
            </div>

            <div style={row2}>
              <div>
                <label style={labelStyle}>PRECIO DE ENTRADA *</label>
                <input
                  style={inputStyle}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.price}
                  onChange={set('price')}
                  placeholder="78000"
                />
              </div>
              <div>
                <label style={labelStyle}>CANTIDAD *</label>
                <input
                  style={inputStyle}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.quantity}
                  onChange={set('quantity')}
                  placeholder="0.5"
                />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>FECHA DE ENTRADA *</label>
              <input style={inputStyle} type="date" value={form.fecha} onChange={set('fecha')} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>NOTAS</label>
              <textarea
                style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
                rows={2}
                value={form.notes}
                onChange={set('notes')}
                placeholder="Observaciones…"
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={close}
                style={{
                  minHeight: 48,
                  padding: '13px 16px',
                  borderRadius: 12,
                  border: '1px solid #dee2e6',
                  background: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#868e96',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={btnDisabled}
                style={{
                  flex: 2,
                  minHeight: 48,
                  padding: '13px',
                  borderRadius: 12,
                  border: 'none',
                  background: btnDisabled ? '#e9ecef' : '#0d1117',
                  color: btnDisabled ? '#adb5bd' : '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: btnDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Crear trade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
