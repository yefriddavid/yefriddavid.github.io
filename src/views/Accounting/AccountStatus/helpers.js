export const now = new Date()
export const CURRENT_YEAR = now.getFullYear()
export const CURRENT_MONTH = now.getMonth() + 1

export const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n ?? 0)

export const PERIOD_OPTIONS = [
  'Mensuales',
  'Trimestrales',
  'Cuatrimestrales',
  'Semestrales',
  'Anuales',
  'N/A',
]
export const TYPE_OPTIONS = ['Outcoming', 'Incoming']
export const CLASSIFICATION_OPTIONS = ['dispensable', 'indispensable']

export const fieldLabel = {
  fontSize: 12,
  fontWeight: 600,
  color: '#6c757d',
  display: 'block',
  marginBottom: 6,
  letterSpacing: '0.04em',
}
export const fieldInput = {
  width: '100%',
  color: '#1a1a2e',
  border: 'none',
  borderBottom: '2px solid #dee2e6',
  outline: 'none',
  padding: '4px 0 10px',
  background: 'transparent',
}

import { MONTH_NAMES } from 'src/constants/commons'

export function isApplicableToMonth(account, month) {
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

export function getStatus(account, payments, monthStr, cumulativePaid = null) {
  const target = account.targetAmount > 0 ? account.targetAmount : null

  if (target !== null) {
    const totalPaid = cumulativePaid ?? payments.reduce((s, t) => s + (t.amount || 0), 0)
    const remaining = target - totalPaid
    if (remaining <= 0)
      return {
        label: 'Pagado',
        color: '#2f9e44',
        bg: '#f0fdf4',
        border: '#86efac',
        paid: totalPaid,
        remaining: 0,
      }
    if (totalPaid > 0)
      return {
        label: 'Parcial',
        color: '#0ea5e9',
        bg: '#f0f9ff',
        border: '#7dd3fc',
        paid: totalPaid,
        remaining,
      }
    const today = new Date()
    const [y, m] = monthStr.split('-').map(Number)
    const due = new Date(y, m - 1, account.maxDatePay || 31)
    if (today > due)
      return {
        label: 'Vencido',
        color: '#e03131',
        bg: '#fff5f5',
        border: '#fca5a5',
        paid: 0,
        remaining,
      }
    return {
      label: 'Pendiente',
      color: '#f59f00',
      bg: '#fff9db',
      border: '#ffe066',
      paid: 0,
      remaining,
    }
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
