/**
 * OCR Receipt Rules
 *
 * Each entry in OCR_RULES represents a type of payment receipt (EPM, Nequi, etc.).
 * The engine (applyOcrRules) tries each rule in order and returns on the first match.
 *
 * Rule structure:
 *   label            – Display name shown to the user in the confirmation step
 *   trigger          – Regex tested against the full OCR text to detect this receipt type
 *   getIdentifier()  – Extracts the contract/account number used to match an account master.
 *                      Matching priority: master.bankAccountNumber === id, then master.name.includes(id)
 *   getAmount()      – Returns the raw amount string; null if not found
 *
 * Date extraction (extractDateFromText) runs automatically on any matched receipt —
 * no need to add getDate() to each rule. It parses Spanish long-form dates
 * ("05 de mayo de 2026", "2 De Mayo De 2026") and returns YYYY-MM-DD.
 *
 * To add a new receipt type:
 *   1. Add an entry to OCR_RULES (copy an existing one as template)
 *   2. Set trigger to a regex that uniquely identifies this receipt (company name, header, etc.)
 *   3. Write getIdentifier() to extract the contract/account number from the OCR text
 *   4. Write getAmount() pointing to the total paid field
 *   5. In the account master record, set bankAccountNumber to the value getIdentifier() will extract
 *   6. Add a real receipt image to src/utils/__tests__/fixtures/ocr/ and add a case to
 *      receiptAnalyzer.integration.test.js to verify end-to-end
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

  // ── Nequi (Envío a banco) ────────────────────────────────────────────────────
  {
    label: 'Nequi',
    trigger: /nequi|env[ií]o\s+a\s+banco/i,
    getIdentifier(text) {
      const m = text.match(/n[uú]mero\s+de\s+cuenta\s*[\n\r:]*\s*(\d+)/i)
      return m?.[1] ?? null
    },
    getAmount(text) {
      const m = text.match(/¿cu[aá]nto\?\s*[\n\r]*\s*\$?\s*([\d.,\s]+)/i)
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

// ── Date parser ────────────────────────────────────────────────────────────────

const MONTH_MAP = {
  enero: '01', febrero: '02', marzo: '03', abril: '04',
  mayo: '05', junio: '06', julio: '07', agosto: '08',
  septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12',
}

export function extractDateFromText(text) {
  const m = text.match(
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i,
  )
  if (!m) return null
  const day = m[1].padStart(2, '0')
  const month = MONTH_MAP[m[2].toLowerCase()]
  const year = m[3]
  return `${year}-${month}-${day}`
}

// ── Engine ─────────────────────────────────────────────────────────────────────

export function applyOcrRules(text) {
  for (const rule of OCR_RULES) {
    if (!rule.trigger.test(text)) continue
    const identifier = rule.getIdentifier(text)
    const rawAmount = rule.getAmount(text)
    const date = extractDateFromText(text)
    return { rule, identifier, rawAmount, date }
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
  return masters.find((a) => a.bankAccountNumber === id || a.name.includes(id)) ?? null
}
