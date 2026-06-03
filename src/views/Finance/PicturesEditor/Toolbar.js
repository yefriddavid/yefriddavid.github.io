import React, { useRef, useState } from 'react'
import { PICTURES_SHAPE_TOOLS, PICTURES_UNITS_MAP } from 'src/constants/finance'
import { WOOD_PATTERN_DATA } from './woodPatterns'

const SWATCH_KEY = 'pic_color_swatches'
const DEFAULT_SWATCHES = ['#1a6bbf', '#e8e8e8', '#000000']

const loadSwatches = () => {
  try {
    const raw = sessionStorage.getItem(SWATCH_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length === 3) return parsed
    }
  } catch {}
  return [...DEFAULT_SWATCHES]
}

const ColorSwatches = ({ selectedNode, onNodeChange }) => {
  const [swatches, setSwatches] = useState(loadSwatches)
  const pickerRefs = useRef([])

  const updateSwatch = (i, color) => {
    const next = swatches.map((c, idx) => (idx === i ? color : c))
    setSwatches(next)
    sessionStorage.setItem(SWATCH_KEY, JSON.stringify(next))
  }

  const handleClick = (i) => {
    if (selectedNode) {
      onNodeChange({ ...selectedNode, stroke: swatches[i] })
    } else {
      pickerRefs.current[i]?.click()
    }
  }

  return (
    <div className="pic-swatches">
      {swatches.map((color, i) => (
        <div key={i} className="pic-swatches__item">
          <div
            className="pic-swatches__swatch"
            style={{ background: color }}
            title={selectedNode ? `Aplicar ${color} al relleno` : 'Editar color'}
            onClick={() => handleClick(i)}
          />
          <input
            ref={(el) => { pickerRefs.current[i] = el }}
            type="color"
            value={color}
            onChange={(e) => updateSwatch(i, e.target.value)}
            className="pic-swatches__picker"
          />
        </div>
      ))}
    </div>
  )
}

const SHAPE_ICONS = {
  select: '↖', rect: '▬', roundRect: '▢', circle: '○', triangle: '△',
  polygon: '⬡', star: '★', diamond: '◇', semicircle: '◐', line: '─', vline: '│', arrow: '→',
  elbow90: '⌐', elbowRound: '⌒', text: 'T', cota: '⟺', eraser: '✕',
}

const TextureSwatch = ({ pat, active, onClick }) => (
  <button
    title={pat.label}
    onClick={onClick}
    style={{
      border: active ? '2px solid #4a9eff' : '2px solid #555',
      borderRadius: 4,
      padding: 0,
      cursor: 'pointer',
      background: 'none',
      outline: 'none',
      overflow: 'hidden',
      width: 40,
      height: 26,
      flexShrink: 0,
    }}
  >
    <svg width="40" height="26" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id={`swatch-${pat.key}`}
          x="0"
          y="0"
          width={pat.w}
          height={pat.h}
          patternUnits="userSpaceOnUse"
        >
          <rect width={pat.w} height={pat.h} fill={pat.bg} />
          {pat.lines.map((l, i) => (
            <path key={i} d={l.d} stroke={l.s} strokeWidth={l.w} fill="none" opacity={l.o} />
          ))}
        </pattern>
      </defs>
      <rect width="40" height="26" fill={`url(#swatch-${pat.key})`} />
      <text
        x="20"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fill="rgba(255,255,255,0.7)"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {pat.icon}
      </text>
    </svg>
  </button>
)

