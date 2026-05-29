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
  { key: 'line', label: 'Línea', icon: '╱' },
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
