import React, { useEffect, useMemo, useRef, useState } from 'react'
import AttachmentViewer from 'src/components/App/AttachmentViewer'
import { processAttachmentFile } from 'src/utils/fileHelpers'
import { useDispatch, useSelector } from 'react-redux'
import { Column, Summary, TotalItem } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/App/StandardGrid'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import * as transactionActions from 'src/actions/CashFlow/transactionActions'
import * as accountsMasterActions from 'src/actions/CashFlow/accountsMasterActions'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, MONTH_NAMES } from 'src/constants/cashFlow'
import { fetchAccounts } from 'src/services/providers/api/accounts'
import '../../movements/payments/Payments.scss'
import '../../movements/payments/ItemDetail.scss'

const now = new Date()
const CURRENT_YEAR = now.getFullYear()
const CURRENT_MONTH = now.getMonth() + 1

const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1]
const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n ?? 0)

const EMPTY_FORM = {
  type: 'expense',
  category: '',
  description: '',
  amount: '',
  date: now.toISOString().slice(0, 10),
  accountMasterId: null,
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function isApplicableToMonth(account, month) {
  if (!account.active) return false
  if (account.period === 'Mensuales') return true
  if (account.period === 'Anuales') {
    const idx = MONTH_NAMES.indexOf(account.monthStartAt)
    return idx + 1 === month
  }
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
  // N/A — always show
  return true
}

// ── Legacy category guesser ────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = [
  { keywords: ['arriendo', 'alquiler', 'administracion', 'administración'], category: 'Hogar' },
  { keywords: ['agua', 'acueducto', 'alcantarillado', 'aseo'], category: 'Servicios públicos' },
  {
    keywords: ['energia', 'energía', 'luz', 'epm', 'electricidad'],
    category: 'Servicios públicos',
  },
  { keywords: ['gas', 'naturgas'], category: 'Servicios públicos' },
  {
    keywords: ['internet', 'wifi', 'claro', 'tigo', 'movistar', 'telefono', 'teléfono', 'celular'],
    category: 'Servicios públicos',
  },
  {
    keywords: ['mercado', 'supermercado', 'rappi', 'exito', 'éxito', 'carulla', 'comida'],
    category: 'Alimentación',
  },
  {
    keywords: ['transporte', 'gasolina', 'parqueadero', 'peaje', 'uber', 'taxi'],
    category: 'Transporte',
  },
  {
    keywords: ['salud', 'medico', 'médico', 'eps', 'farmacia', 'drogueria', 'droguería'],
    category: 'Salud',
  },
  {
    keywords: ['educacion', 'educación', 'colegio', 'universidad', 'curso'],
    category: 'Educación',
  },
]

function guessCategory(accountName) {
  const lower = (accountName || '').toLowerCase()
  for (const { keywords, category } of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k))) return category
  }
  return 'Otros'
}

function toISODate(rawDate) {
  if (!rawDate) return now.toISOString().slice(0, 10)
  const d = new Date(rawDate)
  if (!isNaN(d)) return d.toISOString().slice(0, 10)
  return rawDate
}

// ── Migration modal ────────────────────────────────────────────────────────────
function MigrationModal({ onClose, onDone }) {
  const dispatch = useDispatch()
  const { importing, importProgress } = useSelector((s) => s.transaction)
  const [status, setStatus] = useState('idle')
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)

  const prevImporting = React.useRef(importing)
  React.useEffect(() => {
    if (prevImporting.current && !importing) {
      setStatus('done')
      onDone()
    }
    prevImporting.current = importing
  }, [importing, onDone])

  const fetchLegacy = async () => {
    setStatus('loading')
    setError(null)
    try {
      const response = await fetchAccounts({
        month: 3,
        year: 2026,
        noEmptyAccounts: false,
        type: 'Outcoming',
      })
      const accounts = response?.data?.items ?? []
      const mapped = []
      accounts.forEach((account) => {
        const payments = account.payments?.items ?? []
        payments.forEach((payment) => {
          mapped.push({
            type: 'expense',
            category: guessCategory(account.name),
            description: account.name,
            amount: Number(payment.value || 0),
            date: toISODate(payment.date),
            _legacy_payment_id: payment.paymentId,
            _legacy_account_id: account.accountId,
          })
        })
      })
      setRows(mapped)
      setStatus('preview')
    } catch (e) {
      setError(e.message)
      setStatus('idle')
    }
  }

  const migrate = () => {
    setStatus('migrating')
    const items = rows.map(({ _legacy_payment_id: _a, _legacy_account_id: _b, ...payload }) => payload)
    dispatch(transactionActions.importRequest(items))
  }

  return (
    <CModal visible onClose={onClose} size="lg" alignment="center">
      <CModalHeader>
        <CModalTitle>Migrar datos de marzo (legado → Firebase)</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {status === 'idle' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: 'var(--cui-secondary-color)', marginBottom: 20 }}>
              Esto traerá todos los pagos registrados en <b>marzo 2026</b> desde la API legacy y los
              importará como gastos en Firebase.
            </p>
            {error && <p style={{ color: '#e03131', marginBottom: 12 }}>{error}</p>}
            <CButton color="primary" onClick={fetchLegacy}>
              Obtener datos del legado
            </CButton>
          </div>
        )}

        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <CSpinner color="primary" />
            <p style={{ marginTop: 12 }}>Consultando API legacy…</p>
          </div>
        )}

        {status === 'preview' && (
          <>
            <p style={{ marginBottom: 12, fontSize: 13 }}>
              Se encontraron <b>{rows.length}</b> pagos. Revisa el mapeo antes de confirmar:
            </p>
            <div
              style={{
                maxHeight: 360,
                overflowY: 'auto',
                border: '1px solid var(--cui-border-color)',
                borderRadius: 6,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ background: '#1e3a5f', position: 'sticky', top: 0 }}>
                  <tr>
                    {['Fecha', 'Descripción', 'Categoría', 'Monto'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '7px 12px',
                          color: '#fff',
                          textAlign: 'left',
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: i % 2 === 0 ? '#fff' : '#f8fafc',
                      }}
                    >
                      <td style={{ padding: '6px 12px' }}>{r.date}</td>
                      <td style={{ padding: '6px 12px' }}>{r.description}</td>
                      <td style={{ padding: '6px 12px' }}>
                        <select
                          value={r.category}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((row, j) =>
                                j === i ? { ...row, category: e.target.value } : row,
                              ),
                            )
                          }
                          style={{
                            fontSize: 11,
                            padding: '2px 6px',
                            borderRadius: 4,
                            border: '1px solid var(--cui-border-color)',
                          }}
                        >
                          {EXPENSE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '6px 12px', fontWeight: 600, color: '#e03131' }}>
                        {fmt(r.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <CButton color="secondary" variant="outline" onClick={onClose}>
                Cancelar
              </CButton>
              <CButton color="primary" onClick={migrate} disabled={rows.length === 0}>
                Importar {rows.length} registros a Firebase
              </CButton>
            </div>
          </>
        )}

        {status === 'migrating' && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <CSpinner color="primary" />
            <p style={{ marginTop: 12 }}>Guardando en Firebase… {importProgress}%</p>
            <div
              style={{
                background: '#f1f5f9',
                borderRadius: 8,
                height: 8,
                margin: '12px auto',
                maxWidth: 300,
              }}
            >
              <div
                style={{
                  background: '#1e3a5f',
                  height: '100%',
                  borderRadius: 8,
                  width: `${importProgress}%`,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        )}

        {status === 'done' && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <p style={{ fontWeight: 700, color: '#2f9e44' }}>
              {rows.length} transacciones importadas exitosamente.
            </p>
            <CButton color="primary" onClick={onClose} style={{ marginTop: 12 }}>
              Cerrar
            </CButton>
          </div>
        )}
      </CModalBody>
    </CModal>
  )
}