const Inspector = ({ node, onChange, canvas }) => {
  if (!node) return null

  const set = (key, val) => onChange({ ...node, [key]: val })
  const clearPattern = (patch = {}) => {
    const { fillPattern: _, ...rest } = node
    onChange({ ...rest, ...patch })
  }
  const u = PICTURES_UNITS_MAP[canvas?.unit] ?? PICTURES_UNITS_MAP.cm

  return (
    <div className="pic-inspector">
      <div className="pic-inspector__row">
        <span className="pic-inspector__label">Relleno</span>
        <input
          type="color"
          className="pic-inspector__input"
          value={node.fill}
          onChange={(e) => clearPattern({ fill: e.target.value })}
        />
        {!node.fillPattern && (
          <input
            type="number"
            className="pic-inspector__input"
            min={0}
            max={1}
            step={0.05}
            value={node.fillOpacity}
            style={{ width: 50 }}
            onChange={(e) => set('fillOpacity', parseFloat(e.target.value))}
          />
        )}
      </div>
      <div className="pic-inspector__row" style={{ flexWrap: 'wrap', gap: 4 }}>
        <span className="pic-inspector__label">Textura</span>
        {WOOD_PATTERN_DATA.map((pat) => (
          <TextureSwatch
            key={pat.key}
            pat={pat}
            active={node.fillPattern === pat.key}
            onClick={() =>
              node.fillPattern === pat.key
                ? clearPattern()
                : onChange({ ...node, fillPattern: pat.key })
            }
          />
        ))}
      </div>
      <div className="pic-inspector__row">
        <span className="pic-inspector__label">Borde</span>
        <input
          type="color"
          className="pic-inspector__input"
          value={node.stroke}
          onChange={(e) => set('stroke', e.target.value)}
        />
        <input
          type="number"
          className="pic-inspector__input"
          min={0}
          max={40}
          step={0.5}
          value={node.strokeWidth}
          style={{ width: 50 }}
          onChange={(e) => set('strokeWidth', parseFloat(e.target.value))}
        />
      </div>
      {node.type === 'circle' && (
        <div className="pic-inspector__row">
          <span className="pic-inspector__label">Diámetro</span>
          <input
            type="number"
            className="pic-inspector__input"
            min={0.1}
            step={0.1}
            style={{ width: 65 }}
            value={Math.round((node.w / u.pxPerUnit) * 100) / 100}
            onChange={(e) => {
              const v = Math.max(0.1, parseFloat(e.target.value) || 0.1)
              const px = v * u.pxPerUnit
              onChange({ ...node, w: px, h: px })
            }}
          />
          <span style={{ fontSize: 10, color: '#888' }}>{canvas?.unit}</span>
        </div>
      )}
      <div className="pic-inspector__row">
        <span className="pic-inspector__label">Rotación</span>
        <input
          type="number"
          className="pic-inspector__input"
          min={0}
          max={359}
          value={Math.round(node.rotation)}
          onChange={(e) => set('rotation', parseFloat(e.target.value) || 0)}
        />
      </div>
      {(node.type === 'roundRect' || node.type === 'elbowRound') && (
        <div className="pic-inspector__row">
          <span className="pic-inspector__label">Radio (px)</span>
          <input
            type="number"
            className="pic-inspector__input"
            min={0}
            max={500}
            value={node.rx ?? 12}
            onChange={(e) => set('rx', Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>
      )}
      {(node.type === 'elbow90' || node.type === 'elbowRound') && (
        <div className="pic-inspector__row">
          <span className="pic-inspector__label">Brazo (px)</span>
          <input
            type="number"
            className="pic-inspector__input"
            min={4}
            max={500}
            value={node.armWidth ?? 24}
            onChange={(e) => set('armWidth', Math.max(4, parseInt(e.target.value) || 24))}
          />
        </div>
      )}
      {node.type === 'polygon' && (
        <div className="pic-inspector__row">
          <span className="pic-inspector__label">Lados</span>
          <input
            type="number"
            className="pic-inspector__input"
            min={3}
            max={20}
            value={node.sides ?? 6}
            onChange={(e) => set('sides', Math.max(3, parseInt(e.target.value) || 6))}
          />
        </div>
      )}
      {node.type === 'star' && (
        <div className="pic-inspector__row">
          <span className="pic-inspector__label">Puntas</span>
          <input
            type="number"
            className="pic-inspector__input"
            min={3}
            max={20}
            value={node.points ?? 5}
            onChange={(e) => set('points', Math.max(3, parseInt(e.target.value) || 5))}
          />
        </div>
      )}
      {node.type === 'cota' && (() => {
        const u = PICTURES_UNITS_MAP[canvas?.unit] ?? PICTURES_UNITS_MAP.cm
        const lengthInUnits = Math.round((node.w / u.pxPerUnit) * 100) / 100
        return (
          <div className="pic-inspector__row">
            <span className="pic-inspector__label">Longitud</span>
            <input
              type="number"
              className="pic-inspector__input"
              min={0.1}
              step={0.1}
              style={{ width: 65 }}
              value={lengthInUnits}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0.1
                const newW = v * u.pxPerUnit
                onChange({ ...node, w: newW, text: `${v.toFixed(1)} ${canvas.unit}` })
              }}
            />
            <span style={{ fontSize: 10, color: '#888' }}>{canvas?.unit}</span>
          </div>
        )
      })()}
      {(node.type === 'text' || node.type === 'cota') && (
        <>
          <div className="pic-inspector__row">
            <span className="pic-inspector__label">Texto</span>
            <input
              className="pic-inspector__input"
              value={node.text ?? ''}
              onChange={(e) => set('text', e.target.value)}
            />
          </div>
          <div className="pic-inspector__row">
            <span className="pic-inspector__label">Fuente</span>
            <input
              type="number"
              className="pic-inspector__input"
              min={6}
              max={200}
              value={node.fontSize ?? 16}
              style={{ width: 50 }}
              onChange={(e) => set('fontSize', parseInt(e.target.value) || 16)}
            />
            <input
              type="color"
              className="pic-inspector__input"
              value={node.fontColor ?? '#000000'}
              onChange={(e) => set('fontColor', e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  )
}

const GridControls = ({ canvas, onCanvasChange }) => {
  const setCanvas = (patch) => onCanvasChange({ ...canvas, ...patch })

  return (
    <div className="pic-toolbar__section">
      <div className="pic-grid-controls">
        <label className="pic-grid-controls__toggle">
          <input
            type="checkbox"
            checked={canvas.showGrid !== false}
            onChange={(e) => setCanvas({ showGrid: e.target.checked })}
          />
          <span className="pic-toolbar__section-label" style={{ margin: 0 }}>Cuadrícula</span>
        </label>
        {canvas.showGrid !== false && (
          <div className="pic-grid-controls__row">
            <input
              type="number"
              className="pic-inspector__input"
              min={0.1}
              step={0.1}
              value={canvas.grid ?? 1}
              style={{ width: 55 }}
              onChange={(e) => setCanvas({ grid: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
            />
            <span className="pic-grid-controls__unit">{canvas.unit}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const Toolbar = ({ tool, onToolChange, selectedNode, onNodeChange, canvas, onCanvasChange }) => (
  <div className="pic-toolbar">
    <div className="pic-toolbar__section">
      <span className="pic-toolbar__section-label">Herramientas</span>
      <div className="pic-toolbar__tools">
        {PICTURES_SHAPE_TOOLS.map((t) => (
          <button
            key={t.key}
            className={`pic-toolbar__tool${tool === t.key ? ' pic-toolbar__tool--active' : ''}`}
            title={t.label}
            onClick={() => onToolChange(t.key)}
          >
            <span className="pic-toolbar__tool-icon">{SHAPE_ICONS[t.key]}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>

    <div className="pic-toolbar__divider" />
    <GridControls canvas={canvas} onCanvasChange={onCanvasChange} />

    <div className="pic-toolbar__divider" />
    <ColorSwatches selectedNode={selectedNode} onNodeChange={onNodeChange} />

    {selectedNode && (
      <>
        <div className="pic-toolbar__divider" />
        <div className="pic-toolbar__section">
          <span className="pic-toolbar__section-label">Propiedades</span>
          <Inspector node={selectedNode} onChange={onNodeChange} canvas={canvas} />
        </div>
      </>
    )}
  </div>
)

export default Toolbar
