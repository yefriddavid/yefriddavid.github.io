import React from 'react'
import { PICTURES_SHAPE_TOOLS } from 'src/constants/finance'

const SHAPE_ICONS = {
  select: '↖', rect: '▬', roundRect: '▢', circle: '○', triangle: '△',
  polygon: '⬡', star: '★', line: '─', vline: '│', arrow: '→',
  elbow90: '⌐', elbowRound: '⌒', text: 'T', eraser: '✕',
}

const Inspector = ({ node, onChange }) => {
  if (!node) return null

  const set = (key, val) => onChange({ ...node, [key]: val })

  return (
    <div className="pic-inspector">
      <div className="pic-inspector__row">
        <span className="pic-inspector__label">Relleno</span>
        <input
          type="color"
          className="pic-inspector__input"
          value={node.fill}
          onChange={(e) => set('fill', e.target.value)}
        />
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
      {node.type === 'text' && (
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

const Toolbar = ({ tool, onToolChange, selectedNode, onNodeChange }) => (
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

    {selectedNode && (
      <>
        <div className="pic-toolbar__divider" />
        <div className="pic-toolbar__section">
          <span className="pic-toolbar__section-label">Propiedades</span>
          <Inspector node={selectedNode} onChange={onNodeChange} />
        </div>
      </>
    )}
  </div>
)

export default Toolbar
