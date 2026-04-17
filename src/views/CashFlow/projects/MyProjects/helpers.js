export const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n ?? 0)

export const uid = () => crypto.randomUUID()

export const now = () => new Date().toISOString()

export function totalOf(items) {
  return (items ?? []).reduce((s, i) => s + (Number(i.value) || 0), 0)
}

export function paidOf(items) {
  return (items ?? []).filter((i) => i.paid).reduce((s, i) => s + (Number(i.value) || 0), 0)
}

export const sheetOverlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  zIndex: 1050,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
}

export const sheetBox = {
  width: '100%',
  maxWidth: 540,
  background: '#fff',
  borderRadius: '20px 20px 0 0',
  padding: '20px 20px 36px',
  boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
  maxHeight: '92vh',
  overflowY: 'auto',
}

export const dragHandle = {
  width: 40,
  height: 4,
  borderRadius: 2,
  background: '#dee2e6',
  margin: '0 auto 18px',
}

export const fieldLabel = {
  fontSize: 11,
  fontWeight: 600,
  color: '#6c757d',
  display: 'block',
  marginBottom: 4,
  letterSpacing: '0.05em',
}

export const fieldInput = {
  width: '100%',
  border: 'none',
  borderBottom: '2px solid #dee2e6',
  outline: 'none',
  padding: '4px 0 8px',
  background: 'transparent',
  fontSize: 15,
  color: '#1a1a2e',
}

export const tabBtn = (active) => ({
  flex: 1,
  padding: '10px 0',
  fontSize: 14,
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  background: 'none',
  borderBottom: active ? '2px solid #1e3a5f' : '2px solid transparent',
  color: active ? '#1e3a5f' : '#adb5bd',
  transition: 'all 0.15s',
})

export const btnPrimary = (disabled) => ({
  padding: '13px',
  borderRadius: 12,
  border: 'none',
  background: disabled ? '#e9ecef' : '#1e3a5f',
  color: disabled ? '#adb5bd' : '#fff',
  fontSize: 14,
  fontWeight: 700,
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
})

export const btnGhost = {
  padding: '13px',
  borderRadius: 12,
  border: '1px solid #dee2e6',
  background: '#fff',
  fontSize: 14,
  fontWeight: 600,
  color: '#6c757d',
  cursor: 'pointer',
}
