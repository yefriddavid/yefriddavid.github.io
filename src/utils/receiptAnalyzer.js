import { applyOcrRules, findAccountByIdentifier, parseRawAmount } from './ocrAccountRules'

export async function analyzeReceipt(file, masters, onProgress) {
  const Tesseract = (await import('tesseract.js')).default
  const result = await Tesseract.recognize(file, 'spa', {
    logger: (m) => {
      if (m.status === 'recognizing text') onProgress?.(Math.round(m.progress * 100))
    },
  })

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
