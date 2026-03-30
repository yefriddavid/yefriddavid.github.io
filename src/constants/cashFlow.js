import moment from 'moment'
import 'moment/locale/es'

export const MONTH_NAMES = moment.localeData('en').months()
export const MONTH_LABELS = moment.localeData('es').months()

export const ACCOUNT_CATEGORIES = [
  'Gastos Fijos',
  'Servicios',
  'Impuestos',
  'Salarios',
  'Prestamos',
  'Ayudas',
  'Ocio',
  'Gastos Ocasionales',
  'Alimentación',
  'Transporte',
  'Salud',
  'Educación',
  'Otros',
]

export const PAYMENT_METHODS = ['Cash', 'Deel Card', 'Transferencia', 'Débito automático']

export const EXPENSE_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Servicios públicos',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Ropa y calzado',
  'Hogar',
  'Tecnología',
  'Otros',
]

export const INCOME_CATEGORIES = ['Salario', 'Freelance', 'Inversiones', 'Alquiler', 'Otros']
