import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CButton, CModal, CModalBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilCopy } from '@coreui/icons'
import StandardCard, { SC } from 'src/components/shared/StandardCard/Index'
import Spinner from 'src/components/shared/Spinner'
import * as actions from 'src/actions/finance/picturesActions'
import { PICTURES_UNITS_MAP } from 'src/constants/finance'

const Thumbnail = ({ src, canvas, onClick }) => {
  const u = PICTURES_UNITS_MAP[canvas?.unit] ?? PICTURES_UNITS_MAP.cm
  const w = (canvas?.width ?? 1) * u.pxPerUnit
  const h = (canvas?.height ?? 1) * u.pxPerUnit
  const THUMB_W = 96
  const THUMB_H = Math.round(THUMB_W * (h / w))
  return (
    <div
      onClick={src ? onClick : undefined}
      style={{ width: THUMB_W, height: THUMB_H, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: '#e9ecef', border: '1px solid #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: src ? 'zoom-in' : 'default' }}
    >
      {src
        ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }} />
        : <span style={{ fontSize: 20, opacity: 0.3 }}>🖼</span>
      }
    </div>
  )
}

const Pictures = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list, fetching, saving } = useSelector((s) => s.financePictures)
  const [preview, setPreview] = useState(null)
  const [renamingId, setRenamingId] = useState(null)
  const [renameDraft, setRenameDraft] = useState('')

  useEffect(() => {
    dispatch(actions.fetchRequest())
  }, [dispatch])

  const handleDelete = (row) => {
    if (window.confirm(`¿Eliminar "${row.name}"?`)) {
      dispatch(actions.deleteRequest({ id: row.id }))
    }
  }

  const startRename = (row) => {
    setRenamingId(row.id)
    setRenameDraft(row.name)
  }

  const commitRename = (row) => {
    const name = renameDraft.trim()
    if (name && name !== row.name) {
      dispatch(actions.updateRequest({ id: row.id, data: { ...row, name } }))
    }
    setRenamingId(null)
  }

  const handleDuplicate = (row) => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = row
    dispatch(actions.createRequest({ ...rest, name: `${row.name} (copia)` }))
  }

  const sizeLabel = (row) => {
    const u = PICTURES_UNITS_MAP[row.canvas?.unit] ?? PICTURES_UNITS_MAP.cm
    return `${row.canvas?.width ?? '?'} × ${row.canvas?.height ?? '?'} ${u.label}`
  }

  const fmtDate = (iso) => {
    if (!iso) return null
    return new Date(iso).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="pic-list">
      <div className="pic-list__header">
        <h5 className="pic-list__title">Pictures</h5>
        <CButton
          color="primary"
          size="sm"
          disabled={saving}
          onClick={() => navigate('/finance/pictures/new')}
        >
          <CIcon icon={cilPlus} className="me-1" />
          Nuevo cuadro
        </CButton>
      </div>

      {fetching ? (
        <Spinner mode="section" />
      ) : (
        <StandardCard
          data={list ?? []}
          keyExpr="id"
          emptyText="Sin cuadros todavía."
          renderTitle={(r) => (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Thumbnail src={r.thumbnail} canvas={r.canvas} onClick={() => setPreview(r.thumbnail)} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 2 }}>
                {renamingId === r.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #4a9eff', borderRadius: 6, boxShadow: '0 0 0 3px rgba(74,158,255,0.15)', overflow: 'hidden', background: '#f8fbff' }} onClick={(e) => e.stopPropagation()}>
                    <input
                      autoFocus
                      value={renameDraft}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(r)
                        if (e.key === 'Escape') setRenamingId(null)
                      }}
                      style={{ fontWeight: 600, fontSize: 13, border: 'none', padding: '4px 10px', outline: 'none', flex: 1, background: 'transparent', color: '#1a1a2e' }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); commitRename(r) }}
                      style={{ background: 'linear-gradient(135deg,#4a9eff,#2d7dd2)', border: 'none', borderLeft: '1.5px solid #4a9eff', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '5px 14px', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}
                    >
                      Guardar
                    </button>
                  </div>
                ) : (
                  <span
                    style={{ fontWeight: 600, borderBottom: '1px dashed #adb5bd', cursor: 'text', display: 'inline-block' }}
                    onDoubleClick={(e) => { e.stopPropagation(); startRename(r) }}
                  >
                    {r.name}
                  </span>
                )}
                <span style={{ fontSize: 12, color: '#6c757d' }}>
                  <span className={SC.label}>Tamaño </span>{sizeLabel(r)}
                  {r.nodes?.length > 0 && <>{' · '}<span className={SC.label}>Figs </span>{r.nodes.length}</>}
                </span>
                {r.createdAt && (
                  <span style={{ fontSize: 11, color: '#adb5bd' }}>
                    <span className={SC.label}>Creado </span>{fmtDate(r.createdAt)}
                  </span>
                )}
                {r.updatedAt && (
                  <span style={{ fontSize: 11, color: '#adb5bd' }}>
                    <span className={SC.label}>Editado </span>{fmtDate(r.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          )}
          renderRows={() => []}
          renderActions={(r) => [
            { icon: cilPencil, color: 'primary', title: 'Abrir editor', onClick: () => navigate(`/finance/pictures/${r.id}`) },
            { icon: cilCopy,   color: 'info',    title: 'Duplicar',     onClick: () => handleDuplicate(r) },
            { icon: cilTrash,  color: 'danger',  title: 'Eliminar',     onClick: () => handleDelete(r) },
          ]}
        />
      )}

      <CModal visible={!!preview} onClose={() => setPreview(null)} size="xl" alignment="center">
        <CModalBody style={{ padding: 8, background: '#1a1a1a', textAlign: 'center' }}>
          {preview && (
            <img
              src={preview}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 4 }}
            />
          )}
        </CModalBody>
      </CModal>
    </div>
  )
}

export default Pictures
