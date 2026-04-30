import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilX, cilPencil, cilFullscreen } from '@coreui/icons'
import * as taxiPeriodAttachmentActions from 'src/actions/taxi/taxiPeriodAttachmentActions'
import { processAttachmentFile } from 'src/utils/fileHelpers'

const PeriodAttachments = ({ period }) => {
  const dispatch = useDispatch()
  const { attachments, saving } = useSelector((s) => s.taxiPeriodAttachment)

  const [pendingImage, setPendingImage] = useState(null)
  const [pendingDescription, setPendingDescription] = useState('')
  const [converting, setConverting] = useState(false)
  const [fileError, setFileError] = useState(null)
  const [viewImage, setViewImage] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editingDescription, setEditingDescription] = useState('')
  const inputRef = useRef()

  const periodStr = `${period.year}-${String(period.month).padStart(2, '0')}`

  const handleFile = async (file) => {
    if (!file) return
    setFileError(null)
    setConverting(true)
    try {
      const base64 = await processAttachmentFile(file)
      setPendingImage(base64)
      setPendingDescription('')
    } catch (e) {
      setFileError(e.message)
    } finally {
      setConverting(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const handleSave = () => {
    if (!pendingImage) return
    dispatch(
      taxiPeriodAttachmentActions.createRequest({
        period: periodStr,
        image: pendingImage,
        description: pendingDescription.trim(),
      }),
    )
    setPendingImage(null)
    setPendingDescription('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleCancel = () => {
    setPendingImage(null)
    setPendingDescription('')
    setFileError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este soporte?')) return
    dispatch(taxiPeriodAttachmentActions.deleteRequest({ id }))
  }

  const handleEditSave = (id) => {
    dispatch(
      taxiPeriodAttachmentActions.updateRequest({ id, description: editingDescription.trim() }),
    )
    setEditingId(null)
  }

  return (
    <>
      <CModal visible={!!viewImage} onClose={() => setViewImage(null)} size="xl" alignment="center">
        <CModalHeader>
          <CModalTitle style={{ fontSize: 13 }}>{viewImage?.description || 'Soporte'}</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ textAlign: 'center', padding: 8 }}>
          {viewImage && (
            <img
              src={viewImage.image}
              alt={viewImage.description || 'soporte'}
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 4 }}
            />
          )}
        </CModalBody>
      </CModal>

      <CCard className="mt-3">
        <CCardHeader>
          <strong style={{ fontSize: 13 }}>Soportes del período</strong>
          <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginLeft: 8 }}>
            {period.month}/{period.year}
          </span>
          <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginLeft: 8 }}>
            ({attachments.length})
          </span>
        </CCardHeader>
        <CCardBody>
          {attachments.length === 0 && !pendingImage && (
            <div style={{ fontSize: 13, color: 'var(--cui-secondary-color)', marginBottom: 12 }}>
              Sin soportes para este período.
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
              marginBottom: attachments.length > 0 ? 16 : 0,
            }}
          >
            {attachments.map((att) => (
              <div
                key={att.id}
                style={{
                  border: '1px solid var(--cui-border-color)',
                  borderRadius: 6,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={() => setViewImage(att)}
                >
                  <img
                    src={att.image}
                    alt={att.description || 'soporte'}
                    style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'rgba(0,0,0,0.45)',
                      borderRadius: 4,
                      padding: '2px 4px',
                    }}
                  >
                    <CIcon icon={cilFullscreen} style={{ color: '#fff', width: 14, height: 14 }} />
                  </div>
                </div>

                <div style={{ padding: '6px 8px', flex: 1 }}>
                  {editingId === att.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <input
                        autoFocus
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        style={{
                          fontSize: 12,
                          border: '1px solid var(--cui-border-color)',
                          borderRadius: 4,
                          padding: '3px 6px',
                          width: '100%',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave(att.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                      />
                      <div style={{ display: 'flex', gap: 4 }}>
                        <CButton
                          size="sm"
                          color="primary"
                          style={{ fontSize: 11, padding: '2px 8px' }}
                          onClick={() => handleEditSave(att.id)}
                          disabled={saving}
                        >
                          Guardar
                        </CButton>
                        <CButton
                          size="sm"
                          color="secondary"
                          variant="outline"
                          style={{ fontSize: 11, padding: '2px 8px' }}
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </CButton>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                      <span
                        style={{
                          fontSize: 11,
                          color: att.description
                            ? 'var(--cui-body-color)'
                            : 'var(--cui-secondary-color)',
                          flex: 1,
                          wordBreak: 'break-word',
                        }}
                      >
                        {att.description || 'Sin descripción'}
                      </span>
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="ghost"
                        style={{ padding: '1px 4px', flexShrink: 0 }}
                        onClick={() => {
                          setEditingId(att.id)
                          setEditingDescription(att.description)
                        }}
                      >
                        <CIcon icon={cilPencil} style={{ width: 12, height: 12 }} />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="ghost"
                        style={{ padding: '1px 4px', flexShrink: 0 }}
                        onClick={() => handleDelete(att.id)}
                        disabled={saving}
                      >
                        <CIcon icon={cilTrash} style={{ width: 12, height: 12 }} />
                      </CButton>
                    </div>
                  )}
                  {att.createdAt && (
                    <div
                      style={{ fontSize: 10, color: 'var(--cui-secondary-color)', marginTop: 2 }}
                    >
                      {new Date(att.createdAt).toLocaleString('es-CO')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pendingImage ? (
            <div
              style={{
                border: '1px solid var(--cui-border-color)',
                borderRadius: 6,
                padding: 12,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <img
                src={pendingImage}
                alt="preview"
                style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 4 }}
              />
              <div
                style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <input
                  autoFocus
                  placeholder="Descripción (opcional)"
                  value={pendingDescription}
                  onChange={(e) => setPendingDescription(e.target.value)}
                  style={{
                    fontSize: 13,
                    border: '1px solid var(--cui-border-color)',
                    borderRadius: 4,
                    padding: '6px 8px',
                    width: '100%',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave()
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <CButton color="primary" size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? <CSpinner size="sm" /> : 'Guardar soporte'}
                  </CButton>
                  <CButton color="secondary" variant="outline" size="sm" onClick={handleCancel}>
                    <CIcon icon={cilX} size="sm" />
                  </CButton>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{
                border: '2px dashed var(--cui-border-color)',
                borderRadius: 6,
                padding: '16px 12px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onClick={() => inputRef.current?.click()}
            >
              {converting ? (
                <CSpinner size="sm" color="primary" />
              ) : (
                <>
                  <CIcon icon={cilPlus} style={{ marginRight: 6, opacity: 0.5 }} />
                  <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>
                    Agregar soporte — arrastra, pega o haz clic
                  </span>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          )}

          {fileError && (
            <div style={{ fontSize: 12, color: '#e03131', marginTop: 8 }}>{fileError}</div>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default PeriodAttachments
