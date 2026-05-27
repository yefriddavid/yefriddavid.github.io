// ─── Planos designer constants ───────────────────────────────────────────────

export const GRID_SIZE = 20 // px per grid cell
export const WALL_THICKNESS = 4 // px
export const PIXELS_PER_METER = 40 // 2 cells = 1 m
export const CANVAS_W = 2000
export const CANVAS_H = 1500

export const FURNITURE_CATALOG = [
  { type: 'bed_single', label: 'Cama sencilla', category: 'bedroom', w: 80, h: 120 },
  { type: 'bed_double', label: 'Cama doble', category: 'bedroom', w: 120, h: 120 },
  { type: 'wardrobe', label: 'Armario', category: 'bedroom', w: 120, h: 40 },
  { type: 'toilet', label: 'Inodoro', category: 'bathroom', w: 40, h: 60 },
  { type: 'bathtub', label: 'Bañera', category: 'bathroom', w: 80, h: 160 },
  { type: 'shower', label: 'Ducha', category: 'bathroom', w: 80, h: 80 },
  { type: 'sink_bath', label: 'Lavamanos', category: 'bathroom', w: 40, h: 40 },
  { type: 'sink_kitchen', label: 'Lavaplatos', category: 'kitchen', w: 80, h: 40 },
  { type: 'stove', label: 'Estufa', category: 'kitchen', w: 80, h: 60 },
  { type: 'fridge', label: 'Nevera', category: 'kitchen', w: 60, h: 80 },
  { type: 'sofa', label: 'Sofá', category: 'living', w: 160, h: 80 },
  { type: 'armchair', label: 'Sillón', category: 'living', w: 80, h: 80 },
  { type: 'table_coffee', label: 'Mesa café', category: 'living', w: 100, h: 60 },
  { type: 'tv_unit', label: 'Mueble TV', category: 'living', w: 160, h: 40 },
  { type: 'table_dining', label: 'Mesa comedor', category: 'dining', w: 120, h: 80 },
  { type: 'chair', label: 'Silla', category: 'dining', w: 40, h: 40 },
  { type: 'desk', label: 'Escritorio', category: 'office', w: 120, h: 60 },
  { type: 'patio', label: 'Patio', category: 'outdoor', w: 160, h: 160 },
  { type: 'jardin', label: 'Jardín', category: 'outdoor', w: 160, h: 160 },
  { type: 'terraza', label: 'Terraza', category: 'outdoor', w: 160, h: 120 },
  { type: 'balcon', label: 'Balcón', category: 'outdoor', w: 120, h: 60 },
  { type: 'acera', label: 'Acera', category: 'outdoor', w: 200, h: 60 },
  { type: 'frente', label: 'Frente', category: 'outdoor', w: 240, h: 60 },
  { type: 'garaje', label: 'Garaje', category: 'outdoor', w: 120, h: 200 },
]

export const FURNITURE_CATALOG_MAP = Object.fromEntries(FURNITURE_CATALOG.map((f) => [f.type, f]))

export const FURNITURE_CATEGORIES = [
  { key: 'bedroom', label: 'Dormitorio' },
  { key: 'bathroom', label: 'Baño' },
  { key: 'kitchen', label: 'Cocina' },
  { key: 'living', label: 'Sala' },
  { key: 'dining', label: 'Comedor' },
  { key: 'office', label: 'Oficina' },
  { key: 'outdoor', label: 'Exterior' },
]

export const PLANO_TOOLS = [
  { key: 'select', label: 'Seleccionar' },
  { key: 'wall', label: 'Pared' },
  { key: 'door', label: 'Puerta' },
  { key: 'window', label: 'Ventana' },
  { key: 'label', label: 'Etiqueta' },
  { key: 'eraser', label: 'Borrar' },
]

export const EMPTY_PLANO = {
  name: 'Nuevo plano',
  walls: [],
  doors: [],
  windows: [],
  furniture: [],
  labels: [],
  zOrder: [],
}

// ─── Design template constants ────────────────────────────────────────────────

export const DESIGN_TEMPLATE_DEFS = [
  { key: 'orange', label: '🟠 Naranja', color: '#F07820', badgeVariant: 'warning' },
  { key: 'dark', label: '🌙 Nocturno', color: '#00cfb4', badgeVariant: 'inactive' },
  { key: 'elegant', label: '✨ Elegante', color: '#e8b84b', badgeVariant: 'info' },
]

export const DESIGN_TEMPLATE_MAP = Object.fromEntries(DESIGN_TEMPLATE_DEFS.map((d) => [d.key, d]))
