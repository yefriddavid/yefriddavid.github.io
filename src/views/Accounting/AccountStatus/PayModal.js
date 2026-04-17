import React, { useState, useRef } from 'react'
import { CSpinner } from '@coreui/react'
import { processAttachmentFile } from 'src/utils/fileHelpers'
import { fieldLabel, fieldInput } from './helpers'

export default function PayModal({ account, year, month, saving, onSave, onClose }) {
  const defaultDate = (() => {
    const lastDay = new Date(year, month, 0).getDate()
    const day = Math.min(account.maxDatePay || 15, lastDay)
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  })()

  const [amount, setAmount] = useState(account.defaultValue || '')
  const [date, setDate] = useState(defaultDate)
  const [note, setNote] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [attachName, setAttachName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError('')
    setProcessing(true)
    try {
      const data = await processAttachmentFile(file)
      setAttachment(data)
      setAttachName(file.name)
    } catch (err) {
      setFileError(`Error procesando archivo: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleSave = () => {
    if (!amount || !date) return
    const payload = {
      type: account.type === 'Outcoming' ? 'expense' : 'income',
      category: account.category || '',
      description: account.name,
      amount: Number(String(amount).replace(/\D/g, '')),
      date,
      accountMonth: `${year}-${String(month).padStart(2, '0')}`,
      accountMasterId: account.id,
    }
    if (note.trim()) payload.note = note.trim()
    if (attachment) {
      payload.attachment = attachment
      payload.attachmentName = attachName
    }
    onSave(payload)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 540,
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px 36px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: '#dee2e6',
            margin: '0 auto 20px',
          }}
        />

        <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
          Registrar pago
        </div>
        <div
          style={{
            fontSize: 13,
            color: '#6c757d',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {account.important && <span style={{ color: '#e03131', fontSize: 13 }}>★</span>}
          {account.name}
        </div>

        {/* Amount */}
        <label style={fieldLabel}>MONTO (COP)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          min="0"
          autoFocus
          style={{
            ...fieldInput,
            fontSize: 28,
            fontWeight: 700,
            color: '#1e3a5f',
            marginBottom: 20,
          }}
        />

        {/* Date */}
        <label style={fieldLabel}>FECHA</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ ...fieldInput, fontSize: 16, marginBottom: 20 }}
        />

        {/* Note */}
        <label style={fieldLabel}>NOTA (opcional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Agregar una nota..."
          rows={2}
          style={{
            ...fieldInput,
            fontSize: 14,
            resize: 'none',
            marginBottom: 20,
            borderBottom: '2px solid #dee2e6',
            fontFamily: 'inherit',
          }}
        />

        {/* Attachment */}
        <label style={fieldLabel}>ADJUNTO (opcional)</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: 'none' }}
          onChange={handleFile}
        />

        {!attachment && !processing && (
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              marginBottom: 8,
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
            <span style={{ fontSize: 18 }}>📎</span> Adjuntar imagen o PDF
          </button>
        )}

        {processing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 0',
              marginBottom: 8,
            }}
          >
            <CSpinner size="sm" />
            <span style={{ fontSize: 13, color: '#6c757d' }}>Procesando archivo…</span>
          </div>
        )}

        {fileError && (
          <div style={{ fontSize: 12, color: '#e03131', marginBottom: 8 }}>{fileError}</div>
        )}

        {attachment && (
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <img
              src={attachment}
              alt="adjunto"
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid #dee2e6',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                gap: 6,
              }}
            >
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cambiar
              </button>
              <button
                onClick={() => {
                  setAttachment(null)
                  setAttachName('')
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'rgba(220,53,69,0.85)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Quitar
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#6c757d', marginTop: 4, paddingLeft: 2 }}>
              {attachName}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 12,
              border: '1px solid #dee2e6',
              background: '#fff',
              fontSize: 15,
              fontWeight: 600,
              color: '#6c757d',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !amount || processing}
            style={{
              flex: 2,
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: !amount || processing ? '#e9ecef' : '#1e3a5f',
              fontSize: 15,
              fontWeight: 700,
              color: !amount || processing ? '#adb5bd' : '#fff',
              cursor: !amount || processing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {saving ? (
              <CSpinner
                size="sm"
                style={{ borderColor: '#fff', borderRightColor: 'transparent' }}
              />
            ) : (
              'Guardar pago'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
