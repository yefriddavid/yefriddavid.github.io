import React from 'react'
import { fmt, TYPE_LABELS, TARGET_OPTIONS } from './salaryUtils'

const inp = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--cui-border-color)',
  fontSize: 15,
  width: '100%',
  background: 'var(--cui-body-bg)',
  color: 'var(--cui-body-color)',
  boxSizing: 'border-box',
  WebkitAppearance: 'none',
}

const lbl = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--cui-secondary-color)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 4,
  display: 'block',
}

const inpSm = {
  padding: '4px 8px',
  borderRadius: 6,
  border: '1px solid var(--cui-border-color)',
  fontSize: 13,
  width: '100%',
  background: 'var(--cui-body-bg)',
  color: 'var(--cui-body-color)',
}

function ResultRow({ label, amount, color, note, bg }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        background: bg ?? 'var(--cui-body-bg)',
        borderBottom: '1px solid var(--cui-border-color-translucent)',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>
        {label}
        {note && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--cui-tertiary-color)' }}>{note}</span>}
      </span>
      <span
        style={{ fontSize: 15, fontWeight: 700, color: color ?? 'var(--cui-body-color)', whiteSpace: 'nowrap' }}
      >
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
        background: 'var(--cui-body-bg)',
        border: '1px solid var(--cui-border-color)',
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
            background: idx % 2 === 0 ? 'var(--cui-body-bg)' : 'var(--cui-tertiary-bg)',
            borderBottom: idx < entries.length - 1 ? '1px solid var(--cui-border-color-translucent)' : 'none',
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: key === '__none__' ? 'var(--cui-tertiary-color)' : 'var(--cui-body-color)',
            }}
          >
            {key === '__none__' ? 'Sin target' : key}
          </span>
          <span
            style={{
              fontSize: isMobile ? 14 : 15,
              fontWeight: 700,
              color: 'var(--cui-body-color)',
              whiteSpace: 'nowrap',
            }}
          >
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
  const totalPercent = rows
    .filter((r) => r.type === 'percent')
    .reduce((s, r) => s + Number(r.value), 0)
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
        <div
          style={{ background: 'var(--cui-body-bg)', border: '1px solid var(--cui-border-color)', borderRadius: 8, padding: 14 }}
        >
          <label style={lbl}>Salario</label>
          <input
            style={inp}
            type="number"
            value={salary}
            onChange={(e) => onUpdate({ salary: Number(e.target.value) })}
          />
          <div
            style={{
              marginTop: 6,
              fontSize: 20,
              fontWeight: 700,
              color: '#2f9e44',
              textAlign: 'right',
            }}
          >
            {fmt(salary)}
          </div>
        </div>
        <div
          style={{ background: 'var(--cui-body-bg)', border: '1px solid var(--cui-border-color)', borderRadius: 8, padding: 14 }}
        >
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
            {TARGET_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div
            style={{
              marginTop: 6,
              fontSize: 20,
              fontWeight: 700,
              color: '#7c3aed',
              textAlign: 'right',
            }}
          >
            {fmt(invert)}
          </div>
        </div>
      </div>

      {/* ── Row editor ── */}
      <div
        style={{
          background: 'var(--cui-body-bg)',
          border: '1px solid var(--cui-border-color)',
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--cui-border-color-translucent)',
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
              color: 'var(--cui-secondary-color)',
            }}
          >
            Distribución del resto
          </span>
          <span style={{ fontSize: 12, color: overflowWarning ? 'var(--cui-danger)' : 'var(--cui-secondary-color)' }}>
            {overflowWarning ? `⚠ ${totalPercent}% (supera 100%)` : `${totalPercent}% asignado`}
          </span>
        </div>

        {isMobile ? (
          <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map((row) => (
              <div
                key={row.id}
                style={{
                  border: '1px solid var(--cui-border-color)',
                  borderRadius: 8,
                  padding: 12,
                  background: 'var(--cui-tertiary-bg)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--cui-tertiary-color)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Fila
                  </span>
                  <button
                    onClick={() => onRemoveRow(row.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: 'var(--cui-danger)',
                      fontSize: 20,
                      lineHeight: 1,
                      padding: '4px 8px',
                      minWidth: 36,
                      minHeight: 36,
                    }}
                  >
                    ×
                  </button>
                </div>
                <label style={lbl}>Nombre</label>
                <input
                  style={{ ...inp, marginBottom: 8 }}
                  type="text"
                  value={row.name}
                  placeholder="Nombre"
                  onChange={(e) => onUpdateRow(row.id, { name: e.target.value })}
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <label style={lbl}>Tipo</label>
                    <select
                      style={{ ...inp, cursor: 'pointer' }}
                      value={row.type}
                      onChange={(e) => onUpdateRow(row.id, { type: e.target.value })}
                    >
                      {Object.entries(TYPE_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
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
                        <span style={{ fontSize: 14, color: 'var(--cui-secondary-color)', flexShrink: 0 }}>%</span>
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
                      <div style={{ ...inp, color: 'var(--cui-tertiary-color)', fontSize: 13 }}>auto</div>
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
                  {TARGET_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
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
                background: 'var(--cui-secondary-bg)',
                borderBottom: '1px solid var(--cui-border-color-translucent)',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--cui-tertiary-color)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                minWidth: 480,
              }}
            >
              <span />
              <span>Nombre</span>
              <span>Tipo</span>
              <span>Valor</span>
              <span>Target</span>
              <span />
            </div>
            {rows.map((row, idx) => (
              <div
                key={row.id}
                onDragOver={(e) => {
                  e.preventDefault()
                  onDragOver(row.id)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  onDrop(row.id)
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr 110px 90px 110px 36px',
                  gap: 8,
                  padding: '8px 14px',
                  alignItems: 'center',
                  borderBottom: idx < rows.length - 1 ? '1px solid var(--cui-border-color-translucent)' : 'none',
                  background:
                    dragOverRowId === row.id
                      ? 'rgba(var(--cui-primary-rgb), 0.1)'
                      : idx % 2 === 0
                        ? 'var(--cui-body-bg)'
                        : 'var(--cui-tertiary-bg)',
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
                    color: 'var(--cui-tertiary-color)',
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                    lineHeight: 1,
                  }}
                  title="Arrastrar para reordenar"
                >
                  ⠿
                </div>
                <input
                  style={inpSm}
                  type="text"
                  value={row.name}
                  placeholder="Nombre"
                  onChange={(e) => onUpdateRow(row.id, { name: e.target.value })}
                />
                <select
                  style={{ ...inpSm, cursor: 'pointer' }}
                  value={row.type}
                  onChange={(e) => onUpdateRow(row.id, { type: e.target.value })}
                >
                  {Object.entries(TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                {row.type === 'percent' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      style={inpSm}
                      type="number"
                      min={0}
                      max={100}
                      value={row.value}
                      onChange={(e) => onUpdateRow(row.id, { value: Number(e.target.value) })}
                    />
                    <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>%</span>
                  </div>
                ) : row.type === 'value' ? (
                  <input
                    style={inpSm}
                    type="number"
                    min={0}
                    value={row.value}
                    onChange={(e) => onUpdateRow(row.id, { value: Number(e.target.value) })}
                  />
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--cui-tertiary-color)', paddingLeft: 8 }}>auto</span>
                )}
                <select
                  style={{ ...inpSm, cursor: 'pointer' }}
                  value={row.target ?? ''}
                  onChange={(e) => onUpdateRow(row.id, { target: e.target.value })}
                >
                  <option value="">—</option>
                  {TARGET_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onRemoveRow(row.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: 'var(--cui-danger)',
                      fontSize: 16,
                      padding: '2px 4px',
                      lineHeight: 1,
                    }}
                    title="Eliminar"
                  >
                    ×
                  </button>
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
              border: '1px dashed var(--cui-border-color)',
              background: 'var(--cui-secondary-bg)',
              cursor: 'pointer',
              color: 'var(--cui-secondary-color)',
              width: isMobile ? '100%' : 'auto',
              minHeight: 44,
            }}
          >
            + Agregar fila
          </button>
        </div>
      </div>

      {/* ── Result ── */}
      <div
        style={{
          background: 'var(--cui-body-bg)',
          border: '1px solid var(--cui-border-color)',
          borderRadius: 8,
          overflow: 'hidden',
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
          Resultado — {activeConfig.name}
        </div>

        <ResultRow label="Salario" amount={salary} color="#2f9e44" bg="rgba(47,158,68,0.08)" />
        <ResultRow
          label="Inversión"
          amount={-invert}
          color="#7c3aed"
          note={`(−${fmt(invert)})`}
          bg="rgba(124,58,237,0.08)"
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'var(--cui-secondary-bg)',
            borderTop: '2px solid #1a1a2e',
            borderBottom: '2px solid #1a1a2e',
            fontWeight: 700,
            fontSize: 13,
            color: 'var(--cui-body-color)',
          }}
        >
          <span>Resto a distribuir</span>
          <span style={{ color: base < 0 ? 'var(--cui-danger)' : 'var(--cui-body-color)' }}>{fmt(base)}</span>
        </div>

        {distribution.map((row, idx) => {
          const badge =
            row.type === 'percent'
              ? `${row.value}%`
              : row.type === 'value'
                ? fmt(row.value)
                : 'restante'
          return (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: 8,
                padding: '10px 14px',
                alignItems: 'center',
                background: idx % 2 === 0 ? 'var(--cui-body-bg)' : 'var(--cui-tertiary-bg)',
                borderBottom: idx < distribution.length - 1 ? '1px solid var(--cui-border-color-translucent)' : 'none',
              }}
            >
              <span
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--cui-body-color)', wordBreak: 'break-word' }}
              >
                {row.name || (
                  <span style={{ color: 'var(--cui-tertiary-color)', fontStyle: 'italic' }}>Sin nombre</span>
                )}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 10,
                  whiteSpace: 'nowrap',
                  background:
                    row.type === 'remainder'
                      ? 'var(--cui-secondary-bg)'
                      : row.type === 'value'
                        ? 'rgba(133,100,4,0.15)'
                        : 'rgba(12,99,228,0.12)',
                  color:
                    row.type === 'remainder'
                      ? 'var(--cui-secondary-color)'
                      : row.type === 'value'
                        ? '#856404'
                        : 'var(--cui-primary)',
                }}
              >
                {badge}
              </span>
              <span
                style={{
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 700,
                  color: row.amount < 0 ? 'var(--cui-danger)' : 'var(--cui-body-color)',
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
          <div
            style={{ padding: '8px 14px', background: 'rgba(230,119,0,0.1)', fontSize: 12, color: '#e67700' }}
          >
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

      <p style={{ marginTop: 12, fontSize: 11, color: 'var(--cui-tertiary-color)', textAlign: 'right' }}>
        Configuración guardada en IndexedDB de este navegador.
      </p>
    </>
  )
}