// ── Transaction form ───────────────────────────────────────────────────────────
function TransactionForm({ initial, saving, onSave, onCancel }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM)

  const set = (field) => (e) => {
    const val = e.target.value
    setForm((prev) => {
      const next = { ...prev, [field]: val }
      if (field === 'type') next.category = ''
      return next
    })
  }

  const categories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const handleSave = () => {
    if (!form.amount || !form.date) return
    onSave({ ...form, amount: Number(String(form.amount).replace(/\D/g, '')) })
  }

  const isEdit = !!initial?.id

  return (
    <div className="payment-form">
      <div className="payment-form__header">
        <span className="payment-form__title">
          {isEdit ? 'Editar transacción' : 'Nueva transacción'}
        </span>
      </div>
      <div className="payment-form__body">
        {initial?.accountMasterName && (
          <div className="payment-form__field">
            <label className="payment-form__label">Cuenta maestra</label>
            <div
              style={{
                padding: '8px 12px',
                background: '#eef4ff',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: '#1e3a5f',
              }}
            >
              {initial.accountMasterImportant && (
                <span style={{ color: '#e03131', fontSize: 13, marginRight: 4 }}>★</span>
              )}
              {initial.accountMasterName}
            </div>
          </div>
        )}
        <div className="payment-form__field">
          <label className="payment-form__label">Tipo</label>
          <select
            className="payment-form__input payment-form__input--select"
            value={form.type}
            onChange={set('type')}
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Categoría</label>
          <select
            className="payment-form__input payment-form__input--select"
            value={form.category}
            onChange={set('category')}
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Descripción</label>
          <input
            className="payment-form__input"
            type="text"
            value={form.description}
            onChange={set('description')}
            placeholder="Descripción del movimiento"
          />
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Monto (COP)</label>
          <input
            className="payment-form__input"
            type="number"
            value={form.amount}
            onChange={set('amount')}
            placeholder="0"
            min="0"
          />
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Fecha</label>
          <input
            className="payment-form__input"
            type="date"
            value={form.date}
            onChange={set('date')}
          />
        </div>
      </div>
      <div className="payment-form__actions">
        <CButton
          className="payment-form__btn payment-form__btn--cancel"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </CButton>
        <CButton
          className="payment-form__btn payment-form__btn--save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CSpinner size="sm" /> : 'Guardar'}
        </CButton>
      </div>
    </div>
  )
}

// ── Annual overview ────────────────────────────────────────────────────────────
const MONTHS_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

