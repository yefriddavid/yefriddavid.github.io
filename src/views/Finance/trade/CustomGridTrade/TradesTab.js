import React, { useState, useMemo, useRef } from 'react'
import { useDispatch } from 'react-redux'
import * as actions from 'src/actions/finance/customGridTradeActions'
import AppModal from 'src/components/shared/AppModal'

const today = () => new Date().toISOString().slice(0, 10)

const JSON_PLACEHOLDER = `[
  {
    "price": 78000,
    "quantity": 0.5,
    "fecha": "2024-01-15",
    "notes": "opcional"
  }
]`

function tryAutoFix(raw) {
  return raw
    .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":') // quote unquoted keys
    .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
}

function parseImport(raw) {
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) throw new Error('Se espera un array JSON')
  return parsed.map((item, i) => {
    if (!item.price) throw new Error(`Item ${i + 1}: falta "price"`)
    if (!item.quantity) throw new Error(`Item ${i + 1}: falta "quantity"`)
    if (!item.fecha) throw new Error(`Item ${i + 1}: falta "fecha"`)
    return {
      price: Number(item.price),
      quantity: Number(item.quantity),
      fecha: item.fecha,
      notes: item.notes?.trim() ?? '',
      createdAt: item.createdAt ?? new Date().toISOString(),
    }
  })
}

const emptyForm = () => ({ price: '', quantity: '', fecha: today(), notes: '' })

const inputStyle = {
  width: '100%',
  border: 'none',
  borderBottom: '2px solid #dee2e6',
  outline: 'none',
  padding: '6px 0 10px',
  background: 'transparent',
  fontSize: 16,
  color: '#0d1117',
  boxSizing: 'border-box',
  WebkitAppearance: 'none',
}
const labelStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: '#868e96',
  display: 'block',
  marginBottom: 4,
  letterSpacing: '0.05em',
}
const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }

const FILTER_FIELDS = [
  { key: 'quantity', label: 'Cantidad' },
  { key: 'price', label: 'Precio' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'notes', label: 'Notas' },
]

