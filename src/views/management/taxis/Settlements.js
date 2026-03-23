import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column, MasterDetail } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/StandardGrid'
import {
  CCard, CCardBody, CCardHeader, CSpinner, CBadge,
  CButton, CForm, CFormInput, CFormLabel, CFormSelect, CRow, CCol, CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilX, cilReload, cilPencil } from '@coreui/icons'
import StandardForm, { StandardField, SF } from 'src/components/StandardForm'
import DetailPanel, { DetailSection, DetailRow } from 'src/components/DetailPanel'
import * as taxiSettlementActions from 'src/actions/taxiSettlementActions'
import * as taxiDriverActions from 'src/actions/taxiDriverActions'
import * as taxiVehicleActions from 'src/actions/taxiVehicleActions'
import * as taxiExpenseActions from 'src/actions/taxiExpenseActions'
import * as taxiAuditNoteActions from 'src/actions/taxiAuditNoteActions'
import '../../../views/movements/payments/Payments.scss'
import '../../../views/movements/payments/ItemDetail.scss'
import './Taxis.scss'


const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const fmtDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = date.toLocaleDateString('es-CO', { weekday: 'short' })
  const day = String(d).padStart(2, '0')
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day}`
}

const today = () => new Date().toISOString().split('T')[0]

const EMPTY = { driver: '', plate: '', amount: '', date: today(), comment: '' }

const SettlementMasterDetail = ({ data, drivers, vehicles, onSave, saving, editingRowIdRef }) => {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(() => editingRowIdRef?.current === data.id)
  const [form, setForm] = useState({
    date: data.date || '',
    driver: data.driver || '',
    plate: data.plate || '',
    amount: data.amount || '',
    comment: data.comment || '',
  })
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const driver = drivers.find((d) => d.name === data.driver)
  const vehicle = vehicles.find((v) => v.plate === data.plate)

  if (editing) {
    return (
      <div style={{ width: '50%', padding: 16 }}>
        <StandardForm
          title={t('taxis.settlements.editSettlement')}
          subtitle={data.date}
          onCancel={() => setEditing(false)}
          onSave={() => { onSave({ ...data, ...form, amount: Number(form.amount) }); setEditing(false) }}
          saving={saving}
        >
          <StandardField label={t('taxis.settlements.fields.date')}>
            <input className={SF.input} type="date" value={form.date} onChange={set('date')} />
          </StandardField>
          <StandardField label={t('taxis.settlements.fields.driver')}>
            <select className={SF.select} value={form.driver} onChange={set('driver')}>
              <option value="">{t('taxis.settlements.selectOption')}</option>
              {drivers.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </StandardField>
          <StandardField label={t('taxis.settlements.fields.plate')}>
            <select className={SF.select} value={form.plate} onChange={set('plate')}>
              <option value="">{t('taxis.settlements.selectOption')}</option>
              {vehicles.map((v) => <option key={v.id} value={v.plate}>{v.plate}{v.brand ? ` · ${v.brand}` : ''}</option>)}
            </select>
          </StandardField>
          <StandardField label={t('taxis.settlements.fields.value')}>
            <input className={SF.input} type="number" value={form.amount} onChange={set('amount')} placeholder="0" />
          </StandardField>
          <StandardField label={t('taxis.settlements.fields.comment')}>
            <textarea className={SF.textarea} value={form.comment || ''} onChange={set('comment')} rows={3} />
          </StandardField>
        </StandardForm>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0' }}>
        <CButton size="sm" color="primary" variant="outline" onClick={() => setEditing(true)}>
          <CIcon icon={cilPencil} size="sm" /> {t('common.edit')}
        </CButton>
      </div>
      <DetailPanel columns={3}>
        <DetailSection title={t('taxis.settlements.fields.settlement')}>
          <DetailRow label={t('taxis.settlements.fields.date')} value={data.date} />
          <DetailRow label={t('taxis.settlements.fields.value')} value={fmt(data.amount)} />
          <DetailRow label={t('taxis.settlements.fields.driver')} value={data.driver} />
          <DetailRow label={t('taxis.settlements.fields.plate')} value={data.plate} mono />
          <DetailRow label={t('taxis.settlements.fields.comment')} value={data.comment} />
        </DetailSection>
        <DetailSection title={t('taxis.settlements.fields.driver')}>
          {driver ? (
            <>
              <DetailRow label={t('taxis.settlements.fields.idNumber')} value={driver.idNumber} mono />
              <DetailRow label={t('taxis.settlements.fields.phone')} value={driver.phone} />
              <DetailRow label={t('taxis.settlements.fields.defaultAmount')} value={driver.defaultAmount ? fmt(driver.defaultAmount) : null} />
              <DetailRow label={t('taxis.settlements.fields.defaultAmountSunday')} value={driver.defaultAmountSunday ? fmt(driver.defaultAmountSunday) : null} />
            </>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)' }}>{t('taxis.settlements.noDataInfo')}</span>
          )}
        </DetailSection>
        <DetailSection title={t('taxis.settlements.fields.vehicle')}>
          {vehicle ? (
            <>
              <DetailRow label={t('taxis.settlements.fields.plate')} value={vehicle.plate} mono />
              <DetailRow label={t('taxis.settlements.fields.brand')} value={vehicle.brand} />
              <DetailRow label={t('taxis.settlements.fields.model')} value={vehicle.model} />
              <DetailRow label={t('taxis.settlements.fields.year')} value={vehicle.year} />
            </>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)' }}>{t('taxis.settlements.noDataInfo')}</span>
          )}
        </DetailSection>
      </DetailPanel>
    </div>
  )
}

const Taxis = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { data: settlementsData, fetching: loadingSettlements, isError: settlementError } = useSelector((s) => s.taxiSettlement)
  const { data: driversData } = useSelector((s) => s.taxiDriver)
  const { data: vehiclesData } = useSelector((s) => s.taxiVehicle)
  const { data: expensesData } = useSelector((s) => s.taxiExpense)
  const { notes: auditNotes } = useSelector((s) => s.taxiAuditNote)

  const months = t('taxis.months', { returnObjects: true })

  const now = new Date()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [driverFilter, setDriverFilter] = useState(new Set())
  const [plateFilter, setPlateFilter] = useState('')
  const [dayFilter, setDayFilter] = useState('')
  const [driverDropOpen, setDriverDropOpen] = useState(false)
  const driverDropRef = useRef(null)
  const [viewMode, setViewMode] = useState('detail')
  const [editingRow, setEditingRow] = useState(null)
  const [toast, setToast] = useState(null)
  const [editingNote, setEditingNote] = useState(null) // { date, driver }
  const savingRef = useRef(false)
  const dataGridRef = useRef(null)
  const editingRowIdRef = useRef(null)

  const toggleDriverFilter = (name) => setDriverFilter((prev) => {
    const next = new Set(prev)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    return next
  })

  const records = settlementsData ?? []
  const drivers = driversData ?? []
  const vehicles = vehiclesData ?? []
  const loading = loadingSettlements && !settlementsData

  useEffect(() => {
    dispatch(taxiSettlementActions.fetchRequest())
    dispatch(taxiDriverActions.fetchRequest())
    dispatch(taxiVehicleActions.fetchRequest())
    dispatch(taxiExpenseActions.fetchRequest())
    dispatch(taxiAuditNoteActions.fetchRequest())
  }, [dispatch])

  useEffect(() => {
    if (!driverDropOpen) return
    const handler = (e) => {
      if (!driverDropRef.current?.contains(e.target)) setDriverDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [driverDropOpen])

  useEffect(() => {
    if (!savingRef.current) return
    if (loadingSettlements) return
    const wasCreate = savingRef.current === 'create'
    savingRef.current = false
    if (settlementError) {
      setToast({ type: 'error', msg: t('taxis.settlements.errors.saveError') })
    } else {
      if (wasCreate) {
        setForm(EMPTY)
        setShowForm(false)
      } else {
        dataGridRef.current?.instance?.collapseRow(editingRowIdRef.current)
        editingRowIdRef.current = null
        setEditingRow(null)
      }
      dispatch(taxiSettlementActions.fetchRequest())
      setToast({ type: 'success', msg: t('taxis.settlements.errors.saveSuccess') })
    }
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [loadingSettlements, settlementError])

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleDriverChange = (e) => {
    const name = e.target.value
    const driver = drivers.find((d) => d.name === name)
    setForm((p) => ({
      ...p,
      driver: name,
      amount: driver?.defaultAmount ? String(driver.defaultAmount) : p.amount,
      plate: driver?.defaultVehicle || p.plate,
    }))
  }

  const picoPlacaWarning = (() => {
    if (!form.plate || !form.date) return null
    const [, monthStr, dayStr] = form.date.split('-')
    const month = parseInt(monthStr, 10)
    const day = parseInt(dayStr, 10)
    const vehicle = vehicles.find((v) => v.plate === form.plate)
    const restr = vehicle?.restrictions?.[month] ?? vehicle?.restrictions?.[String(month)]
    if (restr && [restr.d1, restr.d2].filter(Boolean).map(Number).includes(day)) {
      return t('taxis.settlements.errors.picoPlaca', { plate: form.plate, day })
    }
    return null
  })()

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.driver || !form.plate || !form.amount || !form.date) {
      setError(t('taxis.settlements.errors.allRequired'))
      return
    }
    if (picoPlacaWarning) return
    setError(null)
    savingRef.current = 'create'
    dispatch(taxiSettlementActions.createRequest(form))
  }

  const handleRowUpdating = (e) => {
    const merged = { ...e.oldData, ...e.newData }
    savingRef.current = 'update'
    e.cancel = true
    dispatch(taxiSettlementActions.updateRequest({ id: e.key, ...merged }))
  }

  const handleEditSave = (updated) => {
    savingRef.current = 'update'
    dispatch(taxiSettlementActions.updateRequest({ id: updated.id, ...updated }))
  }

  const handleDelete = (id) => {
    if (!window.confirm(t('taxis.settlements.confirmDelete'))) return
    dispatch(taxiSettlementActions.deleteRequest({ id }))
  }

  const availableYears = [...new Set(records.map((r) => r.date?.slice(0, 4)).filter(Boolean))]
    .map(Number).sort((a, b) => b - a)
  if (!availableYears.includes(period.year)) availableYears.unshift(period.year)

  const filtered = records.filter((r) => {
    if (!r.date) return false
    const [y, m] = r.date.split('-').map(Number)
    if (y !== period.year || m !== period.month) return false
    if (driverFilter.size > 0 && !driverFilter.has(r.driver)) return false
    if (plateFilter && r.plate !== plateFilter) return false
    if (dayFilter && r.date?.split('-')[2] !== String(dayFilter).padStart(2, '0')) return false
    return true
  })

  const total = filtered.reduce((acc, r) => acc + (r.amount || 0), 0)

  const totalExpenses = (expensesData ?? [])
    .filter((r) => {
      if (!r.date) return false
      const [y, m] = r.date.split('-').map(Number)
      return y === period.year && m === period.month
    })
    .reduce((acc, r) => acc + (r.amount || 0), 0)

  const isCurrentPeriod = period.year === now.getFullYear() && period.month === (now.getMonth() + 1)
  const daysElapsed = isCurrentPeriod ? now.getDate() : null
  const daysInMonth = new Date(period.year, period.month, 0).getDate()
  const projection = daysElapsed && daysElapsed > 0 ? Math.round((total / daysElapsed) * daysInMonth) : null

  const calcRemaining = (driverName) => {
    if (!isCurrentPeriod) return null
    const driver = drivers.find((d) => d.name === driverName)
    if (!driver) return null
    const vehicle = vehicles.find((v) => v.plate === driver.defaultVehicle)
    const restr = vehicle?.restrictions?.[period.month] ?? vehicle?.restrictions?.[String(period.month)] ?? {}
    const restrictedDays = [restr.d1, restr.d2].filter(Boolean).map(Number)
    let remaining = 0
    for (let day = now.getDate() + 1; day <= daysInMonth; day++) {
      if (restrictedDays.includes(day)) continue
      const isSunday = new Date(period.year, period.month - 1, day).getDay() === 0
      remaining += isSunday ? (driver.defaultAmountSunday || 0) : (driver.defaultAmount || 0)
    }
    return remaining
  }

  const settlementAbbr = t('taxis.settlements.settlementAbbr')

  const byDriver = Object.values(
    filtered.reduce((acc, r) => {
      const k = r.driver
      if (!acc[k]) acc[k] = { id: k, driver: k, count: 0, total: 0, rows: [] }
      acc[k].count += 1
      acc[k].total += r.amount || 0
      acc[k].rows.push(r)
      return acc
    }, {}),
  ).sort((a, b) => b.total - a.total).map((item) => ({
    ...item,
    remaining: calcRemaining(item.driver) ?? 0,
  }))

  const byVehicle = Object.values(
    filtered.reduce((acc, r) => {
      const k = r.plate || '—'
      if (!acc[k]) acc[k] = { id: k, plate: k, count: 0, total: 0, rows: [] }
      acc[k].count += 1
      acc[k].total += r.amount || 0
      acc[k].rows.push(r)
      return acc
    }, {}),
  ).sort((a, b) => b.total - a.total).map((item) => {
    const driver = drivers.find((d) => d.defaultVehicle === item.plate)
    return { ...item, remaining: driver ? (calcRemaining(driver.name) ?? 0) : 0 }
  })

  // ── Audit data ──────────────────────────────────────────────────────────────
  // All taxis have a single shift, so coverage is per vehicle (not per driver).
  // A day is "full" when every active vehicle has at least one settlement that day.
  const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const auditMonthStr = `${period.year}-${String(period.month).padStart(2, '0')}`
  const auditPeriodRecords = records.filter((r) => r.date?.startsWith(auditMonthStr))
  const activeDriverNames = new Set(drivers.filter((d) => d.active !== false).map((d) => d.name))
  const auditDrivers = [...new Set(auditPeriodRecords.map((r) => r.driver).filter((dr) => dr && activeDriverNames.has(dr)))].sort()
  const auditVehicles = [...new Set(auditPeriodRecords.filter((r) => r.driver && activeDriverNames.has(r.driver)).map((r) => r.plate).filter(Boolean))].sort()
  const auditToday = now.getFullYear() === period.year && now.getMonth() + 1 === period.month ? now.getDate() : null
  const auditDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1
    const dateStr = `${auditMonthStr}-${String(d).padStart(2, '0')}`
    const dayRecords = auditPeriodRecords.filter((r) => r.date === dateStr)
    const settled = new Set(dayRecords.map((r) => r.driver).filter(Boolean))
    const settledVehicles = new Set(dayRecords.map((r) => r.plate).filter(Boolean))
    const missingVehicles = auditVehicles.filter((pl) => !settledVehicles.has(pl))
    const missing = auditDrivers.filter((dr) => {
      const plate = drivers.find((d) => d.name === dr)?.defaultVehicle
      return plate ? missingVehicles.includes(plate) : !settled.has(dr)
    })
    const total = dayRecords.reduce((s, r) => s + (r.amount || 0), 0)
    const dow = new Date(period.year, period.month - 1, d).getDay()
    const isFuture = auditToday !== null
      ? d > auditToday
      : period.year > now.getFullYear() || (period.year === now.getFullYear() && period.month > now.getMonth() + 1)
    const isToday = d === auditToday
    const isSunday = dow === 0
    const status = isFuture ? 'future' : dayRecords.length === 0 ? 'none' : missingVehicles.length === 0 ? 'full' : 'partial'
    return { d, dateStr, dayRecords, settled: [...settled], missing, missingVehicles, total, dow, isFuture, isToday, isSunday, status }
  })
  const auditNoteId = (date, driver) => `${date}__${driver.replace(/\s+/g, '_')}`
  const getNote = (date, driver) => auditNotes[auditNoteId(date, driver)]?.note ?? ''
  const handleNoteSave = (date, driver, note) => {
    if (note.trim()) {
      dispatch(taxiAuditNoteActions.upsertRequest({ date, driver, note: note.trim() }))
    } else {
      dispatch(taxiAuditNoteActions.deleteRequest({ date, driver }))
    }
    setEditingNote(null)
  }

  const auditRowBg = (day) => {
    if (day.isToday) return '#e8f0fb'
    if (day.status === 'future') return '#f8fafc'
    if (day.status === 'none') return '#fff5f5'
    if (day.status === 'partial') return '#fffbeb'
    return '#f8fff8'
  }
  const auditAccent = { none: '#e03131', partial: '#e67700', full: '#2f9e44', future: '#cbd5e1' }

  return (
    <>
      {loadingSettlements && savingRef.current && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CSpinner color="light" style={{ width: 48, height: 48 }} />
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10000, padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          background: toast.type === 'success' ? '#2f9e44' : '#e03131',
          color: '#fff',
        }}>
          {toast.msg}
        </div>
      )}

      <CRow className="mb-3 d-none d-sm-flex">
        <CCol sm={2}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>{t('taxis.settlements.summary.totalSettled')}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#2f9e44' }}>{fmt(total)}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={2}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>
                {t('taxis.settlements.summary.monthProjection')}
                {isCurrentPeriod && daysElapsed && (
                  <span style={{ marginLeft: 6, fontStyle: 'italic' }}>
                    {t('taxis.settlements.summary.dayProgress', { daysElapsed, daysInMonth })}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: projection ? 'var(--cui-primary)' : 'var(--cui-secondary-color)' }}>
                {projection !== null ? fmt(projection) : '—'}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={2}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>{t('taxis.settlements.summary.deficit')}</div>
              {projection !== null ? (() => {
                const diff = projection - total
                return (
                  <div style={{ fontSize: 22, fontWeight: 700, color: diff > 0 ? '#e03131' : '#2f9e44' }}>
                    {fmt(Math.abs(diff))}
                  </div>
                )
              })() : (
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--cui-secondary-color)' }}>—</div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={2}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>{t('taxis.settlements.summary.totalExpenses')}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#e67700' }}>{fmt(totalExpenses)}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={2}>
          <CCard className="text-center">
            <CCardBody>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 4 }}>{t('taxis.settlements.summary.net')}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: (total - totalExpenses) >= 0 ? '#1e40af' : '#e03131' }}>
                {fmt(total - totalExpenses)}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={2}>
          <CCard>
            <CCardBody style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginBottom: 6 }}>{t('taxis.settlements.summary.byDriver')}</div>
              {loading ? (
                <CSpinner size="sm" />
              ) : byDriver.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>{t('taxis.settlements.summary.noRecords')}</span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {byDriver.map((d) => (
                    <div key={d.driver} style={{ background: 'var(--cui-primary-bg-subtle, #e7f1ff)', borderRadius: 8, padding: '4px 12px', fontSize: 13 }}>
                      <strong>{d.driver}</strong>
                      <span style={{ color: 'var(--cui-secondary-color)', marginLeft: 8 }}>
                        {d.count} {settlementAbbr} · {fmt(d.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CCard>
        <CCardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <strong>{t('taxis.settlements.title')}</strong>
            <CBadge color="secondary">{filtered.length}</CBadge>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}>{t('taxis.settlements.period')}</span>
            <CFormSelect
              size="sm"
              style={{ width: 120 }}
              value={period.month}
              onChange={(e) => { setPeriod((p) => ({ ...p, month: Number(e.target.value) })); setDayFilter('') }}
            >
              {months.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </CFormSelect>
            <CFormSelect
              size="sm"
              style={{ width: 90 }}
              value={period.year}
              onChange={(e) => { setPeriod((p) => ({ ...p, year: Number(e.target.value) })); setDayFilter('') }}
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </CFormSelect>
            {(viewMode === 'detail' || viewMode === 'byDriver') && (
              <div ref={driverDropRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDriverDropOpen((v) => !v)}
                  style={{
                    fontSize: 12, minWidth: 130, padding: '4px 10px',
                    borderRadius: 6, border: '1px solid var(--cui-secondary)',
                    background: driverFilter.size > 0 ? '#e8f0fb' : '#fff',
                    color: driverFilter.size > 0 ? '#1e3a5f' : 'var(--cui-secondary)',
                    cursor: 'pointer', fontWeight: driverFilter.size > 0 ? 600 : 400,
                  }}
                >
                  {t('taxis.settlements.fields.driver')}{driverFilter.size > 0 ? ` (${driverFilter.size})` : ''} ▾
                </button>
                {driverDropOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 1050,
                    background: '#fff', border: '1px solid var(--cui-border-color)',
                    borderRadius: 8, padding: '8px 12px', minWidth: 180,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', paddingBottom: 6, borderBottom: '1px solid var(--cui-border-color)', marginBottom: 6 }}>
                      <input
                        type="checkbox"
                        checked={driverFilter.size === 0}
                        onChange={() => setDriverFilter(new Set())}
                      />
                      {t('taxis.settlements.all')}
                    </label>
                    {drivers.map((d) => (
                      <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '3px 0' }}>
                        <input
                          type="checkbox"
                          checked={driverFilter.has(d.name)}
                          onChange={() => toggleDriverFilter(d.name)}
                        />
                        {d.name}
                      </label>
                    ))}
                    <div style={{ paddingTop: 8, marginTop: 6, borderTop: '1px solid var(--cui-border-color)', textAlign: 'right' }}>
                      <button
                        onClick={() => setDriverDropOpen(false)}
                        style={{ fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 4, border: '1px solid #1e3a5f', background: '#1e3a5f', color: '#fff', cursor: 'pointer' }}
                      >
                        {t('taxis.settlements.accept')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {viewMode === 'detail' && (
              <>
                <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}>Día</span>
                <CFormSelect
                  size="sm"
                  style={{ width: 75 }}
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  {Array.from(
                    new Set(
                      records
                        .filter((r) => {
                          const [y, m] = (r.date || '').split('-').map(Number)
                          return y === period.year && m === period.month
                        })
                        .map((r) => Number(r.date?.split('-')[2]))
                        .filter(Boolean),
                    ),
                  ).sort((a, b) => a - b).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </CFormSelect>
                <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}>{t('taxis.settlements.fields.vehicle')}</span>
                <CFormSelect
                  size="sm"
                  style={{ width: 110 }}
                  value={plateFilter}
                  onChange={(e) => setPlateFilter(e.target.value)}
                >
                  <option value="">{t('taxis.settlements.all')}</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.plate}>{v.plate}</option>
                  ))}
                </CFormSelect>
              </>
            )}
          </div>
          <div className="d-flex align-items-center gap-1">
            <CButton size="sm" color="secondary" variant={viewMode === 'detail' ? undefined : 'outline'} onClick={() => setViewMode('detail')} style={{ fontSize: 12 }}>
              {t('taxis.settlements.viewDetail')}
            </CButton>
            <CButton size="sm" color="secondary" variant={viewMode === 'byDriver' ? undefined : 'outline'} onClick={() => setViewMode('byDriver')} style={{ fontSize: 12 }}>
              {t('taxis.settlements.viewByDriver')}
            </CButton>
            <CButton size="sm" color="secondary" variant={viewMode === 'byVehicle' ? undefined : 'outline'} onClick={() => setViewMode('byVehicle')} style={{ fontSize: 12 }}>
              {t('taxis.settlements.viewByVehicle')}
            </CButton>
            <CButton size="sm" color="warning" variant={viewMode === 'audit' ? undefined : 'outline'} onClick={() => setViewMode('audit')} style={{ fontSize: 12 }}>
              {t('taxis.settlements.viewAudit')}
            </CButton>
          </div>
          <CButton size="sm" color="secondary" variant="outline" onClick={() => dispatch(taxiSettlementActions.fetchRequest())} title={t('common.refresh')}>
            <CIcon icon={cilReload} size="sm" />
          </CButton>
          <CButton size="sm" color={showForm ? 'danger' : 'primary'} variant="outline" onClick={() => { setShowForm((p) => !p); setError(null) }}>
            <CIcon icon={showForm ? cilX : cilPlus} size="sm" />
            {' '}{showForm ? t('common.cancel') : t('taxis.settlements.newSettlement')}
          </CButton>
        </CCardHeader>

        <CCollapse visible={showForm}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cui-border-color)' }}>
            <CForm onSubmit={handleAdd}>
              <CRow className="g-2 align-items-end">
                <CCol sm={3}>
                  <CFormLabel style={{ fontSize: 12 }}>{t('taxis.settlements.fields.driver')}</CFormLabel>
                  <CFormSelect size="sm" value={form.driver} onChange={handleDriverChange}>
                    <option value="">{t('taxis.settlements.selectOption')}</option>
                    {drivers.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </CFormSelect>
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>{t('taxis.settlements.fields.plate')}</CFormLabel>
                  <CFormSelect size="sm" value={form.plate} onChange={set('plate')}>
                    <option value="">{t('taxis.settlements.selectOption')}</option>
                    {vehicles.map((v) => <option key={v.id} value={v.plate}>{v.plate}{v.brand ? ` · ${v.brand}` : ''}</option>)}
                  </CFormSelect>
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>{t('taxis.settlements.fields.value')}</CFormLabel>
                  <CFormInput size="sm" type="number" placeholder="0" value={form.amount} onChange={set('amount')} />
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>{t('taxis.settlements.fields.date')}</CFormLabel>
                  <CFormInput size="sm" type="date" value={form.date} onChange={set('date')} invalid={!!picoPlacaWarning} />
                  {picoPlacaWarning && (
                    <div style={{ fontSize: 11, color: '#e03131', marginTop: 3 }}>⚠ {picoPlacaWarning}</div>
                  )}
                </CCol>
                <CCol sm={2}>
                  <CFormLabel style={{ fontSize: 12 }}>{t('taxis.settlements.fields.comment')}</CFormLabel>
                  <CFormInput size="sm" placeholder={t('taxis.settlements.notes')} value={form.comment} onChange={set('comment')} />
                </CCol>
                <CCol sm={2}>
                  <CButton type="submit" size="sm" color="primary" disabled={loadingSettlements || !!picoPlacaWarning} style={{ width: '100%' }}>
                    {loadingSettlements ? <CSpinner size="sm" /> : t('common.save')}
                  </CButton>
                </CCol>
              </CRow>
              {error && <div style={{ marginTop: 8, fontSize: 12, color: '#e03131' }}>{error}</div>}
            </CForm>
          </div>
        </CCollapse>

        <CCardBody style={{ padding: 0 }}>
          {loading ? (
            <div className="d-flex justify-content-center py-5"><CSpinner color="primary" /></div>
          ) : viewMode === 'detail' ? (
            <StandardGrid
              ref={dataGridRef}
              id="paymentsGrid"
              keyExpr="id"
              dataSource={filtered}
              noDataText={t('taxis.settlements.noData')}
              summary={{ totalItems: [{ column: 'amount', summaryType: 'sum', customizeText: (e) => fmt(e.value) }] }}
              onRowUpdating={handleRowUpdating}
              onRowPrepared={(e) => {
                if (e.rowType !== 'data') return
                const [y, m, d] = (e.data.date ?? '').split('-').map(Number)
                if (!y) return
                if (new Date(y, m - 1, d).getDay() === 0) e.rowElement.classList.add('dx-row-sunday')
              }}
            >
              <Column dataField="date" caption={t('taxis.settlements.fields.date')} width={110} hidingPriority={5} sortOrder="asc" defaultSortIndex={0}
                cellRender={({ value }) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtDate(value)}</span>}
              />
              <Column dataField="driver" caption={t('taxis.settlements.fields.driver')} minWidth={150} hidingPriority={3} />
              <Column dataField="plate" caption={t('taxis.settlements.fields.plate')} width={110} hidingPriority={2}
                cellRender={({ value }) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>}
              />
              <Column dataField="amount" caption={t('taxis.settlements.fields.value')} hidingPriority={4}
                cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{fmt(value)}</span>}
              />
              <Column dataField="comment" caption={t('taxis.settlements.fields.comment')} minWidth={120} hidingPriority={1} />
              <Column caption="" width={80} allowSorting={false} allowResizing={false} hidingPriority={6}
                cellRender={({ data }) => (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        editingRowIdRef.current = data.id
                        dataGridRef.current?.instance?.collapseRow(data.id)
                        setTimeout(() => dataGridRef.current?.instance?.expandRow(data.id), 0)
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--cui-primary)', cursor: 'pointer', padding: '2px 6px' }}
                      title={t('common.edit')}
                    >
                      <CIcon icon={cilPencil} size="sm" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(data.id) }}
                      style={{ background: 'none', border: 'none', color: '#e03131', cursor: 'pointer', padding: '2px 6px' }}
                      title={t('common.remove')}
                    >
                      <CIcon icon={cilTrash} size="sm" />
                    </button>
                  </div>
                )}
              />
              <MasterDetail enabled={true} render={({ data }) => (
                <SettlementMasterDetail data={data} drivers={drivers} vehicles={vehicles} saving={loadingSettlements} onSave={handleEditSave} editingRowIdRef={editingRowIdRef} />
              )} />
            </StandardGrid>
          ) : viewMode === 'byDriver' ? (
            <StandardGrid keyExpr="id" dataSource={byDriver} noDataText={t('taxis.settlements.noData')}
              summary={{
                totalItems: [
                  { column: 'total', summaryType: 'sum', customizeText: (e) => fmt(e.value) },
                  ...(isCurrentPeriod ? [{ column: 'remaining', summaryType: 'sum', customizeText: (e) => fmt(e.value) }] : []),
                  ...(isCurrentPeriod ? [{ column: 'count', summaryType: 'custom', name: 'grandTotal', showInColumn: 'count', customizeText: () => `Gran total: ${fmt(byDriver.reduce((s, r) => s + r.total + r.remaining, 0))}` }] : []),
                ],
                calculateCustomSummary: () => {},
              }}
            >
              <Column dataField="driver" caption={t('taxis.settlements.fields.driver')} minWidth={180} />
              <Column dataField="count" caption={t('taxis.settlements.columns.countSettlements')} width={140}
                cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{value}</span>}
              />
              <Column dataField="total" caption={t('taxis.settlements.columns.totalDeposited')} width={170}
                cellRender={({ value }) => <span style={{ fontWeight: 700, color: '#1e40af' }}>{fmt(value)}</span>}
              />
              <Column dataField="remaining" caption={t('taxis.settlements.columns.remaining')} width={170} visible={isCurrentPeriod}
                cellRender={({ data }) => <span style={{ fontWeight: 700, color: data.remaining > 0 ? '#e67700' : '#2f9e44' }}>{fmt(data.remaining)}</span>}
              />
              <MasterDetail enabled={true} render={({ data }) => (
                <div style={{ margin: '8px 8px 12px 32px' }}>
                  <StandardGrid dataSource={data.rows} keyExpr="id" style={{ margin: 0 }} noDataText={t('taxis.settlements.noRecords')}>
                    <Column dataField="date" caption={t('taxis.settlements.fields.date')} width={110} sortOrder="asc" defaultSortIndex={0} />
                    <Column dataField="plate" caption={t('taxis.settlements.fields.plate')} width={100}
                      cellRender={({ value }) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>}
                    />
                    <Column dataField="amount" caption={t('taxis.settlements.fields.value')} width={130}
                      cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{fmt(value)}</span>}
                    />
                    <Column dataField="comment" caption={t('taxis.settlements.fields.comment')} minWidth={120} />
                  </StandardGrid>
                </div>
              )} />
            </StandardGrid>
          ) : viewMode === 'byVehicle' ? (
            <StandardGrid keyExpr="id" dataSource={byVehicle} noDataText={t('taxis.settlements.noData')}
              summary={{
                totalItems: [
                  { column: 'total', summaryType: 'sum', customizeText: (e) => fmt(e.value) },
                  ...(isCurrentPeriod ? [{ column: 'remaining', summaryType: 'sum', customizeText: (e) => fmt(e.value) }] : []),
                  ...(isCurrentPeriod ? [{ column: 'count', summaryType: 'custom', name: 'grandTotal', showInColumn: 'count', customizeText: () => `Gran total: ${fmt(byVehicle.reduce((s, r) => s + r.total + r.remaining, 0))}` }] : []),
                ],
                calculateCustomSummary: () => {},
              }}
            >
              <Column dataField="plate" caption={t('taxis.settlements.fields.plate')} minWidth={130}
                cellRender={({ value }) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>}
              />
              <Column dataField="count" caption={t('taxis.settlements.columns.countSettlements')} width={140}
                cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{value}</span>}
              />
              <Column dataField="total" caption={t('taxis.settlements.columns.totalDeposited')} width={170}
                cellRender={({ value }) => <span style={{ fontWeight: 700, color: '#1e40af' }}>{fmt(value)}</span>}
              />
              <Column dataField="remaining" caption={t('taxis.settlements.columns.remaining')} width={170} visible={isCurrentPeriod}
                cellRender={({ data }) => <span style={{ fontWeight: 700, color: data.remaining > 0 ? '#e67700' : '#2f9e44' }}>{fmt(data.remaining)}</span>}
              />
              <MasterDetail enabled={true} render={({ data }) => (
                <div style={{ margin: '8px 8px 12px 32px' }}>
                  <StandardGrid dataSource={data.rows} keyExpr="id" style={{ margin: 0 }} noDataText={t('taxis.settlements.noRecords')}>
                    <Column dataField="date" caption={t('taxis.settlements.fields.date')} width={110} sortOrder="asc" defaultSortIndex={0} />
                    <Column dataField="driver" caption={t('taxis.settlements.fields.driver')} minWidth={150} />
                    <Column dataField="amount" caption={t('taxis.settlements.fields.value')} width={130}
                      cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{fmt(value)}</span>}
                    />
                    <Column dataField="comment" caption={t('taxis.settlements.fields.comment')} minWidth={120} />
                  </StandardGrid>
                </div>
              )} />
            </StandardGrid>
          ) : viewMode === 'audit' ? (
            <div style={{ padding: 16 }}>
              {/* Summary strip */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  { label: t('taxis.settlements.audit.statusNone'), count: auditDays.filter((d) => d.status === 'none').length, color: '#e03131', bg: '#fff5f5' },
                  { label: t('taxis.settlements.audit.statusPartial'), count: auditDays.filter((d) => d.status === 'partial').length, color: '#e67700', bg: '#fffbeb' },
                  { label: t('taxis.settlements.audit.statusFull'), count: auditDays.filter((d) => d.status === 'full').length, color: '#2f9e44', bg: '#f0fdf4' },
                  { label: t('taxis.settlements.audit.statusFuture'), count: auditDays.filter((d) => d.status === 'future').length, color: '#868e96', bg: '#f8fafc' },
                ].map(({ label, count, color, bg }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: bg, border: `1px solid ${color}33`, borderRadius: 8, padding: '6px 14px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{count}</span>
                    <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)' }}>{label}</span>
                  </div>
                ))}
                <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--cui-secondary-color)', alignSelf: 'center' }}>
                  {t('taxis.settlements.audit.activeDrivers' + (auditDrivers.length !== 1 ? '_plural' : ''), { count: auditDrivers.length })}
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#1e3a5f' }}>
                      {[
                        t('taxis.settlements.audit.colDay'),
                        t('taxis.settlements.audit.colWeekday'),
                        t('taxis.settlements.audit.colStatus'),
                        t('taxis.settlements.audit.colCount'),
                        t('taxis.settlements.audit.colTotal'),
                        t('taxis.settlements.audit.colSettled'),
                        t('taxis.settlements.audit.colMissing'),
                      ].map((h) => (
                        <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {auditDays.map((day) => (
                      <tr key={day.d} style={{ background: auditRowBg(day), borderBottom: '1px solid #f1f5f9', borderLeft: `4px solid ${auditAccent[day.status]}` }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: day.isFuture ? '#adb5bd' : '#1e3a5f', whiteSpace: 'nowrap' }}>
                          {String(day.d).padStart(2, '0')}
                          {day.isToday && <span style={{ fontSize: 10, background: '#1e3a5f', color: '#fff', borderRadius: 4, padding: '1px 5px', marginLeft: 6 }}>{t('taxis.settlements.audit.today')}</span>}
                        </td>
                        <td style={{ padding: '8px 12px', color: day.isSunday ? '#7c5e00' : day.isFuture ? '#adb5bd' : '#64748b', fontWeight: day.isSunday ? 700 : 400 }}>
                          {DAY_NAMES[day.dow]}
                        </td>
                        <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                          {day.status === 'none' && <span style={{ fontSize: 11, fontWeight: 700, color: '#e03131', background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 4, padding: '2px 8px' }}>✗ {t('taxis.settlements.audit.statusNone')}</span>}
                          {day.status === 'partial' && <span style={{ fontSize: 11, fontWeight: 700, color: '#e67700', background: '#fffbeb', border: '1px solid #fed7aa', borderRadius: 4, padding: '2px 8px' }}>◐ {t('taxis.settlements.audit.statusPartial')}</span>}
                          {day.status === 'full' && <span style={{ fontSize: 11, fontWeight: 700, color: '#2f9e44', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 4, padding: '2px 8px' }}>✓ {t('taxis.settlements.audit.statusFull')}</span>}
                          {day.status === 'future' && <span style={{ fontSize: 11, color: '#adb5bd', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 8px' }}>— {t('taxis.settlements.audit.statusFuture')}</span>}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: day.isFuture ? '#adb5bd' : '#334155' }}>
                          {day.isFuture ? '—' : day.dayRecords.length}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: day.isFuture ? '#adb5bd' : '#1e3a5f', whiteSpace: 'nowrap' }}>
                          {day.isFuture ? '—' : day.total > 0 ? fmt(day.total) : <span style={{ color: '#adb5bd' }}>—</span>}
                        </td>
                        <td style={{ padding: '8px 6px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {day.settled.map((dr) => (
                              <span key={dr} style={{ fontSize: 11, background: '#dbeafe', color: '#1e40af', borderRadius: 4, padding: '2px 7px', fontWeight: 500 }}>{dr.split(' ')[0]}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '8px 6px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {!day.isFuture && day.missing.map((dr) => {
                              const note = getNote(day.dateStr, dr)
                              const isEditing = editingNote?.date === day.dateStr && editingNote?.driver === dr
                              return (
                                <div key={dr} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: 11, background: '#fee2e2', color: '#b91c1c', borderRadius: 4, padding: '2px 7px', fontWeight: 600 }}>{dr.split(' ')[0]}</span>
                                    <button
                                      onClick={() => setEditingNote(isEditing ? null : { date: day.dateStr, driver: dr })}
                                      title={note ? t('taxis.settlements.audit.editNote') : t('taxis.settlements.audit.addNote')}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px', color: note ? '#e67700' : '#adb5bd', fontSize: 12, lineHeight: 1 }}
                                    >✎</button>
                                  </div>
                                  {isEditing && (
                                    <input
                                      autoFocus
                                      defaultValue={note}
                                      placeholder={t('taxis.settlements.audit.notePlaceholder')}
                                      onBlur={(e) => handleNoteSave(day.dateStr, dr, e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleNoteSave(day.dateStr, dr, e.target.value)
                                        if (e.key === 'Escape') setEditingNote(null)
                                      }}
                                      style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, border: '1px solid #fed7aa', outline: 'none', width: 140 }}
                                    />
                                  )}
                                  {!isEditing && note && (
                                    <span style={{ fontSize: 10, color: '#92400e', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 3, padding: '1px 5px', maxWidth: 160, wordBreak: 'break-word' }}>{note}</span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Taxis
