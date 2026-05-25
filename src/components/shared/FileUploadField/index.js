import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { processAttachmentFile } from 'src/utils/fileHelpers'
import Spinner from 'src/components/shared/Spinner'

/**
 * A shared component for file uploads with preview/clear functionality.
 * Handles base64 conversion via processAttachmentFile.
 */
const FileUploadField = ({ value, name, onChange, label = 'archivo' }) => {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProcessing(true)
    setError('')
    try {
      const data = await processAttachmentFile(file)
      onChange(data, file.name)
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleClear = (e) => {
    e.preventDefault()
    onChange(null, '')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handlePaste = async () => {
    setError('')
    try {
      const items = await navigator.clipboard.read()
      const imageItem = items.find((item) => item.types.some((t) => t.startsWith('image/')))
      if (!imageItem) {
        setError('No hay imagen en el portapapeles.')
        return
      }
      const imageType = imageItem.types.find((t) => t.startsWith('image/'))
      const blob = await imageItem.getType(imageType)
      const file = new File([blob], 'clipboard.png', { type: imageType })
      setProcessing(true)
      try {
        const data = await processAttachmentFile(file)
        onChange(data, 'clipboard.png')
      } catch (err) {
        setError(`Error: ${err.message}`)
      } finally {
        setProcessing(false)
      }
    } catch {
      setError('Sin permiso para leer el portapapeles.')
    }
  }

  return (
    <div className="file-upload-field">
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {!value && !processing && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: '2px dashed #dee2e6',
              background: '#fafafa',
              fontSize: 13,
              color: '#6c757d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span>📎</span> Adjuntar {label}
          </button>
          <button
            type="button"
            onClick={handlePaste}
            title="Pegar imagen del portapapeles"
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              border: '2px dashed #dee2e6',
              background: '#fafafa',
              fontSize: 13,
              color: '#6c757d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            <span>📋</span> Pegar
          </button>
        </div>
      )}

      {processing && (
        <div
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 10,
            marginBottom: 8,
            background: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontSize: 13,
            color: '#6c757d',
          }}
        >
          <Spinner size="sm" color="secondary" />
          Procesando...
        </div>
      )}

      {value && !processing && (
        <div
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 10,
            marginBottom: 8,
            background: '#e7f5ff',
            border: '1px solid #a5d8ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 16 }}>📄</span>
            <span
              style={{
                fontSize: 13,
                color: '#1864ab',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {name || 'Archivo seleccionado'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              color: '#c92a2a',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            Quitar
          </button>
        </div>
      )}

      {error && (
        <div style={{ color: '#e03131', fontSize: 11, marginTop: -4, marginBottom: 8 }}>{error}</div>
      )}
    </div>
  )
}

FileUploadField.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
}

export default FileUploadField
