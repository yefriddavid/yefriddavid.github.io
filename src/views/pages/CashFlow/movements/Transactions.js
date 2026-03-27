import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Column, Summary, TotalItem } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/App/StandardGrid'
import { CButton, CCard, CCardBody, CCardHeader, CModal, CModalBody, CModalHeader, CModalTitle, CSpinner } from '@coreui/react'
import * as transactionActions from 'src/actions/CashFlow/transactionActions'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, addTransaction } from 'src/services/providers/firebase/CashFlow/transactions'
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
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n ?? 0)

const EMPTY_FORM = { type: 'expense', category: '', description: '', amount: '', date: now.toISOString().slice(0, 10) }

// ── Legacy category guesser ────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = [
  { keywords: ['arriendo', 'alquiler', 'administracion', 'administración'], category: 'Hogar' },
  { keywords: ['agua', 'acueducto', 'alcantarillado', 'aseo'], category: 'Servicios públicos' },
  { keywords: ['energia', 'energía', 'luz', 'epm', 'electricidad'], category: 'Servicios públicos' },
  { keywords: ['gas', 'naturgas'], category: 'Servicios públicos' },
  { keywords: ['internet', 'wifi', 'claro', 'tigo', 'movistar', 'telefono', 'teléfono', 'celular'], category: 'Servicios públicos' },
  { keywords: ['mercado', 'supermercado', 'rappi', 'exito', 'éxito', 'carulla', 'comida'], category: 'Alimentación' },
  { keywords: ['transporte', 'gasolina', 'parqueadero', 'peaje', 'uber', 'taxi'], category: 'Transporte' },
  { keywords: ['salud', 'medico', 'médico', 'eps', 'farmacia', 'drogueria', 'droguería'], category: 'Salud' },
  { keywords: ['educacion', 'educación', 'colegio', 'universidad', 'curso'], category: 'Educación' },
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
  // Try to parse formats like "2026-03-15" or "Mar 15, 2026"
  const d = new Date(rawDate)
  if (!isNaN(d)) return d.toISOString().slice(0, 10)
  return rawDate
}

