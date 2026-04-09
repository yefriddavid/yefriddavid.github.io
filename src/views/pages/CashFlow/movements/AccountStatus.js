import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import * as transactionActions from 'src/actions/CashFlow/transactionActions'
import * as accountsMasterActions from 'src/actions/CashFlow/accountsMasterActions'
import * as accountStatusNoteActions from 'src/actions/CashFlow/accountStatusNoteActions'
import { MONTH_LABELS, ACCOUNT_CATEGORIES, PAYMENT_METHODS } from 'src/constants/cashFlow'
import { MONTH_NAMES } from 'src/constants/commons'
import AttachmentViewer from 'src/components/App/AttachmentViewer'
import { processAttachmentFile } from 'src/utils/fileHelpers'
import { cilCalendar } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import InlinePaymentMethod from './InlinePaymentMethod'
import OcrReceiptImporter from './OcrReceiptImporter'

const now = new Date()
const CURRENT_YEAR = now.getFullYear()
const CURRENT_MONTH = now.getMonth() + 1

  /*const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]*/

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n ?? 0)

// ── Domain helpers ─────────────────────────────────────────────────────────────
function isApplicableToMonth(account, month) {
  if (!account.active) return false
  if (account.period === 'Mensuales') return true
  if (account.period === 'Anuales') return MONTH_NAMES.indexOf(account.monthStartAt) + 1 === month
  if (
    account.period === 'Trimestrales' ||
    account.period === 'Cuatrimestrales' ||
    account.period === 'Semestrales'
  ) {
    const startMonth = MONTH_NAMES.indexOf(account.monthStartAt) + 1
    if (startMonth === 0) return false
    const interval =
      account.period === 'Trimestrales' ? 3 : account.period === 'Cuatrimestrales' ? 4 : 6
    return (month - startMonth + 12) % interval === 0
  }
  return true
}

function getStatus(account, payments, monthStr, cumulativePaid = null) {
  const target = account.targetAmount > 0 ? account.targetAmount : null

  if (target !== null) {
    const totalPaid = cumulativePaid ?? payments.reduce((s, t) => s + (t.amount || 0), 0)
    const remaining = target - totalPaid
    if (remaining <= 0)
      return { label: 'Pagado', color: '#2f9e44', bg: '#f0fdf4', border: '#86efac', paid: totalPaid, remaining: 0 }
    if (totalPaid > 0)
      return { label: 'Parcial', color: '#0ea5e9', bg: '#f0f9ff', border: '#7dd3fc', paid: totalPaid, remaining }
    const today = new Date()
    const [y, m] = monthStr.split('-').map(Number)
    const due = new Date(y, m - 1, account.maxDatePay || 31)
    if (today > due)
      return { label: 'Vencido', color: '#e03131', bg: '#fff5f5', border: '#fca5a5', paid: 0, remaining }
    return { label: 'Pendiente', color: '#f59f00', bg: '#fff9db', border: '#ffe066', paid: 0, remaining }
  }

  const paid = payments.reduce((s, t) => s + (t.amount || 0), 0)
  if (paid > 0 && account.defaultValue > 0 && paid < account.defaultValue)
    return { label: 'Parcial', color: '#0ea5e9', bg: '#f0f9ff', border: '#7dd3fc', paid }
  if (paid > 0) return { label: 'Pagado', color: '#2f9e44', bg: '#f0fdf4', border: '#86efac', paid }
  const today = new Date()
  const [y, m] = monthStr.split('-').map(Number)
  const due = new Date(y, m - 1, account.maxDatePay || 31)
  if (today > due)
    return { label: 'Vencido', color: '#e03131', bg: '#fff5f5', border: '#fca5a5', paid: 0 }
  return { label: 'Pendiente', color: '#f59f00', bg: '#fff9db', border: '#ffe066', paid: 0 }
}

const fieldLabel = {
  fontSize: 12,
  fontWeight: 600,
  color: '#6c757d',
  display: 'block',
  marginBottom: 6,
  letterSpacing: '0.04em',
}
const fieldInput = {
  width: '100%',
  color: '#1a1a2e',
  border: 'none',
  borderBottom: '2px solid #dee2e6',
  outline: 'none',
  padding: '4px 0 10px',
  background: 'transparent',
}

