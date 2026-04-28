import React, { useState } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody } from '@coreui/react'

const DayHeader = ({ bg }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
    <span style={{ display: 'inline-flex', gap: 2 }}>
      <span
        style={{
          width: 12,
          height: 12,
          background: 'rgba(255,255,255,0.35)',
          border: '1px solid rgba(255,255,255,0.55)',
          borderRadius: 2,
          display: 'inline-block',
        }}
      />
      <span
        style={{
          width: 12,
          height: 12,
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.55)',
          borderRadius: 2,
          display: 'inline-block',
        }}
      />
    </span>
    DÍA
  </span>
)

const TH = ({ children, right }) => (
  <th
    style={{
      padding: '7px 12px',
      textAlign: right ? 'right' : 'left',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'rgba(255,255,255,0.9)',
      whiteSpace: 'nowrap',
      borderRight: '1px solid rgba(255,255,255,0.1)',
    }}
  >
    {children}
  </th>
)

const TD = ({ children, right, mono, muted, bold, color }) => (
  <td
    style={{
      padding: '8px 12px',
      textAlign: right ? 'right' : 'left',
      fontSize: 12,
      fontFamily: mono ? 'monospace' : undefined,
      fontWeight: bold ? 700 : 400,
      color: color ?? (muted ? '#94a3b8' : '#334155'),
      borderBottom: '1px solid #f1f5f9',
      fontVariantNumeric: mono ? 'tabular-nums' : undefined,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </td>
)

const SampleTable = ({ headers, rows, headerBg }) => (
  <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 14 }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ background: headerBg }}>
          {headers.map((h, i) => (
            <TH key={i} right={h.right}>
              {h.isDayCol ? <DayHeader /> : h.label}
            </TH>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
            {row.map((cell, j) => (
              <TD
                key={j}
                right={headers[j]?.right}
                mono={headers[j]?.mono}
                muted={cell === '—'}
                bold={headers[j]?.bold}
                color={cell?.color}
              >
                {cell?.label ?? cell}
              </TD>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const TABS = [
  { key: 'grouped', label: '📦 Método A — Por liquidación' },
  { key: 'daily', label: '📅 Método B — Por día' },
]

export default function InstructionsModal({ visible, onClose }) {
  const [tab, setTab] = useState('grouped')

  return (
    <CModal visible={visible} onClose={onClose} size="lg" scrollable>
      <CModalHeader style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}>
        <CModalTitle style={{ color: '#1e3a5f', fontWeight: 700, fontSize: 16 }}>
          📖 ¿Cómo llenar el libro contable?
        </CModalTitle>
      </CModalHeader>
      <CModalBody style={{ padding: 0 }}>
        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '2px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          {TABS.map(({ key, label }) => {
            const active = tab === key
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  border: 'none',
                  borderBottom: active ? '2px solid #1e3a5f' : '2px solid transparent',
                  background: active ? '#fff' : 'transparent',
                  color: active ? '#1e3a5f' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  marginBottom: -2,
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div style={{ padding: '20px 24px 28px' }}>
          {tab === 'grouped' && (
            <>
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #93c5fd',
                  borderLeft: '4px solid #1e3a5f',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>
                  ¿Cuándo usar este método?
                </div>
                <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
                  Cuando el conductor <strong>no paga día a día</strong> sino que acumula varios
                  días y los cancela de una sola vez. Aquí cada registro representa un{' '}
                  <em>bloque de días</em>, no un día individual.
                </div>
              </div>

              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, marginBottom: 6 }}>
                <strong>Reglas de oro:</strong>
              </div>
              <ul
                style={{
                  fontSize: 13,
                  color: '#374151',
                  lineHeight: 1.8,
                  paddingLeft: 20,
                  marginBottom: 16,
                }}
              >
                <li>
                  El campo <strong>Liquidación</strong> debe ser el valor{' '}
                  <em>exacto y total</em> de lo que el conductor está cancelando en ese momento —
                  ni más, ni menos.
                </li>
                <li>
                  El campo <strong>Descripción</strong> debe indicar{' '}
                  <strong>qué días cubre ese pago</strong>: fechas exactas, rango o semana. Sin
                  esto el libro queda cojo y la auditoría no cuadra.
                </li>
                <li>
                  Si el conductor paga <em>varios bloques en el mismo día</em>, se registran{' '}
                  <strong>varias filas</strong> — una por bloque.
                </li>
                <li>
                  El campo <strong>Saldo</strong> se llena con lo que el conductor{' '}
                  <em>debe acumulado hasta ese día</em>. Cuando queda en paz (no debe nada), se
                  deja en <strong>0 o vacío</strong>.
                </li>
                <li>
                  Los días sin firma quedan aparentemente sin cubrir — eso es normal con este
                  método. Escribe una nota en el mismo libro (al pie de la página o junto al
                  registro) aclarando qué días cubre cada bloque, para que cualquier revisión
                  posterior pueda verificarlo.
                </li>
              </ul>

              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 2 }}>
                Ejemplo — Carlos Mora / valor diario $70.000:
              </div>
              <SampleTable
                headerBg="#1e3a5f"
                headers={[
                  { isDayCol: true },
                  { label: 'Descripción (Que dias esta pagando)' },
                  { label: 'Firma' },
                  { label: 'Liquidación', right: true, bold: true },
                  { label: 'Saldo' },
                ]}
                rows={[
                  ['01', '', '', { label: '$0', color: '#1e40af' }, ''],
                  ['02', '', '', { label: '$0', color: '#1e40af' }, ''],
                  ['03', '1 y 2 de Abril', 'Carlos Mora', { label: '170.000', color: '#1e40af' }, ''],
                  ['04', '', '', { label: '$0', color: '#1e40af' }, ''],
                  ['05', '3 y 4 de Abril', 'Carlos Mora', { label: '170.000', color: '#1e40af' }, ''],
                ]}
              />

              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  background: '#fffbeb',
                  border: '1px solid #fcd34d',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#92400e',
                }}
              >
                <strong>Ojo:</strong> el total de las 5 filas suma $1.470.000, que es exactamente
                lo que Carlos debía pagar (21 días × $70.000). Con la descripción en cada fila
                queda claro qué días cubre cada pago y el libro no presenta huecos.
              </div>
            </>
          )}

          {tab === 'daily' && (
            <>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderLeft: '4px solid #2f9e44',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 4 }}>
                  ¿Cuándo usar este método?
                </div>
                <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
                  Cuando el conductor paga <strong>cada día que trabaja</strong>. Es el método más
                  transparente y fácil de verificar: cada fila = un día = un pago. No requiere
                  notas aclaratorias adicionales porque cada día queda registrado individualmente.
                </div>
              </div>

              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, marginBottom: 6 }}>
                <strong>Reglas de oro:</strong>
              </div>
              <ul
                style={{
                  fontSize: 13,
                  color: '#374151',
                  lineHeight: 1.8,
                  paddingLeft: 20,
                  marginBottom: 16,
                }}
              >
                <li>
                  Se registra <strong>una fila por cada día</strong>, con la fecha exacta del día
                  trabajado — no la fecha en que se hace el registro.
                </li>
                <li>
                  El campo <strong>Descripción</strong> se puede dejar vacío si es un pago normal
                  completo. Úsalo solo cuando haya algo que aclarar: pago parcial, acuerdo
                  especial, motivo de ausencia que quedó al día.
                </li>
                <li>
                  Cuando el conductor{' '}
                  <strong>no lleva nada en un día específico</strong> pero quieres dejar
                  constancia de por qué (enfermedad, permiso, falla del carro), registra el día
                  con valor <strong>$0</strong> y describe la situación en la Descripción.
                </li>
                <li>
                  Si pagó parcial, registra lo que pagó y deja en Descripción cuánto debe — así
                  el libro no queda con huecos.
                </li>
                <li>
                  El campo <strong>Saldo</strong> se llena con lo que el conductor{' '}
                  <em>debe acumulado hasta ese día</em>. Cuando queda en paz (no debe nada), se
                  deja en <strong>0 o vacío</strong>.
                </li>
              </ul>

              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 2 }}>
                Ejemplo — Luis Peña / valor diario $80.000:
              </div>
              <SampleTable
                headerBg="#2f9e44"
                headers={[
                  { isDayCol: true },
                  { label: 'Descripción (Cuando el dia actual)' },
                  { label: 'Firma' },
                  { label: 'Valor', right: true, bold: true },
                  { label: 'Saldo', right: true, bold: true },
                ]}
                rows={[
                  ['01', '2 Abril', 'Luis Peña', { label: '$85.000', color: '#166534' },''],
                  ['02', '3 Abril', 'Luis Peña', { label: '$85.000', color: '#166534' },''],
                  ['03', 'No trabajó — cita médica EPS', 'Luis Peña', { label: '$0', color: '#94a3b8' }, ''],
                  ['04', '-', '-', { label: '$40.000', color: '#e67700' }, ''],
                  ['05', '4 Abril', 'Luis Peña', { label: '$85.000', color: '#166534' }, ''],
                ]}
              />

              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#166534',
                }}
              >
                <strong>Pro tip:</strong> el día 3 con $0 y la descripción de la causa deja
                constancia de por qué no hubo pago. El día 4 con pago parcial queda registrado
                como está — el saldo pendiente se anota en la columna Saldo. Con este método el
                libro siempre refleja exactamente la realidad, día por día.
              </div>
            </>
          )}
        </div>
      </CModalBody>
    </CModal>
  )
}
