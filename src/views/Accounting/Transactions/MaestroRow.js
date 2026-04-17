import React from 'react'
import { CSpinner } from '@coreui/react'
import InlinePaymentMethod from '../InlinePaymentMethod'
import { fmt } from './helpers'

export default function MaestroRow({
  account,
  payments,
  monthStr,
  onPay,
  onViewPayment,
  onViewAttachment,
  onDelete,
  onAttach,
  attachingId,
}) {
  const paid = payments.reduce((s, t) => s + (t.amount || 0), 0)
  const isPaid = paid > 0
  const isPartial = isPaid && account.defaultValue > 0 && paid < account.defaultValue
  const canPay = !isPaid || isPartial
  const isOverdue =
    !isPaid &&
    (() => {
      const today = new Date()
      const [y, m] = monthStr.split('-').map(Number)
      const dueDate = new Date(y, m - 1, account.maxDatePay || 31)
      return today > dueDate
    })()

  const statusLabel = isPartial
    ? 'Parcial'
    : isPaid
      ? 'Pagado'
      : isOverdue
        ? 'Vencido'
        : 'Pendiente'
  const statusColors = {
    Pagado: { bg: '#f0fdf4', color: '#2f9e44', border: '#86efac' },
    Parcial: { bg: '#f0f9ff', color: '#0ea5e9', border: '#7dd3fc' },
    Vencido: { bg: '#fff5f5', color: '#e03131', border: '#fca5a5' },
    Pendiente: { bg: '#fff9db', color: '#f59f00', border: '#ffe066' },
  }
  const sc = statusColors[statusLabel]

  return (
    <tr
      style={{
        borderBottom: '1px solid #f1f5f9',
        background: isPaid && !isPartial ? '#f0fdf4' : isOverdue ? '#fff5f5' : '#fff',
      }}
    >
      <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>{account.name}</td>
      <td style={{ padding: '8px 12px', fontSize: 12, color: '#6c757d' }}>
        {account.category || '—'}
      </td>
      <td style={{ padding: '8px 12px', fontSize: 12, color: '#6c757d' }}>
        {account.classification}
      </td>
      <td style={{ padding: '8px 12px', fontSize: 12, textAlign: 'center' }}>
        {account.maxDatePay || '—'}
      </td>
      <td style={{ padding: '8px 12px', fontSize: 12, color: '#6c757d' }}>
        <InlinePaymentMethod account={account} />
      </td>
      <td
        style={{
          padding: '8px 12px',
          fontSize: 13,
          fontWeight: 700,
          textAlign: 'right',
          color: isPaid ? '#2f9e44' : '#adb5bd',
        }}
      >
        {isPaid ? fmt(paid) : '—'}
      </td>
      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 4,
            padding: '2px 8px',
            background: sc.bg,
            color: sc.color,
            border: `1px solid ${sc.border}`,
          }}
        >
          {statusLabel}
        </span>
      </td>
      <td style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {payments.map((p) => {
            const isAttaching = attachingId === p.id
            return (
              <div
                key={p.id}
                style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'nowrap' }}
              >
                <span style={{ fontSize: 11, color: '#2f9e44', fontWeight: 600, minWidth: 70 }}>
                  {fmt(p.amount)}
                </span>
                {p.attachment ? (
                  <button
                    onClick={() =>
                      onViewAttachment(p.attachment, p.attachmentName || 'adjunto.jpg')
                    }
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
                      fontSize: 11,
                      color: '#adb5bd',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {isAttaching ? <CSpinner size="sm" style={{ width: 10, height: 10 }} /> : '📎'}
                  </button>
                )}
                <button
                  onClick={() => onViewPayment(p)}
                  style={{
                    fontSize: 11,
                    padding: '3px 8px',
                    borderRadius: 5,
                    border: '1px solid #86efac',
                    background: '#f0fdf4',
                    color: '#2f9e44',
                    cursor: 'pointer',
                  }}
                >
                  Ver
                </button>
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
              </div>
            )
          })}
          {canPay && (
            <button
              onClick={() => onPay(account)}
              style={{
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 5,
                border: '1px solid #1e3a5f',
                background: '#1e3a5f',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                alignSelf: 'flex-start',
                marginTop: payments.length > 0 ? 2 : 0,
              }}
            >
              Pagar
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
