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

export const BANK_NAMES = [
  'Bancolombia',
  'Davivienda',
  'Banco de Bogotá',
  'BBVA',
  'Itaú',
  'Nequi',
  'Daviplata',
  'Av Villas',
  'Otro',
]

export const BANK_ACCOUNT_TYPES = ['Ahorros', 'Corriente', 'Nómina', 'Billetera digital']

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

export const INCOME_CATEGORIES = [
  'Salario',
  'Freelance',
  'Inversiones',
  'Alquiler',
  'Taxis',
  'Otros',
]

export const SALARY_TARGET_OPTIONS = ['bcol', 'col-bnc', 'bnc arg', 'bnc arg 2', 'bnc loan', 'ctb']

export const SALARY_DISTRIBUTION_TYPE_LABELS = {
  percent: 'Porcentaje',
  value: 'Valor fijo',
  remainder: 'Restante',
}

export const ASSET_TYPES = ['financial', 'fixed', 'crypto']
export const ASSET_HORIZONS = ['largo', 'mediano', 'corto']
export const ASSET_LOCATIONS = [
  'ldg',
  'box',
  'trz',
  'dave',
  'bnc col',
  'bnc arg',
  'neverless',
  'biblia',
]
// Symbol options for 'fixed' assets — manual entry, unitPrice typed by hand (COP per unit;
// COP per gram for gold).
export const ASSET_FIXED_SYMBOLS = ['usd', 'cop', 'eur', 'gold']

export const ASSET_TYPE_COLOR = { financial: '#1e3a5f', fixed: '#e67700', crypto: '#6741d9' }
export const ASSET_TYPE_BG = { financial: '#eef4ff', fixed: '#fff8e1', crypto: '#f3f0ff' }
export const ASSET_HORIZON_COLOR = { largo: '#6741d9', mediano: '#1971c2', corto: '#e03131' }
export const ASSET_HORIZON_BG = { largo: '#f3f0ff', mediano: '#e7f5ff', corto: '#fff5f5' }

// Fixed-order categorical palette for cash-flow charts (dashboard breakdowns).
// The last slot is reserved for the "Otros" overflow bucket — never reassigned.
export const CASHFLOW_CHART_CATEGORY_COLORS = [
  '#1971c2',
  '#2f9e44',
  '#e67700',
  '#ae3ec9',
  '#0c8599',
  '#868e96',
]
