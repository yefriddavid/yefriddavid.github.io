import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as a from '../../../../actions/finance/loanActions'
import './LoanCalc.scss'

const fmt = (n, dec = 2) =>
  n != null && isFinite(n)
    ? n.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec })
    : '—'

function calcFrench(principal, r, n) {
  if (r === 0) {
    const payment = principal / n
    return Array.from({ length: n }, (_, i) => ({
      num: i + 1,
      payment,
      interest: 0,
      cap: payment,
      balance: Math.max(0, principal - payment * (i + 1)),
    }))
  }
  const payment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const rows = []
  let balance = principal
  for (let i = 0; i < n; i++) {
    const interest = balance * r
    const cap = payment - interest
    balance = Math.max(0, balance - cap)
    rows.push({ num: i + 1, payment, interest, cap, balance })
  }
  return rows
}

function calcGerman(principal, r, n) {
  const fixedCap = principal / n
  const rows = []
  let balance = principal
  for (let i = 0; i < n; i++) {
    const interest = balance * r
    const payment = fixedCap + interest
    balance = Math.max(0, balance - fixedCap)
    rows.push({ num: i + 1, payment, interest, cap: fixedCap, balance })
  }
  return rows
}

const METHODS = [
  { id: 'french', label: 'Cuota fija (francés)' },
  { id: 'german', label: 'Capital fijo (alemán)' },
]

const EMPTY_SAVE = { name: '', bank: '' }