// ── Migration modal ────────────────────────────────────────────────────────────
function MigrationModal({ onClose, onDone }) {
  const [status, setStatus] = useState('idle') // idle | loading | preview | migrating | done
  const [rows, setRows] = useState([]) // mapped transactions
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const fetchLegacy = async () => {
    setStatus('loading')
    setError(null)
    try {
      const response = await fetchAccounts({ month: 3, year: 2026, noEmptyAccounts: false, type: 'Outcoming' })
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

  const migrate = async () => {
    setStatus('migrating')
    setProgress(0)
    let done = 0
    for (const row of rows) {
      const { _legacy_payment_id: _a, _legacy_account_id: _b, ...payload } = row
      await addTransaction(payload)
      done++
      setProgress(Math.round((done / rows.length) * 100))
    }
    setStatus('done')
    onDone()
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
              Esto traerá todos los pagos registrados en <b>marzo 2026</b> desde la API legacy y los importará como gastos en Firebase.
            </p>
            {error && <p style={{ color: '#e03131', marginBottom: 12 }}>{error}</p>}
            <CButton color="primary" onClick={fetchLegacy}>Obtener datos del legado</CButton>
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
            <div style={{ maxHeight: 360, overflowY: 'auto', border: '1px solid var(--cui-border-color)', borderRadius: 6 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ background: '#1e3a5f', position: 'sticky', top: 0 }}>
                  <tr>
                    {['Fecha', 'Descripción', 'Categoría', 'Monto'].map((h) => (
                      <th key={h} style={{ padding: '7px 12px', color: '#fff', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={{ padding: '6px 12px' }}>{r.date}</td>
                      <td style={{ padding: '6px 12px' }}>{r.description}</td>
                      <td style={{ padding: '6px 12px' }}>
                        <select
                          value={r.category}
                          onChange={(e) => setRows((prev) => prev.map((row, j) => j === i ? { ...row, category: e.target.value } : row))}
                          style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, border: '1px solid var(--cui-border-color)' }}
                        >
                          {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '6px 12px', fontWeight: 600, color: '#e03131' }}>{fmt(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <CButton color="secondary" variant="outline" onClick={onClose}>Cancelar</CButton>
              <CButton color="primary" onClick={migrate} disabled={rows.length === 0}>
                Importar {rows.length} registros a Firebase
              </CButton>
            </div>
          </>
        )}

        {status === 'migrating' && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <CSpinner color="primary" />
            <p style={{ marginTop: 12 }}>Guardando en Firebase… {progress}%</p>
            <div style={{ background: '#f1f5f9', borderRadius: 8, height: 8, margin: '12px auto', maxWidth: 300 }}>
              <div style={{ background: '#1e3a5f', height: '100%', borderRadius: 8, width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        {status === 'done' && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <p style={{ fontWeight: 700, color: '#2f9e44' }}>{rows.length} transacciones importadas exitosamente.</p>
            <CButton color="primary" onClick={onClose} style={{ marginTop: 12 }}>Cerrar</CButton>
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
        <span className="payment-form__title">{isEdit ? 'Editar transacción' : 'Nueva transacción'}</span>
      </div>
      <div className="payment-form__body">
        <div className="payment-form__field">
          <label className="payment-form__label">Tipo</label>
          <select className="payment-form__input payment-form__input--select" value={form.type} onChange={set('type')}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </div>
        <div className="payment-form__field">
          <label className="payment-form__label">Categoría</label>
          <select className="payment-form__input payment-form__input--select" value={form.category} onChange={set('category')}>
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
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
          <input className="payment-form__input" type="date" value={form.date} onChange={set('date')} />
        </div>
      </div>
      <div className="payment-form__actions">
        <CButton className="payment-form__btn payment-form__btn--cancel" onClick={onCancel} disabled={saving}>
          Cancelar
        </CButton>
        <CButton className="payment-form__btn payment-form__btn--save" onClick={handleSave} disabled={saving}>
          {saving ? <CSpinner size="sm" /> : 'Guardar'}
        </CButton>
      </div>
    </div>
  )
}

// ── Summary card ───────────────────────────────────────────────────────────────
function SummaryCard({ label, value, color, bg }) {
  return (
    <div style={{ flex: 1, minWidth: 160, background: bg, border: `1px solid ${color}33`, borderRadius: 10, padding: '14px 20px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Transactions() {
  const dispatch = useDispatch()
  const { data, fetching, saving } = useSelector((s) => s.transaction)

  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [formModal, setFormModal] = useState(null) // null | { mode: 'create' | 'edit', initial?: {} }
  const [migrationOpen, setMigrationOpen] = useState(false)

  useEffect(() => {
    dispatch(transactionActions.fetchRequest({ year }))
  }, [dispatch, year])

  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  const filtered = useMemo(() => {
    if (!data) return []
    return data.filter((r) => {
      if (!r.date?.startsWith(monthStr)) return false
      if (typeFilter !== 'all' && r.type !== typeFilter) return false
      if (categoryFilter && r.category !== categoryFilter) return false
      return true
    })
  }, [data, monthStr, typeFilter, categoryFilter])

  const totalIncome = useMemo(
    () => filtered.filter((r) => r.type === 'income').reduce((s, r) => s + (r.amount || 0), 0),
    [filtered],
  )
  const totalExpense = useMemo(
    () => filtered.filter((r) => r.type === 'expense').reduce((s, r) => s + (r.amount || 0), 0),
    [filtered],
  )
  const balance = totalIncome - totalExpense

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

  return (
    <>
      <CCard className="mb-3">
        <CCardHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <strong>Transacciones</strong>
          <div style={{ display: 'flex', gap: 8 }}>
            <CButton size="sm" color="secondary" variant="outline" onClick={() => setMigrationOpen(true)}>
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
            <SummaryCard label="Ingresos" value={fmt(totalIncome)} color="#2f9e44" bg="#f0fdf4" />
            <SummaryCard label="Gastos" value={fmt(totalExpense)} color="#e03131" bg="#fff5f5" />
            <SummaryCard
              label="Balance"
              value={fmt(balance)}
              color={balance >= 0 ? '#1e3a5f' : '#e03131'}
              bg={balance >= 0 ? '#eef4ff' : '#fff5f5'}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--cui-secondary)', background: '#fff', cursor: 'pointer' }}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--cui-secondary)', background: '#fff', cursor: 'pointer' }}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCategoryFilter('') }}
              style={{
                fontSize: 13, padding: '4px 10px', borderRadius: 6,
                border: `1px solid ${typeFilter !== 'all' ? '#1e3a5f' : 'var(--cui-secondary)'}`,
                background: typeFilter !== 'all' ? '#eef4ff' : '#fff',
                color: typeFilter !== 'all' ? '#1e3a5f' : undefined,
                fontWeight: typeFilter !== 'all' ? 600 : 400, cursor: 'pointer',
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
                fontSize: 13, padding: '4px 10px', borderRadius: 6,
                border: `1px solid ${categoryFilter ? '#1e3a5f' : 'var(--cui-secondary)'}`,
                background: categoryFilter ? '#eef4ff' : '#fff',
                color: categoryFilter ? '#1e3a5f' : undefined,
                fontWeight: categoryFilter ? 600 : 400, cursor: 'pointer',
              }}
            >
              <option value="">Categoría: Todas</option>
              {activeCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {(typeFilter !== 'all' || categoryFilter) && (
              <button
                onClick={() => { setTypeFilter('all'); setCategoryFilter('') }}
                style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #e03131', background: 'none', color: '#e03131', cursor: 'pointer' }}
              >
                ✕ Limpiar
              </button>
            )}

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

          {/* Grid */}
          {fetching && !data ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <CSpinner color="primary" />
            </div>
          ) : (
            <StandardGrid
              keyExpr="id"
              dataSource={filtered}
              noDataText="Sin transacciones para este periodo"
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
                  <span style={{
                    fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px',
                    background: value === 'income' ? '#f0fdf4' : '#fff5f5',
                    color: value === 'income' ? '#2f9e44' : '#e03131',
                    border: `1px solid ${value === 'income' ? '#86efac' : '#fca5a5'}`,
                  }}>
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
                  <span style={{ fontWeight: 700, color: row.type === 'income' ? '#2f9e44' : '#e03131' }}>
                    {row.type === 'income' ? '+' : '-'}{fmt(row.amount)}
                  </span>
                )}
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
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e3a5f', fontSize: 15, padding: '2px 4px' }}
                    >✎</button>
                    <button
                      title="Eliminar"
                      onClick={() => handleDelete(row)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e03131', fontSize: 15, padding: '2px 4px' }}
                    >✕</button>
                  </div>
                )}
              />
              <Summary>
                <TotalItem
                  column="amount"
                  summaryType="sum"
                  customizeText={(e) => fmt(
                    filtered.filter((r) => r.type === 'income').reduce((s, r) => s + (r.amount || 0), 0) -
                    filtered.filter((r) => r.type === 'expense').reduce((s, r) => s + (r.amount || 0), 0)
                  )}
                  displayFormat="Balance: {0}"
                />
              </Summary>
            </StandardGrid>
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

      {/* Form modal */}
      <CModal visible={!!formModal} onClose={() => setFormModal(null)} alignment="center">
        <CModalHeader>
          <CModalTitle>{formModal?.mode === 'edit' ? 'Editar transacción' : 'Nueva transacción'}</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: 0 }}>
          {formModal && (
            <TransactionForm
              initial={formModal.initial}
              saving={saving}
              onSave={formModal.mode === 'edit' ? (p) => handleUpdate({ ...formModal.initial, ...p }) : handleCreate}
              onCancel={() => setFormModal(null)}
            />
          )}
        </CModalBody>
      </CModal>
    </>
  )
}
