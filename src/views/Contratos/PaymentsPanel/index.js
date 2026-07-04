import React, { useMemo, useState } from 'react'
import Spinner from 'src/components/shared/Spinner'
import './PaymentsPanel.scss'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function fmtCOP(v) {
  if (!v && v !== 0) return '—'
  return `$${String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY_FORM = { date: today(), value: '', surcharge: '', description: '' }

export default function PaymentsPanel({ payments = [], saving, onSave }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const sorted = useMemo(
    () => [...payments].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')),
    [payments],
  )

  const closeForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFormOpen(false)
  }

  const handleToggle = () => {
    if (formOpen) closeForm()
    else setFormOpen(true)
  }

  const handleEdit = (entry) => {
    setForm({
      date: entry.date,
      value: String(entry.value ?? ''),
      surcharge: entry.surcharge ? String(entry.surcharge) : '',
      description: entry.description ?? '',
    })
    setEditingId(entry.id)
    setFormOpen(true)
  }

  const handleSave = () => {
    const value = parseInt(form.value, 10)
    const surcharge = form.surcharge === '' ? 0 : parseInt(form.surcharge, 10)
    if (!form.date || isNaN(value) || value <= 0) return

    if (editingId) {
      onSave(
        payments.map((e) =>
          e.id === editingId
            ? {
                ...e,
                date: form.date,
                value,
                surcharge: isNaN(surcharge) ? 0 : surcharge,
                description: form.description,
              }
            : e,
        ),
      )
    } else {
      const entry = {
        id: genId(),
        date: form.date,
        value,
        surcharge: isNaN(surcharge) ? 0 : surcharge,
        description: form.description,
        createdAt: new Date().toISOString(),
      }
      onSave([...payments, entry])
    }
    closeForm()
  }

  const handleDelete = (id) => {
    onSave(payments.filter((e) => e.id !== id))
    if (editingId === id) closeForm()
  }

  const canAdd = form.date && form.value && parseInt(form.value, 10) > 0

  return (
    <div className="pp">
      <div className="pp__header">
        <span className="pp__title">Pagos del canon</span>
        {payments.length > 0 && (
          <span className="pp__count">{payments.length} pago{payments.length !== 1 ? 's' : ''}</span>
        )}
        {editingId && <span className="pp__editing">Editando pago</span>}
        <button
          type="button"
          className="pp__toggle-btn"
          onClick={handleToggle}
        >
          {formOpen ? 'Cancelar' : '+ Agregar pago'}
        </button>
      </div>

      {formOpen && (
        <div className="pp__form">
          <div className="pp__form-field">
            <label className="pp__label">Fecha</label>
            <input
              type="date"
              className="pp__input"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div className="pp__form-field">
            <label className="pp__label">Valor</label>
            <input
              type="text"
              className="pp__input"
              inputMode="numeric"
              placeholder="Valor pagado"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value.replace(/\D/g, '') }))}
            />
          </div>
          <div className="pp__form-field">
            <label className="pp__label">Recargo adicional</label>
            <input
              type="text"
              className="pp__input"
              inputMode="numeric"
              placeholder="0"
              value={form.surcharge}
              onChange={(e) => setForm((f) => ({ ...f, surcharge: e.target.value.replace(/\D/g, '') }))}
            />
          </div>
          <div className="pp__form-field pp__form-field--wide">
            <label className="pp__label">Descripción</label>
            <input
              type="text"
              className="pp__input"
              placeholder="Ej. Pago mes de julio"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <button
            type="button"
            className="pp__add-btn"
            onClick={handleSave}
            disabled={saving || !canAdd}
          >
            {saving ? <Spinner size="sm" /> : editingId ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="pp__empty">Sin pagos registrados</div>
      ) : (
        <div className="pp__table">
          <div className="pp__row pp__row--head">
            <span>Fecha</span>
            <span>Valor</span>
            <span>Recargo</span>
            <span>Descripción</span>
            <span />
          </div>
          {sorted.map((e) => (
            <div key={e.id} className={`pp__row${editingId === e.id ? ' pp__row--editing' : ''}`}>
              <span className="pp__date">{fmtDate(e.date)}</span>
              <span className="pp__value">{fmtCOP(e.value)}</span>
              <span className="pp__surcharge">{e.surcharge ? fmtCOP(e.surcharge) : '—'}</span>
              <span className="pp__description">{e.description || '—'}</span>
              <span className="pp__row-actions">
                <button
                  type="button"
                  className="pp__edit"
                  onClick={() => handleEdit(e)}
                  title="Editar"
                  disabled={saving}
                >✎</button>
                <button
                  type="button"
                  className="pp__del"
                  onClick={() => handleDelete(e.id)}
                  title="Eliminar"
                  disabled={saving}
                >×</button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
