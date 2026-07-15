import React, { useState } from 'react'
import {
  ACCOUNT_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  BANK_NAMES,
  BANK_ACCOUNT_TYPES,
} from 'src/constants/cashFlow'
import { MONTH_NAMES } from 'src/constants/commons'
import useLocaleData from 'src/hooks/useLocaleData'
import {
  fmt,
  fieldLabel,
  fieldInput,
  PERIOD_OPTIONS,
  TYPE_OPTIONS,
  CLASSIFICATION_OPTIONS,
} from './helpers'
import Spinner from 'src/components/shared/Spinner'

export default function DetailModal({ account, saving, onUpdate, onClone, onClose }) {
  const [tab, setTab] = useState('info')
  const [form, setForm] = useState({ ...account })
  const [copied, setCopied] = useState(false)

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  const { monthLabels } = useLocaleData()

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
    ? (monthLabels[MONTH_NAMES.indexOf(account.monthStartAt)] ?? account.monthStartAt)
    : null

  const rows = [
    { label: 'Tipo', value: account.type === 'Outcoming' ? 'Egreso' : 'Ingreso' },
    { label: 'Categoría', value: account.category || '—' },
    {
      label: 'Período',
      value: startMonthLabel ? `${periodLabel} (desde ${startMonthLabel})` : periodLabel,
    },
    { label: 'Valor por defecto', value: account.defaultValue ? fmt(account.defaultValue) : '—' },
    {
      label: 'Fecha límite de pago',
      value:
        account.maxDatePay === -1
          ? 'Último día del mes'
          : account.maxDatePay
            ? `Día ${account.maxDatePay}`
            : '—',
    },
    { label: 'Método de pago', value: account.paymentMethod || '—' },
    { label: 'Banco', value: account.bankName || '—' },
    { label: 'Tipo de cuenta', value: account.bankAccountType || '—' },
    {
      label: 'Número de cuenta',
      value: account.bankAccountNumber || '—',
      copyable: !!account.bankAccountNumber,
    },
    { label: 'Titular', value: account.bankAccountHolder || '—' },
    { label: 'Estado', value: account.active ? 'Activa' : 'Inactiva' },
  ]

  const tabStyle = (active) => ({
    flex: 1,
    padding: '10px 0',
    fontSize: 'var(--fs-md)',
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
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: '#dee2e6',
            margin: '0 auto 16px',
          }}
        />

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          {account.important && (
            <span style={{ color: '#e03131', fontSize: 'var(--fs-xl)' }}>★</span>
          )}
          <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: '#1a1a2e' }}>
            {account.name}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e9ecef', marginBottom: 20 }}>
          <button style={tabStyle(tab === 'info')} onClick={() => setTab('info')}>
            Información
          </button>
          <button style={tabStyle(tab === 'edit')} onClick={() => setTab('edit')}>
            Editar
          </button>
        </div>

        {/* ── Info tab ── */}
        {tab === 'info' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {rows.map(({ label, value, copyable }) => (
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
                  <span style={{ fontSize: 'var(--fs-base)', color: '#6c757d', fontWeight: 500 }}>
                    {label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 'var(--fs-base)',
                        color: '#1a1a2e',
                        fontWeight: 600,
                        textAlign: 'right',
                        maxWidth: '100%',
                      }}
                    >
                      {value}
                    </span>
                    {copyable && (
                      <button
                        onClick={() => handleCopy(value)}
                        title="Copiar"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          fontSize: 'var(--fs-md)',
                          color: copied ? '#2f9e44' : '#adb5bd',
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                      >
                        {copied ? '✓' : '⎘'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid #dee2e6',
                  background: '#fff',
                  fontSize: 'var(--fs-lg)',
                  fontWeight: 600,
                  color: '#6c757d',
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
              <button
                onClick={() => onClone(account)}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  background: saving ? '#e9ecef' : '#495057',
                  fontSize: 'var(--fs-lg)',
                  fontWeight: 600,
                  color: saving ? '#adb5bd' : '#fff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {saving ? (
                  <Spinner
                    size="sm"
                    style={{ borderColor: '#fff', borderRightColor: 'transparent' }}
                  />
                ) : (
                  '⎘ Clonar'
                )}
              </button>
            </div>
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
              <input
                style={fieldInput}
                type="text"
                value={form.description ?? ''}
                onChange={set('description')}
                placeholder="Descripción corta"
              />
            </div>

            {/* Notas */}
            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabel}>NOTAS</label>
              <textarea
                value={form.notes ?? ''}
                onChange={set('notes')}
                rows={2}
                placeholder="Observaciones adicionales…"
                style={{
                  ...fieldInput,
                  resize: 'none',
                  fontFamily: 'inherit',
                  fontSize: 'var(--fs-md)',
                }}
              />
            </div>

            {/* Tipo / Período */}
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}
            >
              <div>
                <label style={fieldLabel}>TIPO</label>
                <select
                  style={{ ...fieldInput, fontSize: 'var(--fs-md)' }}
                  value={form.type}
                  onChange={set('type')}
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={fieldLabel}>PERÍODO</label>
                <select
                  style={{ ...fieldInput, fontSize: 'var(--fs-md)' }}
                  value={form.period}
                  onChange={set('period')}
                >
                  {PERIOD_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mes inicio (solo períodos no mensuales) */}
            {['Trimestrales', 'Cuatrimestrales', 'Semestrales', 'Anuales', 'N/A'].includes(
              form.period,
            ) && (
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>MES DE INICIO / APLICA</label>
                <select
                  style={{ ...fieldInput, fontSize: 'var(--fs-md)' }}
                  value={form.monthStartAt ?? 'January'}
                  onChange={set('monthStartAt')}
                >
                  {MONTH_NAMES.map((m, i) => (
                    <option key={m} value={m}>
                      {monthLabels[i]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clasificación / Categoría */}
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}
            >
              <div>
                <label style={fieldLabel}>CLASIFICACIÓN</label>
                <select
                  style={{ ...fieldInput, fontSize: 'var(--fs-md)' }}
                  value={form.classification ?? 'dispensable'}
                  onChange={set('classification')}
                >
                  {CLASSIFICATION_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={fieldLabel}>CATEGORÍA</label>
                <select
                  style={{ ...fieldInput, fontSize: 'var(--fs-md)' }}
                  value={form.category ?? ''}
                  onChange={set('category')}
                >
                  <option value="">Sin categoría</option>
                  {(form.type === 'Incoming' ? INCOME_CATEGORIES : ACCOUNT_CATEGORIES).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Día máximo / Método de pago */}
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}
            >
              <div>
                <label style={fieldLabel}>DÍA MÁX. PAGO</label>
                <input
                  style={fieldInput}
                  type="number"
                  min={-1}
                  max={31}
                  value={form.maxDatePay ?? 15}
                  onChange={set('maxDatePay')}
                />
                <span style={{ fontSize: 'var(--fs-2xs)', color: '#6c757d' }}>
                  -1 = último día del mes
                </span>
              </div>
              <div>
                <label style={fieldLabel}>MÉTODO DE PAGO</label>
                <select
                  style={{ ...fieldInput, fontSize: 'var(--fs-md)' }}
                  value={form.paymentMethod ?? ''}
                  onChange={set('paymentMethod')}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Banco / Tipo de cuenta */}
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}
            >
              <div>
                <label style={fieldLabel}>BANCO</label>
                <select
                  style={{ ...fieldInput, fontSize: 'var(--fs-md)' }}
                  value={form.bankName ?? ''}
                  onChange={set('bankName')}
                >
                  <option value="">Sin banco</option>
                  {BANK_NAMES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={fieldLabel}>TIPO DE CUENTA</label>
                <select
                  style={{ ...fieldInput, fontSize: 'var(--fs-md)' }}
                  value={form.bankAccountType ?? ''}
                  onChange={set('bankAccountType')}
                >
                  <option value="">Sin tipo</option>
                  {BANK_ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Número de cuenta / Titular */}
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}
            >
              <div>
                <label style={fieldLabel}>NÚMERO DE CUENTA</label>
                <input
                  style={fieldInput}
                  type="text"
                  value={form.bankAccountNumber ?? ''}
                  onChange={set('bankAccountNumber')}
                  placeholder="Ej: 123-456789-00"
                />
              </div>
              <div>
                <label style={fieldLabel}>TITULAR</label>
                <input
                  style={fieldInput}
                  type="text"
                  value={form.bankAccountHolder ?? ''}
                  onChange={set('bankAccountHolder')}
                  placeholder="Nombre del titular"
                />
              </div>
            </div>

            {/* Valor por defecto */}
            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabel}>VALOR POR DEFECTO (COP)</label>
              <input
                style={{ ...fieldInput, fontSize: 'var(--fs-xl)' }}
                type="number"
                min={0}
                value={form.defaultValue ?? ''}
                onChange={set('defaultValue')}
                placeholder="0 — opcional"
              />
            </div>

            {/* Target amount */}
            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabel}>
                DEUDA TOTAL A PAGAR (COP)
                <span style={{ fontSize: 'var(--fs-xs)', color: '#adb5bd', marginLeft: 6 }}>
                  — dejar vacío si no es una deuda
                </span>
              </label>
              <input
                style={{ ...fieldInput, fontSize: 'var(--fs-xl)' }}
                type="number"
                min={0}
                value={form.targetAmount ?? ''}
                onChange={set('targetAmount')}
                placeholder="0 — opcional"
              />
            </div>

            {/* Estado */}
            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabel}>ESTADO</label>
              <select
                style={{ ...fieldInput, fontSize: 'var(--fs-md)' }}
                value={form.active ? 'true' : 'false'}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, active: e.target.value === 'true' }))
                }
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>

            {/* Importante */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 24,
                cursor: 'pointer',
              }}
              onClick={() => setForm((prev) => ({ ...prev, important: !prev.important }))}
            >
              <input
                type="checkbox"
                checked={!!form.important}
                onChange={(e) => setForm((prev) => ({ ...prev, important: e.target.checked }))}
                style={{
                  width: 18,
                  height: 18,
                  accentColor: '#e03131',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <span style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: '#6c757d' }}>
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
                  fontSize: 'var(--fs-lg)',
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
                  fontSize: 'var(--fs-lg)',
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
                  <Spinner
                    size="sm"
                    style={{ borderColor: '#fff', borderRightColor: 'transparent' }}
                  />
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
