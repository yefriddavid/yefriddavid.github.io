import React, { useState } from 'react'
import { CSpinner } from '@coreui/react'
import InlinePaymentMethod from '../InlinePaymentMethod'
import { fmt, getStatus } from './helpers'

export default function AccountCard({
  account,
  payments,
  monthStr,
  cumulativePaid,
  onPay,
  onDetail,
  onDelete,
  onUpdate,
  onViewAttachment,
  onAttach,
  attachingId,
  savingId,
}) {
  const isDebt = account.targetAmount > 0
  const status = getStatus(account, payments, monthStr, isDebt ? cumulativePaid : null)
  const canPay = status.label !== 'Pagado'
  const isSaving = savingId === account.id
  const [editing, setEditing] = useState(null)

  const startEdit = (p) => setEditing({ id: p.id, amount: p.amount, note: p.note ?? '' })
  const cancelEdit = () => setEditing(null)

  const saveEdit = (p) => {
    const newAmount = Number(String(editing.amount).replace(/\D/g, ''))
    const newNote = editing.note.trim()
    if (!newAmount) return
    const hasChanges = newAmount !== p.amount || newNote !== (p.note ?? '')
    if (hasChanges) onUpdate({ ...p, amount: newAmount, note: newNote })
    setEditing(null)
  }

  const isDirty = (p) =>
    editing?.id === p.id &&
    (Number(String(editing.amount).replace(/\D/g, '')) !== p.amount ||
      editing.note.trim() !== (p.note ?? ''))

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 10,
        borderLeft: `4px solid ${status.border}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: status.bg,
            border: `2px solid ${status.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 18,
          }}
        >
          {status.label === 'Pagado'
            ? '✓'
            : status.label === 'Parcial'
              ? '½'
              : status.label === 'Vencido'
                ? '!'
                : '·'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            onClick={() => onDetail(account)}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#1a1a2e',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
              textDecorationColor: '#adb5bd',
            }}
          >
            {account.important && (
              <span style={{ color: '#e03131', fontSize: 13, lineHeight: 1, flexShrink: 0 }}>
                ★{' '}
              </span>
            )}
            {account.name}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 6,
              marginTop: 4,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {account.category && (
              <span
                style={{
                  fontSize: 11,
                  color: '#6c757d',
                  background: '#f1f5f9',
                  borderRadius: 4,
                  padding: '1px 6px',
                }}
              >
                {account.category}
              </span>
            )}
            {account.defaultValue > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>
                {fmt(account.defaultValue)}
              </span>
            )}
            {account.maxDatePay && (
              <span style={{ fontSize: 11, color: '#6c757d' }}>día {account.maxDatePay}</span>
            )}
            <InlinePaymentMethod account={account} />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 20,
              padding: '3px 10px',
              background: status.bg,
              color: status.color,
              border: `1px solid ${status.border}`,
            }}
          >
            {status.label}
          </span>
          {canPay && (
            <button
              onClick={() => !isSaving && onPay(account)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: 'none',
                background: '#1e3a5f',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                minWidth: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSaving ? (
                <CSpinner
                  size="sm"
                  style={{
                    width: 14,
                    height: 14,
                    borderColor: '#fff',
                    borderRightColor: 'transparent',
                  }}
                />
              ) : (
                'Pagar'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Debt progress bar */}
      {isDebt && (
        <div style={{ marginTop: 10, padding: '8px 0 2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#6c757d' }}>
              Pagado: <strong style={{ color: '#1a1a2e' }}>{fmt(cumulativePaid)}</strong>
            </span>
            <span style={{ fontSize: 11, color: '#6c757d' }}>
              Saldo:{' '}
              <strong style={{ color: status.remaining > 0 ? '#e03131' : '#2f9e44' }}>
                {fmt(status.remaining ?? 0)}
              </strong>{' '}
              / {fmt(account.targetAmount)}
            </span>
          </div>
          <div style={{ height: 6, background: '#e9ecef', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: 4,
                background: status.remaining <= 0 ? '#2f9e44' : '#0ea5e9',
                width: `${Math.min(100, (cumulativePaid / account.targetAmount) * 100)}%`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: '#adb5bd', textAlign: 'right', marginTop: 3 }}>
            {Math.round((cumulativePaid / account.targetAmount) * 100)}% completado
          </div>
        </div>
      )}

      {/* Individual payments list */}
      {payments.length > 0 && (
        <div style={{ marginTop: 10, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
          {payments.map((p) => {
            const isAttaching = attachingId === p.id
            const isEditing = editing?.id === p.id
            return (
              <div
                key={p.id}
                style={{
                  marginBottom: 6,
                  padding: '6px 8px',
                  borderRadius: 8,
                  background: isEditing ? '#f0f6ff' : '#f8f9fa',
                  border: isEditing ? '1px solid #c5d8ff' : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {/* View row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    onClick={() => !isEditing && startEdit(p)}
                    title="Editar"
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#2f9e44',
                      flex: 1,
                      minWidth: 0,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                      textDecorationColor: '#adb5bd',
                    }}
                  >
                    {fmt(p.amount)}
                  </span>
                  {p.date && (
                    <span style={{ fontSize: 11, color: '#adb5bd', whiteSpace: 'nowrap' }}>
                      {p.date}
                    </span>
                  )}
                  {!isEditing && p.note && (
                    <span
                      onClick={() => startEdit(p)}
                      title="Editar nota"
                      style={{
                        fontSize: 11,
                        color: '#6c757d',
                        fontStyle: 'italic',
                        maxWidth: 80,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}
                    >
                      {p.note}
                    </span>
                  )}
                  {p.attachment ? (
                    <button
                      onClick={() => onViewAttachment(p.attachment, p.attachmentName)}
                      title="Ver adjunto"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 15,
                        padding: '2px 4px',
                      }}
                    >
                      📎
                    </button>
                  ) : (
                    <button
                      onClick={() => onAttach(p)}
                      disabled={isAttaching}
                      title="Adjuntar"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '2px 4px',
                        cursor: isAttaching ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        color: '#adb5bd',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {isAttaching ? (
                        <CSpinner size="sm" style={{ width: 10, height: 10 }} />
                      ) : (
                        '📎'
                      )}
                    </button>
                  )}
                  {!isEditing && (
                    <button
                      onClick={() => onDelete(p)}
                      title="Eliminar pago"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#e03131',
                        fontSize: 14,
                        padding: '2px 4px',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Edit row */}
                {isEditing && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <input
                      type="number"
                      value={editing.amount}
                      onChange={(e) => setEditing((prev) => ({ ...prev, amount: e.target.value }))}
                      autoFocus
                      style={{
                        width: '100%',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#1e3a5f',
                        border: 'none',
                        borderBottom: '2px solid #1e3a5f',
                        background: 'transparent',
                        outline: 'none',
                        padding: '2px 0',
                      }}
                    />
                    <input
                      type="text"
                      value={editing.note}
                      onChange={(e) => setEditing((prev) => ({ ...prev, note: e.target.value }))}
                      placeholder="Nota (opcional)"
                      style={{
                        width: '100%',
                        fontSize: 12,
                        color: '#6c757d',
                        border: 'none',
                        borderBottom: '1px solid #dee2e6',
                        background: 'transparent',
                        outline: 'none',
                        padding: '2px 0',
                      }}
                    />
                    <div
                      style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 2 }}
                    >
                      <button
                        onClick={cancelEdit}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 6,
                          border: '1px solid #dee2e6',
                          background: '#fff',
                          fontSize: 12,
                          color: '#6c757d',
                          cursor: 'pointer',
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => saveEdit(p)}
                        disabled={!isDirty(p)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 6,
                          border: 'none',
                          background: isDirty(p) ? '#1e3a5f' : '#e9ecef',
                          color: isDirty(p) ? '#fff' : '#adb5bd',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: isDirty(p) ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {status.label === 'Parcial' && (
            <div
              style={{
                fontSize: 11,
                color: '#0ea5e9',
                fontWeight: 600,
                textAlign: 'right',
                marginTop: 2,
              }}
            >
              Pendiente: {fmt((account.defaultValue || 0) - status.paid)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
