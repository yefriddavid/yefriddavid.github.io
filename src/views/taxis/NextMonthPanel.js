import React, { useMemo, useState } from 'react'
import { fmt } from 'src/utils/formatters'
import { getColombianHolidays } from './auditHelpers'
import {
  TAXI_MAINTENANCE_CATEGORIES,
  TAXI_REGULATORY_CATEGORIES,
  TAXI_MAINTENANCE_TYPE_COLORS as CAT_COLORS,
} from 'src/constants/taxi'

const pad2 = (n) => String(n).padStart(2, '0')

const MECHANICAL = TAXI_MAINTENANCE_CATEGORIES.filter((c) => !TAXI_REGULATORY_CATEGORIES.includes(c))

const Section = ({ title, color, count, children }) => (
  <div style={{ marginBottom: 2 }}>
    <div
      style={{
        padding: '7px 20px',
        background: '#f8fafc',
        borderLeft: `3px solid ${color}`,
        fontSize: 11,
        fontWeight: 700,
        color,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{title}</span>
      <span
        style={{
          background: color,
          color: '#fff',
          borderRadius: 99,
          padding: '1px 8px',
          fontSize: 10,
          fontWeight: 700,
          lineHeight: 1.6,
        }}
      >
        {count}
      </span>
    </div>
    {children}
  </div>
)

const AlertRow = ({ item }) => {
  const c = CAT_COLORS[item.cat] ?? {
    bg: '#f8fafc',
    border: '#94a3b8',
    text: '#475569',
    label: item.cat,
  }
  let dateLabel
  if (item.overdue) {
    dateLabel = 'vencido'
  } else if (item.nextDate) {
    const d = item.nextDate.slice(8)
    const mon = new Date(item.nextDate + 'T12:00:00').toLocaleDateString('es-CO', { month: 'short' })
    dateLabel = `vence ${d} ${mon}`
  } else {
    dateLabel = '—'
  }

  return (
    <div
      style={{
        padding: '8px 20px',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      <span
        style={{
          background: c.bg,
          border: `1px solid ${c.border}`,
          color: c.text,
          borderRadius: 4,
          padding: '2px 7px',
          fontSize: 10,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          marginTop: 2,
          flexShrink: 0,
        }}
      >
        {c.label}
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'monospace' }}>{item.vehicle.plate}</span>
          {item.overdue && (
            <span
              style={{
                background: '#fee2e2',
                color: '#dc2626',
                fontSize: 9,
                fontWeight: 700,
                borderRadius: 3,
                padding: '1px 5px',
              }}
            >
              VENCIDO
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: item.overdue ? '#dc2626' : '#6b7280', marginTop: 1 }}>
          {dateLabel}
          {' · '}
          {item.driver ? (
            item.driver.name.split(' ')[0]
          ) : (
            <span style={{ color: '#dc2626' }}>sin conductor</span>
          )}
        </div>
      </div>
    </div>
  )
}

const NextMonthPanel = ({ vehicles, drivers, expenses }) => {
  const [open, setOpen] = useState(false)

  const now = new Date()
  const rawNext = now.getMonth() + 2
  const nextMonth = rawNext > 12 ? 1 : rawNext
  const nextYear = rawNext > 12 ? now.getFullYear() + 1 : now.getFullYear()
  const nextMonthStr = `${nextYear}-${pad2(nextMonth)}`

  const holidays = useMemo(() => getColombianHolidays(nextYear), [nextYear])

  const monthLabel = useMemo(() => {
    const name = new Date(nextYear, nextMonth - 1, 1).toLocaleDateString('es-CO', { month: 'long' })
    return name.charAt(0).toUpperCase() + name.slice(1)
  }, [nextYear, nextMonth])

  const activeVehicles = useMemo(() => vehicles.filter((v) => v.active !== false), [vehicles])
  const activeDrivers = useMemo(() => drivers.filter((d) => d.active !== false), [drivers])

  const driverByPlate = useMemo(
    () =>
      new Map(activeDrivers.filter((d) => d.defaultVehicle).map((d) => [d.defaultVehicle, d])),
    [activeDrivers],
  )

  const lastByCategory = useMemo(() => {
    const map = new Map()
    for (const cat of TAXI_MAINTENANCE_CATEGORIES) {
      const plateMap = new Map()
      for (const e of expenses) {
        if (e.category !== cat || !e.plate || !e.date) continue
        const curr = plateMap.get(e.plate)
        if (!curr || e.date > curr.date) plateMap.set(e.plate, e)
      }
      map.set(cat, plateMap)
    }
    return map
  }, [expenses])

  const dueItems = useMemo(() => {
    const items = []
    const nextMonthStart = nextMonthStr + '-01'
    for (const cat of TAXI_MAINTENANCE_CATEGORIES) {
      const plateMap = lastByCategory.get(cat)
      if (!plateMap) continue
      for (const v of activeVehicles) {
        const last = plateMap.get(v.plate)
        if (!last?.nextDate) continue
        const overdue = last.nextDate < nextMonthStart
        const inNextMonth = last.nextDate.startsWith(nextMonthStr + '-')
        if (!overdue && !inNextMonth) continue
        items.push({
          cat,
          vehicle: v,
          driver: driverByPlate.get(v.plate),
          nextDate: inNextMonth ? last.nextDate : null,
          overdue,
        })
      }
    }
    return items
  }, [lastByCategory, activeVehicles, driverByPlate, nextMonthStr])

  const regulatoryItems = useMemo(
    () => dueItems.filter((i) => TAXI_REGULATORY_CATEGORIES.includes(i.cat)),
    [dueItems],
  )
  const maintenanceItems = useMemo(
    () => dueItems.filter((i) => MECHANICAL.includes(i.cat)),
    [dueItems],
  )

  const vehiclesWithoutDriver = useMemo(
    () => activeVehicles.filter((v) => !driverByPlate.has(v.plate)),
    [activeVehicles, driverByPlate],
  )

  const picoByVehicle = useMemo(() => {
    const map = new Map()
    for (const v of activeVehicles) {
      const restr =
        v.restrictions?.[nextMonth] ?? v.restrictions?.[String(nextMonth)] ?? {}
      const days = [restr.d1, restr.d2].filter(Boolean).map(Number)
      if (days.length > 0) map.set(v.plate, days)
    }
    return map
  }, [activeVehicles, nextMonth])

  const { workingDays, holidayCount } = useMemo(() => {
    const daysInMonth = new Date(nextYear, nextMonth, 0).getDate()
    let working = 0
    let hCount = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${nextMonthStr}-${pad2(d)}`
      const dow = new Date(nextYear, nextMonth - 1, d).getDay()
      if (dow === 0) continue
      if (holidays.has(dateStr)) {
        hCount++
        continue
      }
      working++
    }
    return { workingDays: working, holidayCount: hCount }
  }, [nextYear, nextMonth, nextMonthStr, holidays])

  const projectedIncome = useMemo(() => {
    const daysInMonth = new Date(nextYear, nextMonth, 0).getDate()
    let total = 0
    for (const driver of activeDrivers) {
      if (!driver.defaultVehicle) continue
      const picoSet = new Set(picoByVehicle.get(driver.defaultVehicle) ?? [])
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${nextMonthStr}-${pad2(d)}`
        const dow = new Date(nextYear, nextMonth - 1, d).getDay()
        if (picoSet.has(d)) continue
        const isSunOrHoliday = dow === 0 || holidays.has(dateStr)
        total += isSunOrHoliday
          ? driver.defaultAmountSunday || driver.defaultAmount || 0
          : driver.defaultAmount || 0
      }
    }
    return total
  }, [activeDrivers, picoByVehicle, nextYear, nextMonth, nextMonthStr, holidays])

  const alertCount =
    regulatoryItems.length + maintenanceItems.length + vehiclesWithoutDriver.length

  const badgeColor =
    regulatoryItems.length > 0 ? '#dc2626' : maintenanceItems.length > 0 ? '#d97706' : '#3b82f6'

  const operationalCount =
    vehiclesWithoutDriver.length + (picoByVehicle.size > 0 ? 1 : 0) + (holidayCount > 0 ? 1 : 0)

  const hasAnything =
    regulatoryItems.length > 0 ||
    maintenanceItems.length > 0 ||
    vehiclesWithoutDriver.length > 0 ||
    picoByVehicle.size > 0 ||
    holidayCount > 0

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#1e3a5f',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '5px 12px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Siguiente Mes
        {alertCount > 0 && (
          <span
            style={{
              background: badgeColor,
              color: '#fff',
              borderRadius: 99,
              padding: '1px 7px',
              fontSize: 11,
              fontWeight: 700,
              minWidth: 20,
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            {alertCount}
          </span>
        )}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 1040,
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 380,
          background: '#fff',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          zIndex: 1050,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: '#1e3a5f',
            color: '#fff',
            padding: '16px 20px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              {monthLabel} {nextYear}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 3 }}>
              {workingDays} días hábiles
              {holidayCount > 0 ? ` · ${holidayCount} festivo${holidayCount !== 1 ? 's' : ''}` : ''}
            </div>
            {projectedIncome > 0 && (
              <div style={{ fontSize: 13, marginTop: 5, fontWeight: 600, color: '#93c5fd' }}>
                {fmt(projectedIncome)} proyectado
              </div>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 22,
              cursor: 'pointer',
              padding: '0 0 0 8px',
              lineHeight: 1,
              opacity: 0.8,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!hasAnything ? (
            <div
              style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 13 }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
              Sin pendientes para el próximo mes.
            </div>
          ) : (
            <>
              {regulatoryItems.length > 0 && (
                <Section
                  title="Urgente — Regulatorio"
                  color="#dc2626"
                  count={regulatoryItems.length}
                >
                  {regulatoryItems.map((item, i) => (
                    <AlertRow key={i} item={item} />
                  ))}
                </Section>
              )}

              {maintenanceItems.length > 0 && (
                <Section
                  title="Mantenimiento"
                  color="#d97706"
                  count={maintenanceItems.length}
                >
                  {maintenanceItems.map((item, i) => (
                    <AlertRow key={i} item={item} />
                  ))}
                </Section>
              )}

              {operationalCount > 0 && (
                <Section title="Operación" color="#3b82f6" count={operationalCount}>
                  {vehiclesWithoutDriver.map((v) => (
                    <div
                      key={v.plate}
                      style={{
                        padding: '8px 20px',
                        borderBottom: '1px solid #f3f4f6',
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{v.plate}</span>
                      <span style={{ color: '#dc2626', fontSize: 12 }}>sin conductor activo</span>
                    </div>
                  ))}
                  {picoByVehicle.size > 0 && (
                    <div
                      style={{ padding: '8px 20px', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}
                    >
                      {[...picoByVehicle.entries()].map(([plate, days]) => (
                        <div
                          key={plate}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}
                        >
                          <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{plate}</span>
                          <span style={{ color: '#6b7280', fontSize: 12 }}>
                            P&amp;P días {days.join(' y ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {holidayCount > 0 && (
                    <div style={{ padding: '8px 20px', fontSize: 12, color: '#6b7280' }}>
                      {holidayCount} festivo{holidayCount !== 1 ? 's' : ''} en el mes
                    </div>
                  )}
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default NextMonthPanel
