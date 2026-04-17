import React from 'react'
import { fmt } from './helpers'

export default function AdHocSection({
  adHocTransactions,
  typeTab,
  onAdd,
  onEdit,
  onDelete,
  onViewAttachment,
}) {
  const adHocFiltered = adHocTransactions.filter(
    (t) => t.type === (typeTab === 'Incoming' ? 'income' : 'expense'),
  )

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e9ecef',
        borderRadius: 14,
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: adHocFiltered.length > 0 ? '1px solid #f1f5f9' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>💸</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>Otras cuentas</span>
          {adHocFiltered.length > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: '#eef4ff',
                color: '#1e3a5f',
                borderRadius: 10,
                padding: '1px 7px',
              }}
            >
              {adHocFiltered.length}
            </span>
          )}
        </div>
        <button
          onClick={onAdd}
          style={{
            padding: '5px 14px',
            borderRadius: 20,
            border: 'none',
            background: '#1e3a5f',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          + Agregar
        </button>
      </div>
      {adHocFiltered.map((t) => {
        const isIncome = t.type === 'income'
        const accentColor = isIncome ? '#2f9e44' : '#e03131'
        const accentBg = isIncome ? '#ebfbee' : '#fff5f5'
        const accentBorder = isIncome ? '#8ce99a' : '#ffc9c9'
        return (
          <div
            key={t.id}
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: accentBg,
                  border: `2px solid ${accentBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: accentColor,
                }}
              >
                {isIncome ? '+' : '−'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#1a1a2e',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {t.description}
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
                  {t.note && (
                    <span
                      style={{
                        fontSize: 11,
                        color: '#6c757d',
                        background: '#f1f5f9',
                        borderRadius: 4,
                        padding: '1px 6px',
                        fontStyle: 'italic',
                      }}
                    >
                      {t.note}
                    </span>
                  )}
                  {t.date && <span style={{ fontSize: 11, color: '#6c757d' }}>{t.date}</span>}
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
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 20,
                    padding: '3px 10px',
                    background: accentBg,
                    color: accentColor,
                    border: `1px solid ${accentBorder}`,
                  }}
                >
                  {isIncome ? '+' : '−'} {fmt(t.amount)}
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {t.attachment && (
                    <button
                      onClick={() => onViewAttachment(t.attachment, t.attachmentName)}
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
                  )}
                  <button
                    onClick={() => onEdit(t)}
                    title="Editar"
                    style={{
                      padding: '6px 10px',
                      borderRadius: 20,
                      border: 'none',
                      background: '#e9ecef',
                      color: '#495057',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => onDelete(t)}
                    title="Eliminar"
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      border: 'none',
                      background: '#e03131',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
