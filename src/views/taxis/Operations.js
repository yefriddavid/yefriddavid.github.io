import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import * as taxiExpenseActions from 'src/actions/taxi/taxiExpenseActions'
import { getColombianHolidays } from './auditHelpers'
import { TAXI_MAINTENANCE_CATEGORIES as MAINTENANCE_CATEGORIES } from 'src/constants/taxi'

// Derive day/month names from a locale string using Intl
const getDayNames = (locale) =>
  Array.from({ length: 7 }, (_, i) =>
    new Date(2025, 0, 5 + i).toLocaleDateString(locale, { weekday: 'long' }),
  )

const getMonthNames = (locale) =>
  Array.from({ length: 12 }, (_, i) =>
    new Date(2025, i, 1).toLocaleDateString(locale, { month: 'long' }),
  )

const now = new Date()

// ── helpers ───────────────────────────────────────────────────────────────────

const pad2 = (n) => String(n).padStart(2, '0')

const restrictedDaysForMonth = (vehicle, month) => {
  const restr = vehicle?.restrictions?.[month] ?? vehicle?.restrictions?.[String(month)] ?? {}
  return [restr.d1, restr.d2].filter(Boolean).map(Number)
}

// ── colors & types ────────────────────────────────────────────────────────────

const TYPE_COLORS = {
  'pico-placa': { bg: '#fff1f2', border: '#f43f5e', text: '#9f1239', label: 'P&P' },
  'Cambio Aceite': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', label: 'Aceite' },
  'Cambio de Correa Dentada': {
    bg: '#fff7ed',
    border: '#ea580c',
    text: '#7c2d12',
    label: 'Correa',
  },
  Mantenimiento: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', label: 'Mantto.' },
  Lavado: { bg: '#f0fdf4', border: '#22c55e', text: '#166534', label: 'Lavado' },
  Repuestos: { bg: '#fdf4ff', border: '#a855f7', text: '#7e22ce', label: 'Repuesto' },
}

// ── badge ─────────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n)

const ItemBadge = ({ plate, driver, type, lastExpense, onClick }) => {
  const c = TYPE_COLORS[type] || { bg: '#f8fafc', border: '#94a3b8', text: '#475569', label: type }
  const clickable = !!lastExpense
  return (
    <span
      onClick={clickable ? onClick : undefined}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 6,
        padding: '2px 8px',
        margin: '2px 3px',
        lineHeight: 1.3,
        cursor: clickable ? 'pointer' : 'default',
      }}
    >
      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: c.text }}>
        {plate}
      </span>
      {driver && <span style={{ fontSize: 10, color: c.text }}>{driver.split(' ')[0]}</span>}
      <span style={{ fontSize: 9, color: c.text, opacity: 0.75 }}>{c.label}</span>
    </span>
  )
}

