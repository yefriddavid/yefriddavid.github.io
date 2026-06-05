import { CButton, CFormInput } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'
import { GRID_PRESETS } from 'src/constants/inmobiliaria'
import LengthInput from './LengthInput'

const EditorTopbar = ({
  planName,
  onNameChange,
  onBack,
  gridVisible,
  onToggleGrid,
  gridSpacingPx,
  onGridSpacingChange,
  selectedWall,
  wallLengthNum,
  onWallLengthChange,
  onSnapWall,
  selectedLabel,
  selectedId,
  onLabelUpdate,
  selectedDoor,
  doorWidthNum,
  onDoorWidthChange,
  selectedWindow,
  windowWidthNum,
  onWindowWidthChange,
  selectedRuler,
  rulerLengthNum,
  onRulerLengthChange,
  onSnapRuler,
  onBringToFront,
  onSendToBack,
  selectedIds,
  onEraseMultiple,
  selectedIsFlippable,
  onFlipElement,
  onRotate,
  editorRef,
  saving,
  onSave,
}) => (
  <div className="pe-editor__topbar">
    <CButton color="secondary" variant="outline" size="sm" onClick={onBack}>
      ← Volver
    </CButton>

    <CFormInput
      className="pe-editor__name-input"
      value={planName}
      onChange={(e) => onNameChange(e.target.value)}
      placeholder="Nombre del plano"
      size="sm"
    />

    <div className="pe-editor__topbar-info">
      <span>Snap: 0.5 m</span>
      <span className="pe-editor__topbar-sep" />
      <button
        className={`pe-editor__grid-btn${gridVisible ? '' : ' pe-editor__grid-btn--off'}`}
        title={gridVisible ? 'Ocultar cuadrícula' : 'Mostrar cuadrícula'}
        onClick={onToggleGrid}
      >
        ⊞
      </button>
      <select
        className="form-select form-select-sm pe-editor__grid-select"
        value={gridSpacingPx}
        onChange={(e) => onGridSpacingChange(Number(e.target.value))}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {GRID_PRESETS.map((p) => (
          <option key={p.px} value={p.px}>
            {p.label}
          </option>
        ))}
      </select>

      {selectedWall && (
        <>
          <span style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>Largo:</span>
          <LengthInput
            key={selectedWall.id}
            value={wallLengthNum}
            onCommit={(v) => onWallLengthChange(selectedWall.id, v)}
          />
          <span style={{ fontSize: 12, color: '#555' }}>m</span>
          <CButton size="sm" variant="outline" color="secondary" title="Alinear horizontal" onClick={() => onSnapWall(selectedWall.id, 'h')}>↔</CButton>
          <CButton size="sm" variant="outline" color="secondary" title="Alinear vertical" onClick={() => onSnapWall(selectedWall.id, 'v')}>↕</CButton>
        </>
      )}

      {selectedLabel && (
        <>
          <CFormInput
            size="sm"
            style={{ width: 180 }}
            value={selectedLabel.text}
            onChange={(e) => onLabelUpdate(selectedId, { text: e.target.value })}
            placeholder="Texto"
          />
          <select
            className="form-select form-select-sm"
            style={{ width: 85 }}
            value={selectedLabel.fontSize ?? 14}
            onChange={(e) => onLabelUpdate(selectedId, { fontSize: Number(e.target.value) })}
          >
            {[10, 12, 14, 16, 20, 24, 32, 40, 48].map((s) => (
              <option key={s} value={s}>{s}px</option>
            ))}
          </select>
          <LengthInput
            key={selectedLabel.id + '-rot'}
            value={selectedLabel.rotation ?? 0}
            min={-360}
            onCommit={(v) => onLabelUpdate(selectedId, { rotation: v % 360 })}
          />
          <span style={{ fontSize: 12, color: '#555' }}>°</span>
        </>
      )}

      {selectedDoor && (
        <>
          <span style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>Ancho:</span>
          <LengthInput
            key={selectedDoor.id}
            value={doorWidthNum}
            min={0.2}
            onCommit={(v) => onDoorWidthChange(selectedDoor.id, v)}
          />
          <span style={{ fontSize: 12, color: '#555' }}>m</span>
        </>
      )}

      {selectedWindow && (
        <>
          <span style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>Ancho:</span>
          <LengthInput
            key={selectedWindow.id}
            value={windowWidthNum}
            min={0.2}
            onCommit={(v) => onWindowWidthChange(selectedWindow.id, v)}
          />
          <span style={{ fontSize: 12, color: '#555' }}>m</span>
        </>
      )}

      {selectedRuler && (
        <>
          <span style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>Cota:</span>
          <LengthInput
            key={selectedRuler.id}
            value={rulerLengthNum}
            onCommit={(v) => onRulerLengthChange(selectedRuler.id, v)}
          />
          <span style={{ fontSize: 12, color: '#555' }}>m</span>
          <CButton size="sm" variant="outline" color="secondary" title="Alinear horizontal" onClick={() => onSnapRuler(selectedRuler.id, 'h')}>↔</CButton>
          <CButton size="sm" variant="outline" color="secondary" title="Alinear vertical" onClick={() => onSnapRuler(selectedRuler.id, 'v')}>↕</CButton>
        </>
      )}

      {selectedId && (
        <>
          <CButton color="secondary" variant="outline" size="sm" title="Traer al frente" onClick={() => onBringToFront(selectedId)}>
            ▲ Frente
          </CButton>
          <CButton color="secondary" variant="outline" size="sm" title="Enviar al fondo" onClick={() => onSendToBack(selectedId)}>
            ▼ Fondo
          </CButton>
        </>
      )}

      {selectedIds.length > 0 && (
        <CButton color="danger" variant="ghost" size="sm" onClick={() => onEraseMultiple(selectedIds)}>
          🗑 {selectedIds.length > 1 ? `Borrar ${selectedIds.length}` : 'Borrar'}
        </CButton>
      )}

      {selectedIsFlippable && (
        <>
          <CButton color="secondary" variant="outline" size="sm" title="Voltear horizontalmente" onClick={() => onFlipElement(selectedId, 'scaleX')}>
            ↔ Voltear
          </CButton>
          <CButton color="secondary" variant="outline" size="sm" title="Voltear verticalmente" onClick={() => onFlipElement(selectedId, 'scaleY')}>
            ↕ Voltear
          </CButton>
          <CButton color="secondary" variant="outline" size="sm" title="Rotar 90°" onClick={() => onRotate(selectedId, 90)}>
            ↻ 90°
          </CButton>
        </>
      )}
    </div>

    <CButton color="secondary" variant="outline" size="sm" onClick={() => editorRef.current?.exportPdf(planName)}>
      🖨 PDF
    </CButton>
    <CButton color="secondary" variant="outline" size="sm" onClick={() => editorRef.current?.downloadPng(planName)}>
      🖼 PNG
    </CButton>
    <CButton color="primary" size="sm" onClick={onSave} disabled={saving}>
      {saving ? <Spinner size="sm" /> : '💾 Guardar'}
    </CButton>
  </div>
)

export default EditorTopbar
