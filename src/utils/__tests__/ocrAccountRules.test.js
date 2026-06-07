import { describe, it, expect } from 'vitest'
import {
  parseRawAmount,
  extractDateFromText,
  applyOcrRules,
  findAccountByIdentifier,
  OCR_RULES,
} from '../ocrAccountRules'

// ── parseRawAmount ─────────────────────────────────────────────────────────────

describe('parseRawAmount', () => {
  it.each([
    // Colombian format: dot = thousands, comma = decimal
    ['129.366,00', 129366],
    ['632.000,00', 632000],
    ['1.200.000,00', 1200000],
    // US format: comma = thousands, dot = decimal
    ['137,276.00', 137276],
    ['85,000.00', 85000],
    // Plain integers with thousands separator
    ['85,000', 85000],
    ['50,000', 50000],
    ['100,000', 100000],
    ['1,000', 1000],
    // No separator
    ['50000', 50000],
    ['200000', 200000],
    // With leading $ (already stripped by callers, but defensive)
    ['$ 137,276.00', 137276],
  ])('parses "%s" → %i', (raw, expected) => {
    expect(parseRawAmount(raw)).toBe(expected)
  })

  it.each([
    [null, null],
    [undefined, null],
    ['', null],
    ['   ', null],
    ['N/A', null],
    ['texto', null],
    // values ≤ 100 are rejected (noise / percentage)
    ['50', null],
    ['100', null],
    ['99', null],
  ])('returns null for "%s"', (raw, expected) => {
    expect(parseRawAmount(raw)).toBe(expected)
  })
})

// ── extractDateFromText ────────────────────────────────────────────────────────

describe('extractDateFromText', () => {
  it.each([
    ['05 de mayo de 2026 a las 08:27 p. m.', '2026-05-05'],
    ['2 De Mayo De 2026, 8:12 P. M.', '2026-05-02'],
    ['1 de enero de 2025', '2025-01-01'],
    ['15 de diciembre de 2024', '2024-12-15'],
    ['30 de junio de 2023', '2023-06-30'],
    ['3 de marzo de 2026', '2026-03-03'],
  ])('extracts "%s" → %s', (text, expected) => {
    expect(extractDateFromText(text)).toBe(expected)
  })

  it.each([
    ['Texto sin fecha'],
    ['Pago en EPM\nNúmero de contrato\n5906561'],
    [''],
    ['2026-05-05'],       // ISO format not recognized (only Spanish long form)
    ['05/05/2026'],       // slash format not recognized
  ])('returns null for "%s"', (text) => {
    expect(extractDateFromText(text)).toBeNull()
  })
})

// ── applyOcrRules ──────────────────────────────────────────────────────────────

