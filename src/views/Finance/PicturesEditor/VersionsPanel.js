import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CModal, CModalHeader, CModalBody, CModalTitle } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/finance/pictureVersionsActions'
import * as pictureActions from 'src/actions/finance/picturesActions'

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

const VersionsPanel = ({ visible, onClose, pictureId, pictureName, canvas, nodes, groups, thumbnail, onRestore }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list, loading, saving } = useSelector((s) => s.financePictureVersions)
  const [versionName, setVersionName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (visible && pictureId) {
      dispatch(actions.fetchRequest({ pictureId }))
    }
    if (!visible) dispatch(actions.clearVersions())
  }, [visible, pictureId, dispatch])

  useEffect(() => {
    if (visible) setTimeout(() => inputRef.current?.focus(), 100)
  }, [visible])

  const handleCreate = () => {
    const name = versionName.trim() || `v${(list?.length ?? 0) + 1}`
    dispatch(actions.createRequest({
      pictureId,
      data: { name, canvas, nodes, groups, thumbnail: thumbnail ?? null },
    }))
    setVersionName('')
  }

  const handleRestore = (version) => {
    if (!window.confirm(`¿Restaurar la versión "${version.name}"? Los cambios actuales sin guardar se perderán.`)) return
    onRestore({ canvas: version.canvas, nodes: version.nodes, groups: version.groups })
    onClose()
  }

  const handleFork = (version) => {
    const name = `${pictureName} — ${version.name}`
    dispatch(pictureActions.createRequest({
      name,
      canvas: version.canvas,
      nodes: version.nodes,
      groups: version.groups,
      thumbnail: version.thumbnail ?? null,
      autosave: false,
    }))
    onClose()
    // navigate to new picture after creation — handled by the existing effect in PicturesEditor
  }

  const handleDelete = (version) => {
    if (!window.confirm(`¿Eliminar la versión "${version.name}"?`)) return
    dispatch(actions.deleteRequest({ pictureId, id: version.id }))
  }

  return (
    <CModal visible={visible} onClose={onClose} size="lg" alignment="center" scrollable>
      <CModalHeader>
        <CModalTitle>Versiones — {pictureName}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {/* Create version */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input
            ref={inputRef}
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            placeholder="Nombre de la versión (ej: v1 - borrador)"
            style={{ flex: 1, padding: '6px 10px', border: '1px solid #ced4da', borderRadius: 6, fontSize: 13 }}
          />
          <button
            onClick={handleCreate}
            disabled={saving}
            style={{ background: '#3a6fd8', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: '6px 16px', whiteSpace: 'nowrap' }}
          >
            {saving ? '…' : '+ Crear versión'}
          </button>
        </div>

        {/* List */}
        {loading && <Spinner mode="section" />}
        {!loading && list?.length === 0 && (
          <p style={{ color: '#6c757d', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            Sin versiones todavía. Crea la primera arriba.
          </p>
        )}
        {!loading && list?.map((v) => (
          <div key={v.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #dee2e6' }}>
            {/* Thumbnail */}
            <div style={{ width: 80, height: 55, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: '#f0f0f0', border: '1px solid #dee2e6' }}>
              {v.thumbnail
                ? <img src={v.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 20, opacity: 0.3 }}>🖼</span>
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{v.name}</div>
              <div style={{ fontSize: 11, color: '#6c757d' }}>{fmtDate(v.createdAt)}</div>
              <div style={{ fontSize: 11, color: '#adb5bd' }}>{v.nodes?.length ?? 0} figuras</div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => handleRestore(v)}
                title="Restaurar esta versión en el canvas actual"
                style={{ background: '#198754', border: 'none', borderRadius: 5, color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: '4px 10px' }}
              >
                Restaurar
              </button>
              <button
                onClick={() => handleFork(v)}
                title="Crear un nuevo cuadro basado en esta versión"
                style={{ background: '#0d6efd', border: 'none', borderRadius: 5, color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: '4px 10px' }}
              >
                Bifurcar
              </button>
              <button
                onClick={() => handleDelete(v)}
                title="Eliminar versión"
                style={{ background: 'transparent', border: '1px solid #dee2e6', borderRadius: 5, color: '#dc3545', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: '4px 10px' }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </CModalBody>
    </CModal>
  )
}

export default VersionsPanel
