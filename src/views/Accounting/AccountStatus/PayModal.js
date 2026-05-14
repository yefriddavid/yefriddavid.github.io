import React, { useState, useRef } from 'react'
import { CSpinner } from '@coreui/react'
import { useForm } from 'react-hook-form'
import { fieldLabel, fieldInput } from './helpers'
import FileUploadField from 'src/components/shared/FileUploadField'

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', display: 'block', marginBottom: 4 }}>
      {err.message}
    </span>
  ) : null

export default function PayModal({ account, year, month, saving, onSave, onClose }) {
  const defaultDate = (() => {
    const lastDay = new Date(year, month, 0).getDate()
    const day = Math.min(account.maxDatePay || 15, lastDay)
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  })()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: account.defaultValue || '',
      date: defaultDate,
      note: '',
    },
  })

  const amount = watch('amount')

  const [attachment, setAttachment] = useState(null)
  const [attachName, setAttachName] = useState('')

  const onSubmit = (data) => {
    const payload = {
      type: account.type === 'Outcoming' ? 'expense' : 'income',
      category: account.category || '',
      description: account.name,
      amount: Number(String(data.amount).replace(/\D/g, '')),
      date: data.date,
      accountMonth: `${year}-${String(month).padStart(2, '0')}`,
      accountMasterId: account.id,
    }
    if (data.note?.trim()) payload.note = data.note.trim()
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
          placeholder="0"
          min="0"
          autoFocus
          style={{
            ...fieldInput,
            fontSize: 28,
            fontWeight: 700,
            color: '#1e3a5f',
            marginBottom: 4,
          }}
          {...register('amount', { required: 'El monto es obligatorio' })}
        />
        {fieldError(errors.amount)}
        <div style={{ marginBottom: 16 }} />

        {/* Date */}
        <label style={fieldLabel}>FECHA</label>
        <input
          type="date"
          style={{ ...fieldInput, fontSize: 16, marginBottom: 4 }}
          {...register('date', { required: 'La fecha es obligatoria' })}
        />
        {fieldError(errors.date)}
        <div style={{ marginBottom: 16 }} />

        {/* Note */}
        <label style={fieldLabel}>NOTA (opcional)</label>
        <textarea
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
          {...register('note')}
        />

        {/* Attachment */}
        <label style={fieldLabel}>ADJUNTO (opcional)</label>
        <FileUploadField
          value={attachment}
          name={attachName}
          label="imagen o PDF"
          onChange={(data, name) => {
            setAttachment(data)
            setAttachName(name)
          }}
        />

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
            onClick={handleSubmit(onSubmit)}
            disabled={saving || saving || !amount}
            style={{
              flex: 2,
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: saving ? '#e9ecef' : '#1e3a5f',
              fontSize: 15,
              fontWeight: 700,
              color: saving ? '#adb5bd' : '#fff',
              cursor: saving ? 'not-allowed' : 'pointer',
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
