const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const API_URL = 'https://api.anthropic.com/v1/messages'

export const hasAuditChatKey = () => Boolean(API_KEY)

const SYSTEM_PROMPT = `Eres un auditor financiero experto revisando liquidaciones de taxis.

Recibirás:
- La lista de liquidaciones del período (fecha, placa, conductor, valor).
- La lista de gastos del período (fecha, placa, categoría, descripción, valor, si está pagado).
- Los conductores activos del período con su valor esperado por día (normal y domingo/festivo).
- El estado de cobertura por día YA CALCULADO por la app: si el día quedó completo, parcial o sin
  liquidar, qué conductores faltaron, cuáles pagaron menos de lo esperado, y si el vehículo tenía
  restricción de pico y placa ese día (en ese caso la ausencia de liquidación es normal, no un
  hallazgo). Usa este cálculo como base — no lo recalcules desde cero, pero sí contrástalo contra
  los soportes e identifica lo que la app no puede ver en una imagen.
- Los soportes/comprobantes adjuntos al período: imágenes con su descripción opcional.

Tu trabajo es ayudar a auditar el período: detectar inconsistencias entre liquidaciones, gastos,
el estado de cobertura y los soportes; montos que no calzan, soportes sin liquidación o gasto
asociado, gastos sin soporte, liquidaciones sospechosas, días marcados como problema que en
realidad se explican por un soporte adjunto, etc. Responde siempre en español, de forma clara y
concisa.`

const NOTES_SYSTEM_PROMPT = `Eres un auditor financiero que revisa liquidaciones de taxis y propone
notas de auditoría puntuales por día y conductor, para que el usuario las revise y apruebe antes de
guardarlas. Recibirás el mismo contexto de liquidaciones, gastos, conductores y estado de cobertura
por día descrito arriba.

Devuelve ÚNICAMENTE un objeto JSON válido. Sin texto antes, sin texto después, sin bloques markdown:
{"notes":[{"date":"YYYY-MM-DD","driver":"Nombre exacto del conductor","note":"Comentario breve y específico"}]}

Reglas:
- Solo propone notas para día+conductor donde haya un hallazgo concreto (faltante, pago
  insuficiente, inconsistencia con un soporte, gasto sin soporte, etc.). No inventes notas para
  días sin problema.
- "driver" debe coincidir EXACTAMENTE con uno de los nombres de la lista de conductores activos
  recibida — nunca lo abrevies ni lo inventes.
- "date" debe ser una fecha real del período en formato YYYY-MM-DD.
- Si no encuentras ningún hallazgo que amerite una nota, devuelve {"notes":[]}.
- Nunca agregues texto fuera del JSON, nunca uses bloques \`\`\`.`

const parseDataUrl = (dataUrl) => {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl ?? '')
  return match ? { media_type: match[1], data: match[2] } : null
}

const dayFlags = (day) =>
  [day.isHoliday && 'festivo', day.isSunday && 'domingo', day.hasPicoPlaca && 'pico y placa']
    .filter(Boolean)
    .join(', ')

const dayStatusLine = (day) => {
  const parts = [`${day.dateStr} | estado: ${day.status}`]
  const flags = dayFlags(day)
  if (flags) parts.push(`(${flags})`)
  if (day.missing.length) parts.push(`faltan: ${day.missing.join(', ')}`)
  if (day.underpaidVehicles.length) {
    parts.push(`pago insuficiente en placa(s): ${day.underpaidVehicles.join(', ')}`)
  }
  return parts.join(' ')
}

const buildContextBlocks = ({
  period,
  settlements,
  expenses,
  attachments,
  periodDrivers,
  auditDays,
}) => {
  const settlementsText = settlements.length
    ? settlements.map((r) => `${r.date} | ${r.plate} | ${r.driver} | ${r.amount}`).join('\n')
    : '(sin liquidaciones en este período)'

  const expensesText = expenses.length
    ? expenses
        .map(
          (e) =>
            `${e.date} | ${e.plate} | ${e.category} | ${e.description} | ${e.amount} | ${e.paid ? 'pagado' : 'pendiente'}`,
        )
        .join('\n')
    : '(sin gastos en este período)'

  const driversText = periodDrivers.length
    ? periodDrivers
        .map(
          (d) =>
            `${d.name} | vehículo: ${d.defaultVehicle || '—'} | esperado día normal: ${d.defaultAmount || 0} | domingo/festivo: ${d.defaultAmountSunday || d.defaultAmount || 0}`,
        )
        .join('\n')
    : '(sin conductores activos en este período)'

  const pastDays = auditDays.filter((d) => !d.isFuture)
  const dayStatusText = pastDays.length
    ? pastDays.map(dayStatusLine).join('\n')
    : '(sin días transcurridos en este período)'

  const blocks = [
    {
      type: 'text',
      text:
        `Período: ${period.month}/${period.year}\n\n` +
        `Liquidaciones (fecha | placa | conductor | valor):\n${settlementsText}\n\n` +
        `Gastos (fecha | placa | categoría | descripción | valor | estado):\n${expensesText}\n\n` +
        `Conductores activos y valor esperado por día:\n${driversText}\n\n` +
        `Estado de cobertura por día (ya calculado por la app):\n${dayStatusText}\n\n` +
        `Soportes adjuntos: ${attachments.length}`,
    },
  ]

  attachments.forEach((att) => {
    const parsed = parseDataUrl(att.image)
    if (!parsed) return
    blocks.push({ type: 'image', source: { type: 'base64', ...parsed } })
    if (att.description) {
      blocks.push({ type: 'text', text: `Descripción del soporte anterior: ${att.description}` })
    }
  })

  return blocks
}

const callClaude = async (system, messages) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 2048, system, messages }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Error ${response.status}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text ?? ''
}

export const sendAuditMessage = async ({
  messages,
  period,
  settlements,
  expenses,
  attachments,
  periodDrivers,
  auditDays,
}) => {
  const contextBlocks = buildContextBlocks({
    period,
    settlements,
    expenses,
    attachments,
    periodDrivers,
    auditDays,
  })

  const text = await callClaude(SYSTEM_PROMPT, [
    { role: 'user', content: contextBlocks },
    { role: 'assistant', content: 'Entendido, tengo la información del período.' },
    ...messages,
  ])

  return text || 'No obtuve respuesta.'
}

// Asks Claude to propose audit notes as strict JSON, so the UI can show a
// confirmation dialog before any note is actually saved.
export const proposeAuditNotes = async ({
  period,
  settlements,
  expenses,
  attachments,
  periodDrivers,
  auditDays,
}) => {
  const contextBlocks = buildContextBlocks({
    period,
    settlements,
    expenses,
    attachments,
    periodDrivers,
    auditDays,
  })

  const text = await callClaude(NOTES_SYSTEM_PROMPT, [
    { role: 'user', content: contextBlocks },
    { role: 'assistant', content: 'Entendido, tengo la información del período.' },
    { role: 'user', content: 'Propón las notas de auditoría en el formato JSON indicado.' },
  ])

  try {
    return JSON.parse(text)
  } catch {
    /* fall through to safety-net extraction below */
  }

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) {
    try {
      return JSON.parse(text.slice(start, end + 1))
    } catch {
      /* fall through to default */
    }
  }

  return { notes: [] }
}
