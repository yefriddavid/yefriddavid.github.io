import React, { useState } from 'react'
import { PLANO_TOOLS, FURNITURE_CATALOG, FURNITURE_CATEGORIES } from 'src/constants/inmobiliaria'

const TOOL_ICONS = {
  select: '↖',
  wall: '▬',
  door: '⌒',
  window: '⊟',
  label: 'T',
  eraser: '✕',
}

const Toolbar = ({ tool, onToolChange }) => {
  const [activeCategory, setActiveCategory] = useState('bedroom')

  const filteredFurniture = FURNITURE_CATALOG.filter((f) => f.category === activeCategory)

  return (
    <div className="pe-toolbar">
      <div className="pe-toolbar__section">
        <span className="pe-toolbar__section-label">Herramientas</span>
        <div className="pe-toolbar__tools">
          {PLANO_TOOLS.map((t) => (
            <button
              key={t.key}
              className={`pe-toolbar__tool${tool === t.key ? ' pe-toolbar__tool--active' : ''}`}
              title={t.label}
              onClick={() => onToolChange(t.key)}
            >
              <span className="pe-toolbar__tool-icon">{TOOL_ICONS[t.key]}</span>
              <span className="pe-toolbar__tool-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pe-toolbar__divider" />

      <div className="pe-toolbar__section">
        <span className="pe-toolbar__section-label">Muebles</span>
        <div className="pe-toolbar__categories">
          {FURNITURE_CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`pe-toolbar__cat${activeCategory === c.key ? ' pe-toolbar__cat--active' : ''}`}
              onClick={() => setActiveCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="pe-toolbar__furniture">
          {filteredFurniture.map((f) => (
            <button
              key={f.type}
              className={`pe-toolbar__furniture-item${tool === f.type ? ' pe-toolbar__furniture-item--active' : ''}`}
              title={`${f.label} (${f.w / 40}m × ${f.h / 40}m)`}
              onClick={() => onToolChange(f.type)}
            >
              <span className="pe-toolbar__furniture-label">{f.label}</span>
              <span className="pe-toolbar__furniture-size">
                {(f.w / 40).toFixed(1)}×{(f.h / 40).toFixed(1)}m
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="pe-toolbar__divider" />

      <div className="pe-toolbar__hint">
        {tool === 'select' && <p>Click para seleccionar · R para rotar · Supr para borrar</p>}
        {tool === 'wall' && <p>Click para inicio · Click para fin · Esc para cancelar</p>}
        {tool === 'door' && <p>Click para colocar · R para rotar</p>}
        {tool === 'window' && <p>Click para colocar · R para rotar</p>}
        {tool === 'label' && <p>Click para agregar texto</p>}
        {tool === 'eraser' && <p>Click sobre un elemento para eliminarlo</p>}
        {!PLANO_TOOLS.some((t) => t.key === tool) && (
          <p>Click para colocar mueble · Esc para cancelar</p>
        )}
      </div>
    </div>
  )
}

export default Toolbar
