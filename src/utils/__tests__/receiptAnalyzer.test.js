import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyzeReceipt } from '../receiptAnalyzer'

// ── Tesseract mock ─────────────────────────────────────────────────────────────
const mockRecognize = vi.fn()

vi.mock('tesseract.js', () => ({
  default: { recognize: mockRecognize },
}))

// ── Fixtures ───────────────────────────────────────────────────────────────────
const fakeFile = new File(['img'], 'receipt.png', { type: 'image/png' })

const masters = [
  { id: 'epm-1', name: 'EPM 5906561', type: 'Expense', category: 'Servicios', important: false },
  { id: 'sj-1', name: 'Servicios San Jeronimo', bankAccountNumber: '5906561', type: 'Expense', category: 'Servicios', important: false },
  { id: 'claro-1', name: 'Claro 1234567890', type: 'Expense', category: 'Servicios', important: false },
  { id: 'finca-1', name: 'Alquiler Finca San Jeronimo', bankAccountNumber: '24061709971', type: 'Expense', category: 'Arriendo', important: false },
  { id: 'other-1', name: 'Otra cuenta', type: 'Expense', category: 'Varios', important: false },
]

function makeOcrResult(text) {
  return { data: { text } }
}

beforeEach(() => {
  mockRecognize.mockReset()
})

// ── analyzeReceipt ─────────────────────────────────────────────────────────────
describe('analyzeReceipt', () => {
  it('matches EPM receipt and returns account + amount', async () => {
    mockRecognize.mockResolvedValue(
      makeOcrResult('Pago en EPM\nNúmero de contrato\n5906561\n¿Cuánto pagaste?\n$ 137,276.00'),
    )

    const result = await analyzeReceipt(fakeFile, masters)

    expect(result.ruleLabel).toBe('EPM')
    expect(result.account).toMatchObject({ id: 'epm-1' })
    expect(result.amount).toBe(137276)
    expect(result.text).toContain('EPM')
  })

  it('matches Claro receipt', async () => {
    mockRecognize.mockResolvedValue(
      makeOcrResult('Claro\nNúmero de cuenta\n1234567890\nValor pagado: $85,000'),
    )

    const result = await analyzeReceipt(fakeFile, masters)

    expect(result.ruleLabel).toBe('Claro')
    expect(result.account).toMatchObject({ id: 'claro-1' })
    expect(result.amount).toBe(85000)
  })

  it('returns null account when identifier is not in masters', async () => {
    mockRecognize.mockResolvedValue(
      makeOcrResult('Pago en EPM\nNúmero de contrato\n9999999\n¿Cuánto pagaste?\n$ 50,000'),
    )

    const result = await analyzeReceipt(fakeFile, masters)

    expect(result.ruleLabel).toBe('EPM')
    expect(result.account).toBeNull()
    expect(result.amount).toBe(50000)
  })

  it('returns null account and ruleLabel when no rule matches', async () => {
    mockRecognize.mockResolvedValue(makeOcrResult('Texto genérico sin empresa conocida'))

    const result = await analyzeReceipt(fakeFile, masters)

    expect(result.ruleLabel).toBeNull()
    expect(result.account).toBeNull()
    expect(result.amount).toBeNull()
    expect(result.text).toBeTruthy()
  })

  it('returns null amount when receipt has no parseable value', async () => {
    mockRecognize.mockResolvedValue(
      makeOcrResult('Pago en EPM\nNúmero de contrato\n5906561\n¿Cuánto pagaste?\nN/A'),
    )

    const result = await analyzeReceipt(fakeFile, masters)

    expect(result.account).toMatchObject({ id: 'epm-1' })
    expect(result.amount).toBeNull()
  })

  it('extracts date from Nequi receipt (spanish long format)', async () => {
    mockRecognize.mockResolvedValue(
      makeOcrResult(
        'Envío a banco\n¿Cuánto?\n$ 632.000,00\nFecha\n2 De Mayo De 2026, 8:12 P. M.\nNúmero de cuenta\n24061709971',
      ),
    )

    const result = await analyzeReceipt(fakeFile, masters)

    expect(result.date).toBe('2026-05-02')
  })

  it('extracts date from EPM receipt', async () => {
    mockRecognize.mockResolvedValue(
      makeOcrResult(
        'Pago en EPM\nNúmero de contrato\n5906561\n¿Cuánto pagaste?\n$ 129.366,00\nFecha\n05 de mayo de 2026 a las 08:27 p. m.',
      ),
    )

    const result = await analyzeReceipt(fakeFile, masters)

    expect(result.date).toBe('2026-05-05')
  })

  it('returns null date when no date found', async () => {
    mockRecognize.mockResolvedValue(
      makeOcrResult('Pago en EPM\nNúmero de contrato\n5906561\n¿Cuánto pagaste?\n$ 50,000'),
    )

    const result = await analyzeReceipt(fakeFile, masters)

    expect(result.date).toBeNull()
  })

  it('calls onProgress with percentage values', async () => {
    mockRecognize.mockImplementation((_file, _lang, { logger }) => {
      logger({ status: 'recognizing text', progress: 0.5 })
      logger({ status: 'recognizing text', progress: 1.0 })
      return Promise.resolve(makeOcrResult('Texto'))
    })

    const onProgress = vi.fn()
    await analyzeReceipt(fakeFile, masters, onProgress)

    expect(onProgress).toHaveBeenCalledWith(50)
    expect(onProgress).toHaveBeenCalledWith(100)
  })

  it('matches EPM receipt by bankAccountNumber when name does not contain the contract number', async () => {
    mockRecognize.mockResolvedValue(
      makeOcrResult(
        'Pago en EPM\nNúmero de contrato\n5906561\n¿Cuánto pagaste?\n$ 129.366,00',
      ),
    )

    const localMasters = [
      { id: 'sj-1', name: 'Servicios San Jeronimo', bankAccountNumber: '5906561', type: 'Expense', category: 'Servicios', important: false },
      { id: 'other-1', name: 'Otra cuenta', type: 'Expense', category: 'Varios', important: false },
    ]
    const result = await analyzeReceipt(fakeFile, localMasters)

    expect(result.ruleLabel).toBe('EPM')
    expect(result.account).toMatchObject({ id: 'sj-1' })
    expect(result.amount).toBe(129366)
  })

  it('matches Nequi receipt by account number', async () => {
    mockRecognize.mockResolvedValue(
      makeOcrResult(
        'Envío a banco\nPara\nJoh*** Rod*** Bed***\n¿Cuánto?\n$ 632.000,00\nBanco\nBancolombia\nNúmero de cuenta\n24061709971',
      ),
    )

    const result = await analyzeReceipt(fakeFile, masters)

    expect(result.ruleLabel).toBe('Nequi')
    expect(result.account).toMatchObject({ id: 'finca-1' })
    expect(result.amount).toBe(632000)
  })

  it('works with empty masters list', async () => {
    mockRecognize.mockResolvedValue(
      makeOcrResult('Pago en EPM\nNúmero de contrato\n5906561\n¿Cuánto pagaste?\n$ 100,000'),
    )

    const result = await analyzeReceipt(fakeFile, [], )

    expect(result.account).toBeNull()
    expect(result.amount).toBe(100000)
  })
})
