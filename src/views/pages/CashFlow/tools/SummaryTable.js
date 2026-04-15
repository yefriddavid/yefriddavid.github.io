import React from 'react'
import { fmt, computeDistribution, parseRangeFromName, matchesRange } from './salaryUtils'
import { useAppSetting } from 'src/hooks/useAppSetting'

const cell = { padding: '8px 12px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap', fontSize: 13 }
const colW = 150
const sticky = { position: 'sticky', left: 0, zIndex: 1, borderRight: '2px solid #dee2e6' }

function PivotedTable({ computed, allTargetKeys, amountByTarget, eggPrice }) {
  const allKeys = allTargetKeys.length ? allTargetKeys : ['']
  const fmtPrice = (v) => Number(v).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

  return (
    <div style={{ overflowX: 'auto' }}>
      {eggPrice !== null && (
        <div style={{ padding: '8px 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#6c757d' }}>Precio huevo:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e67700' }}>
            🥚 {fmtPrice(Number(eggPrice))}
            {/*fmtPrice(Number(eggPrice) * 1000)*/}
          </span>
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: allKeys.length * colW + 180 }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th
              style={{
                ...cell,
                ...sticky,
                textAlign: 'left',
                fontWeight: 700,
                color: '#495057',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                width: 170,
                background: '#f8f9fa',
              }}
            >
              Distribución
            </th>
            {allKeys.map((target) => (
              <th
                key={target || '__none__'}
                style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#1e3a5f', fontSize: 13, width: colW }}
              >
                {target || <span style={{ color: '#adb5bd', fontStyle: 'italic' }}>Sin target</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {computed.map((d, i) => {
            const range = parseRangeFromName(d.name)
            const isMatch = matchesRange(range, eggPrice / 1000)
            const totals = amountByTarget(d)
            const baseBg = i % 2 === 0 ? '#fff' : '#fafbfc'

            const rowStyle = isMatch
              ? {
                  background: 'linear-gradient(90deg, #fff3cd 0%, #fffce8 50%, #fff 100%)',
                  borderLeft: '4px solid #f59f00',
                  position: 'relative',
                }
              : { background: baseBg }

            const stickyBg = isMatch
              ? 'linear-gradient(90deg, #fff3cd 0%, #fffce8 100%)'
              : baseBg

            return (
              <tr key={d.id} style={rowStyle}>
                <td
                  style={{
                    ...cell,
                    ...sticky,
                    fontWeight: 600,
                    color: '#1a1a2e',
                    background: stickyBg,
                    paddingLeft: isMatch ? 10 : cell.padding.split(' ')[1],
                  }}
                >
                  {isMatch ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span>{d.name}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          background: 'linear-gradient(90deg, #f59f00, #e67700)',
                          color: '#fff',
                          borderRadius: 8,
                          padding: '1px 7px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          alignSelf: 'flex-start',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        🥚 precio actual
                      </span>
                    </div>
                  ) : (
                    d.name
                  )}
                </td>
                {allKeys.map((target) => {
                  const amount = totals[target] ?? null
                  return (
                    <td
                      key={target || '__none__'}
                      style={{
                        ...cell,
                        textAlign: 'right',
                        fontWeight: isMatch ? 800 : 700,
                        color: amount === null ? '#adb5bd' : amount < 0 ? '#e03131' : isMatch ? '#e67700' : '#1a1a2e',
                      }}
                    >
                      {amount === null ? '—' : fmt(amount)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function SummaryTable({ distributions }) {
  const [pivoted, setPivoted] = React.useState(false)
  const { value: eggPrice } = useAppSetting('egg_current_price')

  const computed = distributions.map((d) => ({
    ...d,
    base: d.salary - d.invert,
    distribution: computeDistribution(d.salary, d.invert, d.rows),
  }))

  // Collect unique targets preserving first-seen order
  const allTargetKeys = []
  const seenTargets = new Set()
  for (const d of computed) {
    for (const r of d.distribution) {
      const key = r.target || ''
      if (!seenTargets.has(key)) { seenTargets.add(key); allTargetKeys.push(key) }
    }
  }

  const amountByTarget = (d) => {
    const totals = {}
    for (const r of d.distribution) {
      const key = r.target || ''
      totals[key] = (totals[key] ?? 0) + (r.amount || 0)
    }
    return totals
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e9ecef',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 24,
      }}
    >
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <input
          type="checkbox"
          id="summary-pivot"
          checked={pivoted}
          onChange={(e) => setPivoted(e.target.checked)}
          style={{ cursor: 'pointer', width: 16, height: 16 }}
        />
        <label htmlFor="summary-pivot" style={{ cursor: 'pointer', fontSize: 13, color: '#495057', userSelect: 'none' }}>
          Targets como columnas
        </label>
      </div>

      {pivoted ? (
        <PivotedTable computed={computed} allTargetKeys={allTargetKeys} amountByTarget={amountByTarget} eggPrice={eggPrice} />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', minWidth: distributions.length * colW + 180 }}
          >
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th
                  style={{
                    ...cell,
                    ...sticky,
                    textAlign: 'left',
                    fontWeight: 700,
                    color: '#495057',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    width: 170,
                    background: '#f8f9fa',
                  }}
                >
                  Concepto
                </th>
                {computed.map((d) => (
                  <th
                    key={d.id}
                    style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#1e3a5f', fontSize: 14, width: colW }}
                  >
                    {d.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#f0fff4' }}>
                <td style={{ ...cell, ...sticky, fontWeight: 600, color: '#495057', background: '#f0fff4' }}>Salario</td>
                {computed.map((d) => (
                  <td key={d.id} style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#2f9e44' }}>
                    {fmt(d.salary)}
                  </td>
                ))}
              </tr>
              <tr style={{ background: '#faf5ff' }}>
                <td style={{ ...cell, ...sticky, fontWeight: 600, color: '#495057', background: '#faf5ff' }}>Inversión</td>
                {computed.map((d) => (
                  <td key={d.id} style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>
                    {d.invert > 0 ? `−${fmt(d.invert)}` : <span style={{ color: '#adb5bd' }}>—</span>}
                    {d.invert > 0 && d.invertTarget && (
                      <span style={{ fontSize: 10, color: '#adb5bd', marginLeft: 4 }}>{d.invertTarget}</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr
                style={{
                  background: '#f8f9fa',
                  borderTop: '2px solid #1a1a2e',
                  borderBottom: '2px solid #1a1a2e',
                }}
              >
                <td style={{ ...cell, ...sticky, fontWeight: 700, background: '#f8f9fa' }}>Base a distribuir</td>
                {computed.map((d) => (
                  <td
                    key={d.id}
                    style={{ ...cell, textAlign: 'right', fontWeight: 700, color: d.base < 0 ? '#e03131' : '#1a1a2e' }}
                  >
                    {fmt(d.base)}
                  </td>
                ))}
              </tr>

              {allTargetKeys.map((target, i) => {
                const bg = i % 2 === 0 ? '#fff' : '#fafbfc'
                return (
                  <tr key={target || '__none__'} style={{ background: bg }}>
                    <td style={{ ...cell, ...sticky, background: bg }}>
                      {target ? (
                        <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{target}</span>
                      ) : (
                        <span style={{ color: '#adb5bd', fontStyle: 'italic' }}>Sin target</span>
                      )}
                    </td>
                    {computed.map((d) => {
                      const totals = amountByTarget(d)
                      const amount = totals[target] ?? null
                      return (
                        <td
                          key={d.id}
                          style={{
                            ...cell,
                            textAlign: 'right',
                            fontWeight: 700,
                            color: amount === null ? '#adb5bd' : amount < 0 ? '#e03131' : '#1a1a2e',
                          }}
                        >
                          {amount === null ? '—' : fmt(amount)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
