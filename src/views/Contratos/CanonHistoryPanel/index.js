import React, { useMemo, useState } from 'react'
import Spinner from 'src/components/shared/Spinner'
import './CanonHistoryPanel.scss'

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

const EMPTY_FORM = { date: today(), percentage: '', value: '' }

export default function CanonHistoryPanel({ history = [], baseValue = 0, saving, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM)

  // Sort descending by date for display; base value is the most recent entry's value
  const sorted = useMemo(
    () => [...history].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')),
    [history],
  )

  const lastValue = sorted.length > 0 ? sorted[0].value : (baseValue ?? 0)

  const handlePctChange = (e) => {
    const pct = e.target.value
    if (pct === '' || pct === '-') { setForm((f) => ({ ...f, percentage: pct, value: '' })); return }
    const pctNum = parseFloat(pct)
    if (!isNaN(pctNum) && lastValue > 0) {
      const calculated = Math.round(lastValue * (1 + pctNum / 100))
      setForm((f) => ({ ...f, percentage: pct, value: String(calculated) }))
    } else {
      setForm((f) => ({ ...f, percentage: pct }))
    }
  }

  const handleValueChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw === '') { setForm((f) => ({ ...f, value: '', percentage: '' })); return }
    const valNum = parseInt(raw, 10)
    if (lastValue > 0) {
      const pct = (((valNum / lastValue) - 1) * 100).toFixed(2)
      setForm((f) => ({ ...f, value: raw, percentage: pct }))
    } else {
      setForm((f) => ({ ...f, value: raw }))
    }
  }

  const handleAdd = () => {
    const value = parseInt(form.value, 10)
    const percentage = parseFloat(form.percentage)
    if (!form.date || isNaN(value) || value <= 0) return
    const entry = {
      id: genId(),
      date: form.date,
      value,
      percentage: isNaN(percentage) ? 0 : percentage,
      createdAt: new Date().toISOString(),
    }
    onSave([...history, entry])
    setForm({ date: today(), percentage: '', value: '' })
  }

  const handleDelete = (id) => {
    onSave(history.filter((e) => e.id !== id))
  }

  const canAdd = form.date && form.value && parseInt(form.value, 10) > 0

  return (
    <div className="ch">
      <div className="ch__header">
        <span className="ch__title">Historial de canon</span>
        {history.length > 0 && <span className="ch__count">{history.length} registro{history.length !== 1 ? 's' : ''}</span>}
        {lastValue > 0 && <span className="ch__base">Base: {fmtCOP(lastValue)}</span>}
      </div>

      {sorted.length === 0 ? (
        <div className="ch__empty">Sin incrementos registrados</div>
      ) : (
        <div className="ch__table">
          <div className="ch__row ch__row--head">
            <span>Fecha</span>
            <span>Incremento</span>
            <span>Nuevo valor</span>
            <span />
          </div>
          {sorted.map((e) => (
            <div key={e.id} className="ch__row">
              <span className="ch__date">{fmtDate(e.date)}</span>
              <span className={`ch__pct ${e.percentage > 0 ? 'ch__pct--up' : e.percentage < 0 ? 'ch__pct--down' : ''}`}>
                {e.percentage > 0 ? '+' : ''}{e.percentage}%
              </span>
              <span className="ch__value">{fmtCOP(e.value)}</span>
              <button
                type="button"
                className="ch__del"
                onClick={() => handleDelete(e.id)}
                title="Eliminar"
                disabled={saving}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <div className="ch__form">
        <div className="ch__form-field">
          <label className="ch__label">Fecha vigencia</label>
          <input
            type="date"
            className="ch__input"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </div>
        <div className="ch__form-field">
          <label className="ch__label">% incremento</label>
          <input
            type="number"
            className="ch__input"
            placeholder="Ej. 10"
            step="0.01"
            value={form.percentage}
            onChange={handlePctChange}
          />
        </div>
        <div className="ch__form-field">
          <label className="ch__label">Nuevo valor canon</label>
          <input
            type="text"
            className="ch__input"
            inputMode="numeric"
            placeholder="Calculado automático"
            value={form.value}
            onChange={handleValueChange}
          />
        </div>
        <button
          type="button"
          className="ch__add-btn"
          onClick={handleAdd}
          disabled={saving || !canAdd}
        >
          {saving ? <Spinner size="sm" /> : 'Agregar'}
        </button>
      </div>
    </div>
  )
}
