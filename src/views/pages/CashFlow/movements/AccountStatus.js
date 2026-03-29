import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CSpinner } from '@coreui/react'
import * as transactionActions from 'src/actions/CashFlow/transactionActions'
import * as accountsMasterActions from 'src/actions/CashFlow/accountsMasterActions'
import { MONTH_NAMES } from 'src/services/providers/firebase/CashFlow/accountsMaster'

const now = new Date()
const CURRENT_YEAR = now.getFullYear()
const CURRENT_MONTH = now.getMonth() + 1

const MONTH_LABELS = [
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
]

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n ?? 0)

function isApplicableToMonth(account, month) {
  if (!account.active) return false
  if (account.period === 'Mensuales') return true
  if (account.period === 'Anuales') return MONTH_NAMES.indexOf(account.monthStartAt) + 1 === month
  return true
}

function getStatus(account, payments, monthStr) {
  const paid = payments.reduce((s, t) => s + (t.amount || 0), 0)
  if (paid > 0) return { label: 'Pagado', color: '#2f9e44', bg: '#f0fdf4', border: '#86efac', paid }
  const today = new Date()
  const [y, m] = monthStr.split('-').map(Number)
  const due = new Date(y, m - 1, account.maxDatePay || 31)
  if (today > due)
    return { label: 'Vencido', color: '#e03131', bg: '#fff5f5', border: '#fca5a5', paid: 0 }
  return { label: 'Pendiente', color: '#f59f00', bg: '#fff9db', border: '#ffe066', paid: 0 }
}

