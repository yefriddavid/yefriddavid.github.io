import React, { useEffect, useRef, useState } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody } from '@coreui/react'
import { analyzeReceipt } from 'src/utils/receiptAnalyzer'
import './OcrReceiptImporter.scss'

const STEPS = ['capture', 'processing', 'confirm']
const STEP_LABELS = ['1. Imagen', '2. Procesando', '3. Confirmar']

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const current = STEPS.indexOf(step)
  return (
    <div className="ocr-receipt-importer__steps">
      {STEP_LABELS.map((label, i) => (
        <React.Fragment key={label}>
          <span
            className={[
              'ocr-receipt-importer__step',
              i === current ? 'ocr-receipt-importer__step--active' : '',
              i < current ? 'ocr-receipt-importer__step--done' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {label}
          </span>
          {i < STEP_LABELS.length - 1 && (
            <span className="ocr-receipt-importer__step-sep">→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Step 1: Capture ────────────────────────────────────────────────────────────
function CaptureStep({ onFileSelected, onNext }) {
  const inputRef = useRef()
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [pasteError, setPasteError] = useState('')

  const handleFile = (f) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setPasteError('')
  }

  const handlePaste = async () => {
    setPasteError('')
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'))
        if (imageType) {
          const blob = await item.getType(imageType)
          const f = new File([blob], 'pasted.png', { type: imageType })
          handleFile(f)
          return
        }
      }
      setPasteError('No hay imagen en el portapapeles')
    } catch {
      setPasteError('No se pudo acceder al portapapeles — use Subir archivo')
    }
  }

  const handleNext = () => {
    if (!file) return
    onFileSelected(file, preview)
    onNext()
  }

  return (
    <div className="ocr-receipt-importer__capture">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div className="ocr-receipt-importer__source-buttons">
        <button
          className="ocr-receipt-importer__source-btn"
          onClick={() => inputRef.current.click()}
        >
          <span className="ocr-receipt-importer__source-icon">📁</span>
          <span className="ocr-receipt-importer__source-label">Subir archivo</span>
          <span className="ocr-receipt-importer__source-hint">JPG, PNG, PDF</span>
        </button>

        <button className="ocr-receipt-importer__source-btn" onClick={handlePaste}>
          <span className="ocr-receipt-importer__source-icon">📋</span>
          <span className="ocr-receipt-importer__source-label">Pegar imagen</span>
          <span className="ocr-receipt-importer__source-hint">Ctrl+C → aquí</span>
        </button>
      </div>

      {pasteError && (
        <div className="ocr-receipt-importer__error-message">{pasteError}</div>
      )}

      {preview && (
        <div className="ocr-receipt-importer__preview">
          <img src={preview} alt="Vista previa" className="ocr-receipt-importer__preview-img" />
        </div>
      )}

      <div className="ocr-receipt-importer__nav">
        <button
          className="ocr-receipt-importer__button-confirm"
          disabled={!file}
          onClick={handleNext}
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}

// ── Step 2: Processing ─────────────────────────────────────────────────────────
function ProcessingStep({ file, imageUrl, masters, transactions, onDone, onBack }) {
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [isDuplicate, setIsDuplicate] = useState(false)

  useEffect(() => {
    if (!file) return
    let cancelled = false

    analyzeReceipt(file, masters, (p) => { if (!cancelled) setProgress(p) })
      .then((r) => {
        if (cancelled) return
        const receiptMonth = r.date?.slice(0, 7)
        const dup = !!(r.account && receiptMonth && transactions?.some((t) => {
          const txMonth = t.accountMonth ?? t.date?.slice(0, 7)
          return t.accountMasterId === r.account.id && txMonth === receiptMonth
        }))
        if (dup) {
          setResult(r)
          setIsDuplicate(true)
        } else {
          onDone(r)
        }
      })
      .catch((err) => { if (!cancelled) onDone({ error: err.message, text: '', account: null, amount: null }) })

    return () => { cancelled = true }
  }, [file])

  return (
    <div className="ocr-receipt-importer__processing">
      {imageUrl && (
        <img src={imageUrl} alt="Comprobante" className="ocr-receipt-importer__image" />
      )}

      {!isDuplicate && (
        <>
          <div className="ocr-receipt-importer__progress-label">
            Analizando imagen… {progress}%
          </div>
          <div className="ocr-receipt-importer__progress-bar">
            <div
              className="ocr-receipt-importer__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}

      {isDuplicate && (
        <>
          <div className="ocr-receipt-importer__duplicate-warning">
            ⚠ Este pago ya está registrado para esta cuenta y fecha
          </div>
          <div className="ocr-receipt-importer__actions">
            <button onClick={onBack} className="ocr-receipt-importer__button-cancel">
              ← Volver
            </button>
            <button onClick={() => onDone(result)} className="ocr-receipt-importer__button-confirm">
              Registrar de todas formas
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Step 3: Confirm ────────────────────────────────────────────────────────────
function ConfirmStep({ imageUrl, ocrText, matchedAccount, matchedRuleLabel, allAccounts, amount, date, onConfirm, onBack }) {
  const [selectedId, setSelectedId] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState(date)
  const [showRaw, setShowRaw] = useState(false)

  useEffect(() => {
    setSelectedId(matchedAccount?.id ?? '')
    setEditAmount(amount != null ? String(amount) : '')
    setEditDate(date)
    setShowRaw(false)
  }, [matchedAccount, amount, date])

  const handleConfirm = () => {
    const account = allAccounts.find((a) => a.id === selectedId)
    if (!account || !editAmount) return
    onConfirm({ account, amount: Number(editAmount), date: editDate })
  }

  return (
    <div>
      <div className="ocr-receipt-importer__container">
        {imageUrl && (
          <div className="ocr-receipt-importer__image-container">
            <img src={imageUrl} alt="Comprobante" className="ocr-receipt-importer__image" />
          </div>
        )}

        <div className="ocr-receipt-importer__form">
          <div className="ocr-receipt-importer__field-container">
            <label className="ocr-receipt-importer__label">Cuenta</label>
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

          <div className="ocr-receipt-importer__field-container">
            <label className="ocr-receipt-importer__label">Valor (COP)</label>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              placeholder="Ingrese el valor manualmente"
              className={`ocr-receipt-importer__input-text${!editAmount ? ' ocr-receipt-importer__input-text--error' : ''}`}
            />
            {!editAmount && (
              <div className="ocr-receipt-importer__error-message">
                No se detectó el valor — ingréselo manualmente
              </div>
            )}
          </div>

          <div className="ocr-receipt-importer__field-container ocr-receipt-importer__field-container--spaced">
            <label className="ocr-receipt-importer__label">Fecha</label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="ocr-receipt-importer__input-select"
            />
          </div>

          <div className="ocr-receipt-importer__actions">
            <button onClick={onBack} className="ocr-receipt-importer__button-cancel">
              ← Atrás
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

      {ocrText && (
        <div className="ocr-receipt-importer__ocr-toggle">
          <button
            onClick={() => setShowRaw((v) => !v)}
            className="ocr-receipt-importer__ocr-toggle-button"
          >
            {showRaw ? '▲ Ocultar' : '▼ Ver'} texto extraído por OCR
          </button>
          {showRaw && (
            <pre className="ocr-receipt-importer__ocr-text">{ocrText}</pre>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function OcrReceiptImporter({ masters, monthStr, transactions, onConfirm }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('capture')
  const [file, setFile] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [ocrResult, setOcrResult] = useState(null)
  const today = new Date().toISOString().slice(0, 10)

  const reset = () => {
    setStep('capture')
    setFile(null)
    setImageUrl(null)
    setOcrResult(null)
  }

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  const handleFileSelected = (f, url) => {
    setFile(f)
    setImageUrl(url)
  }

  const handleOcrDone = (result) => {
    setOcrResult(result)
    setStep('confirm')
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
    handleClose()
  }

  return (
    <div data-testid="ocr-importer">
      <button onClick={() => setOpen(true)} className="ocr-receipt-importer__trigger-button">
        📷 Leer comprobante
      </button>

      <CModal visible={open} onClose={handleClose} size="lg">
        <CModalHeader className="ocr-receipt-importer__modal-header">
          <CModalTitle className="ocr-receipt-importer__modal-title">
            📄 Asistente de comprobante
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="ocr-receipt-importer__modal-body">
          <StepIndicator step={step} />

          {step === 'capture' && (
            <CaptureStep onFileSelected={handleFileSelected} onNext={() => setStep('processing')} />
          )}

          {step === 'processing' && (
            <ProcessingStep
              file={file}
              imageUrl={imageUrl}
              masters={masters}
              transactions={transactions}
              onDone={handleOcrDone}
              onBack={() => setStep('capture')}
            />
          )}

          {step === 'confirm' && ocrResult && (
            <ConfirmStep
              imageUrl={imageUrl}
              ocrText={ocrResult.text}
              matchedAccount={ocrResult.account}
              matchedRuleLabel={ocrResult.ruleLabel}
              allAccounts={masters ?? []}
              amount={ocrResult.amount}
              date={ocrResult.date ?? today}
              onConfirm={handleConfirm}
              onBack={() => setStep('capture')}
            />
          )}
        </CModalBody>
      </CModal>
    </div>
  )
}
