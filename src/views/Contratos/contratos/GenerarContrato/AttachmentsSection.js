import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import * as contractAttachmentActions from 'src/actions/contratos/contractAttachmentActions'
import { IcoDoc, IcoSpinner, IcoTrash, IcoDownload, IcoShare, IcoClose } from './icons'

export default function AttachmentsSection({ contractId, attachments, saving, fetching, onAttachFiles }) {
  const dispatch = useDispatch()
  const [attachDragOver, setAttachDragOver] = useState(false)
  const [deletingAttachId, setDeletingAttachId] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const attachInputRef = useRef(null)

  return (
    <>
      <section className="c-card" id="sec-adjuntos">
        <div className="c-card-header">
          <div className="c-card-icon">
            <IcoDoc />
          </div>
          <h2 className="c-card-title">Adjuntos</h2>
        </div>

        <div
          className={`c-attach-zone${attachDragOver ? ' drag-over' : ''}`}
          onClick={() => attachInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setAttachDragOver(true)
          }}
          onDragLeave={() => setAttachDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setAttachDragOver(false)
            onAttachFiles(e.dataTransfer.files)
          }}
        >
          {saving ? (
            <IcoSpinner />
          ) : (
            <>
              <span className="c-attach-zone__icon">📎</span>
              <span className="c-attach-zone__label">
                Arrastra imágenes o PDF aquí, o <u>haz clic</u> para seleccionar
              </span>
              <span className="c-attach-zone__hint">JPG · PNG · PDF — máx. 5 MB</span>
            </>
          )}
          <input
            ref={attachInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => onAttachFiles(e.target.files)}
          />
        </div>

        {fetching ? (
          <div className="c-attach-loading">
            <IcoSpinner />
          </div>
        ) : attachments.length === 0 ? (
          <p className="c-attach-empty">Sin adjuntos para este contrato.</p>
        ) : (
          <div className="c-attach-list">
            {attachments.map((att) => (
              <div key={att.id} className="c-attach-item">
                <img
                  src={att.data}
                  alt={att.filename}
                  className="c-attach-thumb"
                  onClick={() => setLightbox({ src: att.data, filename: att.filename })}
                />
                <span className="c-attach-name" title={att.filename}>
                  {att.filename}
                </span>
                <button
                  type="button"
                  className="c-attach-delete"
                  title="Eliminar adjunto"
                  disabled={deletingAttachId === att.id}
                  onClick={() => {
                    setDeletingAttachId(att.id)
                    dispatch(contractAttachmentActions.deactivateRequest({ id: att.id }))
                  }}
                >
                  {deletingAttachId === att.id ? <IcoSpinner /> : <IcoTrash />}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {lightbox && (
        <div className="c-overlay c-overlay--lightbox" onClick={() => setLightbox(null)}>
          <div className="c-lightbox" onClick={(e) => e.stopPropagation()}>
            <div className="c-lightbox-topbar">
              <span className="c-lightbox-filename">{lightbox.filename}</span>
              <div className="c-lightbox-actions">
                <a
                  href={lightbox.src}
                  download={lightbox.filename}
                  className="c-lightbox-btn"
                  title="Descargar"
                >
                  <IcoDownload />
                </a>
                <button
                  type="button"
                  className="c-lightbox-btn"
                  title="Compartir"
                  onClick={async () => {
                    try {
                      const res = await fetch(lightbox.src)
                      const blob = await res.blob()
                      const file = new File([blob], lightbox.filename, { type: blob.type })
                      if (navigator.canShare?.({ files: [file] })) {
                        await navigator.share({ files: [file], title: lightbox.filename })
                      } else {
                        const a = document.createElement('a')
                        a.href = lightbox.src
                        a.download = lightbox.filename
                        a.click()
                      }
                    } catch (_) {}
                  }}
                >
                  <IcoShare />
                </button>
                <button
                  type="button"
                  className="c-lightbox-btn"
                  title="Cerrar"
                  onClick={() => setLightbox(null)}
                >
                  <IcoClose />
                </button>
              </div>
            </div>
            <div className="c-lightbox-body">
              <img src={lightbox.src} alt={lightbox.filename} className="c-lightbox-img" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
