import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { CCard, CCardBody, CCardHeader, CButton, CSpinner, CBadge, CFormSelect } from '@coreui/react'
import * as taxiVehicleActions from 'src/actions/CashFlow/taxiVehicleActions'
import * as taxiDriverActions from 'src/actions/CashFlow/taxiDriverActions'
import { getColombianHolidays } from './auditHelpers'

// Derive day names (Sun–Sat) and month names from a locale string using Intl
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

// ── sub-components ────────────────────────────────────────────────────────────

/** Badge showing a plate with optional driver name */
const PlateBadge = ({ plate, driver }) => (
  <span
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: 6,
      padding: '2px 8px',
      margin: '2px 3px',
      lineHeight: 1.3,
    }}
  >
    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#92400e' }}>
      {plate}
    </span>
    {driver && (
      <span style={{ fontSize: 10, color: '#a16207' }}>
        {driver.split(' ')[0]}
      </span>
    )}
  </span>
)

// ── Monthly calendar view ─────────────────────────────────────────────────────

const MonthView = ({ year, month, vehicles, driversByVehicle, holidays, locale }) => {
  const dayNames = useMemo(() => getDayNames(locale), [locale])
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthStr = `${year}-${pad2(month)}`
  const todayNum = now.getFullYear() === year && now.getMonth() + 1 === month ? now.getDate() : null

  const rows = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dateStr = `${monthStr}-${pad2(day)}`
      const dow = new Date(year, month - 1, day).getDay()
      const isSunday = dow === 0
      const isHoliday = holidays.has(dateStr)
      const restricted = vehicles.filter((v) => restrictedDaysForMonth(v, month).includes(day))
      return { day, dateStr, dow, isSunday, isHoliday, restricted }
    })
  }, [year, month, vehicles, holidays, daysInMonth, monthStr])

  const anyRestriction = rows.some((r) => r.restricted.length > 0)

  if (!anyRestriction && vehicles.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--cui-secondary-color)' }}>
        No hay vehículos con restricciones configuradas.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#1e3a5f', color: '#fff' }}>
            <th style={{ padding: '8px 12px', textAlign: 'center', width: 48 }}>Día</th>
            <th style={{ padding: '8px 12px', textAlign: 'center', width: 52 }}>Sem.</th>
            <th style={{ padding: '8px 14px', textAlign: 'left' }}>Vehículos con pico y placa</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ day, dow, isSunday, isHoliday, restricted, dateStr }) => {
            const isToday = day === todayNum
            const isWeekend = isSunday || isHoliday
            const hasRestriction = restricted.length > 0

            let rowBg = '#fff'
            if (isToday) rowBg = '#e8f0fb'
            else if (isWeekend) rowBg = '#fafafa'

            return (
              <tr
                key={day}
                style={{
                  background: rowBg,
                  borderBottom: '1px solid #f0f0f0',
                  borderLeft: isToday
                    ? '3px solid #1e3a5f'
                    : hasRestriction
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
                    color: isToday ? '#1e3a5f' : isWeekend ? '#92400e' : '#374151',
                  }}
                >
                  {pad2(day)}
                  {isHoliday && (
                    <span style={{ fontSize: 9, display: 'block', color: '#b45309' }}>Fest.</span>
                  )}
                </td>
                <td
                  style={{
                    padding: '7px 12px',
                    textAlign: 'center',
                    color: isWeekend ? '#92400e' : '#6b7280',
                    fontStyle: isWeekend ? 'italic' : 'normal',
                    fontSize: 12,
                  }}
                >
                  {dayNames[dow]}
                </td>
                <td style={{ padding: '5px 14px' }}>
                  {hasRestriction ? (
                    restricted.map((v) => (
                      <PlateBadge
                        key={v.id}
                        plate={v.plate}
                        driver={driversByVehicle.get(v.plate)?.name}
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
  )
}

// ── Annual schedule per vehicle ───────────────────────────────────────────────

const VehicleView = ({ year, vehicles, driversByVehicle, locale }) => {
  const monthShort = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        new Date(2025, i, 1).toLocaleDateString(locale, { month: 'short' }),
      ),
    [locale],
  )
  const currentMonth = now.getFullYear() === year ? now.getMonth() + 1 : null

  const vehiclesWithRestrictions = vehicles.filter((v) =>
    Array.from({ length: 12 }, (_, i) => i + 1).some(
      (m) => restrictedDaysForMonth(v, m).length > 0,
    ),
  )

  if (vehiclesWithRestrictions.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--cui-secondary-color)' }}>
        Ningún vehículo tiene restricciones configuradas para {year}.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#1e3a5f', color: '#fff' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', minWidth: 90 }}>Placa</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', minWidth: 110 }}>Conductor</th>
            {monthShort.map((m, i) => (
              <th
                key={i}
                style={{
                  padding: '8px 8px',
                  textAlign: 'center',
                  minWidth: 52,
                  background: currentMonth === i + 1 ? '#2d5a9e' : undefined,
                }}
              >
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vehiclesWithRestrictions.map((v) => {
            const driver = driversByVehicle.get(v.plate)
            return (
              <tr
                key={v.id}
                style={{ borderBottom: '1px solid #f0f0f0' }}
              >
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#1e3a5f' }}>
                  {v.plate}
                </td>
                <td style={{ padding: '8px 12px', color: '#374151', fontSize: 12 }}>
                  {driver ? driver.name.split(' ').slice(0, 2).join(' ') : '—'}
                </td>
                {Array.from({ length: 12 }, (_, i) => {
                  const m = i + 1
                  const days = restrictedDaysForMonth(v, m)
                  const isCurrentMonth = currentMonth === m
                  return (
                    <td
                      key={m}
                      style={{
                        padding: '6px 8px',
                        textAlign: 'center',
                        background: isCurrentMonth ? '#f0f5ff' : undefined,
                        borderLeft: isCurrentMonth ? '1px solid #c3d4f7' : undefined,
                        borderRight: isCurrentMonth ? '1px solid #c3d4f7' : undefined,
                      }}
                    >
                      {days.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                          {days.map((d) => (
                            <span
                              key={d}
                              style={{
                                background: '#fef3c7',
                                border: '1px solid #f59e0b',
                                borderRadius: 4,
                                padding: '1px 5px',
                                fontWeight: 600,
                                color: '#92400e',
                                fontSize: 11,
                              }}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#e5e7eb' }}>—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Summary cards ─────────────────────────────────────────────────────────────

const SummaryCards = ({ year, month, vehicles, driversByVehicle, holidays }) => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthStr = `${year}-${pad2(month)}`

  const todayRestricted = useMemo(() => {
    const today = now.getDate()
    if (now.getFullYear() !== year || now.getMonth() + 1 !== month) return []
    return vehicles.filter((v) => restrictedDaysForMonth(v, month).includes(today))
  }, [year, month, vehicles])

  const tomorrowRestricted = useMemo(() => {
    const tom = new Date(now)
    tom.setDate(tom.getDate() + 1)
    if (tom.getFullYear() !== year || tom.getMonth() + 1 !== month) return []
    const tomDay = tom.getDate()
    return vehicles.filter((v) => restrictedDaysForMonth(v, month).includes(tomDay))
  }, [year, month, vehicles])

  const totalRestrictionDays = useMemo(() => {
    let count = 0
    for (const v of vehicles) {
      count += restrictedDaysForMonth(v, month).length
    }
    return count
  }, [vehicles, month])

  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month

  const cards = [
    ...(isCurrentMonth
      ? [
          {
            label: 'Hoy con P&P',
            value: todayRestricted.length,
            sub: todayRestricted.map((v) => v.plate).join(', ') || 'Ninguno',
            color: todayRestricted.length > 0 ? '#f59e0b' : '#10b981',
            bg: todayRestricted.length > 0 ? '#fffbeb' : '#f0fdf4',
          },
          {
            label: 'Mañana con P&P',
            value: tomorrowRestricted.length,
            sub: tomorrowRestricted.map((v) => v.plate).join(', ') || 'Ninguno',
            color: tomorrowRestricted.length > 0 ? '#f59e0b' : '#10b981',
            bg: tomorrowRestricted.length > 0 ? '#fffbeb' : '#f0fdf4',
          },
        ]
      : []),
    {
      label: 'Días con restricción',
      value: `${Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((d) =>
        vehicles.some((v) => restrictedDaysForMonth(v, month).includes(d)),
      ).length} / ${daysInMonth}`,
      sub: 'días del mes afectados',
      color: '#6366f1',
      bg: '#eef2ff',
    },
    {
      label: 'Vehículos afectados',
      value: vehicles.filter((v) => restrictedDaysForMonth(v, month).length > 0).length,
      sub: `de ${vehicles.length} vehículos`,
      color: '#1e3a5f',
      bg: '#eff6ff',
    },
  ]

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '16px 16px 0' }}>
      {cards.map((c, i) => (
        <div
          key={i}
          style={{
            background: c.bg,
            border: `1px solid ${c.color}30`,
            borderRadius: 10,
            padding: '12px 18px',
            minWidth: 140,
            flex: '1 1 140px',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{c.label}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}

// ── Pico y Placa tab ──────────────────────────────────────────────────────────

const PicoPlacaTab = ({ vehicles, driversByVehicle, holidays }) => {
  const { i18n } = useTranslation()
  const locale = i18n.language

  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [view, setView] = useState('month')

  const monthNames = useMemo(() => getMonthNames(locale), [locale])

  const yearHolidays = useMemo(() => getColombianHolidays(year), [year])
  const effectiveHolidays = year === now.getFullYear() ? holidays : yearHolidays

  const availableYears = useMemo(() => {
    const base = now.getFullYear()
    return [base - 1, base, base + 1]
  }, [])

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          padding: '10px 16px',
          borderBottom: '1px solid var(--cui-border-color)',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CBadge color="warning" style={{ fontSize: 11 }}>
            {vehicles.filter((v) => restrictedDaysForMonth(v, month).length > 0).length} vehículos con P&P este mes
          </CBadge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {view === 'month' && (
            <CFormSelect
              size="sm"
              style={{ width: 120 }}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {monthNames.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </option>
              ))}
            </CFormSelect>
          )}
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
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { key: 'month', label: 'Por mes' },
              { key: 'annual', label: 'Anual' },
            ].map(({ key, label }) => (
              <CButton
                key={key}
                size="sm"
                color="secondary"
                variant={view === key ? undefined : 'outline'}
                onClick={() => setView(key)}
                style={{ fontSize: 12 }}
              >
                {label}
              </CButton>
            ))}
          </div>
        </div>
      </div>

      {view === 'month' && (
        <SummaryCards
          year={year}
          month={month}
          vehicles={vehicles}
          driversByVehicle={driversByVehicle}
          holidays={effectiveHolidays}
        />
      )}

      {view === 'month' ? (
        <MonthView
          year={year}
          month={month}
          vehicles={vehicles}
          driversByVehicle={driversByVehicle}
          holidays={effectiveHolidays}
          locale={locale}
        />
      ) : (
        <VehicleView year={year} vehicles={vehicles} driversByVehicle={driversByVehicle} locale={locale} />
      )}
    </>
  )
}

// ── Tab definitions (add new sections here) ───────────────────────────────────

const TABS = [
  { key: 'pico-placa', label: 'Pico y Placa' },
  // { key: 'maintenance', label: 'Mantenimientos' },  // próximamente
]

// ── Main page ─────────────────────────────────────────────────────────────────

const Operations = () => {
  const dispatch = useDispatch()
  const { data: vehiclesData, fetching } = useSelector((s) => s.taxiVehicle)
  const { data: driversData } = useSelector((s) => s.taxiDriver)

  const [activeTab, setActiveTab] = useState('pico-placa')

  useEffect(() => {
    dispatch(taxiVehicleActions.fetchRequest())
    dispatch(taxiDriverActions.fetchRequest())
  }, [dispatch])

  const vehicles = vehiclesData ?? []
  const drivers = driversData ?? []

  const driversByVehicle = useMemo(
    () => new Map(drivers.filter((d) => d.defaultVehicle).map((d) => [d.defaultVehicle, d])),
    [drivers],
  )

  const holidays = useMemo(() => getColombianHolidays(now.getFullYear()), [])

  return (
    <CCard>
      <CCardHeader style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <strong>Operaciones</strong>
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(({ key, label }) => (
            <CButton
              key={key}
              size="sm"
              color="primary"
              variant={activeTab === key ? undefined : 'outline'}
              onClick={() => setActiveTab(key)}
              style={{ fontSize: 12 }}
            >
              {label}
            </CButton>
          ))}
        </div>
      </CCardHeader>

      <CCardBody style={{ padding: 0 }}>
        {fetching && !vehiclesData ? (
          <div className="d-flex justify-content-center py-5">
            <CSpinner color="primary" />
          </div>
        ) : activeTab === 'pico-placa' ? (
          <PicoPlacaTab
            vehicles={vehicles}
            driversByVehicle={driversByVehicle}
            holidays={holidays}
          />
        ) : null}
      </CCardBody>
    </CCard>
  )
}

export default Operations