export default function LoanCalc() {
  const dispatch = useDispatch()
  const { records, saving } = useSelector((s) => s.loan)

  const [principal, setPrincipal] = useState('')
  const [rate, setRate] = useState('')
  const [rateMode, setRateMode] = useState('annual')
  const [periods, setPeriods] = useState('')
  const [method, setMethod] = useState('french')
  const [safetyFee, setSafetyFee] = useState('')

  const [activeLoanId, setActiveLoanId] = useState(null)
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [saveForm, setSaveForm] = useState(EMPTY_SAVE)
  const nameInputRef = useRef(null)

  useEffect(() => {
    dispatch(a.loadRequest())
  }, [dispatch])

  useEffect(() => {
    if (showSaveForm) nameInputRef.current?.focus()
  }, [showSaveForm])

  const p = parseFloat(principal)
  const rInput = parseFloat(rate)
  const n = parseInt(periods, 10)
  const monthlyRate = rateMode === 'annual' ? rInput / 100 / 12 : rInput / 100
  const fee = parseFloat(safetyFee) || 0
  const valid = p > 0 && rInput >= 0 && n > 0 && n <= 600 && isFinite(monthlyRate)

  const schedule = useMemo(() => {
    if (!valid) return []
    return method === 'french' ? calcFrench(p, monthlyRate, n) : calcGerman(p, monthlyRate, n)
  }, [valid, p, monthlyRate, n, method])

  const totalPaid = schedule.reduce((s, r) => s + r.payment, 0)
  const totalInterest = schedule.reduce((s, r) => s + r.interest, 0)
  const totalFees = fee * schedule.length
  const totalWithFees = totalPaid + totalFees
  const interestPct = totalWithFees > 0 ? ((totalInterest + totalFees) / totalWithFees) * 100 : 0
  const firstPayment = schedule[0] ? schedule[0].payment + fee : null

  const yearlyInterest = useMemo(() => {
    if (schedule.length <= 12) return []
    const years = []
    for (let i = 0; i < schedule.length; i += 12) {
      const chunk = schedule.slice(i, i + 12)
      years.push({
        year: Math.floor(i / 12) + 1,
        interest: chunk.reduce((s, r) => s + r.interest, 0),
        fees: fee * chunk.length,
        months: chunk.length,
      })
    }
    return years
  }, [schedule, fee])

  const currentValues = () => ({
    principal: parseFloat(principal) || 0,
    rate: parseFloat(rate) || 0,
    rateMode,
    periods: parseInt(periods, 10) || 0,
    method,
    safetyFee: parseFloat(safetyFee) || 0,
  })

  const loadLoan = (loan) => {
    setPrincipal(String(loan.principal))
    setRate(String(loan.rate))
    setRateMode(loan.rateMode)
    setPeriods(String(loan.periods))
    setMethod(loan.method)
    setSafetyFee(loan.safetyFee ? String(loan.safetyFee) : '')
    setActiveLoanId(loan.id)
    setShowSaveForm(false)
  }

  const handleSaveNew = () => {
    if (!saveForm.name.trim()) return
    dispatch(
      a.saveRequest({
        ...currentValues(),
        name: saveForm.name.trim(),
        bank: saveForm.bank.trim(),
      }),
    )
    setSaveForm(EMPTY_SAVE)
    setShowSaveForm(false)
    // we'll set activeLoanId when saveSuccess arrives — but we don't have it yet.
    // The reducer puts the new record first in the list, so after dispatch we track via records.
  }

  const handleUpdate = () => {
    const active = records.find((r) => r.id === activeLoanId)
    if (!active) return
    dispatch(a.saveRequest({ ...active, ...currentValues() }))
  }

  const handleDelete = (id) => {
    dispatch(a.deleteRequest(id))
    if (activeLoanId === id) setActiveLoanId(null)
  }

  const handleCancelSave = () => {
    setShowSaveForm(false)
    setSaveForm(EMPTY_SAVE)
  }

  const activeLoan = records.find((r) => r.id === activeLoanId)

  return (
    <div className="loan-calc">
      <h5 className="loan-calc__title">Calculadora de Préstamo</h5>

      {/* ── Saved loans panel ── */}
      <div className="loan-calc__saved">
        <div className="loan-calc__saved-header">
          <span className="loan-calc__saved-label">Préstamos guardados</span>
          <button
            type="button"
            className="loan-calc__saved-add"
            onClick={() => {
              setShowSaveForm((v) => !v)
              setSaveForm(EMPTY_SAVE)
            }}
            title="Guardar como nuevo"
          >
            + Nuevo
          </button>
        </div>

        {showSaveForm && (
          <div className="loan-calc__save-form">
            <input
              ref={nameInputRef}
              className="loan-calc__save-input"
              placeholder="Nombre del préstamo"
              value={saveForm.name}
              onChange={(e) => setSaveForm((f) => ({ ...f, name: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNew()
              }}
            />
            <input
              className="loan-calc__save-input"
              placeholder="Banco"
              value={saveForm.bank}
              onChange={(e) => setSaveForm((f) => ({ ...f, bank: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNew()
              }}
            />
            <button
              type="button"
              className="loan-calc__save-btn loan-calc__save-btn--confirm"
              onClick={handleSaveNew}
              disabled={!saveForm.name.trim() || saving}
            >
              {saving ? '…' : 'Guardar'}
            </button>
            <button type="button" className="loan-calc__save-btn" onClick={handleCancelSave}>
              Cancelar
            </button>
          </div>
        )}

        {records.length > 0 && (
          <div className="loan-calc__saved-list">
            {records.map((loan) => (
              <div
                key={loan.id}
                className={`loan-calc__saved-item${activeLoanId === loan.id ? ' loan-calc__saved-item--active' : ''}`}
              >
                <button
                  type="button"
                  className="loan-calc__saved-load"
                  onClick={() => loadLoan(loan)}
                >
                  <span className="loan-calc__saved-name">{loan.name}</span>
                  {loan.bank && <span className="loan-calc__saved-bank">{loan.bank}</span>}
                </button>
                {activeLoanId === loan.id && (
                  <button
                    type="button"
                    className="loan-calc__saved-action loan-calc__saved-action--update"
                    onClick={handleUpdate}
                    disabled={saving}
                    title="Actualizar con valores actuales"
                  >
                    {saving ? '…' : 'Actualizar'}
                  </button>
                )}
                <button
                  type="button"
                  className="loan-calc__saved-action loan-calc__saved-action--delete"
                  onClick={() => handleDelete(loan.id)}
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {records.length === 0 && !showSaveForm && (
          <p className="loan-calc__saved-empty">Sin préstamos guardados.</p>
        )}
      </div>

      {activeLoan && (
        <div className="loan-calc__active-badge">
          Editando: <strong>{activeLoan.name}</strong>
          {activeLoan.bank && <> — {activeLoan.bank}</>}
        </div>
      )}

      {/* ── Calculator form ── */}
      <div className="loan-calc__form">
        <div className="loan-calc__field">
          <label className="loan-calc__label">Capital prestado</label>
          <input
            className="loan-calc__input"
            type="number"
            placeholder="10000000"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />
        </div>

        <div className="loan-calc__field">
          <label className="loan-calc__label">
            Tasa de interés (%)
            <span className="loan-calc__rate-toggle">
              <button
                type="button"
                className={`loan-calc__toggle-btn ${rateMode === 'annual' ? 'loan-calc__toggle-btn--active' : ''}`}
                onClick={() => setRateMode('annual')}
              >
                Anual
              </button>
              <button
                type="button"
                className={`loan-calc__toggle-btn ${rateMode === 'monthly' ? 'loan-calc__toggle-btn--active' : ''}`}
                onClick={() => setRateMode('monthly')}
              >
                Mensual
              </button>
            </span>
          </label>
          <input
            className="loan-calc__input"
            type="number"
            placeholder={rateMode === 'annual' ? '12' : '1'}
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>

        <div className="loan-calc__field">
          <label className="loan-calc__label">Número de cuotas (meses)</label>
          <input
            className="loan-calc__input"
            type="number"
            placeholder="36"
            min="1"
            max="600"
            value={periods}
            onChange={(e) => setPeriods(e.target.value)}
          />
        </div>

        <div className="loan-calc__field">
          <label className="loan-calc__label">Método de amortización</label>
          <select
            className="loan-calc__input"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="loan-calc__field">
          <label className="loan-calc__label">Seguro mensual del banco</label>
          <input
            className="loan-calc__input"
            type="number"
            placeholder="0"
            min="0"
            value={safetyFee}
            onChange={(e) => setSafetyFee(e.target.value)}
          />
        </div>
      </div>

      {valid && (
        <>
          <div className="loan-calc__summary">
            <div className="loan-calc__stat">
              <span className="loan-calc__stat-label">
                {method === 'french' ? 'Cuota fija / mes' : 'Primera cuota'}
                {fee > 0 && <span className="loan-calc__stat-hint"> (con seguro)</span>}
              </span>
              <span className="loan-calc__stat-value loan-calc__stat-value--primary">
                {fmt(firstPayment)}
              </span>
            </div>
            <div className="loan-calc__stat">
              <span className="loan-calc__stat-label">Total intereses</span>
              <span className="loan-calc__stat-value loan-calc__stat-value--danger">
                {fmt(totalInterest)}
              </span>
            </div>
            {fee > 0 && (
              <div className="loan-calc__stat">
                <span className="loan-calc__stat-label">Total seguros</span>
                <span className="loan-calc__stat-value loan-calc__stat-value--warning">
                  {fmt(totalFees)}
                </span>
              </div>
            )}
            <div className="loan-calc__stat">
              <span className="loan-calc__stat-label">
                {fee > 0 ? 'Total a pagar (con seguro)' : 'Total a pagar'}
              </span>
              <span className="loan-calc__stat-value">
                {fmt(fee > 0 ? totalWithFees : totalPaid)}
              </span>
            </div>
            <div className="loan-calc__stat">
              <span className="loan-calc__stat-label">Tasa mensual efectiva</span>
              <span className="loan-calc__stat-value">{fmt(monthlyRate * 100, 4)}%</span>
            </div>
          </div>

          <div className="loan-calc__bar-wrap">
            <div className="loan-calc__bar-track">
              <div
                className="loan-calc__bar-fill loan-calc__bar-fill--cap"
                style={{ width: `${100 - interestPct}%` }}
                title={`Capital: ${fmt(p)}`}
              />
              <div
                className="loan-calc__bar-fill loan-calc__bar-fill--interest"
                style={{ width: `${interestPct}%` }}
                title={`Intereses: ${fmt(totalInterest)}`}
              />
            </div>
            <div className="loan-calc__bar-legend">
              <span className="loan-calc__bar-dot loan-calc__bar-dot--cap" />
              <span className="loan-calc__bar-legend-text">
                Capital {fmt(100 - interestPct, 1)}%
              </span>
              <span className="loan-calc__bar-dot loan-calc__bar-dot--interest" />
              <span className="loan-calc__bar-legend-text">Intereses {fmt(interestPct, 1)}%</span>
            </div>
          </div>

          {yearlyInterest.length > 0 && (
            <div className="loan-calc__yearly">
              <h6 className="loan-calc__yearly-title">Intereses por año</h6>
              <table className="loan-calc__table loan-calc__table--yearly">
                <thead>
                  <tr>
                    <th className="loan-calc__th--n">Año</th>
                    <th>Intereses</th>
                    {fee > 0 && <th>Seguros</th>}
                    {fee > 0 && <th>Total costo</th>}
                    <th>Meses</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyInterest.map((yr) => (
                    <tr key={yr.year}>
                      <td className="loan-calc__td--n">{yr.year}</td>
                      <td className="loan-calc__td--interest">{fmt(yr.interest)}</td>
                      {fee > 0 && <td className="loan-calc__td--warning">{fmt(yr.fees)}</td>}
                      {fee > 0 && (
                        <td className="loan-calc__td--interest">{fmt(yr.interest + yr.fees)}</td>
                      )}
                      <td className="loan-calc__td--n">{yr.months}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="loan-calc__table-wrap">
            <table className="loan-calc__table">
              <thead>
                <tr>
                  <th className="loan-calc__th--n">#</th>
                  <th>Cuota</th>
                  {fee > 0 && <th>Seguro</th>}
                  {fee > 0 && <th>Total</th>}
                  <th>Capital</th>
                  <th>Interés</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.num}>
                    <td className="loan-calc__td--n">{row.num}</td>
                    <td>{fmt(row.payment)}</td>
                    {fee > 0 && <td className="loan-calc__td--warning">{fmt(fee)}</td>}
                    {fee > 0 && <td className="loan-calc__td--bold">{fmt(row.payment + fee)}</td>}
                    <td>{fmt(row.cap)}</td>
                    <td className="loan-calc__td--interest">{fmt(row.interest)}</td>
                    <td className="loan-calc__td--balance">{fmt(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
