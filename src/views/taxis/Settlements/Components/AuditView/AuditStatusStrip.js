import React from 'react'

const STATUS_DEFS = [
  { key: 'none', tKey: 'statusNone', color: '#e03131', bg: 'rgba(224,49,49,0.1)' },
  { key: 'partial', tKey: 'statusPartial', color: '#e67700', bg: 'rgba(230,119,0,0.1)' },
  { key: 'full', tKey: 'statusFull', color: '#2f9e44', bg: 'rgba(47,158,68,0.1)' },
  { key: 'future', tKey: 'statusFuture', color: '#868e96', bg: 'rgba(134,142,150,0.1)' },
]

const AuditStatusStrip = ({
  auditDays,
  auditStatusFilter,
  setAuditStatusFilter,
  auditDrivers,
  t,
}) => {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
      {STATUS_DEFS.map(({ key, tKey, color, bg }) => {
        const active = auditStatusFilter.has(key)
        const count = auditDays.filter((d) => d.status === key).length
        return (
          <div
            key={key}
            onClick={() =>
              setAuditStatusFilter((prev) => {
                const next = new Set(prev)
                next.has(key) ? next.delete(key) : next.add(key)
                return next
              })
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: active ? color : bg,
              border: `1px solid ${active ? color : color + '33'}`,
              borderRadius: 8,
              padding: '6px 14px',
              cursor: 'pointer',
              boxShadow: active ? `0 0 0 2px ${color}55` : 'none',
              transition: 'all 0.15s',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: active ? '#fff' : color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: active ? '#fff' : color }}>
              {count}
            </span>
            <span
              style={{
                fontSize: 12,
                color: active ? 'rgba(255,255,255,0.85)' : 'var(--cui-secondary-color)',
              }}
            >
              {t(`taxis.settlements.audit.${tKey}`)}
            </span>
          </div>
        )
      })}
      <div
        style={{
          marginLeft: 'auto',
          fontSize: 12,
          color: 'var(--cui-secondary-color)',
          alignSelf: 'center',
        }}
      >
        {t('taxis.settlements.audit.activeDrivers' + (auditDrivers.length !== 1 ? '_plural' : ''), {
          count: auditDrivers.length,
        })}
      </div>
    </div>
  )
}

export default AuditStatusStrip
