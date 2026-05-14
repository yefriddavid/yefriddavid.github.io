export const AUDIT_COL_DEFS = [
  { key: 'weekday', label: 'Día semana' },
  { key: 'status', label: 'Estado' },
  { key: 'count', label: 'Cantidad' },
  { key: 'total', label: 'Total' },
  { key: 'cumul', label: 'Acum.' },
  { key: 'cumul_ideal', label: 'Acum. ideal' },
  { key: 'settled', label: 'Liquidados' },
  { key: 'missing', label: 'Pendientes' },
  { key: 'notes', label: 'Notas auditoría' },
]
export const AUDIT_COLS_LS_KEY = 'auditColVisibility'
export const AUDIT_COLS_ORDER_LS_KEY = 'auditColOrder'
export const AUDIT_COLS_DEFAULT = Object.fromEntries(AUDIT_COL_DEFS.map((c) => [c.key, true]))
