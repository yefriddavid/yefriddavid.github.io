import moment from 'moment'
import 'moment/locale/es'
import es from 'moment/locale/es';
//const lang = "en"

moment.locale('es', es)

export const MONTH_NAMES = moment.localeData('en').months()
export const MONTH_LABELS = moment.localeData('es').months()
export const DAY_NAMES = moment.weekdaysShort(); // ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
export const PERIOD_OPTIONS = ['Mensuales', 'Trimestrales', 'Cuatrimestrales', 'Semestrales', 'Anuales', 'N/A']
export const TYPE_OPTIONS = ['Outcoming', 'Incoming']
export const CLASSIFICATION_OPTIONS = ['dispensable', 'indispensable']

//console.log(DAY_NAMES);

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
