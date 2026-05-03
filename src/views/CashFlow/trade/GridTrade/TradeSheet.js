import React, { useState } from 'react'
import GridChart from './GridChart'
import { PLATFORMS, fmtPrice, fmtUSD } from './utils'

export default function TradeSheet({ initial, saving, onSave, onClose }) {
  const isEdit = !!initial?.id
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    asset: initial?.asset ?? '',
    platform: initial?.platform ?? '',
    gridType: initial?.gridType ?? 'long',
    centerPrice: initial?.centerPrice ?? '',
    upperPrice: initial?.upperPrice ?? '',
    lowerPrice: initial?.lowerPrice ?? '',
    gridCount: initial?.gridCount ?? '',
    investment: initial?.investment ?? '',
    startDate: initial?.startDate ?? today,
    endDate: initial?.endDate ?? '',
    loanRate: initial?.loanRate ?? '',
    loanStartDate: initial?.loanStartDate ?? '',
    notes: initial?.notes ?? '',
  })
  const [showPreview, setShowPreview] = useState(false)

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const canPreview =
    Number(form.centerPrice) > 0 &&
    Number(form.upperPrice) > Number(form.lowerPrice) &&
    Number(form.lowerPrice) > 0 &&
    Number(form.gridCount) >= 1

  const handleSave = () => {
    if (!form.asset.trim() || !form.platform.trim()) return
    onSave({
      id: initial?.id ?? null,
      asset: form.asset.trim(),
      platform: form.platform.trim(),
      centerPrice: Number(form.centerPrice) || 0,
      upperPrice: Number(form.upperPrice) || 0,
      lowerPrice: Number(form.lowerPrice) || 0,
      gridType: form.gridType,
      gridCount: Number(form.gridCount) || 0,
      investment: Number(form.investment) || 0,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      loanRate: Number(form.loanRate) || 0,
      loanStartDate: form.loanStartDate || null,
      notes: form.notes.trim(),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    })
  }

  // fontSize 16 prevents iOS Safari from auto-zooming on focus
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
  const btnDisabled = saving || !form.asset.trim() || !form.platform.trim()

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 560,
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          paddingBottom: 'max(36px, env(safe-area-inset-bottom))',
          padding: '18px 20px 36px',
          maxHeight: '94dvh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box',
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: '#dee2e6',
            margin: '0 auto 18px',
          }}
        />
        <div style={{ fontSize: 17, fontWeight: 800, color: '#0d1117', marginBottom: 16 }}>
          {isEdit ? 'Editar grid trade' : 'Nuevo grid trade'}
        </div>

        {/* Grid type toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            {
              value: 'long',
              label: '📈 Grid Long',
              bg: '#e8f5e9',
              color: '#2e7d32',
              border: '#4caf50',
            },
            {
              value: 'short',
              label: '📉 Grid Short',
              bg: '#fff0f0',
              color: '#c62828',
              border: '#ef5350',
            },
          ].map(({ value, label, bg, color, border }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((p) => ({ ...p, gridType: value }))}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 10,
                border: `2px solid ${form.gridType === value ? border : '#dee2e6'}`,
                background: form.gridType === value ? bg : '#fff',
                color: form.gridType === value ? color : '#adb5bd',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                touchAction: 'manipulation',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Asset + Platform */}
        <div style={row2}>
          <div>
            <label style={labelStyle}>ACTIVO *</label>
            <input
              style={inputStyle}
              type="text"
              value={form.asset}
              onChange={set('asset')}
              placeholder="BTC/USDT"
              autoComplete="off"
              enterKeyHint="next"
            />
          </div>
          <div>
            <label style={labelStyle}>PLATAFORMA *</label>
            <input
              style={inputStyle}
              type="text"
              list="platforms-list"
              value={form.platform}
              onChange={set('platform')}
              placeholder="Binance"
              autoComplete="off"
              enterKeyHint="next"
            />
            <datalist id="platforms-list">
              {PLATFORMS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Precio central */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>PRECIO CENTRAL (entrada / referencia)</label>
          <input
            style={inputStyle}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={form.centerPrice}
            onChange={set('centerPrice')}
            placeholder="70000"
            enterKeyHint="next"
          />
        </div>

        {/* Upper + Lower */}
        <div style={row2}>
          <div>
            <label style={labelStyle}>PRECIO MÁXIMO</label>
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.upperPrice}
              onChange={set('upperPrice')}
              placeholder="80000"
              enterKeyHint="next"
            />
          </div>
          <div>
            <label style={labelStyle}>PRECIO MÍNIMO</label>
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.lowerPrice}
              onChange={set('lowerPrice')}
              placeholder="60000"
              enterKeyHint="next"
            />
          </div>
        </div>

        {/* Grid count + Investment */}
        <div style={row2}>
          <div>
            <label style={labelStyle}>N° DE GRIDS</label>
            <input
              style={inputStyle}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.gridCount}
              onChange={set('gridCount')}
              placeholder="10"
              enterKeyHint="next"
            />
          </div>
          <div>
            <label style={labelStyle}>INVERSIÓN (USD)</label>
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.investment}
              onChange={set('investment')}
              placeholder="1000"
              enterKeyHint="next"
            />
          </div>
        </div>

        {/* Live calc chip */}
        {Number(form.investment) > 0 && Number(form.gridCount) > 0 && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 10,
              padding: '9px 13px',
              marginBottom: 18,
              fontSize: 13,
              color: '#166534',
              lineHeight: 1.5,
            }}
          >
            <strong>{fmtUSD(Number(form.investment) / Number(form.gridCount))}</strong> por grid
            {' · '}
            {Number(form.gridCount) + 1} niveles
            {Number(form.upperPrice) > Number(form.lowerPrice) && Number(form.gridCount) > 0
              ? ` · paso ${fmtPrice((Number(form.upperPrice) - Number(form.lowerPrice)) / Number(form.gridCount))}`
              : ''}
          </div>
        )}

        {/* Dates */}
        <div style={row2}>
          <div>
            <label style={labelStyle}>FECHA INICIO</label>
            <input
              style={inputStyle}
              type="date"
              value={form.startDate}
              onChange={set('startDate')}
            />
          </div>
          <div>
            <label style={labelStyle}>FECHA FIN</label>
            <input style={inputStyle} type="date" value={form.endDate} onChange={set('endDate')} />
          </div>
        </div>

        {/* Loan */}
        <div style={row2}>
          <div>
            <label style={labelStyle}>TASA PRÉSTAMO (% anual)</label>
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.loanRate}
              onChange={set('loanRate')}
              placeholder="12"
              enterKeyHint="next"
            />
          </div>
          <div>
            <label style={labelStyle}>INICIO PRÉSTAMO</label>
            <input
              style={inputStyle}
              type="date"
              value={form.loanStartDate}
              onChange={set('loanStartDate')}
            />
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>NOTAS</label>
          <textarea
            style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
            rows={2}
            value={form.notes}
            onChange={set('notes')}
            placeholder="Observaciones…"
          />
        </div>

        {/* Live preview toggle */}
        {canPreview && (
          <div style={{ marginBottom: 18 }}>
            <button
              onClick={() => setShowPreview((v) => !v)}
              style={{
                width: '100%',
                minHeight: 44,
                padding: '10px',
                borderRadius: 10,
                border: '1px solid #dee2e6',
                background: showPreview ? '#0d1117' : '#f8f9fa',
                color: showPreview ? '#fbbf24' : '#495057',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                touchAction: 'manipulation',
                marginBottom: showPreview ? 12 : 0,
              }}
            >
              {showPreview ? 'Ocultar vista previa' : 'Ver vista previa del grid'}
            </button>
            {showPreview && (
              <GridChart
                centerPrice={form.centerPrice}
                upperPrice={form.upperPrice}
                lowerPrice={form.lowerPrice}
                gridCount={form.gridCount}
                investment={form.investment}
                gridType={form.gridType}
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              minHeight: 48,
              padding: '13px 16px',
              borderRadius: 12,
              border: '1px solid #dee2e6',
              background: '#fff',
              fontSize: 15,
              fontWeight: 600,
              color: '#868e96',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={btnDisabled}
            style={{
              flex: 2,
              minHeight: 48,
              padding: '13px',
              borderRadius: 12,
              border: 'none',
              background: btnDisabled ? '#e9ecef' : '#0d1117',
              color: btnDisabled ? '#adb5bd' : '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: btnDisabled ? 'not-allowed' : 'pointer',
              touchAction: 'manipulation',
            }}
          >
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear grid trade'}
          </button>
        </div>
      </div>
    </div>
  )
}
