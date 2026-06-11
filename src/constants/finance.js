export const PICTURES_UNITS = [
  { key: 'px', label: 'Píxeles', pxPerUnit: 1 },
  { key: 'mm', label: 'Milímetros', pxPerUnit: 3.7795275591 },
  { key: 'cm', label: 'Centímetros', pxPerUnit: 37.795275591 },
  { key: 'm', label: 'Metros', pxPerUnit: 3779.5275591 },
  { key: 'in', label: 'Pulgadas', pxPerUnit: 96 },
  { key: 'ft', label: 'Pies', pxPerUnit: 1152 },
]

export const PICTURES_UNITS_MAP = Object.fromEntries(PICTURES_UNITS.map((u) => [u.key, u]))

export const PICTURES_RULER_SIZE = 24

export const PICTURES_SHAPE_TOOLS = [
  { key: 'select', label: 'Seleccionar', icon: '↖' },
  { key: 'rect', label: 'Rectángulo', icon: '▬' },
  { key: 'roundRect', label: 'Rect. redondeado', icon: '▢' },
  { key: 'circle', label: 'Círculo', icon: '○' },
  { key: 'triangle', label: 'Triángulo', icon: '△' },
  { key: 'polygon', label: 'Polígono', icon: '⬡' },
  { key: 'star', label: 'Estrella', icon: '★' },
  { key: 'diamond', label: 'Rombo', icon: '◇' },
  { key: 'semicircle', label: 'Medio círculo', icon: '◐' },
  { key: 'line', label: 'Línea H', icon: '─' },
  { key: 'vline', label: 'Línea V', icon: '│' },
  { key: 'cota', label: 'Cota', icon: '⟺' },
  { key: 'arrow', label: 'Flecha', icon: '→' },
  { key: 'elbow90', label: 'Codo 90°', icon: '⌐' },
  { key: 'elbowRound', label: 'Codo redondo', icon: '⌒' },
  { key: 'text', label: 'Texto', icon: 'T' },
  { key: 'eraser', label: 'Borrador', icon: '✕' },
]

export const PICTURES_DEFAULT_CANVAS = {
  width: 20,
  height: 15,
  unit: 'cm',
  dpi: 96,
  grid: 1,
  showGrid: true,
  snap: true,
  bg: '#ffffff',
}

export const PICTURES_DEFAULT_NODE = {
  fill: '#4488ff',
  fillOpacity: 1,
  stroke: '#2244aa',
  strokeWidth: 2,
  rotation: 0,
  visible: true,
  locked: false,
  sides: 6,
  points: 5,
  rx: 12,       // corner radius — used by roundRect and elbowRound
  armWidth: 24, // arm thickness (px) — used by elbow90 and elbowRound
  text: 'Texto',
  fontSize: 16,
  fontColor: '#000000',
}

export const PICTURES_FILL_PATTERNS = [
  { key: 'acrylic-green', label: 'Acrílico verde' },
  { key: 'acrylic-black', label: 'Acrílico negro' },
  { key: 'wood-v-light',  label: 'Madera vertical clara' },
  { key: 'wood-v-dark',   label: 'Madera vertical oscura' },
  { key: 'wood-v-walnut', label: 'Nogal vertical' },
  { key: 'wood-h-light',  label: 'Madera horizontal clara' },
  { key: 'wood-h-dark',   label: 'Madera horizontal oscura' },
]

// ── 3D Scenes ─────────────────────────────────────────────────────────────────

export const SCENES3D_OBJECT_TYPES = [
  { key: 'box',      label: 'Caja',      icon: '⬛' },
  { key: 'sphere',   label: 'Esfera',    icon: '⚫' },
  { key: 'cylinder', label: 'Cilindro',  icon: '⬤' },
  { key: 'cone',     label: 'Cono',      icon: '△' },
  { key: 'torus',    label: 'Torus',     icon: '○' },
  { key: 'plane',    label: 'Plano',     icon: '▬' },
]

export const SCENES3D_TRANSFORM_MODES = [
  { key: 'translate', label: 'Mover',   shortcut: 'W' },
  { key: 'rotate',    label: 'Rotar',   shortcut: 'E' },
  { key: 'scale',     label: 'Escalar', shortcut: 'R' },
]

export const SCENES3D_DEFAULT_SCENE = {
  bg: '#1a1a2e',
  grid: true,
  ambientIntensity: 0.5,
  dirLightIntensity: 1.2,
  dirLightColor: '#ffffff',
}

export const SCENES3D_DEFAULT_OBJECT = {
  position: [0, 0.5, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#4488ff',
  opacity: 1,
  wireframe: false,
  visible: true,
  locked: false,
}

export const CALC_LIST_CATEGORIES = [
  { value: 'gastos',  label: 'Gastos' },
  { value: 'ahorros', label: 'Ahorros' },
  { value: 'otros',   label: 'Otros' },
]

export const CALC_LIST_CLASSIFICATIONS = [
  { value: 'comida',    label: 'Comida' },
  { value: 'ocio',      label: 'Ocio' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'otros',     label: 'Otros' },
]

