import React, { useEffect, useRef, useState } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CSpinner } from '@coreui/react'
import { applyOcrRules, findAccountByIdentifier, parseRawAmount } from './ocrAccountRules'

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
      <CModalHeader style={{ background: '#f0f4ff', borderBottom: '1px solid #c7d2fe' }}>
        <CModalTitle style={{ color: '#3730a3', fontWeight: 700, fontSize: 15 }}>
          📄 Confirmar registro desde comprobante
        </CModalTitle>
      </CModalHeader>
      <CModalBody style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Image thumbnail */}
          {imageUrl && (
            <div style={{ flexShrink: 0 }}>
              <img
                src={imageUrl}
                alt="Comprobante"
                style={{
                  width: 160,
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
            </div>
          )}

          {/* Form */}
          <div style={{ flex: 1, minWidth: 240 }}>
            {/* Account selector */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6c757d',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Cuenta
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1.5px solid #c7d2fe',
                  fontSize: 13,
                  color: '#1e3a5f',
                  background: '#f8faff',
                }}
              >
                <option value="">— Seleccione una cuenta —</option>
                {allAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {matchedAccount && selectedId === matchedAccount.id && (
                <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>
                  ✓ Identificada como comprobante <strong>{matchedRuleLabel}</strong> por número de
                  contrato
                </div>
              )}
              {!matchedAccount && (
                <div style={{ fontSize: 11, color: '#f59f00', marginTop: 4 }}>
                  ⚠ Tipo de comprobante no reconocido — seleccione la cuenta manualmente
                </div>
              )}
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6c757d',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Valor (COP)
              </label>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Ingrese el valor manualmente"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: `1.5px solid ${!editAmount ? '#fca5a5' : '#c7d2fe'}`,
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#1e3a5f',
                  background: '#f8faff',
                }}
              />
              {!editAmount && (
                <div style={{ fontSize: 11, color: '#e03131', marginTop: 4 }}>
                  No se detectó el valor — ingréselo manualmente
                </div>
              )}
            </div>

            {/* Date */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6c757d',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Fecha
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1.5px solid #c7d2fe',
                  fontSize: 13,
                  color: '#1e3a5f',
                  background: '#f8faff',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  border: '1px solid #dee2e6',
                  background: '#f8fafc',
                  color: '#6c757d',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedId || !editAmount}
                style={{
                  flex: 2,
                  padding: '10px 0',
                  borderRadius: 8,
                  border: 'none',
                  background: !selectedId || !editAmount ? '#e2e8f0' : '#1e3a5f',
                  color: !selectedId || !editAmount ? '#94a3b8' : '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: !selectedId || !editAmount ? 'not-allowed' : 'pointer',
                }}
              >
                Registrar pago
              </button>
            </div>
          </div>
        </div>

        {/* Raw OCR text toggle */}
        {ocrText && (
          <div style={{ marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
            <button
              onClick={() => setShowRaw((v) => !v)}
              style={{
                fontSize: 11,
                color: '#94a3b8',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {showRaw ? '▲ Ocultar' : '▼ Ver'} texto extraído por OCR
            </button>
            {showRaw && (
              <pre
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: '#64748b',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '8px 10px',
                  whiteSpace: 'pre-wrap',
                  maxHeight: 160,
                  overflowY: 'auto',
                }}
              >
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
    <>
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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontWeight: 600,
          padding: '7px 14px',
          borderRadius: 9,
          border: '1.5px solid #6366f1',
          background: '#f5f3ff',
          color: processing ? '#a5b4fc' : '#4338ca',
          cursor: processing ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
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
    </>
  )
}
