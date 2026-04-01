import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Column, MasterDetail } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/App/StandardGrid'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CBadge,
  CButton,
  CFormSelect,
  CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus, cilX, cilReload, cilPencil } from '@coreui/icons'
import MultiSelectDropdown from 'src/components/App/MultiSelectDropdown'
import * as taxiSettlementActions from 'src/actions/CashFlow/taxiSettlementActions'
import * as taxiDriverActions from 'src/actions/CashFlow/taxiDriverActions'
import * as taxiVehicleActions from 'src/actions/CashFlow/taxiVehicleActions'
import * as taxiExpenseActions from 'src/actions/CashFlow/taxiExpenseActions'
import * as taxiAuditNoteActions from 'src/actions/CashFlow/taxiAuditNoteActions'
import * as taxiPeriodNoteActions from 'src/actions/CashFlow/taxiPeriodNoteActions'
import { getColombianHolidays, auditNoteId, buildAuditDay } from '../auditHelpers'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import '../../../../movements/payments/Payments.scss'
import '../../../../movements/payments/ItemDetail.scss'
import '../Taxis.scss'
import { fmt, fmtDate, EMPTY } from './utils'
import SettlementMasterDetail from './SettlementMasterDetail'
import PeriodSummary from './PeriodSummary'
import SettlementCreateForm from './SettlementCreateForm'
import AuditView from './AuditView'
import PeriodNotes from './PeriodNotes'

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const Taxis = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const {
    data: settlementsData,
    fetching: loadingSettlements,
    isError: settlementError,
  } = useSelector((s) => s.taxiSettlement)
  const { data: driversData } = useSelector((s) => s.taxiDriver)
  const { data: vehiclesData } = useSelector((s) => s.taxiVehicle)
  const { data: expensesData } = useSelector((s) => s.taxiExpense)
  const { notes: auditNotes } = useSelector((s) => s.taxiAuditNote)

  const months = t('taxis.months', { returnObjects: true })
  const now = new Date()

  // ── Period & filters ──────────────────────────────────────────────────────
  const [period, setPeriod] = useState(() => {
    try {
      const stored = localStorage.getItem('settlements_period')
      if (stored) return JSON.parse(stored)
    } catch {}
    return { month: now.getMonth() + 1, year: now.getFullYear() }
  })
  const [driverFilter, setDriverFilter] = useState(new Set())
  const [plateFilter, setPlateFilter] = useState('')
  const [dayFilter, setDayFilter] = useState(new Set())

  const toggleDriverFilter = (name) =>
    setDriverFilter((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })

  const toggleDayFilter = (day) =>
    setDayFilter((prev) => {
      const next = new Set(prev)
      next.has(day) ? next.delete(day) : next.add(day)
      return next
    })

  // ── UI state ──────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem('settlements_viewMode') || 'detail',
  )
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [editingRow, setEditingRow] = useState(null)
  const [toast, setToast] = useState(null)
  const [summaryOpen, setSummaryOpen] = useState(
    () => localStorage.getItem('settlements_summaryOpen') !== 'false',
  )

  const savingRef = useRef(false)
  const dataGridRef = useRef(null)
  const editingRowIdRef = useRef(null)

  const toggleSummary = () =>
    setSummaryOpen((prev) => {
      const next = !prev
      localStorage.setItem('settlements_summaryOpen', String(next))
      return next
    })

  // ── Data ──────────────────────────────────────────────────────────────────
  const records = settlementsData ?? []
  const drivers = driversData ?? []
  const vehicles = vehiclesData ?? []
  const loading = loadingSettlements && !settlementsData

  const driversMap = useMemo(() => new Map(drivers.map((d) => [d.name, d])), [drivers])
  const vehiclesMap = useMemo(() => new Map(vehicles.map((v) => [v.plate, v])), [vehicles])
  const driversByVehicleMap = useMemo(
    () => new Map(drivers.filter((d) => d.defaultVehicle).map((d) => [d.defaultVehicle, d])),
    [drivers],
  )

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(taxiSettlementActions.fetchRequest())
    dispatch(taxiDriverActions.fetchRequest())
    dispatch(taxiVehicleActions.fetchRequest())
    dispatch(taxiExpenseActions.fetchRequest())
    dispatch(taxiAuditNoteActions.fetchRequest())
  }, [dispatch])

  useEffect(() => {
    dispatch(
      taxiPeriodNoteActions.fetchRequest({
        period: `${period.year}-${String(period.month).padStart(2, '0')}`,
      }),
    )
  }, [dispatch, period.year, period.month])

  useEffect(() => {
    localStorage.setItem('settlements_period', JSON.stringify(period))
  }, [period])

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

  // ── Form handlers ─────────────────────────────────────────────────────────
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleDriverChange = (e) => {
    const name = e.target.value
    const driver = driversMap.get(name)
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
    const vehicle = vehiclesMap.get(form.plate)
    const restr = vehicle?.restrictions?.[month] ?? vehicle?.restrictions?.[String(month)]
    if (restr && new Set([restr.d1, restr.d2].filter(Boolean).map(Number)).has(day)) {
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

  // ── Derived data ──────────────────────────────────────────────────────────
  const availableYears = useMemo(() => {
    const years = [...new Set(records.map((r) => r.date?.slice(0, 4)).filter(Boolean))]
      .map(Number)
      .sort((a, b) => b - a)
    if (!years.includes(period.year)) years.unshift(period.year)
    return years
  }, [records, period.year])

  const filtered = records.filter((r) => {
    if (!r.date) return false
    const [y, m] = r.date.split('-').map(Number)
    if (y !== period.year || m !== period.month) return false
    if (driverFilter.size > 0 && !driverFilter.has(r.driver)) return false
    if (plateFilter && r.plate !== plateFilter) return false
    if (dayFilter.size > 0 && !dayFilter.has(Number(r.date?.split('-')[2]))) return false
    return true
  })

  const total = filtered.reduce((acc, r) => acc + (r.amount || 0), 0)

  const periodExpenses = (expensesData ?? []).filter((r) => {
    if (!r.date) return false
    const [y, m] = r.date.split('-').map(Number)
    return y === period.year && m === period.month
  })
  const totalExpenses = periodExpenses.reduce((acc, r) => acc + (r.amount || 0), 0)

  const isCurrentPeriod = period.year === now.getFullYear() && period.month === now.getMonth() + 1
  const daysElapsed = isCurrentPeriod ? now.getDate() : null
  const daysInMonth = new Date(period.year, period.month, 0).getDate()
  const projection =
    daysElapsed && daysElapsed > 0 ? Math.round((total / daysElapsed) * daysInMonth) : null

  const colombianHolidaysCalc = useMemo(() => getColombianHolidays(period.year), [period.year])

  const calcRemaining = useCallback(
    (driverName, rows = []) => {
      if (!isCurrentPeriod) return null
      const driver = driversMap.get(driverName)
      if (!driver) return null
      const periodPrefix = `${period.year}-${String(period.month).padStart(2, '0')}-`
      const startDay = driver.startDate?.startsWith(periodPrefix)
        ? parseInt(driver.startDate.slice(-2), 10)
        : 1
      const driverEndDay = driver.endDate?.startsWith(periodPrefix)
        ? parseInt(driver.endDate.slice(-2), 10)
        : daysInMonth
      const todayNum = now.getDate()
      const hasSettlementToday = rows.some(
        (r) => r.date?.startsWith(periodPrefix) && parseInt(r.date.slice(-2), 10) === todayNum,
      )
      const endDay = Math.min(driverEndDay, hasSettlementToday ? todayNum : todayNum - 1)
      const paidPerDay = {}
      for (const r of rows) {
        if (r.date?.startsWith(periodPrefix)) {
          const day = parseInt(r.date.slice(-2), 10)
          paidPerDay[day] = (paidPerDay[day] || 0) + (r.amount || 0)
        }
      }
      let remaining = 0
      for (let day = startDay; day <= endDay; day++) {
        const dayStr = `${periodPrefix}${String(day).padStart(2, '0')}`
        const isSunday = new Date(period.year, period.month - 1, day).getDay() === 0
        const isHoliday = colombianHolidaysCalc.has(dayStr)
        const expectedDay =
          isSunday || isHoliday ? driver.defaultAmountSunday || 0 : driver.defaultAmount || 0
        remaining += Math.max(0, expectedDay - (paidPerDay[day] || 0))
      }
      return remaining
    },
    [isCurrentPeriod, driversMap, period.month, period.year, daysInMonth, now, colombianHolidaysCalc],
  )

  const calcFuture = useCallback(
    (driverName, rows = []) => {
      if (!isCurrentPeriod) return null
      const driver = driversMap.get(driverName)
      if (!driver || driver.active === false) return null
      const plateKey = driver.defaultVehicle || rows.find((r) => r.plate)?.plate
      const vehicle = vehiclesMap.get(plateKey)
      const restr =
        vehicle?.restrictions?.[period.month] ?? vehicle?.restrictions?.[String(period.month)] ?? {}
      const restrictedDays = new Set([restr.d1, restr.d2].filter(Boolean).map(Number))
      const periodPrefix = `${period.year}-${String(period.month).padStart(2, '0')}-`
      const driverEndDay = driver.endDate?.startsWith(periodPrefix)
        ? parseInt(driver.endDate.slice(-2), 10)
        : daysInMonth
      const todayNum = now.getDate()
      const hasSettlementToday = rows.some(
        (r) => r.date?.startsWith(periodPrefix) && parseInt(r.date.slice(-2), 10) === todayNum,
      )
      const startDay = hasSettlementToday ? todayNum + 1 : todayNum
      const endDay = Math.min(driverEndDay, daysInMonth)
      let future = 0
      for (let day = startDay; day <= endDay; day++) {
        if (restrictedDays.has(day)) continue
        const dayStr = `${periodPrefix}${String(day).padStart(2, '0')}`
        const isSunday = new Date(period.year, period.month - 1, day).getDay() === 0
        const isHoliday = colombianHolidaysCalc.has(dayStr)
        future +=
          isSunday || isHoliday ? driver.defaultAmountSunday || 0 : driver.defaultAmount || 0
      }
      return future
    },
    [isCurrentPeriod, driversMap, vehiclesMap, period.month, period.year, daysInMonth, now, colombianHolidaysCalc],
  )

  const rowsByDriver = useMemo(
    () =>
      records
        .filter((r) => {
          if (!r.date) return false
          const [y, m] = r.date.split('-').map(Number)
          return y === period.year && m === period.month
        })
        .reduce((acc, r) => {
          if (!acc[r.driver]) acc[r.driver] = []
          acc[r.driver].push(r)
          return acc
        }, {}),
    [records, period.year, period.month],
  )

  const pendingRows = useMemo(() => {
    if (!isCurrentPeriod) return []
    const rows = []
    const periodPrefix = `${period.year}-${String(period.month).padStart(2, '0')}-`
    const todayNum = now.getDate()
    for (const driver of drivers.filter((d) => d.active !== false && d.defaultVehicle)) {
      const plate = driver.defaultVehicle
      const vehicle = vehiclesMap.get(plate)
      const restr =
        vehicle?.restrictions?.[period.month] ?? vehicle?.restrictions?.[String(period.month)] ?? {}
      const restrictedDays = new Set([restr.d1, restr.d2].filter(Boolean).map(Number))
      const driverStartDay = driver.startDate?.startsWith(periodPrefix)
        ? parseInt(driver.startDate.slice(-2), 10)
        : 1
      const driverEndDay = driver.endDate?.startsWith(periodPrefix)
        ? parseInt(driver.endDate.slice(-2), 10)
        : daysInMonth
      const startDay = Math.max(todayNum, driverStartDay)
      const endDay = Math.min(daysInMonth, driverEndDay)
      if (startDay > endDay) continue
      const driverRows = rowsByDriver[driver.name] || []
      for (let day = startDay; day <= endDay; day++) {
        if (restrictedDays.has(day)) continue
        const dayStr = `${periodPrefix}${String(day).padStart(2, '0')}`
        const alreadySettled = driverRows.some(
          (r) => r.date?.startsWith(periodPrefix) && parseInt(r.date.slice(-2), 10) === day,
        )
        if (alreadySettled) continue
        const jsDay = new Date(period.year, period.month - 1, day).getDay()
        const isSunday = jsDay === 0
        const isHoliday = colombianHolidaysCalc.has(dayStr)
        const amount =
          isSunday || isHoliday ? driver.defaultAmountSunday || 0 : driver.defaultAmount || 0
        rows.push({ date: dayStr, plate, driver: driver.name, amount, isHoliday, isSunday })
      }
    }
    return rows.sort((a, b) => a.date.localeCompare(b.date))
  }, [isCurrentPeriod, drivers, vehiclesMap, rowsByDriver, period, daysInMonth, now, colombianHolidaysCalc])

  const settlementAbbr = t('taxis.settlements.settlementAbbr')

  const byDriver = useMemo(
    () =>
      Object.values(
        filtered.reduce((acc, r) => {
          const k = r.driver
          if (!acc[k]) acc[k] = { id: k, driver: k, count: 0, total: 0, rows: [] }
          acc[k].count += 1
          acc[k].total += r.amount || 0
          acc[k].rows.push(r)
          return acc
        }, {}),
      )
        .sort((a, b) => b.total - a.total)
        .map((item) => ({
          ...item,
          remaining: calcRemaining(item.driver, rowsByDriver[item.driver] || []) ?? 0,
          future: calcFuture(item.driver, rowsByDriver[item.driver] || []),
        })),
    [filtered, calcRemaining, calcFuture, rowsByDriver],
  )

  const byVehicle = useMemo(
    () =>
      Object.values(
        filtered.reduce((acc, r) => {
          const k = r.plate || '—'
          if (!acc[k]) acc[k] = { id: k, plate: k, count: 0, total: 0, rows: [] }
          acc[k].count += 1
          acc[k].total += r.amount || 0
          acc[k].rows.push(r)
          return acc
        }, {}),
      )
        .sort((a, b) => b.total - a.total)
        .map((item) => {
          const driver = driversByVehicleMap.get(item.plate)
          return {
            ...item,
            remaining: driver
              ? (calcRemaining(driver.name, rowsByDriver[driver.name] || []) ?? 0)
              : 0,
          }
        }),
    [filtered, calcRemaining, driversByVehicleMap, rowsByDriver],
  )

  // ── Audit data ────────────────────────────────────────────────────────────
  const auditMonthStr = `${period.year}-${String(period.month).padStart(2, '0')}`
  const auditPeriodRecords = records.filter((r) => r.date?.startsWith(auditMonthStr))
  const auditMonthEnd = `${auditMonthStr}-${String(daysInMonth).padStart(2, '0')}`
  const periodDrivers = drivers.filter((d) => {
    const hasHistoricalCoverage = d.defaultVehicle && d.endDate
    if (d.active === false && !hasHistoricalCoverage) return false
    if (d.startDate && d.startDate > auditMonthEnd) return false
    if (d.endDate && d.endDate < `${auditMonthStr}-01`) return false
    return true
  })
  const auditDrivers = periodDrivers.map((d) => d.name).sort()
  const auditVehicles = [
    ...new Set(periodDrivers.map((d) => d.defaultVehicle).filter(Boolean)),
  ].sort()
  const auditToday =
    now.getFullYear() === period.year && now.getMonth() + 1 === period.month ? now.getDate() : null
  const auditVehicleRestrictions = new Map(
    auditVehicles.map((pl) => {
      const v = vehiclesMap.get(pl)
      const restr = v?.restrictions?.[period.month] ?? v?.restrictions?.[String(period.month)] ?? {}
      return [pl, new Set([restr.d1, restr.d2].filter(Boolean).map(Number))]
    }),
  )
  const auditDays = Array.from({ length: daysInMonth }, (_, i) =>
    buildAuditDay(i + 1, {
      monthStr: auditMonthStr,
      periodRecords: auditPeriodRecords,
      periodDrivers,
      auditVehicles,
      auditDrivers,
      year: period.year,
      month: period.month,
      auditToday,
      now,
      holidays: colombianHolidaysCalc,
      vehicleRestrictions: auditVehicleRestrictions,
    }),
  )

  // ── Audit note helpers ────────────────────────────────────────────────────
  const getNote = (date, driver) => auditNotes[auditNoteId(date, driver)]?.note ?? ''
  const getResolved = (date, driver) => auditNotes[auditNoteId(date, driver)]?.resolved || false

  const handleNoteSave = (date, driver, note) => {
    const resolved = getResolved(date, driver)
    if (note.trim() || resolved) {
      dispatch(taxiAuditNoteActions.upsertRequest({ date, driver, note: note.trim(), resolved }))
    } else {
      dispatch(taxiAuditNoteActions.deleteRequest({ date, driver }))
    }
  }

  const handleResolvedToggle = (date, driver) => {
    const current = auditNotes[auditNoteId(date, driver)]
    const note = current?.note || ''
    const resolved = !(current?.resolved || false)
    if (note || resolved) {
      dispatch(taxiAuditNoteActions.upsertRequest({ date, driver, note, resolved }))
    } else {
      dispatch(taxiAuditNoteActions.deleteRequest({ date, driver }))
    }
  }

  const isAllResolved = (day) => {
    if (day.status === 'full' || day.status === 'future') return false
    const hasIssues = day.missing.length > 0 || day.underpaidVehicles.length > 0
    if (!hasIssues) return false
    const missingResolved = day.missing.every((dr) => getResolved(day.dateStr, dr))
    const underpaidResolved = day.underpaidVehicles.every((pl) => {
      const driver = periodDrivers.find((d) => {
        if (d.defaultVehicle !== pl) return false
        if (d.startDate && d.startDate > day.dateStr) return false
        if (d.endDate && d.endDate < day.dateStr) return false
        return true
      })
      return driver ? getResolved(day.dateStr, driver.name) : true
    })
    return missingResolved && underpaidResolved
  }

  const auditRowBg = (day) => {
    if (day.isToday) return '#e8f0fb'
    if (day.status === 'future') return '#f8fafc'
    if (isAllResolved(day)) return '#f0fdf4'
    if (day.status === 'none') return '#fff5f5'
    if (day.status === 'partial') return '#fffbeb'
    if (day.hasPicoPlaca) return '#faf5ff'
    return '#f8fff8'
  }

  const auditAccentMap = { none: '#e03131', partial: '#e67700', full: '#2f9e44', future: '#cbd5e1' }
  const auditLeftBorder = (day) => {
    if (isAllResolved(day)) return '#2f9e44'
    if (day.hasPicoPlaca && day.status === 'full') return '#7c3aed'
    return auditAccentMap[day.status]
  }

  // ── Audit exports ─────────────────────────────────────────────────────────
  const exportAuditToExcel = () => {
    const statusLabel = { none: 'Sin actividad', partial: 'Parcial', full: 'Completo', future: 'Futuro' }
    const monthName = new Date(period.year, period.month - 1, 1).toLocaleDateString('es-CO', {
      month: 'long', year: 'numeric',
    })
    const title = `Auditoría ${monthName}`
    const headers = ['Día', 'Fecha', 'Semana', 'Estado', 'Liq.', 'Total (COP)', 'Liquidaron', 'Sin liquidar']
    const rows = auditDays.map((day) => [
      String(day.d).padStart(2, '0'),
      day.dateStr,
      DAY_NAMES[day.dow],
      statusLabel[day.status] ?? day.status,
      day.isFuture ? '' : day.dayRecords.length,
      day.isFuture ? '' : day.total,
      day.settled.join(', '),
      day.missing.join(', '),
    ])
    const pastDays = auditDays.filter((d) => !d.isFuture)
    const totalsRow = ['', '', '', 'TOTAL', pastDays.reduce((s, d) => s + d.dayRecords.length, 0), pastDays.reduce((s, d) => s + d.total, 0), '', '']
    const aoa = [[title], [], headers, ...rows, [], totalsRow]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws['!cols'] = [{ wch: 5 }, { wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 6 }, { wch: 16 }, { wch: 40 }, { wch: 40 }]
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoría')
    XLSX.writeFile(wb, `auditoria_${auditMonthStr}.xlsx`)
  }

  const exportAuditToPdf = () => {
    const monthName = new Date(period.year, period.month - 1, 1).toLocaleDateString('es-CO', {
      month: 'long', year: 'numeric',
    })
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()

    doc.setFillColor(30, 58, 95)
    doc.rect(0, 0, pageW, 18, 'F')
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(`Auditoria de Liquidaciones - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`, 14, 12)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 215, 240)
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, pageW - 14, 12, { align: 'right' })
    doc.setTextColor(0)

    const pastDays = auditDays.filter((d) => !d.isFuture)
    const summaryItems = [
      { label: 'Sin actividad', value: String(auditDays.filter((d) => d.status === 'none').length), fill: [224, 49, 49], bg: [255, 245, 245] },
      { label: 'Parcial', value: String(auditDays.filter((d) => d.status === 'partial').length), fill: [230, 119, 0], bg: [255, 251, 235] },
      { label: 'Completo', value: String(auditDays.filter((d) => d.status === 'full').length), fill: [47, 158, 68], bg: [240, 253, 244] },
      { label: 'Dias futuros', value: String(auditDays.filter((d) => d.status === 'future').length), fill: [134, 142, 150], bg: [248, 250, 252] },
      { label: 'Total recaudado', value: fmt(pastDays.reduce((s, d) => s + d.total, 0)), fill: [30, 58, 95], bg: [238, 244, 255], wide: true },
    ]
    let sx = 14
    const boxH = 14
    const topY = 22
    summaryItems.forEach((item) => {
      const bw = item.wide ? 52 : 42
      doc.setFillColor(...item.bg)
      doc.setDrawColor(...item.fill)
      doc.roundedRect(sx, topY, bw, boxH, 2, 2, 'FD')
      doc.setFontSize(item.wide ? 9 : 13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...item.fill)
      doc.text(item.value, sx + bw / 2, topY + 7, { align: 'center' })
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'normal')
      doc.text(item.label, sx + bw / 2, topY + 11.5, { align: 'center' })
      sx += bw + 4
    })
    doc.setTextColor(0)

    const statusLabel = { none: 'Sin activ.', partial: 'Parcial', full: 'Completo', future: 'Futuro' }
    const tableRows = auditDays.map((day) => {
      const resolvedLabel = isAllResolved(day) ? 'Completo' : (statusLabel[day.status] ?? day.status)
      const settledStr = day.settled
        .map((dr) => {
          const plate = drivers.find((d) => d.name === dr)?.defaultVehicle
          const underpaid = plate ? day.underpaidVehicles.includes(plate) : false
          const driverRecs = day.dayRecords.filter((r) => r.driver === dr)
          return driverRecs
            .map((rec) => `${underpaid ? '~ ' : ''}${dr.split(' ')[0]}${driverRecs.length > 1 ? ` $${(rec.amount / 1000).toFixed(0)}k` : ''}`)
            .join(', ')
        })
        .join(', ')
      const issueParts = []
      if (!day.isFuture) {
        day.missing.forEach((dr) => {
          const note = getNote(day.dateStr, dr)
          const resolved = getResolved(day.dateStr, dr)
          issueParts.push(`${resolved ? '[OK] ' : ''}${dr}${note ? ` — ${note}` : ''}`)
        })
        day.underpaidVehicles.forEach((pl) => {
          const driver = periodDrivers.find((d) => {
            if (d.defaultVehicle !== pl) return false
            if (d.startDate && d.startDate > day.dateStr) return false
            if (d.endDate && d.endDate < day.dateStr) return false
            return true
          })
          if (!driver) return
          const expected = day.isSunday ? driver.defaultAmountSunday || driver.defaultAmount || 0 : driver.defaultAmount || 0
          const paid = day.dayRecords.filter((r) => r.plate === pl).reduce((s, r) => s + (r.amount || 0), 0)
          const note = getNote(day.dateStr, driver.name)
          const resolved = getResolved(day.dateStr, driver.name)
          issueParts.push(`[~] ${resolved ? '[OK] ' : ''}${driver.name.split(' ')[0]} ${fmt(paid)}/${fmt(expected)}${note ? ` — ${note}` : ''}`)
        })
        day.picoPlacaDrivers.forEach((dr) => {
          const driverObj = periodDrivers.find((d) => d.name === dr)
          issueParts.push(`[P&P] ${dr.split(' ')[0]}${driverObj?.defaultVehicle ? ` ${driverObj.defaultVehicle}` : ''}`)
        })
      }
      const dayLabel = [String(day.d).padStart(2, '0'), day.isHoliday ? '(F)' : '', day.hasPicoPlaca && day.status !== 'none' ? '(P&P)' : ''].filter(Boolean).join(' ')
      return [
        { content: dayLabel, styles: { fontStyle: day.isToday ? 'bold' : 'normal', textColor: day.isFuture ? [173, 181, 189] : [30, 58, 95] } },
        { content: DAY_NAMES[day.dow], styles: { textColor: day.isSunday || day.isHoliday ? [124, 94, 0] : day.isFuture ? [173, 181, 189] : [100, 116, 139], fontStyle: day.isSunday || day.isHoliday ? 'bold' : 'normal' } },
        { content: resolvedLabel },
        { content: day.isFuture ? '' : String(day.dayRecords.length), styles: { halign: 'center' } },
        { content: day.isFuture ? '' : day.total > 0 ? fmt(day.total) : '—', styles: { halign: 'right', fontStyle: 'bold' } },
        { content: settledStr },
        { content: issueParts.join('\n') },
      ]
    })

    const totalCount = pastDays.reduce((s, d) => s + d.dayRecords.length, 0)
    const totalAmt = pastDays.reduce((s, d) => s + d.total, 0)

    autoTable(doc, {
      startY: topY + boxH + 6,
      head: [['Dia', 'Sem.', 'Estado', 'Liq.', 'Total', 'Liquidaron', 'Sin liquidar / Notas']],
      body: tableRows,
      foot: [[{ content: '', colSpan: 2 }, { content: 'TOTAL', styles: { fontStyle: 'bold', halign: 'center' } }, { content: String(totalCount), styles: { halign: 'center', fontStyle: 'bold' } }, { content: fmt(totalAmt), styles: { halign: 'right', fontStyle: 'bold' } }, { content: '' }, { content: '' }]],
      styles: { fontSize: 7.5, cellPadding: { top: 3, right: 4, bottom: 3, left: 4 }, overflow: 'linebreak', valign: 'middle' },
      headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      footStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      columnStyles: { 0: { cellWidth: 15, halign: 'center' }, 1: { cellWidth: 11, halign: 'center' }, 2: { cellWidth: 22, halign: 'center' }, 3: { cellWidth: 10, halign: 'center' }, 4: { cellWidth: 28 }, 5: { cellWidth: 'auto' }, 6: { cellWidth: 'auto' } },
      didParseCell: (data) => {
        if (data.section !== 'body') return
        if (data.column.index === 2) {
          const day = auditDays[data.row.index]
          if (!day) return
          const resolved = isAllResolved(day)
          if (resolved || day.status === 'full') { data.cell.styles.textColor = [47, 158, 68]; data.cell.styles.fillColor = [240, 253, 244] }
          else if (day.status === 'none') { data.cell.styles.textColor = [180, 30, 30]; data.cell.styles.fillColor = [255, 245, 245] }
          else if (day.status === 'partial') { data.cell.styles.textColor = [166, 93, 0]; data.cell.styles.fillColor = [255, 251, 235] }
          else if (day.status === 'future') { data.cell.styles.textColor = [173, 181, 189]; data.cell.styles.fillColor = [248, 250, 252] }
        }
        if (data.column.index === 6 && data.cell.raw?.content) data.cell.styles.textColor = [180, 30, 30]
      },
      alternateRowStyles: { fillColor: [250, 251, 252] },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages()
        doc.setFontSize(7)
        doc.setTextColor(160)
        doc.text(`Pagina ${data.pageNumber} de ${pageCount}`, pageW - 14, doc.internal.pageSize.getHeight() - 5, { align: 'right' })
        doc.setTextColor(0)
      },
      margin: { left: 14, right: 14 },
      showFoot: 'lastPage',
    })
    doc.save(`auditoria_${auditMonthStr}.pdf`)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {loadingSettlements && savingRef.current && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CSpinner color="light" style={{ width: 48, height: 48 }} />
        </div>
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            padding: '12px 28px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            background: toast.type === 'success' ? '#2f9e44' : '#e03131',
            color: '#fff',
          }}
        >
          {toast.msg}
        </div>
      )}

      <PeriodSummary
        summaryOpen={summaryOpen}
        toggleSummary={toggleSummary}
        total={total}
        projection={projection}
        isCurrentPeriod={isCurrentPeriod}
        daysElapsed={daysElapsed}
        daysInMonth={daysInMonth}
        totalExpenses={totalExpenses}
        periodExpenses={periodExpenses}
        byDriver={byDriver}
        settlementAbbr={settlementAbbr}
        pendingRows={pendingRows}
        now={now}
        period={period}
        loading={loading}
      />

      <CCard>
        <CCardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <strong>{t('taxis.settlements.title')}</strong>
            <CBadge color="secondary">{filtered.length}</CBadge>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}>
              {t('taxis.settlements.period')}
            </span>
            <CFormSelect
              size="sm"
              style={{ width: 120 }}
              value={period.month}
              onChange={(e) => {
                setPeriod((p) => ({ ...p, month: Number(e.target.value) }))
                setDayFilter(new Set())
              }}
            >
              {months.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </CFormSelect>
            <CFormSelect
              size="sm"
              style={{ width: 90 }}
              value={period.year}
              onChange={(e) => {
                setPeriod((p) => ({ ...p, year: Number(e.target.value) }))
                setDayFilter(new Set())
              }}
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </CFormSelect>

            {(viewMode === 'detail' || viewMode === 'byDriver') && (
              <MultiSelectDropdown
                label={(size) => `${t('taxis.settlements.fields.driver')}${size > 0 ? ` (${size})` : ''}`}
                options={drivers.map((d) => ({ value: d.name, label: d.name }))}
                selected={driverFilter}
                onToggle={toggleDriverFilter}
                onClearAll={() => setDriverFilter(new Set())}
                acceptLabel={t('taxis.settlements.accept')}
              />
            )}

            {(viewMode === 'detail' || viewMode === 'audit') && (
              <>
                <MultiSelectDropdown
                  label={(size) => `${t('taxis.settlements.audit.colDay')}${size > 0 ? ` (${size})` : ''}`}
                  options={Array.from({ length: daysInMonth }, (_, i) => ({ value: i + 1, label: String(i + 1) }))}
                  selected={dayFilter}
                  onToggle={toggleDayFilter}
                  onClearAll={() => setDayFilter(new Set())}
                  acceptLabel={t('taxis.settlements.accept')}
                />
                <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', whiteSpace: 'nowrap' }}>
                  {t('taxis.settlements.fields.vehicle')}
                </span>
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
            Mode:
            {[
              { key: 'detail', label: t('taxis.settlements.viewDetail'), color: 'secondary' },
              { key: 'byDriver', label: t('taxis.settlements.viewByDriver'), color: 'secondary' },
              { key: 'byVehicle', label: t('taxis.settlements.viewByVehicle'), color: 'secondary' },
              { key: 'audit', label: t('taxis.settlements.viewAudit'), color: 'warning' },
            ].map(({ key, label, color }) => (
              <CButton
                key={key}
                size="sm"
                color={color}
                variant={viewMode === key ? undefined : 'outline'}
                onClick={() => {
                  setViewMode(key)
                  localStorage.setItem('settlements_viewMode', key)
                }}
                style={{ fontSize: 12 }}
              >
                {label}
              </CButton>
            ))}
          </div>

          <CButton
            size="sm"
            color="secondary"
            variant="outline"
            onClick={() => dispatch(taxiSettlementActions.fetchRequest())}
            title={t('common.refresh')}
          >
            <CIcon icon={cilReload} size="sm" />
          </CButton>
          <CButton
            size="sm"
            color={showForm ? 'danger' : 'primary'}
            variant="outline"
            onClick={() => {
              setShowForm((p) => !p)
              setError(null)
            }}
          >
            <CIcon icon={showForm ? cilX : cilPlus} size="sm" />{' '}
            {showForm ? t('common.cancel') : t('taxis.settlements.newSettlement')}
          </CButton>
        </CCardHeader>

        <CCollapse visible={showForm}>
          <SettlementCreateForm
            form={form}
            drivers={drivers}
            vehicles={vehicles}
            loading={loadingSettlements}
            picoPlacaWarning={picoPlacaWarning}
            error={error}
            onSubmit={handleAdd}
            onDriverChange={handleDriverChange}
            onChange={set}
          />
        </CCollapse>

        <CCardBody style={{ padding: 0 }}>
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : viewMode === 'detail' ? (
            <StandardGrid
              ref={dataGridRef}
              id="paymentsGrid"
              keyExpr="id"
              dataSource={filtered}
              noDataText={t('taxis.settlements.noData')}
              summary={{
                totalItems: [
                  { column: 'amount', summaryType: 'sum', customizeText: (e) => fmt(e.value) },
                ],
              }}
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
              <Column dataField="amount" caption={t('taxis.settlements.fields.value')}
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
              <MasterDetail
                enabled={true}
                render={({ data }) => (
                  <SettlementMasterDetail
                    data={data}
                    drivers={drivers}
                    vehicles={vehicles}
                    saving={loadingSettlements}
                    onSave={handleEditSave}
                    editingRowIdRef={editingRowIdRef}
                  />
                )}
              />
            </StandardGrid>
          ) : viewMode === 'byDriver' ? (
            <StandardGrid
              keyExpr="id"
              dataSource={byDriver}
              noDataText={t('taxis.settlements.noData')}
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
              <MasterDetail
                enabled={true}
                render={({ data }) => (
                  <div style={{ margin: '8px 8px 12px 32px' }}>
                    <StandardGrid dataSource={data.rows} keyExpr="id" style={{ margin: 0 }} noDataText={t('taxis.settlements.noRecords')}>
                      <Column dataField="date" caption={t('taxis.settlements.fields.date')} width={110} sortOrder="asc" defaultSortIndex={0} />
                      <Column dataField="plate" caption={t('taxis.settlements.fields.plate')} width={100} cellRender={({ value }) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>} />
                      <Column dataField="amount" caption={t('taxis.settlements.fields.value')} width={130} cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{fmt(value)}</span>} />
                      <Column dataField="comment" caption={t('taxis.settlements.fields.comment')} minWidth={120} />
                    </StandardGrid>
                  </div>
                )}
              />
            </StandardGrid>
          ) : viewMode === 'byVehicle' ? (
            <StandardGrid
              keyExpr="id"
              dataSource={byVehicle}
              noDataText={t('taxis.settlements.noData')}
              summary={{
                totalItems: [
                  { column: 'total', summaryType: 'sum', customizeText: (e) => fmt(e.value) },
                  ...(isCurrentPeriod ? [{ column: 'remaining', summaryType: 'sum', customizeText: (e) => fmt(e.value) }] : []) ,
                  ...(isCurrentPeriod ? [{ column: 'count', summaryType: 'custom', name: 'grandTotal', showInColumn: 'count', customizeText: () => `Gran total: ${fmt(byVehicle.reduce((s, r) => s + r.total + r.remaining, 0))}` }] : []),
                ],
                calculateCustomSummary: () => {},
              }}
            >
              <Column dataField="plate" caption={t('taxis.settlements.fields.plate')} minWidth={130} cellRender={({ value }) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>} />
              <Column dataField="count" caption={t('taxis.settlements.columns.countSettlements')} width={140} cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{value}</span>} />
              <Column dataField="total" caption={t('taxis.settlements.columns.totalDeposited')} width={170} cellRender={({ value }) => <span style={{ fontWeight: 700, color: '#1e40af' }}>{fmt(value)}</span>} />
              <Column dataField="remaining" caption={t('taxis.settlements.columns.remaining')} width={170} visible={isCurrentPeriod} cellRender={({ data }) => <span style={{ fontWeight: 700, color: data.remaining > 0 ? '#e67700' : '#2f9e44' }}>{fmt(data.remaining)}</span>} />
              <MasterDetail
                enabled={true}
                render={({ data }) => (
                  <div style={{ margin: '8px 8px 12px 32px' }}>
                    <StandardGrid dataSource={data.rows} keyExpr="id" style={{ margin: 0 }} noDataText={t('taxis.settlements.noRecords')}>
                      <Column dataField="date" caption={t('taxis.settlements.fields.date')} width={110} sortOrder="asc" defaultSortIndex={0} />
                      <Column dataField="driver" caption={t('taxis.settlements.fields.driver')} minWidth={150} />
                      <Column dataField="amount" caption={t('taxis.settlements.fields.value')} width={130} cellRender={({ value }) => <span style={{ fontWeight: 600 }}>{fmt(value)}</span>} />
                      <Column dataField="comment" caption={t('taxis.settlements.fields.comment')} minWidth={120} />
                    </StandardGrid>
                  </div>
                )}
              />
            </StandardGrid>
          ) : viewMode === 'audit' ? (
            <AuditView
              auditDays={auditDays}
              dayFilter={dayFilter}
              drivers={drivers}
              periodDrivers={periodDrivers}
              auditDrivers={auditDrivers}
              auditVehicles={auditVehicles}
              getNote={getNote}
              getResolved={getResolved}
              handleResolvedToggle={handleResolvedToggle}
              handleNoteSave={handleNoteSave}
              isAllResolved={isAllResolved}
              auditRowBg={auditRowBg}
              auditLeftBorder={auditLeftBorder}
              exportAuditToExcel={exportAuditToExcel}
              exportAuditToPdf={exportAuditToPdf}
            />
          ) : null}
        </CCardBody>
      </CCard>

      <PeriodNotes period={period} />
    </>
  )
}

export default Taxis