const ExpenseModal = ({ item, onClose }) => {
  if (!item) return null
  const c = TYPE_COLORS[item.type] || {
    bg: '#f8fafc',
    border: '#94a3b8',
    text: '#475569',
    label: item.type,
  }
  const e = item.lastExpense
  return (
    <CModal visible={!!item} onClose={onClose} alignment="center" size="sm">
      <CModalHeader>
        <CModalTitle style={{ fontSize: 14 }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: c.text }}>
            {item.vehicle.plate}
          </span>
          {' — '}
          {item.type}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <tbody>
            {[
              ['Último servicio', e.date],
              ['Descripción', e.description],
              ['Valor', e.amount ? fmt(e.amount) : '—'],
              ['Próximo servicio', e.nextDate || '—'],
              ['Comentario', e.comment || '—'],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td
                  style={{ padding: '6px 8px', color: '#6b7280', whiteSpace: 'nowrap', width: 130 }}
                >
                  {label}
                </td>
                <td style={{ padding: '6px 8px', fontWeight: 500 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CModalBody>
    </CModal>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

const Operations = () => {
  const dispatch = useDispatch()
  const { i18n } = useTranslation()
  const locale = i18n.language

  const { data: vehiclesData, fetching } = useSelector((s) => s.taxiVehicle)
  const { data: driversData } = useSelector((s) => s.taxiDriver)
  const { data: expensesData } = useSelector((s) => s.taxiExpense)

  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selected, setSelected] = useState(
    () =>
      new Set(JSON.parse(localStorage.getItem('ops_selected') || '["pico-placa","Cambio Aceite"]')),
  )
  const [activeItem, setActiveItem] = useState(null)

  useEffect(() => {
    dispatch(taxiVehicleActions.fetchRequest())
    dispatch(taxiDriverActions.fetchRequest())
    dispatch(taxiExpenseActions.fetchRequest())
  }, [dispatch])

  const vehicles = vehiclesData ?? []
  const drivers = driversData ?? []
  const expenses = expensesData ?? []

  const driversByVehicle = useMemo(
    () => new Map(drivers.filter((d) => d.defaultVehicle).map((d) => [d.defaultVehicle, d])),
    [drivers],
  )

  const dayNames = useMemo(() => getDayNames(locale), [locale])
  const monthNames = useMemo(() => getMonthNames(locale), [locale])
  const availableYears = useMemo(() => {
    const base = now.getFullYear()
    return [base - 1, base, base + 1]
  }, [])
  const holidays = useMemo(() => getColombianHolidays(year), [year])

  const toggleType = (key) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      localStorage.setItem('ops_selected', JSON.stringify([...next]))
      return next
    })
  }

  // last expense per maintenance category per plate
  const lastByCategory = useMemo(() => {
    const map = new Map()
    for (const cat of MAINTENANCE_CATEGORIES) {
      const plateMap = new Map()
      for (const e of expenses) {
        if (e.category !== cat || !e.plate || !e.date) continue
        const current = plateMap.get(e.plate)
        if (!current || e.date > current.date) plateMap.set(e.plate, e)
      }
      map.set(cat, plateMap)
    }
    return map
  }, [expenses])

  const daysInMonth = new Date(year, month, 0).getDate()
  const monthStr = `${year}-${pad2(month)}`
  const todayNum = now.getFullYear() === year && now.getMonth() + 1 === month ? now.getDate() : null

  // unified items per day from all selected types
  const itemsByDay = useMemo(() => {
    const map = new Map()

    // pico y placa
    if (selected.has('pico-placa')) {
      for (const v of vehicles) {
        for (const day of restrictedDaysForMonth(v, month)) {
          if (!map.has(day)) map.set(day, [])
          map
            .get(day)
            .push({ type: 'pico-placa', vehicle: v, driver: driversByVehicle.get(v.plate) })
        }
      }
    }

    // maintenance categories — use nextDate field from last expense
    for (const cat of MAINTENANCE_CATEGORIES) {
      if (!selected.has(cat)) continue
      const plateMap = lastByCategory.get(cat)
      if (!plateMap) continue
      for (const v of vehicles) {
        const last = plateMap.get(v.plate)
        if (!last?.nextDate) continue
        const isOverdue = last.nextDate < monthStr + '-01'
        const isThisMonth = last.nextDate.startsWith(monthStr + '-')
        if (!isOverdue && !isThisMonth) continue
        const day = isOverdue ? 1 : parseInt(last.nextDate.split('-')[2], 10)
        if (!map.has(day)) map.set(day, [])
        map
          .get(day)
          .push({ type: cat, vehicle: v, driver: driversByVehicle.get(v.plate), lastExpense: last })
      }
    }

    return map
  }, [selected, vehicles, driversByVehicle, month, lastByCategory, monthStr])

  return (
    <CCard>
      <CCardHeader
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'space-between',
        }}
      >
        <strong>Operaciones</strong>

        {/* Toggle badges — click to activate/deactivate each type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[{ key: 'pico-placa' }, ...MAINTENANCE_CATEGORIES.map((c) => ({ key: c }))].map(
            ({ key }) => {
              const c = TYPE_COLORS[key]
              const active = selected.has(key)
              return (
                <span
                  key={key}
                  onClick={() => toggleType(key)}
                  style={{
                    background: active ? c.bg : '#f1f5f9',
                    border: `2px solid ${active ? c.border : '#cbd5e1'}`,
                    color: active ? c.text : '#94a3b8',
                    borderRadius: 4,
                    padding: '2px 10px',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {key === 'pico-placa' ? 'Pico y Placa' : key}
                </span>
              )
            },
          )}
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <CFormSelect
            size="sm"
            style={{ width: 130 }}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {monthNames.map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </option>
            ))}
          </CFormSelect>
          <CFormSelect
            size="sm"
            style={{ width: 90 }}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </CFormSelect>
        </div>
      </CCardHeader>

      <CCardBody style={{ padding: 0 }}>
        {fetching && !vehiclesData ? (
          <div className="d-flex justify-content-center py-5">
            <CSpinner color="primary" />
          </div>
        ) : selected.size === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--cui-secondary-color)' }}>
            Selecciona al menos un tipo para mostrar.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#1e3a5f', color: '#fff' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'center', width: 48 }}>Día</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', width: 120 }}>Semana</th>
                  <th style={{ padding: '8px 14px', textAlign: 'left' }}>Eventos</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const dateStr = `${monthStr}-${pad2(day)}`
                  const dow = new Date(year, month - 1, day).getDay()
                  const isSunday = dow === 0
                  const isHoliday = holidays.has(dateStr)
                  const isToday = day === todayNum
                  const items = itemsByDay.get(day) ?? []
                  const hasItems = items.length > 0

                  return (
                    <tr
                      key={day}
                      style={{
                        background: isToday
                          ? '#e8f0fb'
                          : isSunday || isHoliday
                            ? '#fafafa'
                            : '#fff',
                        borderBottom: '1px solid #f0f0f0',
                        borderLeft: isToday
                          ? '3px solid #1e3a5f'
                          : hasItems
                            ? '3px solid #f59e0b'
                            : '3px solid transparent',
                      }}
                    >
                      <td
                        style={{
                          padding: '7px 12px',
                          textAlign: 'center',
                          fontWeight: isToday ? 700 : 500,
                          fontVariantNumeric: 'tabular-nums',
                          color: isToday
                            ? '#1e3a5f'
                            : isSunday || isHoliday
                              ? '#92400e'
                              : '#374151',
                        }}
                      >
                        {pad2(day)}
                        {isHoliday && (
                          <span style={{ fontSize: 9, display: 'block', color: '#b45309' }}>
                            Fest.
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: '7px 12px',
                          textAlign: 'center',
                          color: isSunday || isHoliday ? '#92400e' : '#6b7280',
                          fontStyle: isSunday || isHoliday ? 'italic' : 'normal',
                          fontSize: 12,
                        }}
                      >
                        {dayNames[dow]}
                      </td>
                      <td style={{ padding: '5px 14px' }}>
                        {hasItems ? (
                          items.map((item, idx) => (
                            <ItemBadge
                              key={idx}
                              plate={item.vehicle.plate}
                              driver={item.driver?.name}
                              type={item.type}
                              lastExpense={item.lastExpense}
                              onClick={() => setActiveItem(item)}
                            />
                          ))
                        ) : (
                          <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CCardBody>
      <ExpenseModal item={activeItem} onClose={() => setActiveItem(null)} />
    </CCard>
  )
}

export default Operations
