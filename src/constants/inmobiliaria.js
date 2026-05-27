export const DESIGN_TEMPLATE_DEFS = [
  { key: 'orange', label: '🟠 Naranja', color: '#F07820', badgeVariant: 'warning' },
  { key: 'dark', label: '🌙 Nocturno', color: '#00cfb4', badgeVariant: 'inactive' },
  { key: 'elegant', label: '✨ Elegante', color: '#e8b84b', badgeVariant: 'info' },
]

export const DESIGN_TEMPLATE_MAP = Object.fromEntries(DESIGN_TEMPLATE_DEFS.map((d) => [d.key, d]))
