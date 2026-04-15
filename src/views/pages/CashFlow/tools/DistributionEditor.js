import React from 'react'
import { fmt, TYPE_LABELS, TARGET_OPTIONS } from './salaryUtils'

const inp = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #ced4da',
  fontSize: 15,
  width: '100%',
  background: '#fff',
  boxSizing: 'border-box',
  WebkitAppearance: 'none',
}

const lbl = {
  fontSize: 11,
  fontWeight: 600,
  color: '#6c757d',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 4,
  display: 'block',
}

function ResultRow({ label, amount, color, note, bg }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        background: bg ?? '#fff',
        borderBottom: '1px solid #f1f5f9',
      }}
    >
      <span style={{ fontSize: 13, color: '#495057' }}>
        {label}
        {note && <span style={{ marginLeft: 6, fontSize: 11, color: '#adb5bd' }}>{note}</span>}
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, color: color ?? '#1a1a2e', whiteSpace: 'nowrap' }}>
        {amount < 0 ? `−${fmt(Math.abs(amount))}` : fmt(amount)}
      </span>
    </div>
  )
}

function TargetSummary({ distribution, invert, invertTarget, isMobile }) {
  const totals = {}

  if (invert > 0) {
    const key = invertTarget || '__none__'
    totals[key] = (totals[key] ?? 0) + invert
  }

  distribution.forEach((row) => {
    const key = row.target || '__none__'
    totals[key] = (totals[key] ?? 0) + (row.amount || 0)
  })

  const entries = Object.entries(totals).sort(([a], [b]) => {
    if (a === '__none__') return 1
    if (b === '__none__') return -1
    return a.localeCompare(b)
  })

  if (entries.length === 0) return null

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e9ecef',
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 16,
      }}
    >
      <div
        style={{
          padding: '10px 14px',
          background: '#1a1a2e',
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Total por target
      </div>
      {entries.map(([key, amount], idx) => (
        <div
          key={key}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            background: idx % 2 === 0 ? '#fff' : '#fafbfc',
            borderBottom: idx < entries.length - 1 ? '1px solid #f1f5f9' : 'none',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: key === '__none__' ? '#adb5bd' : '#1a1a2e' }}>
            {key === '__none__' ? 'Sin target' : key}
          </span>
          <span style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap' }}>
            {fmt(amount)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function DistributionEditor({
  activeConfig,
  distribution,
  isMobile,
  dragRowId,
  dragOverRowId,
  onUpdate,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const { salary, invert, rows } = activeConfig
  const base = salary - invert
  const totalPercent = rows.filter((r) => r.type === 'percent').reduce((s, r) => s + Number(r.value), 0)
  const hasRemainder = rows.some((r) => r.type === 'remainder')
  const overflowWarning = totalPercent > 100

  return (
    <>
      {/* ── Salary / Invert ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, padding: 14 }}>
          <label style={lbl}>Salario</label>
          <input
            style={inp}
            type="number"
            value={salary}
            onChange={(e) => onUpdate({ salary: Number(e.target.value) })}
          />
          <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700, color: '#2f9e44', textAlign: 'right' }}>
            {fmt(salary)}
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, padding: 14 }}>
          <label style={lbl}>Inversión</label>
          <input
            style={inp}
            type="number"
            value={invert}
            onChange={(e) => onUpdate({ invert: Number(e.target.value) })}
          />
          <select
            style={{ ...inp, marginTop: 8, cursor: 'pointer' }}
            value={activeConfig.invertTarget ?? ''}
            onChange={(e) => onUpdate({ invertTarget: e.target.value })}
          >
            <option value="">— Target —</option>
            {TARGET_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700, color: '#7c3aed', textAlign: 'right' }}>
            {fmt(invert)}
          </div>
        </div>
      </div>

      {/* ── Row editor ── */}
      <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, marginBottom: 20 }}>
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#495057',
            }}
          >
            Distribución del resto
          </span>
          <span style={{ fontSize: 12, color: overflowWarning ? '#e03131' : '#6c757d' }}>
            {overflowWarning ? `⚠ ${totalPercent}% (supera 100%)` : `${totalPercent}% asignado`}
          </span>
        </div>

        {isMobile ? (
          <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map((row) => (
              <div
                key={row.id}
                style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: 12, background: '#fafbfc' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#adb5bd', textTransform: 'uppercase' }}>Fila</span>
                  <button
                    onClick={() => onRemoveRow(row.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#e03131',
                      fontSize: 20,
                      lineHeight: 1,
                      padding: '4px 8px',
                      minWidth: 36,
                      minHeight: 36,
                    }}
                  >×</button>
                </div>
                <label style={lbl}>Nombre</label>
                <input
                  style={{ ...inp, marginBottom: 8 }}
                  type="text"
                  value={row.name}
                  placeholder="Nombre"
                  onChange={(e) => onUpdateRow(row.id, { name: e.target.value })}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={lbl}>Tipo</label>
                    <select
                      style={{ ...inp, cursor: 'pointer' }}
                      value={row.type}
                      onChange={(e) => onUpdateRow(row.id, { type: e.target.value })}
                    >
                      {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Valor</label>
                    {row.type === 'percent' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                          style={inp}
                          type="number"
                          min={0}
                          max={100}
                          value={row.value}
                          onChange={(e) => onUpdateRow(row.id, { value: Number(e.target.value) })}
                        />
                        <span style={{ fontSize: 14, color: '#6c757d', flexShrink: 0 }}>%</span>
                      </div>
                    ) : row.type === 'value' ? (
                      <input
                        style={inp}
                        type="number"
                        min={0}
                        value={row.value}
                        onChange={(e) => onUpdateRow(row.id, { value: Number(e.target.value) })}
                      />
                    ) : (
                      <div style={{ ...inp, color: '#adb5bd', fontSize: 13 }}>auto</div>
                    )}
                  </div>
                </div>
                <label style={lbl}>Target</label>
                <select
                  style={{ ...inp, cursor: 'pointer' }}
                  value={row.target ?? ''}
                  onChange={(e) => onUpdateRow(row.id, { target: e.target.value })}
                >
                  <option value="">—</option>
                  {TARGET_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 110px 90px 110px 36px',
                gap: 8,
                padding: '8px 14px',
                background: '#f8f9fa',
                borderBottom: '1px solid #f1f5f9',
                fontSize: 11,
                fontWeight: 600,
                color: '#adb5bd',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                minWidth: 480,
              }}
            >
              <span /><span>Nombre</span><span>Tipo</span><span>Valor</span><span>Target</span><span />
            </div>
            {rows.map((row, idx) => (
              <div
                key={row.id}
                onDragOver={(e) => { e.preventDefault(); onDragOver(row.id) }}
                onDrop={(e) => { e.preventDefault(); onDrop(row.id) }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr 110px 90px 110px 36px',
                  gap: 8,
                  padding: '8px 14px',
                  alignItems: 'center',
                  borderBottom: idx < rows.length - 1 ? '1px solid #f8f9fa' : 'none',
                  background: dragOverRowId === row.id ? '#e8f4fd' : idx % 2 === 0 ? '#fff' : '#fafbfc',
                  minWidth: 480,
                  transition: 'background 0.1s',
                  opacity: dragRowId === row.id ? 0.4 : 1,
                }}
              >
                <div
                  draggable
                  onDragStart={() => onDragStart(row.id)}
                  onDragEnd={onDragEnd}
                  style={{
                    cursor: 'grab',
                    color: '#adb5bd',
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                    lineHeight: 1,
                  }}
                  title="Arrastrar para reordenar"
                >⠿</div>
                <input
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ced4da', fontSize: 13, width: '100%', background: '#fff' }}
                  type="text"
                  value={row.name}
                  placeholder="Nombre"
                  onChange={(e) => onUpdateRow(row.id, { name: e.target.value })}
                />
                <select
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ced4da', fontSize: 13, width: '100%', background: '#fff', cursor: 'pointer' }}
                  value={row.type}
                  onChange={(e) => onUpdateRow(row.id, { type: e.target.value })}
                >
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                {row.type === 'percent' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ced4da', fontSize: 13, width: '100%', background: '#fff' }}
                      type="number"
                      min={0}
                      max={100}
                      value={row.value}
                      onChange={(e) => onUpdateRow(row.id, { value: Number(e.target.value) })}
                    />
                    <span style={{ fontSize: 13, color: '#6c757d' }}>%</span>
                  </div>
                ) : row.type === 'value' ? (
                  <input
                    style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ced4da', fontSize: 13, width: '100%', background: '#fff' }}
                    type="number"
                    min={0}
                    value={row.value}
                    onChange={(e) => onUpdateRow(row.id, { value: Number(e.target.value) })}
                  />
                ) : (
                  <span style={{ fontSize: 12, color: '#adb5bd', paddingLeft: 8 }}>auto</span>
                )}
                <select
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ced4da', fontSize: 13, width: '100%', background: '#fff', cursor: 'pointer' }}
                  value={row.target ?? ''}
                  onChange={(e) => onUpdateRow(row.id, { target: e.target.value })}
                >
                  <option value="">—</option>
                  {TARGET_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onRemoveRow(row.id)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e03131', fontSize: 16, padding: '2px 4px', lineHeight: 1 }}
                    title="Eliminar"
                  >×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '10px 14px' }}>
          <button
            onClick={onAddRow}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px dashed #ced4da',
              background: '#f8f9fa',
              cursor: 'pointer',
              color: '#495057',
              width: isMobile ? '100%' : 'auto',
              minHeight: 44,
            }}
          >
            + Agregar fila
          </button>
        </div>
      </div>

      {/* ── Result ── */}
      <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, overflow: 'hidden' }}>
        <div
          style={{
            padding: '10px 14px',
            background: '#1a1a2e',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Resultado — {activeConfig.name}
        </div>

        <ResultRow label="Salario" amount={salary} color="#2f9e44" bg="#f0fff4" />
        <ResultRow label="Inversión" amount={-invert} color="#7c3aed" note={`(−${fmt(invert)})`} bg="#faf5ff" />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: '#f8f9fa',
            borderTop: '2px solid #1a1a2e',
            borderBottom: '2px solid #1a1a2e',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          <span>Resto a distribuir</span>
          <span style={{ color: base < 0 ? '#e03131' : '#1a1a2e' }}>{fmt(base)}</span>
        </div>

        {distribution.map((row, idx) => {
          const badge =
            row.type === 'percent' ? `${row.value}%` : row.type === 'value' ? fmt(row.value) : 'restante'
          return (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: 8,
                padding: '10px 14px',
                alignItems: 'center',
                background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                borderBottom: idx < distribution.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', wordBreak: 'break-word' }}>
                {row.name || <span style={{ color: '#adb5bd', fontStyle: 'italic' }}>Sin nombre</span>}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 10,
                  whiteSpace: 'nowrap',
                  background:
                    row.type === 'remainder' ? '#e9ecef' : row.type === 'value' ? '#fff3cd' : '#e8f4fd',
                  color:
                    row.type === 'remainder' ? '#6c757d' : row.type === 'value' ? '#856404' : '#0c63e4',
                }}
              >
                {badge}
              </span>
              <span
                style={{
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 700,
                  color: row.amount < 0 ? '#e03131' : '#1a1a2e',
                  minWidth: isMobile ? 80 : 100,
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                }}
              >
                {fmt(row.amount)}
              </span>
            </div>
          )
        })}

        {!hasRemainder && (
          <div style={{ padding: '8px 14px', background: '#fff8e1', fontSize: 12, color: '#e67700' }}>
            {'Sin fila de tipo "Restante" — el sobrante no está asignado.'}
          </div>
        )}
      </div>

      <TargetSummary
        distribution={distribution}
        invert={invert}
        invertTarget={activeConfig.invertTarget}
        isMobile={isMobile}
      />

      <p style={{ marginTop: 12, fontSize: 11, color: '#adb5bd', textAlign: 'right' }}>
        Configuración guardada en IndexedDB de este navegador.
      </p>
    </>
  )
}