export default function TradesTab({ trades, saving, hiddenTrades, toggleHide }) {
  const dispatch = useDispatch()
  const [form, setForm] = useState(null)
  const [importOpen, setImportOpen] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)
  const [filterField, setFilterField] = useState('quantity')
  const [filterValue, setFilterValue] = useState('')
  const textareaRef = useRef(null)
  const lineNumsRef = useRef(null)
  const lineCount = Math.max(1, jsonText.split('\n').length)

  const importResult = useMemo(() => {
    if (!jsonText.trim()) return { valid: null, error: null }
    const toParse = (() => {
      try { JSON.parse(jsonText); return jsonText } catch { return tryAutoFix(jsonText) }
    })()
    try {
      return { valid: parseImport(toParse), error: null }
    } catch (e) {
      return { valid: null, error: e.message }
    }
  }, [jsonText])

  const handleFormat = () => {
    const toParse = (() => {
      try { JSON.parse(jsonText); return jsonText } catch { return tryAutoFix(jsonText) }
    })()
    try {
      setJsonText(JSON.stringify(JSON.parse(toParse), null, 2))
    } catch {
      // leave as-is if still unparseable
    }
  }

  const handleImport = () => {
    if (!importResult.valid?.length) return
    dispatch(actions.bulkImportRequest(importResult.valid))
    setImportOpen(false)
    setJsonText('')
  }

  const openImport = () => {
    setJsonText('')
    setImportOpen(true)
  }

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const openNew = () => setForm(emptyForm())
  const openEdit = (trade) =>
    setForm({
      id: trade.id,
      price: trade.price,
      quantity: trade.quantity,
      fecha: trade.fecha ?? today(),
      notes: trade.notes ?? '',
    })
  const close = () => setForm(null)

  const handleSave = () => {
    if (!form.price || !form.quantity || !form.fecha) return
    dispatch(
      actions.saveRequest({
        id: form.id ?? null,
        price: Number(form.price),
        quantity: Number(form.quantity),
        fecha: form.fecha,
        notes: form.notes.trim(),
        createdAt: form.id ? undefined : new Date().toISOString(),
      }),
    )
    close()
  }

  const handleDelete = (trade) => {
    if (window.confirm(`¿Eliminar trade en $${trade.price}?`)) {
      dispatch(actions.deleteRequest({ id: trade.id }))
    }
  }

  const fmtK = (p) => `$${(p / 1000).toFixed(2)}K`
  const btnDisabled = saving || !form?.price || !form?.quantity || !form?.fecha

  const importConfirmLabel = saving
    ? 'Importando…'
    : importResult.valid
      ? `Importar ${importResult.valid.length} trade${importResult.valid.length !== 1 ? 's' : ''}`
      : 'Importar'

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0d1117' }}>
          {trades.length} trade{trades.length !== 1 ? 's' : ''}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={openImport}
            style={{
              height: 36,
              padding: '0 14px',
              borderRadius: 8,
              border: '1px solid #dee2e6',
              background: '#fff',
              color: '#495057',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Importar JSON
          </button>
          <button
            onClick={openNew}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: '#0d1117',
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid #dee2e6' }}>
        <select
          value={filterField}
          onChange={(e) => { setFilterField(e.target.value); setFilterValue('') }}
          style={{
            height: 36,
            padding: '0 10px',
            border: 'none',
            borderRight: '1px solid #dee2e6',
            background: '#f8f9fa',
            color: '#495057',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            flexShrink: 0,
          }}
        >
          {FILTER_FIELDS.map((f) => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
        <input
          type={filterField === 'fecha' ? 'date' : 'text'}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          placeholder={`Buscar por ${FILTER_FIELDS.find((f) => f.key === filterField)?.label.toLowerCase()}…`}
          style={{
            flex: 1,
            height: 36,
            padding: '0 12px',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: '#0d1117',
            background: '#fff',
          }}
        />
        {filterValue && (
          <button
            onClick={() => setFilterValue('')}
            style={{
              height: 36,
              padding: '0 10px',
              border: 'none',
              background: '#fff',
              color: '#adb5bd',
              fontSize: 16,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* List */}
      {trades.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#adb5bd', fontSize: 14 }}>
          Sin trades. Presiona + para agregar el primero.
        </div>
      ) : (
        [...trades]
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
          .filter((t) => {
            if (!filterValue.trim()) return true
            const val = String(t[filterField] ?? '').toLowerCase()
            return val.includes(filterValue.trim().toLowerCase())
          })
          .map((t) => (
          <div
            key={t.id}
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e9ecef',
              padding: '12px 14px',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              opacity: hiddenTrades?.has(t.price) ? 0.45 : 1,
              transition: 'opacity 150ms',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0d1117' }}>{fmtK(t.price)}</div>
              <div style={{ fontSize: 12, color: '#868e96', marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span>{t.quantity} unid · {t.fecha}</span>
                <span style={{ color: '#4dabf7', fontWeight: 700 }}>${(t.price * t.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {t.notes && (
                <div style={{ fontSize: 11, color: '#adb5bd', fontStyle: 'italic', marginTop: 2 }}>
                  {t.notes}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => toggleHide(t.price)}
                title={hiddenTrades?.has(t.price) ? 'Mostrar en grid' : 'Ocultar en grid'}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: `2px solid ${hiddenTrades?.has(t.price) ? '#4b5563' : '#a78bfa'}`,
                  background: hiddenTrades?.has(t.price) ? '#f8f9fa' : '#f3eeff',
                  color: hiddenTrades?.has(t.price) ? '#4b5563' : '#a78bfa',
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {hiddenTrades?.has(t.price) ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <line x1="3" y1="13" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <circle cx="8" cy="8" r="2" fill="currentColor"/>
                  </svg>
                )}
              </button>
              <button
                onClick={() => openEdit(t)}
                style={{
                  minHeight: 36,
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#eef4ff',
                  color: '#1e3a5f',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Editar
              </button>
              <button
                onClick={() => {
                  const { id: _id, ...rest } = t
                  setForm({ ...rest, fecha: today() })
                }}
                style={{
                  minHeight: 36,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#f8f9fa',
                  color: '#495057',
                  fontSize: 15,
                  cursor: 'pointer',
                }}
                title="Clonar"
              >
                ⧉
              </button>
              <button
                onClick={() => handleDelete(t)}
                style={{
                  minHeight: 36,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#fff5f5',
                  color: '#e03131',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ))
      )}

      {/* JSON Import modal */}
      <AppModal
        visible={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importar JSON"
        size="lg"
        onConfirm={handleImport}
        confirmLabel={importConfirmLabel}
        confirmDisabled={!importResult.valid?.length || saving}
        confirmLoading={saving}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          {/* Collapsible help */}
          <div style={{ flex: 1 }}>
            <button
              onClick={() => setHelpOpen((v) => !v)}
              style={{
                border: 'none',
                background: 'none',
                fontSize: 12,
                fontWeight: 600,
                color: '#868e96',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span style={{ fontSize: 10, transition: 'transform 150ms', display: 'inline-block', transform: helpOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
              Ejemplo de item
            </button>
            {helpOpen && (
              <div
                style={{
                  marginTop: 8,
                  background: '#161b22',
                  border: '1px solid #2d333b',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontFamily: 'Menlo, Monaco, Consolas, monospace',
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: '#e6edf3',
                }}
              >
                <div><span style={{ color: '#79c0ff' }}>{`{`}</span></div>
                <div style={{ paddingLeft: 16 }}>
                  <span style={{ color: '#ff7b72' }}>"price"</span>
                  <span style={{ color: '#e6edf3' }}>: </span>
                  <span style={{ color: '#79c0ff' }}>118161.20</span>
                  <span style={{ color: '#6e7681' }}>,{'  '}// requerido — precio de entrada</span>
                </div>
                <div style={{ paddingLeft: 16 }}>
                  <span style={{ color: '#ff7b72' }}>"quantity"</span>
                  <span style={{ color: '#e6edf3' }}>: </span>
                  <span style={{ color: '#79c0ff' }}>0.00846</span>
                  <span style={{ color: '#6e7681' }}>,{'  '}// requerido — cantidad</span>
                </div>
                <div style={{ paddingLeft: 16 }}>
                  <span style={{ color: '#ff7b72' }}>"fecha"</span>
                  <span style={{ color: '#e6edf3' }}>: </span>
                  <span style={{ color: '#a5d6ff' }}>"2025-08-15"</span>
                  <span style={{ color: '#6e7681' }}>,{'  '}// requerido — YYYY-MM-DD</span>
                </div>
                <div style={{ paddingLeft: 16 }}>
                  <span style={{ color: '#ff7b72' }}>"notes"</span>
                  <span style={{ color: '#e6edf3' }}>: </span>
                  <span style={{ color: '#a5d6ff' }}>"observación"</span>
                  <span style={{ color: '#6e7681' }}>{'  '}// opcional</span>
                </div>
                <div><span style={{ color: '#79c0ff' }}>{`}`}</span></div>
              </div>
            )}
          </div>
          <button
            onClick={handleFormat}
            style={{
              border: 'none',
              background: 'none',
              fontSize: 12,
              fontWeight: 700,
              color: '#4dabf7',
              cursor: 'pointer',
              padding: 0,
              letterSpacing: '0.03em',
              flexShrink: 0,
              marginLeft: 12,
            }}
          >
            Formatear
          </button>
        </div>

        {/* Code editor */}
        <div
          style={{
            background: '#0d1117',
            borderRadius: 10,
            marginBottom: 10,
            border: importResult.error
              ? '1.5px solid #ff6b6b'
              : importResult.valid
                ? '1.5px solid #51cf66'
                : '1.5px solid #2d333b',
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          <div
            ref={lineNumsRef}
            style={{
              overflowY: 'hidden',
              paddingTop: 12,
              paddingBottom: 12,
              paddingLeft: 10,
              paddingRight: 8,
              fontFamily: 'Menlo, Monaco, Consolas, monospace',
              fontSize: 13,
              lineHeight: 1.6,
              color: '#484f58',
              textAlign: 'right',
              userSelect: 'none',
              minWidth: 32,
              borderRight: '1px solid #21262d',
              flexShrink: 0,
            }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            onScroll={() => {
              if (lineNumsRef.current)
                lineNumsRef.current.scrollTop = textareaRef.current.scrollTop
            }}
            placeholder={JSON_PLACEHOLDER}
            rows={14}
            spellCheck={false}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'Menlo, Monaco, Consolas, monospace',
              fontSize: 13,
              lineHeight: 1.6,
              color: '#e6edf3',
              padding: '12px 14px',
              boxSizing: 'border-box',
              caretColor: '#4dabf7',
            }}
          />
        </div>

        {/* Status line */}
        <div style={{ minHeight: 18, fontSize: 13 }}>
          {importResult.error && (
            <span style={{ color: '#ff6b6b', fontFamily: 'Menlo, Monaco, Consolas, monospace' }}>
              ✕ {importResult.error}
            </span>
          )}
          {importResult.valid && (
            <span style={{ color: '#51cf66', fontWeight: 700 }}>
              ✓ {importResult.valid.length} trade{importResult.valid.length !== 1 ? 's' : ''}{' '}
              válido{importResult.valid.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </AppModal>

      {/* Trade form modal */}
      <AppModal
        visible={form !== null}
        onClose={close}
        title={form?.id ? 'Editar trade' : 'Nuevo trade'}
        size="sm"
        onConfirm={handleSave}
        confirmLabel={saving ? 'Guardando…' : form?.id ? 'Guardar cambios' : 'Crear trade'}
        confirmDisabled={btnDisabled}
        confirmLoading={saving}
      >
        <div style={row2}>
          <div>
            <label style={labelStyle}>PRECIO DE ENTRADA *</label>
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form?.price ?? ''}
              onChange={set('price')}
              placeholder="78000"
            />
          </div>
          <div>
            <label style={labelStyle}>CANTIDAD *</label>
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form?.quantity ?? ''}
              onChange={set('quantity')}
              placeholder="0.5"
            />
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>FECHA DE ENTRADA *</label>
          <input
            style={inputStyle}
            type="date"
            value={form?.fecha ?? ''}
            onChange={set('fecha')}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={labelStyle}>NOTAS</label>
          <textarea
            style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
            rows={2}
            value={form?.notes ?? ''}
            onChange={set('notes')}
            placeholder="Observaciones…"
          />
        </div>
      </AppModal>
    </div>
  )
}
