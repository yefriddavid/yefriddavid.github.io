import React, { useMemo } from 'react'
import { getColombianHolidays } from './auditHelpers'
import { restrictedDaysFor } from './picoPlacaHelpers'
import {
  TAXI_MAINTENANCE_CATEGORIES as MAINTENANCE_CATEGORIES,
  TAXI_MAINTENANCE_TYPE_COLORS as TYPE_COLORS,
} from 'src/constants/taxi'

const DOW_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
const pad2 = (n) => String(n).padStart(2, '0')

const NextMonthMiniCalendar = ({ vehicles, lastByCategory, selected }) => {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const nextDate = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const nm = nextDate.getMonth() + 1
  const ny = nextDate.getFullYear()
  const monthStr = `${ny}-${pad2(nm)}`
  const holidays = useMemo(() => getColombianHolidays(ny), [ny])

  const monthLabel = nextDate.toLocaleDateString('es-CO', { month: 'long' })
  const yearLabel = ny

  const itemsByDay = useMemo(() => {
    const map = new Map()

    if (selected.has('pico-placa')) {
      for (const v of vehicles) {
        for (const day of restrictedDaysFor(v?.restrictions, ny, nm)) {
          if (!map.has(day)) map.set(day, new Set())
          map.get(day).add('pico-placa')
        }
      }
    }

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
        if (!map.has(day)) map.set(day, new Set())
        map.get(day).add(cat)
      }
    }

    return map
  }, [selected, vehicles, lastByCategory, nm, ny, monthStr])

  const daysInMonth = new Date(ny, nm, 0).getDate()
  const firstDow = new Date(ny, nm - 1, 1).getDay()

  const weeks = []
  let week = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  const presentTypes = useMemo(() => {
    const types = new Set()
    for (const set of itemsByDay.values()) set.forEach((t) => types.add(t))
    return [...types]
  }, [itemsByDay])

  return (
    <div className="mini-cal">
      <div className="mini-cal__header">
        <span className="mini-cal__month">{monthLabel}</span>
        <span className="mini-cal__year">{yearLabel}</span>
      </div>

      <table className="mini-cal__grid">
        <thead>
          <tr>
            {DOW_LABELS.map((d, i) => (
              <th key={i} className={`mini-cal__dow ${i === 0 || i === 6 ? 'mini-cal__dow--weekend' : 'mini-cal__dow--weekday'}`}>
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => {
                if (!day) return <td key={di} className="mini-cal__cell mini-cal__cell--empty" />

                const dateStr = `${ny}-${pad2(nm)}-${pad2(day)}`
                const isToday = dateStr === todayStr
                const isWeekend = di === 0 || di === 6
                const isHoliday = holidays.has(dateStr)
                const types = [...(itemsByDay.get(day) ?? [])]
                const hasEvents = types.length > 0

                const dayClass = [
                  'mini-cal__day',
                  isToday ? 'mini-cal__day--today' : '',
                  hasEvents && !isToday ? 'mini-cal__day--has-events' : '',
                ].filter(Boolean).join(' ')

                const numClass = [
                  'mini-cal__num',
                  isToday ? 'mini-cal__num--today' : '',
                  !isToday && (isWeekend || isHoliday) ? 'mini-cal__num--weekend' : '',
                  !isToday && !isWeekend && !isHoliday && !hasEvents ? 'mini-cal__num--muted' : '',
                ].filter(Boolean).join(' ')

                return (
                  <td key={di} className="mini-cal__cell">
                    <div className={dayClass}>
                      <span className={numClass}>{day}</span>
                      <div className="mini-cal__dots">
                        {types.slice(0, 4).map((type, ti) => {
                          const c = TYPE_COLORS[type]
                          return (
                            <div
                              key={ti}
                              className="mini-cal__dot"
                              style={{ background: isToday ? 'rgba(255,255,255,0.7)' : (c?.border ?? '#94a3b8') }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {presentTypes.length > 0 && (
        <div className="mini-cal__legend">
          {presentTypes.slice(0, 5).map((type) => {
            const c = TYPE_COLORS[type]
            return (
              <div key={type} className="mini-cal__legend-item">
                <div className="mini-cal__legend-dot" style={{ background: c?.border ?? '#94a3b8' }} />
                <span>{type === 'pico-placa' ? 'Pico y Placa' : type}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NextMonthMiniCalendar
