import { MONTH_NAMES } from 'src/constants/commons'

export const now = new Date()
export const CURRENT_YEAR = now.getFullYear()
export const CURRENT_MONTH = now.getMonth() + 1

export const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1]

export const MONTHS = [
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

export const MONTHS_SHORT = [
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

export const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n ?? 0)

export const EMPTY_FORM = {
  type: 'expense',
  category: '',
  description: '',
  amount: '',
  date: now.toISOString().slice(0, 10),
  accountMasterId: null,
  paymentMethod: '',
}

export function isApplicableToMonth(account, month) {
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
  return true
}

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

export function guessCategory(accountName) {
  const lower = (accountName || '').toLowerCase()
  for (const { keywords, category } of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k))) return category
  }
  return 'Otros'
}

export function toISODate(rawDate) {
  if (!rawDate) return now.toISOString().slice(0, 10)
  const d = new Date(rawDate)
  if (!isNaN(d)) return d.toISOString().slice(0, 10)
  return rawDate
}
