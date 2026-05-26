/**
 * Integration tests for the OCR receipt analyzer.
 *
 * These tests run real Tesseract OCR against image fixtures — no mocks.
 * They are slow (~30s total) and are kept separate from the unit tests.
 *
 * To add a new receipt type:
 *   1. Save the image to src/utils/__tests__/fixtures/ocr/<name>.png
 *   2. Add the matching account master to the `masters` array below
 *   3. Add a new it() case with the expected ruleLabel, amount, date, and account id
 *
 * Run only these tests:
 *   npx vitest run src/utils/__tests__/receiptAnalyzer.integration.test.js
 */
import { describe, it, expect } from 'vitest'
import { join } from 'path'
import Tesseract from 'tesseract.js'
import { applyOcrRules, findAccountByIdentifier, parseRawAmount } from '../ocrAccountRules'

const FIXTURES = join(__dirname, 'fixtures/ocr')

async function analyzeFromPath(imagePath, masters) {
  const result = await Tesseract.recognize(imagePath, 'spa')
  const text = result.data.text
  const ruleResult = applyOcrRules(text)
  const account = ruleResult ? findAccountByIdentifier(ruleResult.identifier, masters ?? []) : null
  const amount = ruleResult ? parseRawAmount(ruleResult.rawAmount) : null
  return {
    text,
    account,
    amount,
    ruleLabel: ruleResult?.rule?.label ?? null,
    date: ruleResult?.date ?? null,
  }
}

const masters = [
  {
    id: 'finca-1',
    name: 'Alquiler Finca San Jeronimo',
    bankAccountNumber: '24061709971',
    type: 'Expense',
    category: 'Arriendo',
  },
  {
    id: 'sj-epm-1',
    name: 'Servicios San Jeronimo',
    bankAccountNumber: '5906561',
    type: 'Expense',
    category: 'Servicios',
  },
]

describe('receiptAnalyzer — integration (real OCR)', () => {
  it('nequi_finca.png → Nequi, $632.000, 2026-05-02, cuenta Finca San Jeronimo', async () => {
    const result = await analyzeFromPath(join(FIXTURES, 'nequi_finca.png'), masters)

    expect(result.ruleLabel).toBe('Nequi')
    expect(result.amount).toBe(632000)
    expect(result.date).toBe('2026-05-02')
    expect(result.account).toMatchObject({ id: 'finca-1' })
  }, 60000)

  it('epm_servicios.png → EPM, $129.366, 2026-05-05, cuenta Servicios San Jeronimo', async () => {
    const result = await analyzeFromPath(join(FIXTURES, 'epm_servicios.png'), masters)

    expect(result.ruleLabel).toBe('EPM')
    expect(result.amount).toBe(129366)
    expect(result.date).toBe('2026-05-05')
    expect(result.account).toMatchObject({ id: 'sj-epm-1' })
  }, 60000)
})
