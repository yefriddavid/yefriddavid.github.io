/**
 * OCR Receipt Rules
 *
 * Each entry represents a type of payment receipt. When a receipt image is
 * processed, the engine tries each rule in order until one matches.
 *
 * Structure of each rule:
 *   label        – Human-readable name for this receipt type
 *   trigger      – Regex tested against the full OCR text to detect this type
 *   getIdentifier(text) – Extracts the contract/reference number that will be
 *                         matched against account master names
 *   getAmount(text)     – Returns the raw amount string (digits + separators)
 *                         from the receipt; null if not found
 *
 * To add a new receipt type:
 *   1. Copy an existing entry
 *   2. Set a trigger regex that uniquely identifies it
 *   3. Write getIdentifier() using the label/field that precedes the number
 *   4. Write getAmount() pointing to the "total paid" field
 */

// Shared amount parser (used by individual getAmount implementations)
export function parseRawAmount(raw) {
  if (!raw) return null
  const clean = raw.replace(/\s/g, '')
  if (!clean) return null

  const lastDot = clean.lastIndexOf('.')
  const lastComma = clean.lastIndexOf(',')

  let intPart
  if (lastDot === -1 && lastComma === -1) {
    intPart = clean
  } else if (lastDot > lastComma) {
    // dot is rightmost: decimal if ≤2 digits follow, else thousand separator
    intPart =
      clean.length - lastDot - 1 <= 2
        ? clean.slice(0, lastDot).replace(/,/g, '')
        : clean.replace(/[.,]/g, '')
  } else {
    // comma is rightmost
    intPart =
      clean.length - lastComma - 1 <= 2
        ? clean.slice(0, lastComma).replace(/\./g, '')
        : clean.replace(/[.,]/g, '')
  }

  const n = parseInt(intPart.replace(/[^0-9]/g, ''), 10)
  return !isNaN(n) && n > 100 ? n : null
}

// ── Rule definitions ───────────────────────────────────────────────────────────

export const OCR_RULES = [
  // ── EPM (Energía / Gas) ──────────────────────────────────────────────────────
  {
    label: 'EPM',
    trigger: /pago en epm|epm\b/i,
    getIdentifier(text) {
      // "Número de contrato\n5906561"
      const m = text.match(/n[uú]mero\s+de\s+contrato\s*[\n\r:]+\s*(\d+)/i)
      return m?.[1] ?? null
    },
    getAmount(text) {
      // "¿Cuánto pagaste?\n$ 137,276.00"
      const m = text.match(/pagaste[?¿\s]*[\n\r]+\s*\$?\s*([\d.,\s]+)/i)
      if (m) return m[1]
      // Fallback: first $ value in document
      const f = text.match(/\$\s*([\d.,\s]+)/)
      return f?.[1] ?? null
    },
  },

  // ── Claro (Telefonía / Internet) ─────────────────────────────────────────────
  {
    label: 'Claro',
    trigger: /claro\b|pago\s+claro/i,
    getIdentifier(text) {
      // "Número de cuenta\n1234567890"
      const m = text.match(/n[uú]mero\s+de\s+cuenta\s*[\n\r:]+\s*(\d+)/i)
      if (m) return m[1]
      // "Cuenta: 1234567890"
      const m2 = text.match(/cuenta[:\s]+(\d{6,})/i)
      return m2?.[1] ?? null
    },
    getAmount(text) {
      const m = text.match(/(?:valor\s+pagado|total\s+pagado|monto)[:\s]*\$?\s*([\d.,\s]+)/i)
      if (m) return m[1]
      const f = text.match(/\$\s*([\d.,\s]+)/)
      return f?.[1] ?? null
    },
  },

  // ── Acueducto (Aguas) ────────────────────────────────────────────────────────
  {
    label: 'Acueducto',
    trigger: /acueducto|aguas\s+(de|del)|empresa\s+de\s+acueducto/i,
    getIdentifier(text) {
      const m = text.match(/(?:n[uú]mero\s+de\s+cuenta|cuenta|contrato)\s*[\n\r:]+\s*(\d+)/i)
      return m?.[1] ?? null
    },
    getAmount(text) {
      const m = text.match(/(?:valor|total|pago)\s*[\n\r:]+\s*\$?\s*([\d.,\s]+)/i)
      if (m) return m[1]
      const f = text.match(/\$\s*([\d.,\s]+)/)
      return f?.[1] ?? null
    },
  },

  // ── Gas Natural / Surtigas / Vanti ───────────────────────────────────────────
  {
    label: 'Gas Natural',
    trigger: /gas\s+natural|surtigas|vanti\b/i,
    getIdentifier(text) {
      const m = text.match(/(?:n[uú]mero\s+de\s+contrato|cuenta|suscriptor)\s*[\n\r:]+\s*(\d+)/i)
      return m?.[1] ?? null
    },
    getAmount(text) {
      const m = text.match(/(?:valor\s+pagado|total|monto)\s*[\n\r:]+\s*\$?\s*([\d.,\s]+)/i)
      if (m) return m[1]
      const f = text.match(/\$\s*([\d.,\s]+)/)
      return f?.[1] ?? null
    },
  },

  // ── ETB / UNE / Movistar (Telecomunicaciones) ────────────────────────────────
  {
    label: 'Telecomunicaciones',
    trigger: /etb\b|une\b|movistar|tigo\b|wom\b/i,
    getIdentifier(text) {
      const m = text.match(
        /(?:n[uú]mero\s+de\s+cuenta|cuenta|contrato|factura)\s*[\n\r:]+\s*(\d+)/i,
      )
      return m?.[1] ?? null
    },
    getAmount(text) {
      const m = text.match(/(?:valor|total|monto)\s*[\n\r:]+\s*\$?\s*([\d.,\s]+)/i)
      if (m) return m[1]
      const f = text.match(/\$\s*([\d.,\s]+)/)
      return f?.[1] ?? null
    },
  },

  // ── Predial (Impuesto predial) ───────────────────────────────────────────────
  {
    label: 'Predial',
    trigger: /predial|impuesto\s+predial/i,
    getIdentifier(text) {
      // Chip or property identifier
      const m = text.match(
        /(?:chip|c[oó]digo\s+catastral|referencia\s+catastral)\s*[\n\r:]+\s*(\d+)/i,
      )
      return m?.[1] ?? null
    },
    getAmount(text) {
      const m = text.match(
        /(?:valor\s+pagado|total\s+a\s+pagar|monto)\s*[\n\r:]+\s*\$?\s*([\d.,\s]+)/i,
      )
      if (m) return m[1]
      const f = text.match(/\$\s*([\d.,\s]+)/)
      return f?.[1] ?? null
    },
  },
]

// ── Engine ─────────────────────────────────────────────────────────────────────

/**
 * Runs the rule engine against OCR text.
 * Returns { rule, identifier, rawAmount } for the first matching rule,
 * or null if no rule matches.
 */
export function applyOcrRules(text) {
  for (const rule of OCR_RULES) {
    if (!rule.trigger.test(text)) continue
    const identifier = rule.getIdentifier(text)
    const rawAmount = rule.getAmount(text)
    return { rule, identifier, rawAmount }
  }
  return null
}

/**
 * Finds the best matching account master for a given identifier string.
 * Looks for the identifier as a substring of the account name (case-insensitive).
 */
export function findAccountByIdentifier(identifier, masters) {
  if (!identifier || !masters) return null
  const id = identifier.trim()
  return masters.find((a) => a.name.includes(id)) ?? null
}
