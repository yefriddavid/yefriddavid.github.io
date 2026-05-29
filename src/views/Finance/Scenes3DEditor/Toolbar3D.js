import React from 'react'
import { SCENES3D_OBJECT_TYPES, SCENES3D_TRANSFORM_MODES } from 'src/constants/finance'

const Inspector = ({ obj, onChange }) => {
  if (!obj) return null
  const set = (key, val) => onChange({ ...obj, [key]: val })

  return (
    <div className="s3d-inspector">
      <div className="s3d-inspector__row">
        <span className="s3d-inspector__label">Color</span>
        <input type="color" className="s3d-inspector__input" value={obj.color} onChange={(e) => set('color', e.target.value)} />
      </div>
      <div className="s3d-inspector__row">
        <span className="s3d-inspector__label">Opacidad</span>
        <input
          type="number" className="s3d-inspector__input"
          min={0} max={1} step={0.05} value={obj.opacity ?? 1} style={{ width: 55 }}
          onChange={(e) => set('opacity', parseFloat(e.target.value))}
        />
      </div>
      <div className="s3d-inspector__row">
        <span className="s3d-inspector__label">Wireframe</span>
        <input type="checkbox" checked={obj.wireframe ?? false} onChange={(e) => set('wireframe', e.target.checked)} />
      </div>
      <div className="s3d-inspector__section">Posición</div>
      {['x', 'y', 'z'].map((axis, i) => (
        <div key={axis} className="s3d-inspector__row">
          <span className="s3d-inspector__label s3d-inspector__label--axis">{axis.toUpperCase()}</span>
          <input
            type="number" className="s3d-inspector__input" step={0.1} style={{ width: 65 }}
            value={Math.round((obj.position[i] ?? 0) * 100) / 100}
            onChange={(e) => {
              const pos = [...obj.position]
              pos[i] = parseFloat(e.target.value) || 0
              set('position', pos)
            }}
          />
        </div>
      ))}
      <div className="s3d-inspector__section">Rotación (rad)</div>
      {['x', 'y', 'z'].map((axis, i) => (
        <div key={axis} className="s3d-inspector__row">
          <span className="s3d-inspector__label s3d-inspector__label--axis">{axis.toUpperCase()}</span>
          <input
            type="number" className="s3d-inspector__input" step={0.05} style={{ width: 65 }}
            value={Math.round((obj.rotation[i] ?? 0) * 100) / 100}
            onChange={(e) => {
              const rot = [...obj.rotation]
              rot[i] = parseFloat(e.target.value) || 0
              set('rotation', rot)
            }}
          />
        </div>
      ))}
      <div className="s3d-inspector__section">Escala</div>
      {['x', 'y', 'z'].map((axis, i) => (
        <div key={axis} className="s3d-inspector__row">
          <span className="s3d-inspector__label s3d-inspector__label--axis">{axis.toUpperCase()}</span>
          <input
            type="number" className="s3d-inspector__input" min={0.01} step={0.1} style={{ width: 65 }}
            value={Math.round((obj.scale[i] ?? 1) * 100) / 100}
            onChange={(e) => {
              const sc = [...obj.scale]
              sc[i] = Math.max(0.01, parseFloat(e.target.value) || 1)
              set('scale', sc)
            }}
          />
        </div>
      ))}
    </div>
  )
}

const Toolbar3D = ({ transformMode, onTransformModeChange, onAddObject, selectedObj, onObjectChange }) => (
  <div className="s3d-toolbar">
    <div className="s3d-toolbar__section">
      <span className="s3d-toolbar__label">Primitivas</span>
      <div className="s3d-toolbar__tools">
        {SCENES3D_OBJECT_TYPES.map((t) => (
          <button
            key={t.key}
            className="s3d-toolbar__tool"
            title={`Añadir ${t.label}`}
            onClick={() => onAddObject(t.key)}
          >
            <span className="s3d-toolbar__tool-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>

    <div className="s3d-toolbar__divider" />

    <div className="s3d-toolbar__section">
      <span className="s3d-toolbar__label">Transformar</span>
      <div className="s3d-toolbar__modes">
        {SCENES3D_TRANSFORM_MODES.map((m) => (
          <button
            key={m.key}
            className={`s3d-toolbar__mode${transformMode === m.key ? ' s3d-toolbar__mode--active' : ''}`}
            title={`${m.label} (${m.shortcut})`}
            onClick={() => onTransformModeChange(m.key)}
          >
            <span className="s3d-toolbar__mode-key">{m.shortcut}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>
    </div>

    {selectedObj && (
      <>
        <div className="s3d-toolbar__divider" />
        <div className="s3d-toolbar__section">
          <span className="s3d-toolbar__label">Propiedades</span>
          <Inspector obj={selectedObj} onChange={onObjectChange} />
        </div>
      </>
    )}
  </div>
)

export default Toolbar3D
