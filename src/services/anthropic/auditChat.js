const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const API_URL = 'https://api.anthropic.com/v1/messages'

export const hasAuditChatKey = () => Boolean(API_KEY)

const SYSTEM_PROMPT = `Eres un auditor financiero experto revisando liquidaciones de taxis.

Recibirás:
- La lista de liquidaciones del período (fecha, placa, conductor, valor).
- La lista de gastos del período (fecha, placa, categoría, descripción, valor, si está pagado).
- Los soportes/comprobantes adjuntos al período: imágenes con su descripción opcional.

Tu trabajo es ayudar a auditar el período: detectar inconsistencias entre liquidaciones, gastos y
soportes, montos que no calzan, soportes sin liquidación o gasto asociado, gastos sin soporte,
liquidaciones sospechosas, días sin actividad que sí tienen soporte, etc. Responde siempre en
español, de forma clara y concisa.`

const parseDataUrl = (dataUrl) => {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl ?? '')
  return match ? { media_type: match[1], data: match[2] } : null
}

const buildContextBlocks = ({ period, settlements, expenses, attachments }) => {
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

  const blocks = [
    {
      type: 'text',
      text:
        `Período: ${period.month}/${period.year}\n\n` +
        `Liquidaciones (fecha | placa | conductor | valor):\n${settlementsText}\n\n` +
        `Gastos (fecha | placa | categoría | descripción | valor | estado):\n${expensesText}\n\n` +
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

export const sendAuditMessage = async ({
  messages,
  period,
  settlements,
  expenses,
  attachments,
}) => {
  const contextBlocks = buildContextBlocks({ period, settlements, expenses, attachments })

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: contextBlocks },
        { role: 'assistant', content: 'Entendido, tengo la información del período.' },
        ...messages,
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Error ${response.status}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text ?? 'No obtuve respuesta.'
}