describe('applyOcrRules', () => {
  it('returns null when no rule matches', () => {
    expect(applyOcrRules('Texto genérico sin empresa conocida')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(applyOcrRules('')).toBeNull()
  })

  describe('EPM', () => {
    const text = 'Pago en EPM\nNúmero de contrato\n5906561\n¿Cuánto pagaste?\n$ 137,276.00'

    it('matches trigger', () => {
      expect(applyOcrRules(text)?.rule.label).toBe('EPM')
    })

    it('extracts identifier', () => {
      expect(applyOcrRules(text)?.identifier).toBe('5906561')
    })

    it('extracts rawAmount', () => {
      expect(applyOcrRules(text)?.rawAmount).toMatch(/137/)
    })

    it('returns null identifier when contract number is missing', () => {
      expect(applyOcrRules('Pago en EPM\n¿Cuánto pagaste?\n$ 50,000')?.identifier).toBeNull()
    })

    it('falls back to first $ value when "pagaste" line is missing', () => {
      const r = applyOcrRules('Pago en EPM\nNúmero de contrato\n5906561\n$ 99,000')
      expect(r?.rawAmount).toMatch(/99/)
    })
  })

  describe('Claro', () => {
    const text = 'Claro\nNúmero de cuenta\n1234567890\nValor pagado: $85,000'

    it('matches trigger', () => {
      expect(applyOcrRules(text)?.rule.label).toBe('Claro')
    })

    it('extracts identifier from "Número de cuenta"', () => {
      expect(applyOcrRules(text)?.identifier).toBe('1234567890')
    })

    it('extracts identifier from "Cuenta:" inline format', () => {
      const r = applyOcrRules('Claro\nCuenta: 9876543210\nTotal pagado: $60,000')
      expect(r?.identifier).toBe('9876543210')
    })
  })

  describe('Nequi', () => {
    const text =
      'Envío a banco\nPara\nJoh*** Rod***\n¿Cuánto?\n$ 632.000,00\nNúmero de cuenta\n24061709971'

    it('matches trigger via "Envío a banco"', () => {
      expect(applyOcrRules(text)?.rule.label).toBe('Nequi')
    })

    it('also matches trigger via "Nequi" keyword', () => {
      expect(applyOcrRules('Nequi\n¿Cuánto?\n$ 100,000\nNúmero de cuenta\n11111')?.rule.label).toBe('Nequi')
    })

    it('extracts identifier (account number)', () => {
      expect(applyOcrRules(text)?.identifier).toBe('24061709971')
    })

    it('extracts rawAmount from "¿Cuánto?" line', () => {
      expect(applyOcrRules(text)?.rawAmount).toMatch(/632/)
    })
  })

  describe('Acueducto', () => {
    it('matches trigger', () => {
      const r = applyOcrRules('Empresa de Acueducto\nNúmero de cuenta\n123456\nValor: $45,000')
      expect(r?.rule.label).toBe('Acueducto')
    })

    it('matches "Aguas de" variant', () => {
      const r = applyOcrRules('Aguas de Bogotá\ncuenta\n654321\nTotal: $30,000')
      expect(r?.rule.label).toBe('Acueducto')
    })
  })

  describe('Gas Natural', () => {
    it('matches trigger', () => {
      const r = applyOcrRules('Gas Natural\nNúmero de contrato\n789012\nValor pagado: $25,000')
      expect(r?.rule.label).toBe('Gas Natural')
    })

    it('matches Surtigas variant', () => {
      expect(applyOcrRules('Surtigas\nsuscriptor\n111222\nTotal: $18,000')?.rule.label).toBe('Gas Natural')
    })
  })

  describe('Predial', () => {
    it('matches trigger', () => {
      const r = applyOcrRules('Impuesto Predial\nChip\n202100123\nValor pagado: $350,000')
      expect(r?.rule.label).toBe('Predial')
    })

    it('extracts chip identifier', () => {
      const r = applyOcrRules('Impuesto Predial\nChip\n202100123\nValor pagado: $350,000')
      expect(r?.identifier).toBe('202100123')
    })
  })

  it('uses first matching rule when multiple triggers could match', () => {
    // "EPM" comes before "Acueducto" in OCR_RULES
    const r = applyOcrRules('Pago en EPM Acueducto\nNúmero de contrato\n111\n$ 10,000')
    expect(r?.rule.label).toBe('EPM')
  })

  it('includes date in result when found', () => {
    const text = 'Pago en EPM\nNúmero de contrato\n5906561\n¿Cuánto pagaste?\n$ 50,000\nFecha\n05 de mayo de 2026'
    expect(applyOcrRules(text)?.date).toBe('2026-05-05')
  })

  it('includes null date when not found', () => {
    const text = 'Pago en EPM\nNúmero de contrato\n5906561\n¿Cuánto pagaste?\n$ 50,000'
    expect(applyOcrRules(text)?.date).toBeNull()
  })
})

// ── findAccountByIdentifier ────────────────────────────────────────────────────

describe('findAccountByIdentifier', () => {
  const masters = [
    // name does NOT include the number → only bankAccountNumber matches
    { id: 'sj-1', name: 'Servicios San Jeronimo', bankAccountNumber: '5906561' },
    // name includes the number → matched by name.includes
    { id: 'claro-1', name: 'Claro 1234567890' },
    { id: 'finca-1', name: 'Alquiler Finca', bankAccountNumber: '24061709971' },
  ]

  it('matches by bankAccountNumber (exact)', () => {
    expect(findAccountByIdentifier('5906561', masters)).toMatchObject({ id: 'sj-1' })
  })

  it('matches by name.includes when no bankAccountNumber matches', () => {
    expect(findAccountByIdentifier('1234567890', masters)).toMatchObject({ id: 'claro-1' })
  })

  it('returns null when identifier not found in any master', () => {
    expect(findAccountByIdentifier('9999999', masters)).toBeNull()
  })

  it('returns null for null identifier', () => {
    expect(findAccountByIdentifier(null, masters)).toBeNull()
  })

  it('returns null for empty string identifier', () => {
    expect(findAccountByIdentifier('', masters)).toBeNull()
  })

  it('returns null for empty masters array', () => {
    expect(findAccountByIdentifier('5906561', [])).toBeNull()
  })

  it('returns null for null masters', () => {
    expect(findAccountByIdentifier('5906561', null)).toBeNull()
  })

  it('trims whitespace from identifier before matching', () => {
    expect(findAccountByIdentifier('  5906561  ', masters)).not.toBeNull()
  })
})

// ── OCR_RULES structure ────────────────────────────────────────────────────────

describe('OCR_RULES', () => {
  it('every rule has label, trigger, getIdentifier, getAmount', () => {
    for (const rule of OCR_RULES) {
      expect(typeof rule.label).toBe('string')
      expect(rule.trigger).toBeInstanceOf(RegExp)
      expect(typeof rule.getIdentifier).toBe('function')
      expect(typeof rule.getAmount).toBe('function')
    }
  })

  it('getIdentifier returns string or null (never throws) on arbitrary text', () => {
    const texts = ['', '   ', 'texto aleatorio sin estructura', '$ 123.456\nCuenta: 789']
    for (const rule of OCR_RULES) {
      for (const text of texts) {
        let result
        expect(() => { result = rule.getIdentifier(text) }).not.toThrow()
        expect(result == null || typeof result === 'string').toBe(true)
      }
    }
  })

  it('getAmount returns string or null (never throws) on arbitrary text', () => {
    const texts = ['', 'texto', '$ 50,000', 'Total: 0']
    for (const rule of OCR_RULES) {
      for (const text of texts) {
        let result
        expect(() => { result = rule.getAmount(text) }).not.toThrow()
        expect(result == null || typeof result === 'string').toBe(true)
      }
    }
  })
})
