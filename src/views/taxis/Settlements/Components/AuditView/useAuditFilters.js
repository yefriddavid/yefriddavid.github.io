import { useState } from 'react'

export const useAuditFilters = ({ auditDays, dayFilter, periodDrivers }) => {
  const [auditPlateFilter, setAuditPlateFilter] = useState('')
  const [auditDriverFilter, setAuditDriverFilter] = useState(new Set())
  const [auditStatusFilter, setAuditStatusFilter] = useState(new Set())

  const simulateDay = (day) => {
    const eligible = periodDrivers.filter((d) => {
      if (!d.defaultVehicle) return false
      if (d.startDate && d.startDate > day.dateStr) return false
      if (d.endDate && d.endDate < day.dateStr) return false
      if (day.picoPlacaVehicles?.includes(d.defaultVehicle)) return false
      if (auditDriverFilter.size > 0 && !auditDriverFilter.has(d.name)) return false
      return true
    })
    const total = eligible.reduce((s, d) => {
      const amount =
        day.isSunday || day.isHoliday
          ? d.defaultAmountSunday || d.defaultAmount || 0
          : d.defaultAmount || 0
      return s + amount
    }, 0)
    return { count: eligible.length, total }
  }

  const auditFilteredDays = auditDays.filter((day) => {
    if (dayFilter.size > 0 && !dayFilter.has(day.d)) return false
    if (auditStatusFilter.size > 0 && !auditStatusFilter.has(day.status)) return false
    if (
      auditPlateFilter &&
      !day.settledVehicles.includes(auditPlateFilter) &&
      !day.missingVehicles.includes(auditPlateFilter) &&
      !day.picoPlacaVehicles.includes(auditPlateFilter)
    )
      return false
    if (
      auditDriverFilter.size > 0 &&
      !day.settled.some((dr) => auditDriverFilter.has(dr)) &&
      !day.missing.some((dr) => auditDriverFilter.has(dr)) &&
      !day.picoPlacaDrivers.some((dr) => auditDriverFilter.has(dr))
    )
      return false
    return true
  })

  const hasFilters = auditPlateFilter || auditDriverFilter.size > 0 || auditStatusFilter.size > 0

  // Per-day totals: `real` is the amount actually recorded that day, `ideal`
  // is what drivers were supposed to pay that day regardless of whether they
  // already did. Single source of truth so the audit table cells and the
  // selection summary bar never compute this differently.
  const getDayTotals = (day) => {
    const recs =
      auditDriverFilter.size > 0
        ? day.dayRecords.filter((r) => auditDriverFilter.has(r.driver))
        : day.dayRecords
    const real = day.isFuture ? 0 : recs.reduce((s, r) => s + (r.amount || 0), 0)
    return { real, ideal: simulateDay(day).total }
  }

  return {
    auditPlateFilter,
    setAuditPlateFilter,
    auditDriverFilter,
    setAuditDriverFilter,
    auditStatusFilter,
    setAuditStatusFilter,
    simulateDay,
    getDayTotals,
    auditFilteredDays,
    hasFilters,
  }
}
