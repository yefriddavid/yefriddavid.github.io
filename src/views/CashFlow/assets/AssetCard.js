import React from 'react'
import { fmt, fmtNum } from './assetHelpers'
import { TYPE_COLOR, TYPE_BG, HORIZON_COLOR, HORIZON_BG } from './assetConstants'

function Pill({ label, color, bg }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 10,
        background: bg,
        color,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

export default function AssetCard({ asset, onEdit, onDelete, onSync, syncing }) {
  const valueCOP = (Number(asset.quantity) || 0) * (Number(asset.unitPrice) || 0)

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '13px 15px',
        marginBottom: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        borderLeft: `4px solid ${TYPE_COLOR[asset.type] ?? '#dee2e6'}`,
        opacity: asset.archived ? 0.5 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', textDecoration: asset.archived ? 'line-through' : 'none' }}>
            {asset.name}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            <Pill label={asset.type} color={TYPE_COLOR[asset.type]} bg={TYPE_BG[asset.type]} />
            {asset.liveSymbol && asset.type === 'crypto' && (
              <Pill
                label={`● ${asset.liveSymbol.replace(/USDT$/, '')}`}
                color="#6741d9"
                bg="#f3f0ff"
              />
            )}
            {asset.liveSymbol && asset.type === 'fixed' && (
              <Pill
                label={asset.liveSymbol.toUpperCase()}
                color={TYPE_COLOR.fixed}
                bg={TYPE_BG.fixed}
              />
            )}
            {asset.liquid && <Pill label="liquid" color="#2f9e44" bg="#f0fdf4" />}
            {asset.projection && <Pill label="proyección" color="#6c757d" bg="#f8f9fa" />}
            {asset.horizon && (
              <Pill label={asset.horizon} color={HORIZON_COLOR[asset.horizon]} bg={HORIZON_BG[asset.horizon]} />
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#1a1a2e' }}>{fmt(valueCOP)}</div>
          {asset.monthlyGain > 0 && (
            <div style={{ fontSize: 11, color: '#2f9e44', fontWeight: 700, marginTop: 2 }}>
              +{fmt(asset.monthlyGain)}/mes
            </div>
          )}
        </div>
      </div>

      {(asset.quantity || asset.unitPrice) && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#6c757d', marginBottom: 8 }}>
          <span>{fmtNum(asset.quantity)} unidades</span>
          {asset.unitPrice ? (
            <>
              <span style={{ color: '#dee2e6' }}>·</span>
              <span>precio {fmt(asset.unitPrice)}</span>
            </>
          ) : null}
        </div>
      )}

      {asset.notes && (
        <div style={{ fontSize: 11, color: '#adb5bd', fontStyle: 'italic', marginBottom: 8 }}>
          {asset.notes}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => onEdit(asset)}
          style={{ flex: 1, padding: '7px', borderRadius: 8, border: '1px solid #dee2e6', background: '#fff', fontSize: 13, fontWeight: 600, color: '#1e3a5f', cursor: 'pointer' }}
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => onSync(asset)}
          disabled={syncing}
          style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: '#eef4ff', fontSize: 13, fontWeight: 600, color: syncing ? '#adb5bd' : '#1e3a5f', cursor: syncing ? 'not-allowed' : 'pointer' }}
          title="Sincronizar a Firebase"
        >
          ☁️
        </button>
        <button
          onClick={() => onDelete(asset)}
          style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: '#fff5f5', fontSize: 13, color: '#e03131', cursor: 'pointer' }}
        >
          🗑
        </button>
      </div>
      <div style={{ fontSize: 10, color: asset.syncedAt ? '#2f9e44' : '#f59f00', marginTop: 4, textAlign: 'right' }}>
        {asset.syncedAt ? '● Firebase' : '○ Local'}
      </div>
    </div>
  )
}