// ── Pay modal ──────────────────────────────────────────────────────────────────
function PayModal({ account, year, month, saving, onSave, onClose }) {
  const defaultDate = (() => {
    const d = new Date(year, month - 1, account.maxDatePay || 15)
    // if date is in the future use it, else use today
    return d > new Date() ? d.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  })()

  const [amount, setAmount] = useState(account.defaultValue || '')
  const [date, setDate] = useState(defaultDate)

  const handleSave = () => {
    if (!amount || !date) return
    onSave({
      type: account.type === 'Outcoming' ? 'expense' : 'income',
      category: account.category || '',
      description: account.name,
      amount: Number(String(amount).replace(/\D/g, '')),
      date,
      accountMasterId: account.id,
    })
  }

  return (
    // backdrop
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
      {/* sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 540,
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px 36px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
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
        <div style={{ fontSize: 13, color: '#6c757d', marginBottom: 24 }}>{account.name}</div>

        {/* Amount */}
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#6c757d',
            display: 'block',
            marginBottom: 6,
          }}
        >
          MONTO (COP)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          min="0"
          autoFocus
          style={{
            width: '100%',
            fontSize: 28,
            fontWeight: 700,
            color: '#1e3a5f',
            border: 'none',
            borderBottom: '2px solid #dee2e6',
            outline: 'none',
            padding: '4px 0 10px',
            marginBottom: 20,
            background: 'transparent',
          }}
        />

        {/* Date */}
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#6c757d',
            display: 'block',
            marginBottom: 6,
          }}
        >
          FECHA
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            width: '100%',
            fontSize: 16,
            color: '#1a1a2e',
            border: 'none',
            borderBottom: '2px solid #dee2e6',
            outline: 'none',
            padding: '4px 0 10px',
            marginBottom: 28,
            background: 'transparent',
          }}
        />

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
            disabled={saving || !amount}
            style={{
              flex: 2,
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: !amount ? '#e9ecef' : '#1e3a5f',
              fontSize: 15,
              fontWeight: 700,
              color: !amount ? '#adb5bd' : '#fff',
              cursor: !amount ? 'not-allowed' : 'pointer',
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
function AccountCard({ account, payments, monthStr, onPay }) {
  const status = getStatus(account, payments, monthStr)
  const canPay = status.label !== 'Pagado'

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 10,
        borderLeft: `4px solid ${status.border}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Status dot */}
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
        {status.label === 'Pagado' ? '✓' : status.label === 'Vencido' ? '!' : '·'}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#1a1a2e',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {account.name}
        </div>
        <div
          style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}
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
          {account.paymentMethod && account.paymentMethod !== 'Cash' && (
            <span
              style={{
                fontSize: 11,
                color: '#6c757d',
                background: '#e9ecef',
                borderRadius: 4,
                padding: '1px 6px',
              }}
            >
              {account.paymentMethod}
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div
        style={{
          textAlign: 'right',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 6,
        }}
      >
        {status.paid > 0 ? (
          <>
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
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2f9e44' }}>
              {fmt(status.paid)}
            </div>
          </>
        ) : (
          <>
            {account.defaultValue > 0 && (
              <div style={{ fontSize: 12, color: '#adb5bd' }}>{fmt(account.defaultValue)}</div>
            )}
            {canPay && (
              <button
                onClick={() => onPay(account)}
                style={{
                  padding: '6px 14px',
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
                Pagar
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AccountStatus() {
  const dispatch = useDispatch()
  const { data: transactions, fetching, saving } = useSelector((s) => s.transaction)
  const { data: masters, fetching: fetchingMasters } = useSelector((s) => s.accountsMaster)

  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [filter, setFilter] = useState('all')
  const [paying, setPaying] = useState(null) // account being paid

  useEffect(() => {
    dispatch(transactionActions.fetchRequest({ year }))
  }, [dispatch, year])

  useEffect(() => {
    if (!masters) dispatch(accountsMasterActions.fetchRequest())
  }, [dispatch, masters])

  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  const applicable = useMemo(() => {
    if (!masters) return []
    return masters.filter((a) => isApplicableToMonth(a, month))
  }, [masters, month])

  const masterPaymentsMap = useMemo(() => {
    if (!transactions) return {}
    const map = {}
    transactions.forEach((t) => {
      if (t.accountMasterId && t.date?.startsWith(monthStr)) {
        if (!map[t.accountMasterId]) map[t.accountMasterId] = []
        map[t.accountMasterId].push(t)
      }
    })
    return map
  }, [transactions, monthStr])

  const { paid, pending, overdue } = useMemo(() => {
    let p = 0,
      pe = 0,
      ov = 0
    applicable.forEach((a) => {
      const s = getStatus(a, masterPaymentsMap[a.id] ?? [], monthStr)
      if (s.label === 'Pagado') p++
      else if (s.label === 'Vencido') ov++
      else pe++
    })
    return { paid: p, pending: pe, overdue: ov }
  }, [applicable, masterPaymentsMap, monthStr])

  const totalPaid = useMemo(
    () =>
      Object.values(masterPaymentsMap)
        .flat()
        .reduce((s, t) => s + (t.amount || 0), 0),
    [masterPaymentsMap],
  )

  const filtered = useMemo(() => {
    return applicable.filter((a) => {
      if (filter === 'all') return true
      const s = getStatus(a, masterPaymentsMap[a.id] ?? [], monthStr)
      if (filter === 'paid') return s.label === 'Pagado'
      if (filter === 'pending') return s.label === 'Pendiente' || s.label === 'Vencido'
      return true
    })
  }, [applicable, masterPaymentsMap, monthStr, filter])

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear((y) => y - 1)
    } else setMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear((y) => y + 1)
    } else setMonth((m) => m + 1)
  }

  const handleSavePayment = (payload) => {
    dispatch(transactionActions.createRequest(payload))
    setPaying(null)
  }

  // close modal when saving completes
  const prevSaving = React.useRef(saving)
  useEffect(() => {
    if (prevSaving.current && !saving) setPaying(null)
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
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}
      >
        {[
          { label: 'Pagadas', value: paid, color: '#2f9e44', bg: '#f0fdf4', border: '#86efac' },
          {
            label: 'Pendientes',
            value: pending,
            color: '#f59f00',
            bg: '#fff9db',
            border: '#ffe066',
          },
          { label: 'Vencidas', value: overdue, color: '#e03131', bg: '#fff5f5', border: '#fca5a5' },
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
          </div>
        ))}
      </div>

      {/* Total paid */}
      {totalPaid > 0 && (
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
          <span style={{ fontSize: 13, color: '#1e3a5f', fontWeight: 600 }}>Total pagado</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>{fmt(totalPaid)}</span>
        </div>
      )}

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
        filtered.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            payments={masterPaymentsMap[account.id] ?? []}
            monthStr={monthStr}
            onPay={setPaying}
          />
        ))
      )}

      {/* Pay modal (bottom sheet) */}
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
    </div>
  )
}
