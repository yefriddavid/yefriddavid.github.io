import { GRID_SIZE, FURNITURE_CATALOG_MAP, PLANO_TOOLS, PIXELS_PER_METER } from 'src/constants/inmobiliaria'

export const snap = (v) => Math.round(v / GRID_SIZE) * GRID_SIZE
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2)
export const isFurnitureTool = (tool) => !!FURNITURE_CATALOG_MAP[tool]
export const isPlanoTool = (tool) => PLANO_TOOLS.some((t) => t.key === tool)

export const wallLengthM = (w) => {
  const px = Math.sqrt((w.x2 - w.x1) ** 2 + (w.y2 - w.y1) ** 2)
  return (px / PIXELS_PER_METER).toFixed(1) + 'm'
}

export const autoName = (p, kind, subtype = null) => {
  switch (kind) {
    case 'wall':
      return `Pared ${p.walls.length + 1}`
    case 'door':
      return `Puerta ${p.doors.length + 1}`
    case 'window':
      return `Ventana ${p.windows.length + 1}`
    case 'ruler':
      return `Cota ${(p.rulers ?? []).length + 1}`
    case 'label':
      return `Texto ${p.labels.length + 1}`
    case 'furniture': {
      const def = FURNITURE_CATALOG_MAP[subtype]
      const count = p.furniture.filter((f) => f.type === subtype).length + 1
      return `${def?.label ?? subtype} ${count}`
    }
    default:
      return 'Elemento'
  }
}
