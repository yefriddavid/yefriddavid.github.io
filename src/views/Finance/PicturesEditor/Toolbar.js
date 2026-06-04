import React, { useRef, useState, useEffect, useCallback } from 'react'
import { PICTURES_SHAPE_TOOLS, PICTURES_UNITS_MAP } from 'src/constants/finance'
import { WOOD_PATTERN_DATA, ACRYLIC_PATTERN_DATA } from './woodPatterns'

const ALL_PATTERNS = [...ACRYLIC_PATTERN_DATA, ...WOOD_PATTERN_DATA]

// ── Predeterminados ───────────────────────────────────────────────────────────

const PREDET_KEY = 'pic-color-predef'
const PREDET_DEFAULTS = [
  '#E8A020', // amarillo mostaza
  '#EDE4CC', // crema fondo
  '#2B7A8A', // verde azulado teal
  '#D4603A', // naranja terracota
  '#1A2840', // azul noche
  '#1A1A1A', // negro
  '#FFFFFF',  // blanco
]

const loadPredet = () => {
  try {
    const raw = localStorage.getItem(PREDET_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return [...PREDET_DEFAULTS]
}

const savePredet = (colors) => {
  try { localStorage.setItem(PREDET_KEY, JSON.stringify(colors)) } catch {}
}

// ── ColorPicker con tab Predeterminados ───────────────────────────────────────

export const ColorPicker = ({ value, onChange, label, canSave = false }) => {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('picker')
  const [predet, setPredet] = useState(loadPredet)
  const [draft, setDraft] = useState(value)
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const popupRef = useRef(null)
  const addRef = useRef(null)

  useEffect(() => { setDraft(value) }, [value])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        popupRef.current && !popupRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = () => {
    if (open) { setOpen(false); return }
    const rect = btnRef.current?.getBoundingClientRect()
    const popupH = 180
    if (rect) {
      const spaceAbove = rect.top
      const top = spaceAbove >= popupH + 8
        ? rect.top - popupH - 6
        : rect.bottom + 6
      setPopupPos({ top, left: rect.left })
    }
    setOpen(true)
  }

  const applyColor = useCallback((color) => {
    onChange(color)
    setOpen(false)
  }, [onChange])

  const addPredet = (color) => {
    if (predet.includes(color)) return
    const next = [color, ...predet]
    setPredet(next)
    savePredet(next)
  }

  const removePredet = (color) => {
    const next = predet.filter((c) => c !== color)
    setPredet(next)
    savePredet(next)
  }

  return (
    <>
      <button
        ref={btnRef}
        title={label}
        onClick={handleOpen}
        style={{
          width: 26, height: 22, padding: 1,
          border: '1px solid #555', borderRadius: 3,
          background: value, cursor: 'pointer', flexShrink: 0,
        }}
      />
      {open && (
        <div ref={popupRef} style={{
          position: 'fixed', zIndex: 99999,
          top: popupPos.top, left: popupPos.left,
          background: '#1e1e2e', border: '1px solid #444', borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)', width: 200, overflow: 'hidden',
        }}>
          {/* tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
            {['picker', 'predet'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '6px 4px', fontSize: 11, border: 'none', cursor: 'pointer',
                  background: tab === t ? '#2d2d3e' : 'transparent',
                  color: tab === t ? '#e8e8e8' : '#888',
                  borderBottom: tab === t ? '2px solid #4a9eff' : '2px solid transparent',
                }}
              >
                {t === 'picker' ? 'Color' : 'Predeterminados'}
              </button>
            ))}
          </div>

          {tab === 'picker' && (
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  style={{ width: 36, height: 30, border: '1px solid #555', borderRadius: 4, padding: 2, background: 'none', cursor: 'pointer', flexShrink: 0 }}
                />
                <input
                  type="text"
                  value={draft}
                  maxLength={7}
                  onChange={(e) => {
                    const v = e.target.value
                    setDraft(v)
                    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v)
                  }}
                  style={{ flex: 1, background: '#2d2d3e', border: '1px solid #444', borderRadius: 4, color: '#e8e8e8', fontSize: 12, padding: '4px 6px', fontFamily: 'monospace' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => applyColor(draft)}
                  style={{ flex: 1, fontSize: 11, padding: '4px 0', background: '#4a9eff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                >
                  Aplicar
                </button>
                {canSave && (
                  <button
                    onClick={() => { addPredet(draft); applyColor(draft) }}
                    title="Aplicar y guardar en predeterminados"
                    style={{ flex: 1, fontSize: 11, padding: '4px 0', background: '#2d5a2d', color: '#aee', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  >
                    + Guardar
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === 'predet' && (
            <div style={{ padding: 8 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                {predet.map((color) => (
                  <div key={color} style={{ position: 'relative' }}>
                    <button
                      title={color}
                      onClick={() => applyColor(color)}
                      style={{
                        width: 28, height: 28, border: color === value ? '2px solid #4a9eff' : '1px solid #555',
                        borderRadius: 4, background: color, cursor: 'pointer', display: 'block',
                      }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); removePredet(color) }}
                      title="Quitar"
                      style={{
                        position: 'absolute', top: -5, right: -5, width: 13, height: 13,
                        borderRadius: '50%', background: '#555', border: 'none', color: '#fff',
                        fontSize: 9, lineHeight: '13px', textAlign: 'center', cursor: 'pointer', padding: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid #333', paddingTop: 6 }}>
                <input
                  ref={addRef}
                  type="color"
                  defaultValue="#4488ff"
                  style={{ width: 26, height: 22, border: '1px solid #555', borderRadius: 3, background: 'none', cursor: 'pointer', padding: 1 }}
                />
                <button
                  onClick={() => addPredet(addRef.current?.value ?? '#4488ff')}
                  style={{ fontSize: 11, padding: '3px 8px', background: '#2d2d3e', color: '#aaa', border: '1px solid #444', borderRadius: 4, cursor: 'pointer' }}
                >
                  + Agregar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

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
  const [popup, setPopup] = useState(null) // { idx, pos, mode: 'apply'|'picker' }
  const [searchQuery, setSearchQuery] = useState('')
  const [predet] = useState(loadPredet)
  const [pickerDraft, setPickerDraft] = useState('#000000')
  const popupRef = useRef(null)

  useEffect(() => {
    if (!popup) return
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setPopup(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [popup])

  const updateSwatch = (i, color) => {
    const next = swatches.map((c, idx) => (idx === i ? color : c))
    setSwatches(next)
    sessionStorage.setItem(SWATCH_KEY, JSON.stringify(next))
  }

  const handleSwatchClick = (i, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = { top: rect.top - 10, left: rect.right + 8 }
    if (selectedNode) {
      setPopup({ idx: i, pos, mode: 'apply' })
    } else {
      setPickerDraft(swatches[i])
      setSearchQuery('')
      setPopup({ idx: i, pos, mode: 'picker' })
    }
  }

  const applyToNode = (idx, target) => {
    const color = swatches[idx]
    let updated = { ...selectedNode }
    if (target === 'fill'   || target === 'both') updated = { ...updated, fill: color }
    if (target === 'stroke' || target === 'both') updated = { ...updated, stroke: color }
    onNodeChange(updated)
    setPopup(null)
  }

  const allColors = [...new Set([...predet, ...swatches])]
  const filteredColors = allColors.filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <div className="pic-swatches">
        {swatches.map((color, i) => (
          <button
            key={i}
            title={selectedNode ? `Aplicar ${color}` : `Editar swatch ${color}`}
            onClick={(e) => handleSwatchClick(i, e)}
            style={{
              width: 26, height: 22, padding: 1, border: '1px solid #555',
              borderRadius: 3, background: color, cursor: 'pointer', flexShrink: 0,
            }}
          />
        ))}
      </div>

      {popup && (
        <div ref={popupRef} style={{
          position: 'fixed', zIndex: 99999,
          top: popup.pos.top, left: popup.pos.left,
          background: '#1e1e2e', border: '1px solid #444', borderRadius: 6,
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)', width: 200, overflow: 'hidden',
        }}>

          {/* modo: aplicar al nodo */}
          {popup.mode === 'apply' && (
            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 10, color: '#888', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 14, height: 14, background: swatches[popup.idx], borderRadius: 2, border: '1px solid #555', display: 'inline-block' }} />
                Aplicar {swatches[popup.idx]}
              </div>
              {[['fill', 'Relleno'], ['stroke', 'Borde'], ['both', 'Ambos']].map(([target, label]) => (
                <button key={target} onClick={() => applyToNode(popup.idx, target)} style={{
                  background: '#2d2d3e', border: '1px solid #444', borderRadius: 4,
                  color: '#e8e8e8', fontSize: 12, padding: '5px 8px', cursor: 'pointer', textAlign: 'left',
                }}>
                  {label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid #333', marginTop: 2, paddingTop: 6 }}>
                <button onClick={() => { setPickerDraft(swatches[popup.idx]); setSearchQuery(''); setPopup((p) => ({ ...p, mode: 'picker' })) }} style={{
                  background: 'none', border: 'none', color: '#888', fontSize: 11, cursor: 'pointer', padding: '2px 0',
                }}>
                  ✎ Editar color del swatch
                </button>
              </div>
            </div>
          )}

          {/* modo: picker / buscar */}
          {popup.mode === 'picker' && (
            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="color" value={pickerDraft} onChange={(e) => setPickerDraft(e.target.value)}
                  style={{ width: 30, height: 24, border: '1px solid #555', borderRadius: 3, padding: 1, background: 'none', cursor: 'pointer' }} />
                <input type="text" value={pickerDraft} maxLength={7}
                  onChange={(e) => { const v = e.target.value; setPickerDraft(v); setSearchQuery(v) }}
                  style={{ flex: 1, background: '#2d2d3e', border: '1px solid #444', borderRadius: 4, color: '#e8e8e8', fontSize: 12, padding: '3px 6px', fontFamily: 'monospace' }} />
              </div>
              <input type="text" placeholder="Buscar…" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: '#2d2d3e', border: '1px solid #444', borderRadius: 4, color: '#e8e8e8', fontSize: 11, padding: '3px 6px' }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxHeight: 100, overflowY: 'auto' }}>
                {filteredColors.map((color) => (
                  <button key={color} title={color} onClick={() => { updateSwatch(popup.idx, color); setPopup(null) }}
                    style={{ width: 26, height: 22, background: color, border: swatches[popup.idx] === color ? '2px solid #4a9eff' : '1px solid #555', borderRadius: 3, cursor: 'pointer' }} />
                ))}
              </div>
              <button onClick={() => { updateSwatch(popup.idx, pickerDraft); setPopup(null) }} style={{
                background: '#4a9eff', border: 'none', borderRadius: 4, color: '#fff', fontSize: 11, padding: '4px 0', cursor: 'pointer',
              }}>
                Aplicar al swatch
              </button>
            </div>
          )}
        </div>
      )}
    </>
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
  const clearStrokePattern = (patch = {}) => {
    const { strokePattern: _, ...rest } = node
    onChange({ ...rest, ...patch })
  }
  const u = PICTURES_UNITS_MAP[canvas?.unit] ?? PICTURES_UNITS_MAP.cm

  return (
    <div className="pic-inspector">
      <div className="pic-inspector__row" style={{ flexWrap: 'wrap', gap: 4 }}>
        <span className="pic-inspector__label">Textura</span>
        {ALL_PATTERNS.map((pat) => (
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
        <span className="pic-inspector__label">Textura borde</span>
        {ALL_PATTERNS.map((pat) => (
          <TextureSwatch
            key={pat.key}
            pat={pat}
            active={node.strokePattern === pat.key}
            onClick={() =>
              node.strokePattern === pat.key
                ? clearStrokePattern()
                : onChange({ ...node, strokePattern: pat.key })
            }
          />
        ))}
      </div>
      <div className="pic-inspector__row">
        <span className="pic-inspector__label">Borde</span>
        {!node.strokePattern && (
          <input
            type="color"
            className="pic-inspector__input"
            value={node.stroke}
            onChange={(e) => clearStrokePattern({ stroke: e.target.value })}
          />
        )}
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
      <div className="pic-inspector__row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="pic-inspector__label">3D</span>
          <span style={{ fontSize: 10, color: '#888' }}>{node.shadow ?? 0}</span>
        </div>
        <input
          type="range"
          min={0}
          max={20}
          step={1}
          value={node.shadow ?? 0}
          onChange={(e) => set('shadow', parseInt(e.target.value))}
          style={{ width: '100%', accentColor: '#4a9eff' }}
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