// ── Period notes ──────────────────────────────────────────────────────────────
function PeriodNotes({ period, notes, saving, fetching, onAdd, onToggle, onDelete }) {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)

  const handleAdd = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setText('')
  }

  const fmtDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e9ecef',
        borderRadius: 14,
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      {/* Header toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>📝</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>
            Notas del período
          </span>
          {notes.length > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: '#eef4ff',
                color: '#1e3a5f',
                borderRadius: 10,
                padding: '1px 7px',
              }}
            >
              {notes.length}
            </span>
          )}
        </div>
        <span style={{ fontSize: 14, color: '#adb5bd', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* Notes list */}
          {fetching ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <CSpinner size="sm" />
            </div>
          ) : notes.length === 0 ? (
            <div style={{ fontSize: 13, color: '#adb5bd', padding: '4px 0 12px', textAlign: 'center' }}>
              Sin notas para este período
            </div>
          ) : (
            <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {notes.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: n.checked ? '#f0fdf4' : '#f8f9fa',
                    border: `1px solid ${n.checked ? '#86efac' : '#e9ecef'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!n.checked}
                    onChange={() => onToggle(n)}
                    style={{ marginTop: 2, width: 16, height: 16, accentColor: '#2f9e44', flexShrink: 0, cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        color: n.checked ? '#6c757d' : '#1a1a2e',
                        textDecoration: n.checked ? 'line-through' : 'none',
                        wordBreak: 'break-word',
                      }}
                    >
                      {n.text}
                    </div>
                    {n.createdAt && (
                      <div style={{ fontSize: 11, color: '#adb5bd', marginTop: 2 }}>
                        {fmtDate(n.createdAt)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onDelete(n)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#adb5bd',
                      fontSize: 14,
                      padding: '0 2px',
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                    title="Eliminar nota"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add note input */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Nueva nota…"
              style={{
                flex: 1,
                fontSize: 14,
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #dee2e6',
                outline: 'none',
                background: '#fafafa',
              }}
            />
            <button
              onClick={handleAdd}
              disabled={saving || !text.trim()}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: 'none',
                background: saving || !text.trim() ? '#e9ecef' : '#1e3a5f',
                color: saving || !text.trim() ? '#adb5bd' : '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: saving || !text.trim() ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {saving ? <CSpinner size="sm" style={{ borderColor: '#fff', borderRightColor: 'transparent' }} /> : '+ Agregar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const PERIOD_OPTIONS = ['Mensuales', 'Trimestrales', 'Cuatrimestrales', 'Semestrales', 'Anuales', 'N/A']
const TYPE_OPTIONS = ['Outcoming', 'Incoming']
const CLASSIFICATION_OPTIONS = ['dispensable', 'indispensable']

// ── Detail modal (bottom sheet) ───────────────────────────────────────────────
function DetailModal({ account, saving, onUpdate, onClose }) {
  const [tab, setTab] = useState('info')
  const [form, setForm] = useState({ ...account })

  const set = (field) => (e) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
  }

  const handleSave = () => {
    if (!form.name?.trim()) return
    onUpdate(form)
  }

  const periodLabel = account.period || '—'
  const startMonthLabel = account.monthStartAt
    ? MONTH_LABELS[MONTH_NAMES.indexOf(account.monthStartAt)] ?? account.monthStartAt
    : null

  const rows = [
    { label: 'Tipo', value: account.type === 'Outcoming' ? 'Egreso' : 'Ingreso' },
    { label: 'Categoría', value: account.category || '—' },
    { label: 'Período', value: startMonthLabel ? `${periodLabel} (desde ${startMonthLabel})` : periodLabel },
    { label: 'Valor por defecto', value: account.defaultValue ? fmt(account.defaultValue) : '—' },
    { label: 'Fecha límite de pago', value: account.maxDatePay ? `Día ${account.maxDatePay}` : '—' },
    { label: 'Método de pago', value: account.paymentMethod || '—' },
    { label: 'Estado', value: account.active ? 'Activa' : 'Inactiva' },
  ]

  const tabStyle = (active) => ({
    flex: 1,
    padding: '10px 0',
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    background: 'none',
    borderBottom: active ? '2px solid #1e3a5f' : '2px solid transparent',
    color: active ? '#1e3a5f' : '#adb5bd',
    transition: 'all 0.15s',
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
          padding: '24px 20px 36px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#dee2e6', margin: '0 auto 16px' }} />

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          {account.important && <span style={{ color: '#e03131', fontSize: 16 }}>★</span>}
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>{account.name}</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e9ecef', marginBottom: 20 }}>
          <button style={tabStyle(tab === 'info')} onClick={() => setTab('info')}>Información</button>
          <button style={tabStyle(tab === 'edit')} onClick={() => setTab('edit')}>Editar</button>
        </div>

        {/* ── Info tab ── */}
        {tab === 'info' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {rows.map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '11px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ fontSize: 13, color: '#6c757d', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              style={{
                marginTop: 24,
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: '1px solid #dee2e6',
                background: '#fff',
                fontSize: 15,
                fontWeight: 600,
                color: '#6c757d',
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </>
        )}

        {/* ── Edit tab ── */}
        {tab === 'edit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabel}>NOMBRE *</label>
              <input style={fieldInput} type="text" value={form.name} onChange={set('name')} />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabel}>DESCRIPCIÓN</label>
              <input style={fieldInput} type="text" value={form.description ?? ''} onChange={set('description')} placeholder="Descripción corta" />
            </div>

            {/* Notas */}
            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabel}>NOTAS</label>
              <textarea
                value={form.notes ?? ''}
                onChange={set('notes')}
                rows={2}
                placeholder="Observaciones adicionales…"
                style={{ ...fieldInput, resize: 'none', fontFamily: 'inherit', fontSize: 14 }}
              />
            </div>

            {/* Tipo / Período */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={fieldLabel}>TIPO</label>
                <select style={{ ...fieldInput, fontSize: 14 }} value={form.type} onChange={set('type')}>
                  {TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={fieldLabel}>PERÍODO</label>
                <select style={{ ...fieldInput, fontSize: 14 }} value={form.period} onChange={set('period')}>
                  {PERIOD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Mes inicio (solo períodos no mensuales) */}
            {['Trimestrales', 'Cuatrimestrales', 'Semestrales', 'Anuales', 'N/A'].includes(form.period) && (
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>MES DE INICIO / APLICA</label>
                <select style={{ ...fieldInput, fontSize: 14 }} value={form.monthStartAt ?? 'January'} onChange={set('monthStartAt')}>
                  {MONTH_NAMES.map((m, i) => <option key={m} value={m}>{MONTH_LABELS[i]}</option>)}
                </select>
              </div>
            )}

            {/* Clasificación / Categoría */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={fieldLabel}>CLASIFICACIÓN</label>
                <select style={{ ...fieldInput, fontSize: 14 }} value={form.classification ?? 'dispensable'} onChange={set('classification')}>
                  {CLASSIFICATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={fieldLabel}>CATEGORÍA</label>
                <select style={{ ...fieldInput, fontSize: 14 }} value={form.category ?? ''} onChange={set('category')}>
                  <option value="">Sin categoría</option>
                  {ACCOUNT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Día máximo / Método de pago */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={fieldLabel}>DÍA MÁX. PAGO</label>
                <input style={fieldInput} type="number" min={1} max={31} value={form.maxDatePay ?? 15} onChange={set('maxDatePay')} />
              </div>
              <div>
                <label style={fieldLabel}>MÉTODO DE PAGO</label>
                <select style={{ ...fieldInput, fontSize: 14 }} value={form.paymentMethod ?? ''} onChange={set('paymentMethod')}>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Valor por defecto */}
            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabel}>VALOR POR DEFECTO (COP)</label>
              <input style={{ ...fieldInput, fontSize: 16 }} type="number" min={0} value={form.defaultValue ?? ''} onChange={set('defaultValue')} placeholder="0 — opcional" />
            </div>

            {/* Target amount */}
            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabel}>
                DEUDA TOTAL A PAGAR (COP)
                <span style={{ fontSize: 11, color: '#adb5bd', marginLeft: 6 }}>— dejar vacío si no es una deuda</span>
              </label>
              <input style={{ ...fieldInput, fontSize: 16 }} type="number" min={0} value={form.targetAmount ?? ''} onChange={set('targetAmount')} placeholder="0 — opcional" />
            </div>

            {/* Estado */}
            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabel}>ESTADO</label>
              <select
                style={{ ...fieldInput, fontSize: 14 }}
                value={form.active ? 'true' : 'false'}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.value === 'true' }))}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>

            {/* Importante */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, cursor: 'pointer' }}
              onClick={() => setForm((prev) => ({ ...prev, important: !prev.important }))}
            >
              <input
                type="checkbox"
                checked={!!form.important}
                onChange={(e) => setForm((prev) => ({ ...prev, important: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: '#e03131', cursor: 'pointer', flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#6c757d' }}>
                <span style={{ color: '#e03131', marginRight: 4 }}>★</span>Importante
              </span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid #dee2e6',
                  background: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#6c757d',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name?.trim()}
                style={{
                  flex: 2,
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  background: saving || !form.name?.trim() ? '#e9ecef' : '#1e3a5f',
                  fontSize: 15,
                  fontWeight: 700,
                  color: saving || !form.name?.trim() ? '#adb5bd' : '#fff',
                  cursor: saving || !form.name?.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {saving ? (
                  <CSpinner size="sm" style={{ borderColor: '#fff', borderRightColor: 'transparent' }} />
                ) : (
                  'Guardar cambios'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Pay modal (bottom sheet) ───────────────────────────────────────────────────
function PayModal({ account, year, month, saving, onSave, onClose }) {
  const defaultDate = (() => {
    const lastDay = new Date(year, month, 0).getDate()
    const day = Math.min(account.maxDatePay || 15, lastDay)
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  })()

  const [amount, setAmount] = useState(account.defaultValue || '')
  const [date, setDate] = useState(defaultDate)
  const [note, setNote] = useState('')
  const [attachment, setAttachment] = useState(null) // base64 string
  const [attachName, setAttachName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError('')
    setProcessing(true)
    try {
      const data = await processAttachmentFile(file)
      setAttachment(data)
      setAttachName(file.name)
    } catch (err) {
      setFileError(`Error procesando archivo: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleSave = () => {
    if (!amount || !date) return
    const payload = {
      type: account.type === 'Outcoming' ? 'expense' : 'income',
      category: account.category || '',
      description: account.name,
      amount: Number(String(amount).replace(/\D/g, '')),
      date,
      accountMonth: `${year}-${String(month).padStart(2, '0')}`,
      accountMasterId: account.id,
    }
    if (note.trim()) payload.note = note.trim()
    if (attachment) {
      payload.attachment = attachment
      payload.attachmentName = attachName
    }
    onSave(payload)
  }

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
          padding: '24px 20px 36px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: '#dee2e6',
            margin: '0 auto 20px',
          }}
        />

        <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
          Registrar pago
        </div>
        <div style={{ fontSize: 13, color: '#6c757d', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 4 }}>
          {account.important && <span style={{ color: '#e03131', fontSize: 13 }}>★</span>}
          {account.name}
        </div>

        {/* Amount */}
        <label style={fieldLabel}>MONTO (COP)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          min="0"
          autoFocus
          style={{
            ...fieldInput,
            fontSize: 28,
            fontWeight: 700,
            color: '#1e3a5f',
            marginBottom: 20,
          }}
        />

        {/* Date */}
        <label style={fieldLabel}>FECHA</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ ...fieldInput, fontSize: 16, marginBottom: 20 }}
        />

        {/* Note */}
        <label style={fieldLabel}>NOTA (opcional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Agregar una nota..."
          rows={2}
          style={{
            ...fieldInput,
            fontSize: 14,
            resize: 'none',
            marginBottom: 20,
            borderBottom: '2px solid #dee2e6',
            fontFamily: 'inherit',
          }}
        />

        {/* Attachment */}
        <label style={fieldLabel}>ADJUNTO (opcional)</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: 'none' }}
          onChange={handleFile}
        />

        {!attachment && !processing && (
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              marginBottom: 8,
              border: '2px dashed #dee2e6',
              background: '#fafafa',
              fontSize: 13,
              color: '#6c757d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>📎</span> Adjuntar imagen o PDF
          </button>
        )}

        {processing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 0',
              marginBottom: 8,
            }}
          >
            <CSpinner size="sm" />
            <span style={{ fontSize: 13, color: '#6c757d' }}>Procesando archivo…</span>
          </div>
        )}

        {fileError && (
          <div style={{ fontSize: 12, color: '#e03131', marginBottom: 8 }}>{fileError}</div>
        )}

        {attachment && (
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <img
              src={attachment}
              alt="adjunto"
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid #dee2e6',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                gap: 6,
              }}
            >
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cambiar
              </button>
              <button
                onClick={() => {
                  setAttachment(null)
                  setAttachName('')
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'rgba(220,53,69,0.85)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Quitar
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#6c757d', marginTop: 4, paddingLeft: 2 }}>
              {attachName}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 12,
              border: '1px solid #dee2e6',
              background: '#fff',
              fontSize: 15,
              fontWeight: 600,
              color: '#6c757d',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !amount || processing}
            style={{
              flex: 2,
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: !amount || processing ? '#e9ecef' : '#1e3a5f',
              fontSize: 15,
              fontWeight: 700,
              color: !amount || processing ? '#adb5bd' : '#fff',
              cursor: !amount || processing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {saving ? (
              <CSpinner
                size="sm"
                style={{ borderColor: '#fff', borderRightColor: 'transparent' }}
              />
            ) : (
              'Guardar pago'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Account card ───────────────────────────────────────────────────────────────
function AccountCard({
  account,
  payments,
  monthStr,
  cumulativePaid,
  onPay,
  onDetail,
  onDelete,
  onUpdate,
  onViewAttachment,
  onAttach,
  attachingId,
  savingId,
}) {
  const isDebt = account.targetAmount > 0
  const status = getStatus(account, payments, monthStr, isDebt ? cumulativePaid : null)
  const canPay = status.label !== 'Pagado'
  const isSaving = savingId === account.id
  const [editing, setEditing] = useState(null) // { id, amount, note }

  const startEdit = (p) => setEditing({ id: p.id, amount: p.amount, note: p.note ?? '' })
  const cancelEdit = () => setEditing(null)

  const saveEdit = (p) => {
    const newAmount = Number(String(editing.amount).replace(/\D/g, ''))
    const newNote = editing.note.trim()
    if (!newAmount) return
    const hasChanges = newAmount !== p.amount || newNote !== (p.note ?? '')
    if (hasChanges) onUpdate({ ...p, amount: newAmount, note: newNote })
    setEditing(null)
  }

  const isDirty = (p) =>
    editing?.id === p.id &&
    (Number(String(editing.amount).replace(/\D/g, '')) !== p.amount ||
      editing.note.trim() !== (p.note ?? ''))

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 10,
        borderLeft: `4px solid ${status.border}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: status.bg,
            border: `2px solid ${status.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 18,
          }}
        >
          {status.label === 'Pagado'
            ? '✓'
            : status.label === 'Parcial'
              ? '½'
              : status.label === 'Vencido'
                ? '!'
                : '·'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            onClick={() => onDetail(account)}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#1a1a2e',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
              textDecorationColor: '#adb5bd',
            }}
          >
            {account.important && (
              <span style={{ color: '#e03131', fontSize: 13, lineHeight: 1, flexShrink: 0 }}>★ {' '}</span>
            )}
            {account.name}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 6,
              marginTop: 4,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {account.category && (
              <span
                style={{
                  fontSize: 11,
                  color: '#6c757d',
                  background: '#f1f5f9',
                  borderRadius: 4,
                  padding: '1px 6px',
                }}
              >
                {account.category}
              </span>
            )}
            {account.maxDatePay && (
              <span style={{ fontSize: 11, color: '#6c757d' }}>día {account.maxDatePay}</span>
            )}
            <InlinePaymentMethod account={account} />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 20,
              padding: '3px 10px',
              background: status.bg,
              color: status.color,
              border: `1px solid ${status.border}`,
            }}
          >
            {status.label}
          </span>
          {account.defaultValue > 0 && (
            <div style={{ fontSize: 11, color: '#adb5bd' }}>{fmt(account.defaultValue)}</div>
          )}
          {canPay && (
            <button
              onClick={() => !isSaving && onPay(account)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: 'none',
                background: '#1e3a5f',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                minWidth: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSaving ? (
                <CSpinner size="sm" style={{ width: 14, height: 14, borderColor: '#fff', borderRightColor: 'transparent' }} />
              ) : (
                'Pagar'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Debt progress bar */}
      {isDebt && (
        <div style={{ marginTop: 10, padding: '8px 0 2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#6c757d' }}>
              Pagado: <strong style={{ color: '#1a1a2e' }}>{fmt(cumulativePaid)}</strong>
            </span>
            <span style={{ fontSize: 11, color: '#6c757d' }}>
              Saldo: <strong style={{ color: status.remaining > 0 ? '#e03131' : '#2f9e44' }}>
                {fmt(status.remaining ?? 0)}
              </strong> / {fmt(account.targetAmount)}
            </span>
          </div>
          <div style={{ height: 6, background: '#e9ecef', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: 4,
                background: status.remaining <= 0 ? '#2f9e44' : '#0ea5e9',
                width: `${Math.min(100, (cumulativePaid / account.targetAmount) * 100)}%`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: '#adb5bd', textAlign: 'right', marginTop: 3 }}>
            {Math.round((cumulativePaid / account.targetAmount) * 100)}% completado
          </div>
        </div>
      )}

      {/* Individual payments list */}
      {payments.length > 0 && (
        <div style={{ marginTop: 10, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
          {payments.map((p) => {
            const isAttaching = attachingId === p.id
            const isEditing = editing?.id === p.id
            return (
              <div
                key={p.id}
                style={{
                  marginBottom: 6,
                  padding: '6px 8px',
                  borderRadius: 8,
                  background: isEditing ? '#f0f6ff' : '#f8f9fa',
                  border: isEditing ? '1px solid #c5d8ff' : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {/* View row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    onClick={() => !isEditing && startEdit(p)}
                    title="Editar"
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#2f9e44',
                      flex: 1,
                      minWidth: 0,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                      textDecorationColor: '#adb5bd',
                    }}
                  >
                    {fmt(p.amount)}
                  </span>
                  {p.date && (
                    <span style={{ fontSize: 11, color: '#adb5bd', whiteSpace: 'nowrap' }}>
                      {p.date}
                    </span>
                  )}
                  {!isEditing && p.note && (
                    <span
                      onClick={() => startEdit(p)}
                      title="Editar nota"
                      style={{
                        fontSize: 11,
                        color: '#6c757d',
                        fontStyle: 'italic',
                        maxWidth: 80,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}
                    >
                      {p.note}
                    </span>
                  )}
                  {p.attachment ? (
                    <button
                      onClick={() => onViewAttachment(p.attachment, p.attachmentName)}
                      title="Ver adjunto"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, padding: '2px 4px' }}
                    >
                      📎
                    </button>
                  ) : (
                    <button
                      onClick={() => onAttach(p)}
                      disabled={isAttaching}
                      title="Adjuntar"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '2px 4px',
                        cursor: isAttaching ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        color: '#adb5bd',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {isAttaching ? <CSpinner size="sm" style={{ width: 10, height: 10 }} /> : '📎'}
                    </button>
                  )}
                  {!isEditing && (
                    <button
                      onClick={() => onDelete(p)}
                      title="Eliminar pago"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e03131', fontSize: 14, padding: '2px 4px' }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Edit row */}
                {isEditing && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <input
                      type="number"
                      value={editing.amount}
                      onChange={(e) => setEditing((prev) => ({ ...prev, amount: e.target.value }))}
                      autoFocus
                      style={{
                        width: '100%',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#1e3a5f',
                        border: 'none',
                        borderBottom: '2px solid #1e3a5f',
                        background: 'transparent',
                        outline: 'none',
                        padding: '2px 0',
                      }}
                    />
                    <input
                      type="text"
                      value={editing.note}
                      onChange={(e) => setEditing((prev) => ({ ...prev, note: e.target.value }))}
                      placeholder="Nota (opcional)"
                      style={{
                        width: '100%',
                        fontSize: 12,
                        color: '#6c757d',
                        border: 'none',
                        borderBottom: '1px solid #dee2e6',
                        background: 'transparent',
                        outline: 'none',
                        padding: '2px 0',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 2 }}>
                      <button
                        onClick={cancelEdit}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 6,
                          border: '1px solid #dee2e6',
                          background: '#fff',
                          fontSize: 12,
                          color: '#6c757d',
                          cursor: 'pointer',
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => saveEdit(p)}
                        disabled={!isDirty(p)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 6,
                          border: 'none',
                          background: isDirty(p) ? '#1e3a5f' : '#e9ecef',
                          color: isDirty(p) ? '#fff' : '#adb5bd',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: isDirty(p) ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {status.label === 'Parcial' && (
            <div
              style={{
                fontSize: 11,
                color: '#0ea5e9',
                fontWeight: 600,
                textAlign: 'right',
                marginTop: 2,
              }}
            >
              Pendiente: {fmt((account.defaultValue || 0) - status.paid)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Ad-hoc expense modal ───────────────────────────────────────────────────────
function AdHocExpenseModal({ year, month, defaultType, saving, onSave, onClose }) {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`
  const defaultDate = `${year}-${String(month).padStart(2, '0')}-01`

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [type, setType] = useState(defaultType === 'Incoming' ? 'income' : 'expense')
  const [attachment, setAttachment] = useState(null)
  const [attachName, setAttachName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError('')
    setProcessing(true)
    try {
      const data = await processAttachmentFile(file)
      setAttachment(data)
      setAttachName(file.name)
    } catch (err) {
      setFileError(`Error procesando archivo: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleSave = () => {
    if (!description.trim() || !amount || !date) return
    const payload = {
      type,
      category: category || '',
      description: description.trim(),
      amount: Number(String(amount).replace(/\D/g, '')),
      date,
      accountMonth: monthStr,
    }
    if (note.trim()) payload.note = note.trim()
    if (attachment) {
      payload.attachment = attachment
      payload.attachmentName = attachName
    }
    onSave(payload)
  }

  const canSave = description.trim() && amount && date && !processing

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
          padding: '24px 20px 36px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#dee2e6', margin: '0 auto 20px' }} />

        <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
          Agregar movimiento del período
        </div>
        <div style={{ fontSize: 13, color: '#6c757d', marginBottom: 24 }}>
          Solo quedará en el historial de este período
        </div>

        {/* Type toggle */}
        <label style={fieldLabel}>TIPO</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[{ key: 'expense', label: 'Gasto' }, { key: 'income', label: 'Ingreso' }].map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: type === t.key ? 700 : 500,
                cursor: 'pointer',
                background: type === t.key ? '#1e3a5f' : '#e9ecef',
                color: type === t.key ? '#fff' : '#6c757d',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Description */}
        <label style={fieldLabel}>DESCRIPCIÓN *</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Reparación, mercado…"
          autoFocus
          style={{ ...fieldInput, fontSize: 16, marginBottom: 20 }}
        />

        {/* Amount */}
        <label style={fieldLabel}>MONTO (COP) *</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          min="0"
          style={{ ...fieldInput, fontSize: 28, fontWeight: 700, color: '#1e3a5f', marginBottom: 20 }}
        />

        {/* Date */}
        <label style={fieldLabel}>FECHA *</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ ...fieldInput, fontSize: 16, marginBottom: 20 }}
        />

        {/* Category */}
        <label style={fieldLabel}>CATEGORÍA (opcional)</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ ...fieldInput, fontSize: 14, marginBottom: 20 }}
        >
          <option value="">Sin categoría</option>
          {ACCOUNT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Note */}
        <label style={fieldLabel}>NOTA (opcional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Agregar una nota..."
          rows={2}
          style={{ ...fieldInput, fontSize: 14, resize: 'none', marginBottom: 20, fontFamily: 'inherit' }}
        />

        {/* Attachment */}
        <label style={fieldLabel}>ADJUNTO (opcional)</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        {!attachment && !processing && (
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              marginBottom: 8,
              border: '2px dashed #dee2e6',
              background: '#fafafa',
              fontSize: 13,
              color: '#6c757d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>📎</span> Adjuntar imagen o PDF
          </button>
        )}
        {processing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', marginBottom: 8 }}>
            <CSpinner size="sm" />
            <span style={{ fontSize: 13, color: '#6c757d' }}>Procesando archivo…</span>
          </div>
        )}
        {fileError && <div style={{ fontSize: 12, color: '#e03131', marginBottom: 8 }}>{fileError}</div>}
        {attachment && (
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <img src={attachment} alt="adjunto" style={{ width: '100%', borderRadius: 10, border: '1px solid #dee2e6', display: 'block' }} />
            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
              <button
                onClick={() => fileRef.current?.click()}
                style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
              >
                Cambiar
              </button>
              <button
                onClick={() => { setAttachment(null); setAttachName('') }}
                style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: 'rgba(220,53,69,0.85)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
              >
                Quitar
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#6c757d', marginTop: 4, paddingLeft: 2 }}>{attachName}</div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 12,
              border: '1px solid #dee2e6',
              background: '#fff',
              fontSize: 15,
              fontWeight: 600,
              color: '#6c757d',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            style={{
              flex: 2,
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: !canSave ? '#e9ecef' : '#1e3a5f',
              fontSize: 15,
              fontWeight: 700,
              color: !canSave ? '#adb5bd' : '#fff',
              cursor: !canSave ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {saving ? <CSpinner size="sm" style={{ borderColor: '#fff', borderRightColor: 'transparent' }} /> : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AccountStatus() {
  const dispatch = useDispatch()
  const { data: transactions, fetching, saving } = useSelector((s) => s.transaction)
  const { data: masters, fetching: fetchingMasters, saving: savingMasters } = useSelector((s) => s.accountsMaster)
  const { notes: periodNotes, fetching: fetchingNotes, saving: savingNotes } = useSelector((s) => s.accountStatusNote)

  const [searchParams, setSearchParams] = useSearchParams()
  const typeTab = searchParams.get('tab') === 'Incoming' ? 'Incoming' : 'Outcoming'
  const setTypeTab = (value) => setSearchParams((prev) => { prev.set('tab', value); return prev })

  const year = Number(searchParams.get('year')) || CURRENT_YEAR
  const month = Number(searchParams.get('month')) || CURRENT_MONTH
  const setYear = (value) => setSearchParams((prev) => { prev.set('year', value); return prev })
  const setMonth = (value) => setSearchParams((prev) => { prev.set('month', value); return prev })
  const [filter, setFilter] = useState('all')
  const [paying, setPaying] = useState(null)
  const [detail, setDetail] = useState(null)
  const [viewer, setViewer] = useState(null) // { src, filename }
  const [attachingTx, setAttachingTx] = useState(null) // transaction being attached to
  const [attachProcessing, setAttachProcessing] = useState(false)
  const [addingAdHoc, setAddingAdHoc] = useState(false)
  const attachRef = useRef()

  useEffect(() => {
    dispatch(transactionActions.fetchRequest({ year }))
  }, [dispatch, year])

  useEffect(() => {
    if (!masters) dispatch(accountsMasterActions.fetchRequest())
  }, [dispatch, masters])

  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  useEffect(() => {
    dispatch(accountStatusNoteActions.fetchRequest({ period: monthStr }))
  }, [dispatch, monthStr])

  const cumulativePaymentsMap = useMemo(() => {
    if (!transactions) return {}
    const map = {}
    transactions.forEach((t) => {
      if (!t.accountMasterId) return
      map[t.accountMasterId] = (map[t.accountMasterId] ?? 0) + (t.amount || 0)
    })
    return map
  }, [transactions])

  const applicable = useMemo(() => {
    if (!masters) return []
    return masters.filter((a) => {
      if (a.type !== typeTab || !a.active) return false
      if (a.targetAmount > 0) {
        return (cumulativePaymentsMap[a.id] ?? 0) < a.targetAmount
      }
      return isApplicableToMonth(a, month)
    })
  }, [masters, month, typeTab, cumulativePaymentsMap])

  const masterPaymentsMap = useMemo(() => {
    if (!transactions) return {}
    const map = {}
    transactions.forEach((t) => {
      const period = t.accountMonth ?? t.date?.slice(0, 7)
      if (t.accountMasterId && period === monthStr) {
        if (!map[t.accountMasterId]) map[t.accountMasterId] = []
        map[t.accountMasterId].push(t)
      }
    })
    return map
  }, [transactions, monthStr])

  const adHocTransactions = useMemo(() => {
    if (!transactions) return []
    return transactions.filter(
      (t) => !t.accountMasterId && (t.accountMonth ?? t.date?.slice(0, 7)) === monthStr,
    )
  }, [transactions, monthStr])

  const { paid, pending, overdue, totalPending, totalOverdue } = useMemo(() => {
    let p = 0,
      pe = 0,
      ov = 0,
      tpe = 0,
      tov = 0
    applicable.forEach((a) => {
      const s = getStatus(a, masterPaymentsMap[a.id] ?? [], monthStr, a.targetAmount > 0 ? (cumulativePaymentsMap[a.id] ?? 0) : null)
      if (s.label === 'Pagado') p++
      else if (s.label === 'Vencido') {
        ov++
        tov += a.defaultValue || 0
      } else if (s.label === 'Parcial') {
        pe++
        tpe += (a.defaultValue || 0) - s.paid
      } else {
        pe++
        tpe += a.defaultValue || 0
      }
    })
    return { paid: p, pending: pe, overdue: ov, totalPending: tpe, totalOverdue: tov }
  }, [applicable, masterPaymentsMap, monthStr, cumulativePaymentsMap])

  const totalPaid = useMemo(
    () =>
      applicable.reduce((sum, a) => {
        const payments = masterPaymentsMap[a.id] ?? []
        return sum + payments.reduce((s, t) => s + (t.amount || 0), 0)
      }, 0),
    [applicable, masterPaymentsMap],
  )

  const { totalIncome, totalExpenses } = useMemo(() => {
    if (!masters) return { totalIncome: 0, totalExpenses: 0 }
    let income = 0
    let expenses = 0
    masters
      .filter((a) => isApplicableToMonth(a, month))
      .forEach((a) => {
        const payments = masterPaymentsMap[a.id] ?? []
        const paid = payments.reduce((s, t) => s + (t.amount || 0), 0)
        if (a.type === 'Incoming') {
          income += Math.max(paid, a.defaultValue || 0)
        } else {
          // paid + remaining pending/overdue = max(paid, defaultValue)
          expenses += Math.max(paid, a.defaultValue || 0)
        }
      })
    return { totalIncome: income, totalExpenses: expenses }
  }, [masters, month, masterPaymentsMap, monthStr])

  const filtered = useMemo(() => {
    return applicable
      .filter((a) => {
        if (filter === 'all') return true
        const s = getStatus(a, masterPaymentsMap[a.id] ?? [], monthStr, a.targetAmount > 0 ? (cumulativePaymentsMap[a.id] ?? 0) : null)
        if (filter === 'paid') return s.label === 'Pagado'
        if (filter === 'pending')
          return s.label === 'Pendiente' || s.label === 'Vencido' || s.label === 'Parcial'
        return true
      })
      .sort((a, b) => (a.maxDatePay || 31) - (b.maxDatePay || 31))
  }, [applicable, masterPaymentsMap, monthStr, filter])

  const prevMonth = () => {
    if (month === 1) {
      setSearchParams((prev) => { prev.set('month', 12); prev.set('year', year - 1); return prev })
    } else {
      setMonth(month - 1)
    }
  }
  const nextMonth = () => {
    if (month === 12) {
      setSearchParams((prev) => { prev.set('month', 1); prev.set('year', year + 1); return prev })
    } else {
      setMonth(month + 1)
    }
  }

  const handleSavePayment = (payload) => {
    dispatch(transactionActions.createRequest(payload))
  }

  const handleSaveAdHoc = (payload) => {
    dispatch(transactionActions.createRequest(payload))
  }

  const handleUpdate = (transaction) => {
    dispatch(transactionActions.updateRequest(transaction))
  }

  const handleDelete = (transaction) => {
    if (window.confirm(`¿Eliminar este pago de ${fmt(transaction.amount)}?`)) {
      dispatch(transactionActions.deleteRequest({ id: transaction.id }))
    }
  }

  const handleAddNote = (text) => {
    dispatch(accountStatusNoteActions.createRequest({ period: monthStr, text }))
  }

  const handleToggleNote = (note) => {
    dispatch(accountStatusNoteActions.updateRequest({ id: note.id, checked: !note.checked }))
  }

  const handleDeleteNote = (note) => {
    dispatch(accountStatusNoteActions.deleteRequest({ id: note.id }))
  }

  const handleAttach = (transaction) => {
    setAttachingTx(transaction)
    attachRef.current.value = ''
    attachRef.current.click()
  }

  const handleAttachFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !attachingTx) return
    setAttachProcessing(true)
    try {
      const data = await processAttachmentFile(file)
      dispatch(
        transactionActions.updateRequest({
          ...attachingTx,
          attachment: data,
          attachmentName: file.name,
        }),
      )
    } catch (err) {
      alert(err.message)
    } finally {
      setAttachProcessing(false)
      setAttachingTx(null)
    }
  }

  const prevSaving = React.useRef(saving)
  useEffect(() => {
    if (prevSaving.current && !saving) {
      setPaying(null)
      setAddingAdHoc(false)
    }
    prevSaving.current = saving
  }, [saving])

  const loading = (fetching && !transactions) || (fetchingMasters && !masters)

  return (
    <div
      style={{
        maxWidth: 540,
        margin: '0 auto',
        padding: '0 12px 32px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Balance strip */}
      {(totalIncome > 0 || totalExpenses > 0) && (() => {
        const balance = totalIncome - totalExpenses
        const isPositive = balance >= 0
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              borderRadius: 12,
              marginTop: 12,
              background: isPositive ? '#f0fdf4' : '#fff5f5',
              border: `1px solid ${isPositive ? '#86efac' : '#fca5a5'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#6c757d', fontWeight: 500 }}>
                Ingresos − Egresos
              </span>
              <span style={{ fontSize: 11, color: '#adb5bd' }}>
                {fmt(totalIncome)} − {fmt(totalExpenses)}
              </span>
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: isPositive ? '#2f9e44' : '#e03131',
              }}
            >
              {isPositive ? '+' : ''}{fmt(balance)}
            </span>
          </div>
        )
      })()}

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 0 4px' }}>
        {[
          { key: 'Outcoming', label: 'Egresos' },
          { key: 'Incoming', label: 'Ingresos' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTypeTab(t.key); setFilter('all') }}
            style={{
              flex: 1,
              padding: '9px 0',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: typeTab === t.key ? 700 : 500,
              cursor: 'pointer',
              background: typeTab === t.key ? '#1e3a5f' : '#e9ecef',
              color: typeTab === t.key ? '#fff' : '#6c757d',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OCR importer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <OcrReceiptImporter
          masters={masters}
          monthStr={monthStr}
          onConfirm={handleSavePayment}
        />
      </div>

      {/* Month navigator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0 16px',
          position: 'sticky',
          top: 0,
          background: 'var(--cui-body-bg, #f8f9fa)',
          zIndex: 10,
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid #dee2e6',
            background: '#fff',
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1e3a5f',
          }}
        >
          ‹
        </button>

        <div style={{ textAlign: 'center' }}>

          <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>
            {MONTH_LABELS[month - 1]}
          </div>
          <div style={{ fontSize: 13, color: '#6c757d' }}>{year}</div>
          <div style={{ fontSize: 12, color: '#adb5bd', marginTop: 2 }}>
              <CIcon icon={cilCalendar} size="sm" />
              { ' ' }
            {now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase())}
          </div>
        </div>

        <button
          onClick={nextMonth}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid #dee2e6',
            background: '#fff',
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1e3a5f',
          }}
        >
          ›
        </button>
      </div>

      {/* Summary strip */}
      <div
        style={{ padding: '10px 0px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}
      >
        {[
          {
            label: 'Pagadas',
            value: paid,
            total: totalPaid,
            color: '#2f9e44',
            bg: '#f0fdf4',
            border: '#86efac',
          },
          {
            label: 'Pendientes',
            value: pending,
            total: totalPending,
            color: '#f59f00',
            bg: '#fff9db',
            border: '#ffe066',
          },
          {
            label: 'Vencidas',
            value: overdue,
            total: totalOverdue,
            color: '#e03131',
            bg: '#fff5f5',
            border: '#fca5a5',
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 12,
              padding: '10px 0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 3, fontWeight: 600 }}>
              {s.label}
            </div>
            {s.total > 0 && (
              <div
                style={{
                  fontSize: 10,
                  color: s.color,
                  marginTop: 4,
                  opacity: 0.85,
                  paddingLeft: 4,
                  paddingRight: 4,
                }}
              >
                {fmt(s.total)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total paid */}
      {/*totalPaid > 0 && ( */}
      {
        <div
          style={{
            background: '#eef4ff',
            border: '1px solid #c5d8ff',
            borderRadius: 12,
            padding: '10px 16px',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 13, color: '#1e3a5f', fontWeight: 600 }}>Total:</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>{fmt(totalPaid + totalPending + totalOverdue)}</span>
        </div>
      }

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: 10,
          padding: 3,
          marginBottom: 16,
          gap: 3,
        }}
      >
        {[
          { key: 'all', label: `Todas (${applicable.length})` },
          { key: 'pending', label: `Sin pagar (${pending + overdue})` },
          { key: 'paid', label: `Pagadas (${paid})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              flex: 1,
              padding: '7px 4px',
              border: 'none',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: filter === tab.key ? 700 : 400,
              cursor: 'pointer',
              background: filter === tab.key ? '#fff' : 'transparent',
              color: filter === tab.key ? '#1e3a5f' : '#6c757d',
              boxShadow: filter === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <CSpinner color="primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#adb5bd', fontSize: 14 }}>
          {applicable.length === 0
            ? 'No hay cuentas configuradas para este mes.'
            : 'Sin cuentas en este filtro.'}
        </div>
      ) : (
        [...filtered.map((a) => ({ kind: 'account', day: a.maxDatePay || 31, data: a })),
         ...adHocTransactions.map((t) => ({ kind: 'adhoc', day: parseInt(t.date?.split('-')[2]) || 31, data: t })),
        ]
          .sort((a, b) => a.day - b.day)
          .map((item) => {
            if (item.kind === 'account') {
              const account = item.data
              return (
                <AccountCard
                  key={account.id}
                  account={account}
                  payments={masterPaymentsMap[account.id] ?? []}
                  monthStr={monthStr}
                  cumulativePaid={cumulativePaymentsMap[account.id] ?? 0}
                  onPay={setPaying}
                  onDetail={setDetail}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onViewAttachment={(src, filename) => setViewer({ src, filename })}
                  onAttach={handleAttach}
                  attachingId={attachProcessing ? attachingTx?.id : null}
                  savingId={saving ? paying?.id : null}
                />
              )
            }
            const t = item.data
            const isIncome = t.type === 'income'
            const accentColor = isIncome ? '#2f9e44' : '#e03131'
            const accentBg = isIncome ? '#ebfbee' : '#fff5f5'
            const accentBorder = isIncome ? '#8ce99a' : '#ffc9c9'
            return (
              <div
                key={t.id}
                style={{
                  background: '#f8f4ff',
                  borderRadius: 14,
                  padding: '14px 16px',
                  marginBottom: 10,
                  borderLeft: '4px solid #9775fa',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: accentBg, border: `2px solid ${accentBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: 18, fontWeight: 700, color: accentColor,
                    }}
                  >
                    {isIncome ? '+' : '−'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.description}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      {t.note && (
                        <span style={{ fontSize: 11, color: '#6c757d', background: '#f1f5f9', borderRadius: 4, padding: '1px 6px', fontStyle: 'italic' }}>
                          {t.note}
                        </span>
                      )}
                      {t.date && <span style={{ fontSize: 11, color: '#6c757d' }}>{t.date}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, borderRadius: 20, padding: '3px 10px', background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}>
                      {isIncome ? '+' : '−'} {fmt(t.amount)}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {t.attachment && (
                        <button onClick={() => setViewer({ src: t.attachment, filename: t.attachmentName })} title="Ver adjunto"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, padding: '2px 4px' }}>
                          📎
                        </button>
                      )}
                      <button onClick={() => handleDelete(t)} title="Eliminar"
                        style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: '#e03131', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
      )}

      {/* Ad-hoc period transactions */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e9ecef',
          borderRadius: 14,
          marginBottom: 16,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>💸</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>
              Movimientos extra del período
            </span>
            {adHocTransactions.length > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: '#eef4ff',
                  color: '#1e3a5f',
                  borderRadius: 10,
                  padding: '1px 7px',
                }}
              >
                {adHocTransactions.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setAddingAdHoc(true)}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: 'none',
              background: '#1e3a5f',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            + Agregar
          </button>
        </div>
      </div>

      {/* Hidden input for attaching to existing transactions */}
      <input
        ref={attachRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleAttachFile}
      />

      {/* Detail modal */}
      {detail && (
        <DetailModal
          account={detail}
          saving={savingMasters}
          onUpdate={(updated) => {
            dispatch(accountsMasterActions.updateRequest(updated))
            setDetail(null)
          }}
          onClose={() => setDetail(null)}
        />
      )}

      {/* Pay modal */}
      {paying && (
        <PayModal
          account={paying}
          year={year}
          month={month}
          saving={saving}
          onSave={handleSavePayment}
          onClose={() => setPaying(null)}
        />
      )}

      {/* Ad-hoc expense modal */}
      {addingAdHoc && (
        <AdHocExpenseModal
          year={year}
          month={month}
          defaultType={typeTab}
          saving={saving}
          onSave={handleSaveAdHoc}
          onClose={() => setAddingAdHoc(false)}
        />
      )}

      {/* Attachment viewer */}
      {viewer && (
        <AttachmentViewer
          src={viewer.src}
          filename={viewer.filename}
          onClose={() => setViewer(null)}
        />
      )}

      {/* Period notes */}
          {!fetching && (
      <PeriodNotes
        period={monthStr}
        notes={periodNotes}
        fetching={fetchingNotes}
        saving={savingNotes}
        onAdd={handleAddNote}
        onToggle={handleToggleNote}
        onDelete={handleDeleteNote}
      />
          )}
    </div>


  )
}