function AnnualView({ masters, transactions, year }) {
  const todayYear = now.getFullYear()
  const todayMonth = now.getMonth() + 1

  const paymentMap = useMemo(() => {
    const map = {}
    if (!transactions) return map
    transactions.forEach((t) => {
      if (!t.accountMasterId) return
      const match = t.date?.match(/^(\d{4})-(\d{2})/)
      if (!match) return
      if (parseInt(match[1]) !== year) return
      const m = parseInt(match[2])
      if (!map[t.accountMasterId]) map[t.accountMasterId] = {}
      map[t.accountMasterId][m] = (map[t.accountMasterId][m] || 0) + (t.amount || 0)
    })
    return map
  }, [transactions, year])

  const activeMasters = useMemo(() => (masters ?? []).filter((a) => a.active), [masters])
  const debtMasters = useMemo(() => activeMasters.filter((a) => a.targetAmount > 0), [activeMasters])
  const outcomingMasters = useMemo(
    () => activeMasters.filter((a) => a.type === 'Outcoming' && !(a.targetAmount > 0)),
    [activeMasters],
  )
  const incomingMasters = useMemo(
    () => activeMasters.filter((a) => a.type === 'Incoming' && !(a.targetAmount > 0)),
    [activeMasters],
  )

  // free expense transactions grouped by month (no accountMasterId, type=expense)
  const freeExpensesByMonth = useMemo(() => {
    const result = {}
    if (!transactions) return result
    transactions.forEach((t) => {
      if (t.accountMasterId) return
      if (t.type !== 'expense') return
      const match = t.date?.match(/^(\d{4})-(\d{2})/)
      if (!match) return
      if (parseInt(match[1]) !== year) return
      const m = parseInt(match[2])
      if (!result[m]) result[m] = []
      result[m].push(t)
    })
    return result
  }, [transactions, year])

  // cumulative payments across ALL years (no year filter) for debt accounts
  const cumulativeDebtMap = useMemo(() => {
    const map = {}
    if (!transactions) return map
    transactions.forEach((t) => {
      if (!t.accountMasterId) return
      map[t.accountMasterId] = (map[t.accountMasterId] ?? 0) + (t.amount || 0)
    })
    return map
  }, [transactions])

  const calcMonthTotals = (accounts) => {
    const totals = Array(12).fill(0)
    accounts.forEach((account) => {
      for (let m = 1; m <= 12; m++) {
        totals[m - 1] += paymentMap[account.id]?.[m] || 0
      }
    })
    return totals
  }

  const outcomingTotals = useMemo(() => calcMonthTotals(outcomingMasters), [outcomingMasters, paymentMap])
  const incomingTotals = useMemo(() => calcMonthTotals(incomingMasters), [incomingMasters, paymentMap])

  const thStyle = {
    padding: '8px 6px',
    color: '#fff',
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    fontSize: 11,
  }
  const tdBase = {
    padding: '6px 6px',
    textAlign: 'right',
    fontSize: 11,
    whiteSpace: 'nowrap',
  }

  const renderRows = (accounts) =>
    accounts.map((account, idx) => {
      const accountTotal = Array.from(
        { length: 12 },
        (_, i) => paymentMap[account.id]?.[i + 1] || 0,
      ).reduce((s, v) => s + v, 0)

      return (
        <tr
          key={account.id}
          style={{
            borderBottom: '1px solid #f1f5f9',
            background: idx % 2 === 0 ? '#fff' : '#fafbfc',
          }}
        >
          <td
            style={{
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: '#1a1a2e',
              whiteSpace: 'nowrap',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {account.important && <span style={{ color: '#e03131', marginRight: 4 }}>★</span>}
            {account.name}
          </td>
          {Array.from({ length: 12 }, (_, i) => {
            const month = i + 1
            const applies = isApplicableToMonth(account, month)
            const paid = paymentMap[account.id]?.[month] || 0
            const isPast = year < todayYear || (year === todayYear && month <= todayMonth)

            if (!applies) return <td key={month} style={{ ...tdBase, background: '#f1f5f9', color: '#dee2e6' }} />
            if (paid > 0) return (
              <td key={month} style={{ ...tdBase, background: '#f0fdf4', color: '#2f9e44', fontWeight: 700 }}>
                {fmt(paid)}
              </td>
            )
            if (isPast) return (
              <td key={month} style={{ ...tdBase, background: '#fff5f5', color: '#e03131' }}>—</td>
            )
            return (
              <td key={month} style={{ ...tdBase, color: '#adb5bd' }}>
                {account.defaultValue ? fmt(account.defaultValue) : '—'}
              </td>
            )
          })}
          <td style={{ ...tdBase, fontWeight: 700, color: accountTotal > 0 ? '#1e3a5f' : '#adb5bd', background: accountTotal > 0 ? '#eef4ff' : undefined }}>
            {accountTotal > 0 ? fmt(accountTotal) : '—'}
          </td>
        </tr>
      )
    })

  const renderTotalsRow = (totals, label, bg) => (
    <tr style={{ background: bg, fontWeight: 700 }}>
      <td style={{ padding: '8px 12px', color: '#fff', fontSize: 12 }}>{label}</td>
      {totals.map((total, i) => (
        <td key={i} style={{ ...tdBase, color: total > 0 ? '#fff' : 'rgba(255,255,255,0.35)', fontWeight: 700 }}>
          {total > 0 ? fmt(total) : '—'}
        </td>
      ))}
      <td style={{ ...tdBase, color: '#fff', fontWeight: 800, fontSize: 13 }}>
        {fmt(totals.reduce((s, t) => s + t, 0))}
      </td>
    </tr>
  )

  const renderSectionHeader = (label, color) => (
    <tr>
      <td
        colSpan={14}
        style={{
          padding: '6px 12px',
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color,
          background: `${color}18`,
          borderTop: `2px solid ${color}`,
          borderBottom: `1px solid ${color}40`,
        }}
      >
        {label}
      </td>
    </tr>
  )

  const colHeader = (
    <tr style={{ background: '#1e3a5f' }}>
      <th style={{ ...thStyle, textAlign: 'left', minWidth: 160, padding: '8px 12px' }}>Cuenta</th>
      {MONTHS_SHORT.map((m) => (
        <th key={m} style={{ ...thStyle, minWidth: 72 }}>{m}</th>
      ))}
      <th style={{ ...thStyle, minWidth: 90 }}>Total</th>
    </tr>
  )

  return (
    <>
      <div style={{ overflowX: 'auto', border: '1px solid #e9ecef', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>{colHeader}</thead>
          <tbody>
            {outcomingMasters.length > 0 && (
              <>
                {renderSectionHeader('Egresos', '#e03131')}
                {renderRows(outcomingMasters)}
              </>
            )}
            {incomingMasters.length > 0 && (
              <>
                {renderSectionHeader('Ingresos', '#2f9e44')}
                {renderRows(incomingMasters)}
              </>
            )}
          </tbody>
          <tfoot>
            {outcomingMasters.length > 0 && renderTotalsRow(outcomingTotals, 'Total Egresos', '#c0392b')}
            {incomingMasters.length > 0 && renderTotalsRow(incomingTotals, 'Total Ingresos', '#2f9e44')}
            {incomingMasters.length > 0 && outcomingMasters.length > 0 && (() => {
              const netTotals = incomingTotals.map((inc, i) => inc - outcomingTotals[i])
              const netTotal = netTotals.reduce((s, v) => s + v, 0)
              return (
                <tr style={{ background: '#1e3a5f', fontWeight: 700, borderTop: '2px solid #fff' }}>
                  <td style={{ padding: '8px 12px', color: '#fff', fontSize: 12 }}>Balance neto</td>
                  {netTotals.map((val, i) => (
                    <td key={i} style={{ ...tdBase, fontWeight: 700, color: val > 0 ? '#69db7c' : val < 0 ? '#ff8787' : 'rgba(255,255,255,0.35)' }}>
                      {val !== 0 ? fmt(Math.abs(val)) : '—'}
                    </td>
                  ))}
                  <td style={{ ...tdBase, fontWeight: 800, fontSize: 13, color: netTotal > 0 ? '#69db7c' : netTotal < 0 ? '#ff8787' : '#fff' }}>
                    {netTotal !== 0 ? fmt(Math.abs(netTotal)) : '—'}
                  </td>
                </tr>
              )
            })()}
          </tfoot>
        </table>
      </div>

      {/* Free expense transactions by month */}
      {Object.keys(freeExpensesByMonth).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#e03131',
              background: '#e0313118',
              borderTop: '2px solid #e03131',
              borderBottom: '1px solid #e0313140',
              padding: '6px 12px',
              borderRadius: '8px 8px 0 0',
            }}
          >
            Otros egresos
          </div>
          <div
            style={{
              border: '1px solid #e9ecef',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              overflow: 'hidden',
            }}
          >
            {Object.keys(freeExpensesByMonth)
              .map(Number)
              .sort((a, b) => a - b)
              .map((m) => {
                const rows = freeExpensesByMonth[m]
                const monthTotal = rows.reduce((s, t) => s + (t.amount || 0), 0)
                return (
                  <div key={m}>
                    <div
                      style={{
                        padding: '5px 12px',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#1e3a5f',
                        background: '#eef4ff',
                        borderBottom: '1px solid #e9ecef',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{MONTHS_SHORT[m - 1]}</span>
                      <span style={{ color: '#e03131' }}>{fmt(monthTotal)}</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <tbody>
                        {rows.map((t, idx) => (
                          <tr
                            key={t.id ?? idx}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                            }}
                          >
                            <td style={{ padding: '5px 12px', color: '#6c757d', width: 90 }}>
                              {t.date?.slice(5)}
                            </td>
                            <td style={{ padding: '5px 12px', fontWeight: 600 }}>
                              {t.description || '—'}
                            </td>
                            <td style={{ padding: '5px 12px', color: '#6c757d' }}>
                              {t.category || '—'}
                            </td>
                            <td
                              style={{
                                padding: '5px 12px',
                                textAlign: 'right',
                                fontWeight: 700,
                                color: '#e03131',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {fmt(t.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Debt accounts section */}
      {debtMasters.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#7c3aed',
              background: '#7c3aed18',
              borderTop: '2px solid #7c3aed',
              borderBottom: '1px solid #7c3aed40',
              padding: '6px 12px',
              borderRadius: '8px 8px 0 0',
            }}
          >
            Deudas activas
          </div>
          <div style={{ border: '1px solid #e9ecef', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
            {debtMasters.map((account, idx) => {
              const cumPaid = cumulativeDebtMap[account.id] ?? 0
              const remaining = Math.max(0, account.targetAmount - cumPaid)
              const pct = Math.min(100, Math.round((cumPaid / account.targetAmount) * 100))
              const isDone = remaining <= 0
              return (
                <div
                  key={account.id}
                  style={{
                    padding: '14px 16px',
                    background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                    borderBottom: idx < debtMasters.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>
                        {account.important && <span style={{ color: '#e03131', marginRight: 4 }}>★</span>}
                        {account.name}
                      </span>
                      {account.category && (
                        <span style={{ marginLeft: 8, fontSize: 11, color: '#6c757d' }}>{account.category}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isDone ? '#2f9e44' : '#7c3aed' }}>
                      {isDone ? 'Saldada' : `Saldo: ${fmt(remaining)}`}
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, color: '#6c757d' }}>
                    <span>Meta: <strong style={{ color: '#1a1a2e' }}>{fmt(account.targetAmount)}</strong></span>
                    <span>Pagado: <strong style={{ color: '#2f9e44' }}>{fmt(cumPaid)}</strong></span>
                    <span>Restante: <strong style={{ color: isDone ? '#2f9e44' : '#e03131' }}>{fmt(remaining)}</strong></span>
                  </div>
                  <div style={{ marginTop: 8, height: 8, background: '#e9ecef', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 4,
                        background: isDone ? '#2f9e44' : '#7c3aed',
                        width: `${pct}%`,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 4, fontSize: 11, color: '#adb5bd', textAlign: 'right' }}>
                    {pct}% completado
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

// ── Summary card ───────────────────────────────────────────────────────────────
function SummaryCard({ label, value, color, bg, sub }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 160,
        background: bg,
        border: `1px solid ${color}33`,
        borderRadius: 10,
        padding: '14px 20px',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color, opacity: 0.75, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── Maestro row ────────────────────────────────────────────────────────────────
function MaestroRow({
  account,
  payments,
  monthStr,
  onPay,
  onViewPayment,
  onViewAttachment,
  onDelete,
  onAttach,
  attachingId,
}) {
  const paid = payments.reduce((s, t) => s + (t.amount || 0), 0)
  const isPaid = paid > 0
  const isPartial = isPaid && account.defaultValue > 0 && paid < account.defaultValue
  const canPay = !isPaid || isPartial
  const isOverdue =
    !isPaid &&
    (() => {
      const today = new Date()
      const [y, m] = monthStr.split('-').map(Number)
      const dueDate = new Date(y, m - 1, account.maxDatePay || 31)
      return today > dueDate
    })()

  const statusLabel = isPartial
    ? 'Parcial'
    : isPaid
      ? 'Pagado'
      : isOverdue
        ? 'Vencido'
        : 'Pendiente'
  const statusColors = {
    Pagado: { bg: '#f0fdf4', color: '#2f9e44', border: '#86efac' },
    Parcial: { bg: '#f0f9ff', color: '#0ea5e9', border: '#7dd3fc' },
    Vencido: { bg: '#fff5f5', color: '#e03131', border: '#fca5a5' },
    Pendiente: { bg: '#fff9db', color: '#f59f00', border: '#ffe066' },
  }
  const sc = statusColors[statusLabel]

  return (
    <tr
      style={{
        borderBottom: '1px solid #f1f5f9',
        background: isPaid && !isPartial ? '#f0fdf4' : isOverdue ? '#fff5f5' : '#fff',
      }}
    >
      <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>{account.name}</td>
      <td style={{ padding: '8px 12px', fontSize: 12, color: '#6c757d' }}>
        {account.category || '—'}
      </td>
      <td style={{ padding: '8px 12px', fontSize: 12, color: '#6c757d' }}>
        {account.classification}
      </td>
      <td style={{ padding: '8px 12px', fontSize: 12, textAlign: 'center' }}>
        {account.maxDatePay || '—'}
      </td>
      <td style={{ padding: '8px 12px', fontSize: 12, color: '#6c757d' }}>
        {account.paymentMethod}
      </td>
      <td
        style={{
          padding: '8px 12px',
          fontSize: 13,
          fontWeight: 700,
          textAlign: 'right',
          color: isPaid ? '#2f9e44' : '#adb5bd',
        }}
      >
        {isPaid ? fmt(paid) : '—'}
      </td>
      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 4,
            padding: '2px 8px',
            background: sc.bg,
            color: sc.color,
            border: `1px solid ${sc.border}`,
          }}
        >
          {statusLabel}
        </span>
      </td>
      <td style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {payments.map((p) => {
            const isAttaching = attachingId === p.id
            return (
              <div
                key={p.id}
                style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'nowrap' }}
              >
                <span style={{ fontSize: 11, color: '#2f9e44', fontWeight: 600, minWidth: 70 }}>
                  {fmt(p.amount)}
                </span>
                {p.attachment ? (
                  <button
                    onClick={() =>
                      onViewAttachment(p.attachment, p.attachmentName || 'adjunto.jpg')
                    }
                    title="Ver adjunto"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 15,
                      padding: '2px 4px',
                    }}
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
                      fontSize: 11,
                      color: '#adb5bd',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {isAttaching ? <CSpinner size="sm" style={{ width: 10, height: 10 }} /> : '📎'}
                  </button>
                )}
                <button
                  onClick={() => onViewPayment(p)}
                  style={{
                    fontSize: 11,
                    padding: '3px 8px',
                    borderRadius: 5,
                    border: '1px solid #86efac',
                    background: '#f0fdf4',
                    color: '#2f9e44',
                    cursor: 'pointer',
                  }}
                >
                  Ver
                </button>
                <button
                  onClick={() => onDelete(p)}
                  title="Eliminar pago"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#e03131',
                    fontSize: 14,
                    padding: '2px 4px',
                  }}
                >
                  ✕
                </button>
              </div>
            )
          })}
          {canPay && (
            <button
              onClick={() => onPay(account)}
              style={{
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 5,
                border: '1px solid #1e3a5f',
                background: '#1e3a5f',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                alignSelf: 'flex-start',
                marginTop: payments.length > 0 ? 2 : 0,
              }}
            >
              Pagar
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Transactions() {
  const dispatch = useDispatch()
  const { data, fetching, saving } = useSelector((s) => s.transaction)
  const { data: masters, fetching: fetchingMasters } = useSelector((s) => s.accountsMaster)

  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [formModal, setFormModal] = useState(null) // null | { mode: 'create' | 'edit', initial?: {} }
  const [migrationOpen, setMigrationOpen] = useState(false)
  const [viewer, setViewer] = useState(null) // { src, filename }
  const [activeTab, setActiveTab] = useState('maestro') // 'maestro' | 'transactions'
  const [attachingTx, setAttachingTx] = useState(null)
  const [attachProcessing, setAttachProcessing] = useState(false)
  const attachRef = useRef()

  useEffect(() => {
    dispatch(transactionActions.fetchRequest({ year }))
  }, [dispatch, year])

  useEffect(() => {
    if (!masters) dispatch(accountsMasterActions.fetchRequest())
  }, [dispatch, masters])

  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  // Master accounts applicable to the selected month
  const applicableMasters = useMemo(() => {
    if (!masters) return []
    return masters.filter((acc) => isApplicableToMonth(acc, month))
  }, [masters, month])

  // Map: accountMasterId → transactions for this month
  const masterPaymentsMap = useMemo(() => {
    if (!data) return {}
    const map = {}
    data.forEach((t) => {
      if (t.accountMasterId && t.date?.startsWith(monthStr)) {
        if (!map[t.accountMasterId]) map[t.accountMasterId] = []
        map[t.accountMasterId].push(t)
      }
    })
    return map
  }, [data, monthStr])

  // Free transactions (not linked to master) for the month
  const freeTransactions = useMemo(() => {
    if (!data) return []
    return data.filter((r) => {
      if (!r.date?.startsWith(monthStr)) return false
      if (r.accountMasterId) return false
      if (typeFilter !== 'all' && r.type !== typeFilter) return false
      if (categoryFilter && r.category !== categoryFilter) return false
      return true
    })
  }, [data, monthStr, typeFilter, categoryFilter])

  // Summary totals for the month
  const totalMasterPaid = useMemo(
    () =>
      Object.values(masterPaymentsMap)
        .flat()
        .reduce((s, t) => s + (t.amount || 0), 0),
    [masterPaymentsMap],
  )
  const totalMasterIncoming = useMemo(
    () =>
      applicableMasters
        .filter((a) => a.type === 'Incoming')
        .flatMap((a) => masterPaymentsMap[a.id] ?? [])
        .reduce((s, t) => s + (t.amount || 0), 0),
    [applicableMasters, masterPaymentsMap],
  )
  const totalMasterOutcoming = useMemo(
    () =>
      applicableMasters
        .filter((a) => a.type === 'Outcoming')
        .flatMap((a) => masterPaymentsMap[a.id] ?? [])
        .reduce((s, t) => s + (t.amount || 0), 0),
    [applicableMasters, masterPaymentsMap],
  )
  const totalFreeExpense = useMemo(
    () =>
      freeTransactions.filter((r) => r.type === 'expense').reduce((s, r) => s + (r.amount || 0), 0),
    [freeTransactions],
  )
  const totalFreeIncome = useMemo(
    () =>
      freeTransactions.filter((r) => r.type === 'income').reduce((s, r) => s + (r.amount || 0), 0),
    [freeTransactions],
  )
  const masterPendingCount = useMemo(
    () => applicableMasters.filter((acc) => !masterPaymentsMap[acc.id]?.length).length,
    [applicableMasters, masterPaymentsMap],
  )

  const activeCategories = useMemo(() => {
    if (typeFilter === 'expense') return EXPENSE_CATEGORIES
    if (typeFilter === 'income') return INCOME_CATEGORIES
    return [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])]
  }, [typeFilter])

  const handleCreate = (payload) => {
    dispatch(transactionActions.createRequest(payload))
    setFormModal(null)
  }

  const handleUpdate = (payload) => {
    dispatch(transactionActions.updateRequest(payload))
    setFormModal(null)
  }

  const handleDelete = (row) => {
    if (window.confirm(`¿Eliminar "${row.description || row.category || 'esta transacción'}"?`)) {
      dispatch(transactionActions.deleteRequest({ id: row.id }))
    }
  }

  const handlePayMaster = (account) => {
    const defaultDate = (() => {
      const d = new Date(year, month - 1, account.maxDatePay || 15)
      return d.toISOString().slice(0, 10)
    })()
    setFormModal({
      mode: 'create',
      initial: {
        type: account.type === 'Outcoming' ? 'expense' : 'income',
        category: account.category || '',
        description: account.name,
        amount: account.defaultValue || '',
        date: defaultDate,
        accountMasterId: account.id,
        accountMasterName: account.name,
        accountMasterImportant: account.important,
      },
    })
  }

  const handleViewPayment = (transaction) => {
    setFormModal({ mode: 'edit', initial: transaction })
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

  return (
    <>
      <CCard className="mb-3">
        <CCardHeader
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <strong>Transacciones</strong>
          <div style={{ display: 'flex', gap: 8 }}>
            <CButton
              size="sm"
              color="secondary"
              variant="outline"
              onClick={() => setMigrationOpen(true)}
            >
              ↓ Migrar legado
            </CButton>
            <CButton size="sm" color="primary" onClick={() => setFormModal({ mode: 'create' })}>
              + Nueva transacción
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          {/* Summary strip */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <SummaryCard
              label="Cuentas maestras pagadas"
              value={fmt(totalMasterPaid)}
              color="#1e3a5f"
              bg="#eef4ff"
              sub={`${applicableMasters.length - masterPendingCount} de ${applicableMasters.length} pagadas`}
            />
            <SummaryCard
              label="Pendientes del maestro"
              value={masterPendingCount}
              color={masterPendingCount > 0 ? '#f59f00' : '#2f9e44'}
              bg={masterPendingCount > 0 ? '#fff9db' : '#f0fdf4'}
              sub={masterPendingCount > 0 ? 'cuentas sin registrar' : 'Todo al día'}
            />
            <SummaryCard
              label="Otros ingresos"
              value={fmt(totalFreeIncome)}
              color="#2f9e44"
              bg="#f0fdf4"
            />
            <SummaryCard
              label="Otros gastos"
              value={fmt(totalFreeExpense)}
              color="#e03131"
              bg="#fff5f5"
            />
          </div>

          {/* Period filters */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{
                fontSize: 13,
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid var(--cui-secondary)',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{
                fontSize: 13,
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid var(--cui-secondary)',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <CButton
              size="sm"
              color="secondary"
              variant="outline"
              style={{ marginLeft: 'auto' }}
              onClick={() => dispatch(transactionActions.fetchRequest({ year }))}
            >
              ↺ Actualizar
            </CButton>
          </div>

          {/* Tabs */}
          <div
            style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid #e9ecef' }}
          >
            {[
              { key: 'maestro', label: `Maestro del mes (${applicableMasters.length})` },
              { key: 'transactions', label: 'Otras transacciones' },
              { key: 'anual', label: `Anual ${year}` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: activeTab === tab.key ? 700 : 400,
                  color: activeTab === tab.key ? '#1e3a5f' : '#6c757d',
                  borderBottom:
                    activeTab === tab.key ? '2px solid #1e3a5f' : '2px solid transparent',
                  marginBottom: -2,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Maestro del mes */}
          {activeTab === 'maestro' && (
            <>
              {fetchingMasters && !masters ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <CSpinner color="primary" />
                </div>
              ) : applicableMasters.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#6c757d', fontSize: 13 }}>
                  No hay cuentas maestras configuradas para este mes.{' '}
                  <a href="/cash_flow/management/accounts-master" style={{ color: '#1e3a5f' }}>
                    Configurar maestro →
                  </a>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #e9ecef', borderRadius: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#1e3a5f' }}>
                        {[
                          'Nombre',
                          'Categoría',
                          'Clasificación',
                          'Día máx.',
                          'Método pago',
                          'Monto pagado',
                          'Estado',
                          'Acción',
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '9px 12px',
                              color: '#fff',
                              textAlign: 'left',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {applicableMasters.map((account) => (
                        <MaestroRow
                          key={account.id}
                          account={account}
                          payments={masterPaymentsMap[account.id] ?? []}
                          monthStr={monthStr}
                          onPay={handlePayMaster}
                          onViewPayment={handleViewPayment}
                          onViewAttachment={(src, filename) => setViewer({ src, filename })}
                          onDelete={handleDelete}
                          onAttach={handleAttach}
                          attachingId={attachProcessing ? attachingTx?.id : null}
                        />
                      ))}
                    </tbody>
                    <tfoot>
                      {totalMasterIncoming > 0 && (
                        <tr style={{ background: '#ebfbee', fontWeight: 600 }}>
                          <td colSpan={5} style={{ padding: '7px 12px', fontSize: 12, color: '#2f9e44' }}>
                            + Total Ingresos
                          </td>
                          <td style={{ padding: '7px 12px', fontSize: 13, textAlign: 'right', color: '#2f9e44' }}>
                            {fmt(totalMasterIncoming)}
                          </td>
                          <td colSpan={2} />
                        </tr>
                      )}
                      {totalMasterOutcoming > 0 && (
                        <tr style={{ background: '#fff5f5', fontWeight: 600 }}>
                          <td colSpan={5} style={{ padding: '7px 12px', fontSize: 12, color: '#c0392b' }}>
                            − Total Egresos
                          </td>
                          <td style={{ padding: '7px 12px', fontSize: 13, textAlign: 'right', color: '#c0392b' }}>
                            {fmt(totalMasterOutcoming)}
                          </td>
                          <td colSpan={2} />
                        </tr>
                      )}
                      <tr style={{ background: '#1e3a5f', fontWeight: 700, borderTop: '2px solid #fff' }}>
                        <td colSpan={5} style={{ padding: '8px 12px', fontSize: 12, color: '#fff' }}>
                          Balance
                        </td>
                        <td
                          style={{
                            padding: '8px 12px',
                            fontSize: 13,
                            textAlign: 'right',
                            fontWeight: 700,
                            color: totalMasterIncoming - totalMasterOutcoming >= 0 ? '#69db7c' : '#ff8787',
                          }}
                        >
                          {fmt(totalMasterIncoming - totalMasterOutcoming)}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Tab: Otras transacciones */}
          {activeTab === 'transactions' && (
            <>
              {/* Additional filters for free transactions */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value)
                    setCategoryFilter('')
                  }}
                  style={{
                    fontSize: 13,
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: `1px solid ${typeFilter !== 'all' ? '#1e3a5f' : 'var(--cui-secondary)'}`,
                    background: typeFilter !== 'all' ? '#eef4ff' : '#fff',
                    color: typeFilter !== 'all' ? '#1e3a5f' : undefined,
                    fontWeight: typeFilter !== 'all' ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">Tipo: Todos</option>
                  <option value="income">Ingresos</option>
                  <option value="expense">Gastos</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    fontSize: 13,
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: `1px solid ${categoryFilter ? '#1e3a5f' : 'var(--cui-secondary)'}`,
                    background: categoryFilter ? '#eef4ff' : '#fff',
                    color: categoryFilter ? '#1e3a5f' : undefined,
                    fontWeight: categoryFilter ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Categoría: Todas</option>
                  {activeCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {(typeFilter !== 'all' || categoryFilter) && (
                  <button
                    onClick={() => {
                      setTypeFilter('all')
                      setCategoryFilter('')
                    }}
                    style={{
                      fontSize: 11,
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #e03131',
                      background: 'none',
                      color: '#e03131',
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Limpiar
                  </button>
                )}
              </div>

              {fetching && !data ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <CSpinner color="primary" />
                </div>
              ) : (
                <StandardGrid
                  keyExpr="id"
                  dataSource={freeTransactions}
                  noDataText="Sin transacciones libres para este periodo"
                >
                  <Column
                    dataField="date"
                    caption="Fecha"
                    width={110}
                    dataType="date"
                    format="dd/MM/yyyy"
                    sortOrder="desc"
                  />
                  <Column
                    dataField="type"
                    caption="Tipo"
                    width={100}
                    cellRender={({ value }) => (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 4,
                          padding: '2px 8px',
                          background: value === 'income' ? '#f0fdf4' : '#fff5f5',
                          color: value === 'income' ? '#2f9e44' : '#e03131',
                          border: `1px solid ${value === 'income' ? '#86efac' : '#fca5a5'}`,
                        }}
                      >
                        {value === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    )}
                  />
                  <Column dataField="category" caption="Categoría" width={150} />
                  <Column dataField="description" caption="Descripción" minWidth={180} />
                  <Column
                    dataField="amount"
                    caption="Monto"
                    width={140}
                    alignment="right"
                    cellRender={({ data: row }) => (
                      <span
                        style={{
                          fontWeight: 700,
                          color: row.type === 'income' ? '#2f9e44' : '#e03131',
                        }}
                      >
                        {row.type === 'income' ? '+' : '-'}
                        {fmt(row.amount)}
                      </span>
                    )}
                  />
                  <Column
                    caption="📎"
                    width={46}
                    alignment="center"
                    allowSorting={false}
                    cellRender={({ data: row }) =>
                      row.attachment ? (
                        <button
                          title="Ver adjunto"
                          onClick={() =>
                            setViewer({
                              src: row.attachment,
                              filename: row.attachmentName || 'adjunto.jpg',
                            })
                          }
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 16,
                            padding: '2px 4px',
                          }}
                        >
                          📎
                        </button>
                      ) : (
                        <button
                          title="Adjuntar"
                          onClick={() => handleAttach(row)}
                          disabled={attachProcessing && attachingTx?.id === row.id}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '2px 4px',
                            cursor:
                              attachProcessing && attachingTx?.id === row.id
                                ? 'not-allowed'
                                : 'pointer',
                            fontSize: 13,
                            color: '#adb5bd',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {attachProcessing && attachingTx?.id === row.id ? (
                            <CSpinner size="sm" style={{ width: 10, height: 10 }} />
                          ) : (
                            '📎'
                          )}
                        </button>
                      )
                    }
                  />
                  <Column
                    caption=""
                    width={80}
                    alignment="center"
                    allowSorting={false}
                    cellRender={({ data: row }) => (
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button
                          title="Editar"
                          onClick={() => setFormModal({ mode: 'edit', initial: row })}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#1e3a5f',
                            fontSize: 15,
                            padding: '2px 4px',
                          }}
                        >
                          ✎
                        </button>
                        <button
                          title="Eliminar"
                          onClick={() => handleDelete(row)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#e03131',
                            fontSize: 15,
                            padding: '2px 4px',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  />
                  <Summary>
                    <TotalItem
                      column="amount"
                      summaryType="sum"
                      customizeText={() =>
                        fmt(
                          freeTransactions
                            .filter((r) => r.type === 'income')
                            .reduce((s, r) => s + (r.amount || 0), 0) -
                            freeTransactions
                              .filter((r) => r.type === 'expense')
                              .reduce((s, r) => s + (r.amount || 0), 0),
                        )
                      }
                      displayFormat="Balance: {0}"
                    />
                  </Summary>
                </StandardGrid>
              )}
            </>
          )}

          {/* Tab: Anual */}
          {activeTab === 'anual' && (
            <>
              {fetchingMasters && !masters ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <CSpinner color="primary" />
                </div>
              ) : (
                <AnnualView masters={masters} transactions={data} year={year} />
              )}
            </>
          )}
        </CCardBody>
      </CCard>

      {/* Migration modal */}
      {migrationOpen && (
        <MigrationModal
          onClose={() => setMigrationOpen(false)}
          onDone={() => {
            setMigrationOpen(false)
            dispatch(transactionActions.fetchRequest({ year }))
          }}
        />
      )}

      {/* Hidden input for attaching to existing transactions */}
      <input
        ref={attachRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleAttachFile}
      />

      {/* Attachment viewer */}
      {viewer && (
        <AttachmentViewer
          src={viewer.src}
          filename={viewer.filename}
          onClose={() => setViewer(null)}
        />
      )}

      {/* Form modal */}
      <CModal visible={!!formModal} onClose={() => setFormModal(null)} alignment="center">
        <CModalHeader>
          <CModalTitle>
            {formModal?.mode === 'edit' ? 'Editar transacción' : 'Nueva transacción'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: 0 }}>
          {formModal && (
            <TransactionForm
              initial={formModal.initial}
              saving={saving}
              onSave={
                formModal.mode === 'edit'
                  ? (p) => handleUpdate({ ...formModal.initial, ...p })
                  : handleCreate
              }
              onCancel={() => setFormModal(null)}
            />
          )}
        </CModalBody>
      </CModal>
    </>
  )
}
