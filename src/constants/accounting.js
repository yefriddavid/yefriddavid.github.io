export const PERIOD_OPTIONS = [
  'Mensuales',
  'Trimestrales',
  'Cuatrimestrales',
  'Semestrales',
  'Anuales',
  'N/A',
]

export const TYPE_OPTIONS = ['Outcoming', 'Incoming']

export const ACCOUNT_MASTER_TYPES = ['Incoming', 'Outcoming', 'Activo', 'Pasivo']

export const ACCOUNT_MASTER_TYPE_LABELS = {
  Incoming: 'Ingreso',
  Outcoming: 'Egreso',
  Activo: 'Activo',
  Pasivo: 'Pasivo',
}

export const ACCOUNT_MASTER_NATURE = {
  Activo: 'Débito',
  Outcoming: 'Débito',
  Pasivo: 'Crédito',
  Incoming: 'Crédito',
}

export const ACCOUNT_MASTER_CODE_PREFIX = {
  Activo: '1',
  Pasivo: '2',
  Incoming: '4',
  Outcoming: '5',
}

export const CLASSIFICATION_OPTIONS = ['dispensable', 'indispensable']

export const ACCOUNT_NATURE_COLOR = {
  Débito: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  Crédito: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
}

export const ACCOUNT_TYPE_COLOR = {
  Activo: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  Pasivo: { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
  Incoming: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  Outcoming: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
}
