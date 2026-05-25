import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { ACCOUNT_CATEGORIES } from 'src/constants/cashFlow'
import { uploadImage } from 'src/services/facade/imageFacade'
import { fieldLabel, fieldInput } from './helpers'
import Spinner from 'src/components/shared/Spinner'

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 11, color: '#b91c1c', display: 'block', marginBottom: 4 }}>
      {err.message}
    </span>
  ) : null

export default function AdHocExpenseModal({
  year,
  month,
  defaultType,
  saving,
  onSave,
  onClose,
  initialData,
}) {
  const isEditing = !!initialData
  const monthStr = `${year}-${String(month).padStart(2, '0')}`
  const defaultDate = `${year}-${String(month).padStart(2, '0')}-01`

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: initialData?.description ?? '',
      amount: initialData?.amount ?? '',
      date: initialData?.date ?? defaultDate,
      category: initialData?.category ?? '',
      note: initialData?.note ?? '',
      type: initialData?.type ?? (defaultType === 'Incoming' ? 'income' : 'expense'),
    },
  })

  const type = watch('type')
  const description = watch('description')
  const amount = watch('amount')

  const [attachment, setAttachment] = useState(initialData?.attachment ?? null)
  const [attachName, setAttachName] = useState(initialData?.attachmentName ?? '')
  const [processing, setProcessing] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError('')
    setProcessing(true)
    try {
      const data = await uploadImage(file)
      setAttachment(data)
      setAttachName(file.name)
    } catch (err) {
      setFileError(`Error procesando archivo: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const onSubmit = ({ description, amount, date, category, note, type: t }) => {
    const payload = {
      ...(isEditing && { id: initialData.id }),
      type: t,
      category: category || '',
      description: description.trim(),
      amount: Number(String(amount).replace(/\D/g, '')),
      date,
      accountMonth: isEditing ? initialData.accountMonth : monthStr,
      note: note.trim() || null,
      attachment: attachment || null,
      attachmentName: attachment ? attachName : null,
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
          {isEditing ? 'Editar movimiento' : 'Agregar movimiento del período'}
        </div>
        <div style={{ fontSize: 13, color: '#6c757d', marginBottom: 24 }}>
          {isEditing
            ? 'Modifica los datos del movimiento'
            : 'Solo quedará en el historial de este período'}
        </div>

        {/* Type toggle */}
        <label style={fieldLabel}>TIPO</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { key: 'expense', label: 'Gasto' },
            { key: 'income', label: 'Ingreso' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setValue('type', opt.key)}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: type === opt.key ? 700 : 500,
                cursor: 'pointer',
                background: type === opt.key ? '#1e3a5f' : '#e9ecef',
                color: type === opt.key ? '#fff' : '#6c757d',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Description */}
        <label style={fieldLabel}>DESCRIPCIÓN *</label>
        <input
          type="text"
          placeholder="Ej: Reparación, mercado…"
          autoFocus
          style={{ ...fieldInput, fontSize: 16, marginBottom: 4 }}
          {...register('description', { required: 'La descripción es obligatoria' })}
        />
        {fieldError(errors.description)}
        <div style={{ marginBottom: 16 }} />

        {/* Amount */}
        <label style={fieldLabel}>MONTO (COP) *</label>
        <input
          type="number"
          placeholder="0"
          min="0"
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
        <label style={fieldLabel}>FECHA *</label>
        <input
          type="date"
          style={{ ...fieldInput, fontSize: 16, marginBottom: 4 }}
          {...register('date', { required: 'La fecha es obligatoria' })}
        />
        {fieldError(errors.date)}
        <div style={{ marginBottom: 16 }} />

        {/* Category */}
        <label style={fieldLabel}>CATEGORÍA (opcional)</label>
        <select
          style={{ ...fieldInput, fontSize: 14, marginBottom: 20 }}
          {...register('category')}
        >
          <option value="">Sin categoría</option>
          {ACCOUNT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

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
            fontFamily: 'inherit',
          }}
          {...register('note')}
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
            <Spinner size="sm" />
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
            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
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
            onClick={handleSubmit(onSubmit)}
            disabled={saving || processing || !description || !amount}
            style={{
              flex: 2,
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: processing ? '#e9ecef' : '#1e3a5f',
              fontSize: 15,
              fontWeight: 700,
              color: processing ? '#adb5bd' : '#fff',
              cursor: processing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {saving ? (
              <Spinner
                size="sm"
                style={{ borderColor: '#fff', borderRightColor: 'transparent' }}
              />
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
