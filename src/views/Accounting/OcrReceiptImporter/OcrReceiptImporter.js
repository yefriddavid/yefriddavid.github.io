import React, { useEffect, useRef, useState } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CSpinner } from '@coreui/react'
import { applyOcrRules, findAccountByIdentifier, parseRawAmount } from '../ocrAccountRules'
import "./OcrReceiptImporter.scss"

// ── Confirmation modal ─────────────────────────────────────────────────────────
function ConfirmModal({
  visible,
  imageUrl,
  ocrText,
  matchedAccount,
  matchedRuleLabel,
  allAccounts,
  amount,
  date,
  onConfirm,
  onClose,
}) {
  const [selectedId, setSelectedId] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState(date)
  const [showRaw, setShowRaw] = useState(false)

  // Sync state when new OCR result arrives
  useEffect(() => {
    setSelectedId(matchedAccount?.id ?? '')
    setEditAmount(amount != null ? String(amount) : '')
    setEditDate(date)
    setShowRaw(false)
  }, [matchedAccount, amount, date, visible])

  const handleConfirm = () => {
    const account = allAccounts.find((a) => a.id === selectedId)
    if (!account || !editAmount) return
    onConfirm({ account, amount: Number(editAmount), date: editDate })
  }

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader className="ocr-receipt-importer__modal-header">
        <CModalTitle className="ocr-receipt-importer__modal-title">
          📄 Confirmar registro desde comprobante
        </CModalTitle>
      </CModalHeader>
      <CModalBody className="ocr-receipt-importer__modal-body">
        <div className="ocr-receipt-importer__container">
          {/* Image thumbnail */}
          {imageUrl && (
            <div className="ocr-receipt-importer__image-container">
              <img
                src={imageUrl}
                alt="Comprobante"
                className="ocr-receipt-importer__image"
              />
            </div>
          )}

          {/* Form */}
          <div className="ocr-receipt-importer__form">
            {/* Account selector */}
            <div className="ocr-receipt-importer__field-container">
              <label className="ocr-receipt-importer__label">
                Cuenta
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="ocr-receipt-importer__input-select"
              >
                <option value="">— Seleccione una cuenta —</option>
                {allAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {matchedAccount && selectedId === matchedAccount.id && (
                <div className="ocr-receipt-importer__match-info">
                  ✓ Identificada como comprobante <strong>{matchedRuleLabel}</strong> por número de
                  contrato
                </div>
              )}
              {!matchedAccount && (
                <div className="ocr-receipt-importer__match-warning">
                  ⚠ Tipo de comprobante no reconocido — seleccione la cuenta manualmente
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="ocr-receipt-importer__field-container">
              <label className="ocr-receipt-importer__label">
                Valor (COP)
              </label>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Ingrese el valor manualmente"
                className={`ocr-receipt-importer__input-text ${!editAmount ? 'ocr-receipt-importer__input-text--error' : ''}`}
              />
              {!editAmount && (
                <div className="ocr-receipt-importer__error-message">
                  No se detectó el valor — ingréselo manualmente
                </div>
              )}
            </div>

            {/* Date */}
            <div className="ocr-receipt-importer__field-container ocr-receipt-importer__field-container--spaced">
              <label className="ocr-receipt-importer__label">
                Fecha
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="ocr-receipt-importer__input-select"
              />
            </div>

            {/* Actions */}
            <div className="ocr-receipt-importer__actions">
              <button
                onClick={onClose}
                className="ocr-receipt-importer__button-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedId || !editAmount}
                className="ocr-receipt-importer__button-confirm"
              >
                Registrar pago
              </button>
            </div>
          </div>
        </div>

        {/* Raw OCR text toggle */}
        {ocrText && (
          <div className="ocr-receipt-importer__ocr-toggle">
            <button
              onClick={() => setShowRaw((v) => !v)}
              className="ocr-receipt-importer__ocr-toggle-button"
            >
              {showRaw ? '▲ Ocultar' : '▼ Ver'} texto extraído por OCR
            </button>
            {showRaw && (
              <pre className="ocr-receipt-importer__ocr-text">
                {ocrText}
              </pre>
            )}
          </div>
        )}
      </CModalBody>
    </CModal>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function OcrReceiptImporter({ masters, monthStr, onConfirm }) {
  const inputRef = useRef()
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [ocrText, setOcrText] = useState('')
  const [matchedAccount, setMatchedAccount] = useState(null)
  const [extractedAmount, setExtractedAmount] = useState(null)
  const [matchedRuleLabel, setMatchedRuleLabel] = useState(null)
  const today = new Date().toISOString().slice(0, 10)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setProcessing(true)
    setProgress(0)
    setMatchedAccount(null)
    setExtractedAmount(null)
    setMatchedRuleLabel(null)

    try {
      const Tesseract = (await import('tesseract.js')).default
      const result = await Tesseract.recognize(file, 'spa', {
        logger: (m) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100))
        },
      })

      const text = result.data.text
      setOcrText(text)

      const ruleResult = applyOcrRules(text)
      const account = ruleResult
        ? findAccountByIdentifier(ruleResult.identifier, masters ?? [])
        : null
      setMatchedAccount(account)
      setMatchedRuleLabel(ruleResult?.rule?.label ?? null)

      const amount = ruleResult ? parseRawAmount(ruleResult.rawAmount) : null
      setExtractedAmount(amount)

      setShowModal(true)
    } catch (err) {
      alert('Error al procesar la imagen: ' + err.message)
    } finally {
      setProcessing(false)
      inputRef.current.value = ''
    }
  }

  const handleConfirm = ({ account, amount, date }) => {
    onConfirm({
      accountMasterId: account.id,
      accountMasterName: account.name,
      accountMasterImportant: account.important ?? false,
      type: account.type === 'Incoming' ? 'income' : 'expense',
      category: account.category ?? '',
      description: account.name,
      amount,
      date,
      accountMonth: monthStr,
    })
    setShowModal(false)
  }

  return (
    <div data-testid="ocr-importer">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <button
        onClick={() => inputRef.current.click()}
        disabled={processing}
        title="Cargar comprobante y registrar automáticamente con OCR"
        className="ocr-receipt-importer__trigger-button"
      >
        {processing ? (
          <>
            <CSpinner size="sm" style={{ color: '#6366f1', width: 14, height: 14 }} />
            OCR {progress}%
          </>
        ) : (
          <>📷 Leer comprobante</>
        )}
      </button>

      <ConfirmModal
        visible={showModal}
        imageUrl={imageUrl}
        ocrText={ocrText}
        matchedAccount={matchedAccount}
        matchedRuleLabel={matchedRuleLabel}
        allAccounts={masters ?? []}
        amount={extractedAmount}
        date={today}
        onConfirm={handleConfirm}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}
