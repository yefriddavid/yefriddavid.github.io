export const DEFAULT_NOTE_CATEGORY = 'general'

export const PRIVATE_NOTES_PASSWORD = 'dave123*'

export const NOTE_COLORS = [
  { value: '#ffffff', label: 'Blanco' },
  { value: '#fef9c3', label: 'Amarillo' },
  { value: '#dcfce7', label: 'Verde' },
  { value: '#dbeafe', label: 'Azul' },
  { value: '#f3e8ff', label: 'Púrpura' },
  { value: '#fce7f3', label: 'Rosa' },
  { value: '#ffedd5', label: 'Naranja' },
  { value: '#f1f5f9', label: 'Gris' },
]

// 'Blanco' is the default swatch and gets persisted on every note that never picked
// a color — treat it as "no color" so the card falls back to the theme surface
// instead of a hardcoded white that goes invisible in dark mode.
export const noteBgStyle = (color) =>
  color && color.toLowerCase() !== '#ffffff' ? { '--note-bg': color } : undefined
