import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { ACCOUNT_CATEGORIES, INCOME_CATEGORIES } from 'src/constants/cashFlow'
import { uploadImage } from 'src/services/facade/imageFacade'
import { fieldLabel, fieldInput } from './helpers'
import Spinner from 'src/components/shared/Spinner'
import AttachmentViewer from 'src/components/shared/AttachmentViewer'

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 'var(--fs-xs)', color: '#b91c1c', display: 'block', marginBottom: 4 }}>
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
      paid: initialData ? (initialData?.paid ?? true) : false,
    },
  })

  const type = watch('type')
  const paid = watch('paid')
  const categoryOptions = type === 'income' ? INCOME_CATEGORIES : ACCOUNT_CATEGORIES
  const description = watch('description')
  const amount = watch('amount')

  const initialAttachments = initialData?.attachments?.length
    ? initialData.attachments
    : initialData?.attachment
      ? [{ data: initialData.attachment, name: initialData.attachmentName || 'Adjunto' }]
      : []

  const [attachments, setAttachments] = useState(initialAttachments)
  const [previewing, setPreviewing] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileRef = useRef()

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setFileError('')
    setProcessing(true)
    try {
      const uploaded = []
      for (const file of files) {
        const data = await uploadImage(file)
        uploaded.push({ data, name: file.name })
      }
      setAttachments((prev) => [...prev, ...uploaded])
    } catch (err) {
      setFileError(`Error procesando archivo: ${err.message}`)
    } finally {
      setProcessing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeAttachment = (index) => setAttachments((prev) => prev.filter((_, i) => i !== index))

  const onSubmit = ({ description, amount, date, category, note, type: t, paid: p }) => {
    const payload = {
      ...(isEditing && { id: initialData.id }),
      type: t,
      paid: p,
      category: category || '',
      description: description.trim(),
      amount: Number(String(amount).replace(/\D/g, '')),
      date,
      accountMonth: isEditing ? initialData.accountMonth : monthStr,
      note: note.trim() || null,
      // legacy single-attachment fields kept in sync (first attachment) so other
      // views reading account.attachment (e.g. Transactions grid) keep working
      attachment: attachments[0]?.data || null,
      attachmentName: attachments[0]?.name || null,
      attachments: attachments.length ? attachments : null,
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

        <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
          {isEditing ? 'Editar movimiento' : 'Agregar movimiento del período'}
        </div>
        <div style={{ fontSize: 'var(--fs-base)', color: '#6c757d', marginBottom: 24 }}>
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
                fontSize: 'var(--fs-base)',
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

        {/* Paid toggle */}
        <label style={fieldLabel}>ESTADO</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { key: true, label: 'Pagada' },
            { key: false, label: 'Pendiente' },
          ].map((opt) => (
            <button
              key={String(opt.key)}
              type="button"
              onClick={() => setValue('paid', opt.key)}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: 10,
                fontSize: 'var(--fs-base)',
                fontWeight: paid === opt.key ? 700 : 500,
                cursor: 'pointer',
                background: paid === opt.key ? (opt.key ? '#2f9e44' : '#e03131') : '#e9ecef',
                color: paid === opt.key ? '#fff' : '#6c757d',
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
          style={{ ...fieldInput, fontSize: 'var(--fs-xl)', marginBottom: 4 }}
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
          style={{ ...fieldInput, fontSize: 'var(--fs-xl)', marginBottom: 4 }}
          {...register('date', { required: 'La fecha es obligatoria' })}
        />
        {fieldError(errors.date)}
        <div style={{ marginBottom: 16 }} />

        {/* Category */}
        <label style={fieldLabel}>CATEGORÍA (opcional)</label>
        <select
          style={{ ...fieldInput, fontSize: 'var(--fs-md)', marginBottom: 20 }}
          {...register('category')}
        >
          <option value="">Sin categoría</option>
          {categoryOptions.map((c) => (
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
            fontSize: 'var(--fs-md)',
            resize: 'none',
            marginBottom: 20,
            fontFamily: 'inherit',
          }}
          {...register('note')}
        />

        {/* Attachments */}
        <label style={fieldLabel}>ADJUNTOS (opcional)</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          style={{ display: 'none' }}
          onChange={handleFile}
        />

        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {attachments.map((a, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid #dee2e6',
                  borderRadius: 10,
                  padding: '8px 10px',
                }}
              >
                <span style={{ fontSize: 'var(--fs-lg)' }}>📎</span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 'var(--fs-sm)',
                    color: '#495057',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {a.name}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewing(a)}
                  title="Ver adjunto"
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#e9ecef',
                    color: '#495057',
                    fontSize: 'var(--fs-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  👁
                </button>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  title="Quitar adjunto"
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: 'none',
                    background: 'rgba(220,53,69,0.1)',
                    color: '#e03131',
                    fontSize: 'var(--fs-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
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
            <span style={{ fontSize: 'var(--fs-base)', color: '#6c757d' }}>Procesando archivo…</span>
          </div>
        )}
        {fileError && (
          <div style={{ fontSize: 'var(--fs-sm)', color: '#e03131', marginBottom: 8 }}>{fileError}</div>
        )}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={processing}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 10,
            marginBottom: 20,
            border: '2px dashed #dee2e6',
            background: '#fafafa',
            fontSize: 'var(--fs-base)',
            color: '#6c757d',
            cursor: processing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 'var(--fs-2xl)' }}>📎</span>
          {attachments.length ? 'Adjuntar otro' : 'Adjuntar imagen o PDF'}
        </button>

        {previewing && (
          <AttachmentViewer
            src={previewing.data}
            filename={previewing.name}
            onClose={() => setPreviewing(null)}
          />
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
              fontSize: 'var(--fs-lg)',
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
              fontSize: 'var(--fs-lg)',
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
