const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const API_URL = 'https://api.anthropic.com/v1/messages'

const SYSTEM_PROMPT = `Eres un diseñador gráfico profesional experto en diseño de planos, layouts y composición visual.
Ayudas al usuario a diseñar en un editor 2D de vectores SVG.

El canvas es un área de trabajo con nodos (figuras). Cada nodo tiene esta estructura:
{ id, type, name, x, y, w, h, rotation, fill, fillOpacity, stroke, strokeWidth, visible, locked, groupId, text, fontSize, fontColor }
Tipos válidos: rect | roundRect | circle | triangle | polygon | star | line | vline | arrow | elbow90 | elbowRound | text | cota

REGLA CRÍTICA: Responde ÚNICAMENTE con un objeto JSON válido. Sin texto antes, sin texto después, sin bloques markdown, sin explicaciones fuera del JSON.

Cuando el usuario pida crear o modificar elementos:
{"action":"update_nodes","nodes":[...lista COMPLETA de nodos...],"message":"Frase breve explicando qué hiciste"}

Cuando el usuario pida opinión o consejo sin modificar el canvas:
{"action":"message","message":"Tu respuesta profesional aquí"}

Reglas:
- SIEMPRE incluye el campo "message" con una frase corta en español
- Al modificar el canvas devuelve TODOS los nodos (existentes + nuevos/modificados)
- Usa colores profesionales y armónicos
- Posiciones y tamaños coherentes con el canvas recibido
- Máximo 2 oraciones en "message"
- Solo JSON puro en la respuesta, nunca markdown`

// Strip node properties not needed by Claude to save tokens
const leanNode = (n) => {
  const r = (v) => Math.round(v * 10) / 10
  return {
    id: n.id, type: n.type, name: n.name,
    x: r(n.x), y: r(n.y), w: r(n.w), h: r(n.h),
    rotation: Math.round(n.rotation ?? 0),
    fill: n.fill, stroke: n.stroke,
    fillOpacity: n.fillOpacity,
    strokeWidth: n.strokeWidth,
    visible: n.visible, locked: n.locked, groupId: n.groupId ?? null,
    ...(n.text != null && { text: n.text }),
    ...(n.fontSize != null && { fontSize: n.fontSize }),
    ...(n.fontColor != null && { fontColor: n.fontColor }),
  }
}

export const sendDesignMessage = async ({ messages, canvasConfig, nodes }) => {
  const leanNodes = nodes.map(leanNode)
  const contextMsg = `Canvas: ${canvasConfig.width}×${canvasConfig.height} ${canvasConfig.unit}. Nodos (${leanNodes.length}): ${JSON.stringify(leanNodes)}`

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: contextMsg },
        { role: 'assistant', content: 'Entendido.' },
        ...messages,
        // prefill forces Claude to start directly with JSON
        { role: 'assistant', content: '{' },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Error ${response.status}`)
  }

  const data = await response.json()
  // prefill added '{' — prepend it to the response
  const raw = '{' + (data.content?.[0]?.text ?? '')

  try { return JSON.parse(raw) } catch { /* fall through */ }

  // extract from first { to last } as safety net
  const end = raw.lastIndexOf('}')
  if (end !== -1) {
    try { return JSON.parse(raw.slice(0, end + 1)) } catch { /* fall through */ }
  }

  return { action: 'message', message: 'No pude generar una respuesta válida. Intenta reformular.' }
}
