import { Engine } from 'json-rules-engine'
import { fmt } from './utils'

export async function runAuditAnalysis(auditDays, periodDrivers) {
  const pastDays = auditDays.filter((d) => !d.isFuture)
  if (pastDays.length === 0)
    return { summary: null, findings: [], driverRanking: [], driverPayments: [] }

  // --- Aggregates ---
  const noneCount = pastDays.filter((d) => d.status === 'none').length
  const partialCount = pastDays.filter((d) => d.status === 'partial').length
  const fullCount = pastDays.filter((d) => d.status === 'full').length
  const nonePercent = Math.round((noneCount / pastDays.length) * 100)
  const partialPercent = Math.round((partialCount / pastDays.length) * 100)
  const fullPercent = Math.round((fullCount / pastDays.length) * 100)

  // Driver missing counts
  const driverMissingMap = {}
  for (const day of pastDays) {
    for (const dr of day.missing ?? []) {
      driverMissingMap[dr] = (driverMissingMap[dr] ?? 0) + 1
    }
  }
  const driverRanking = Object.entries(driverMissingMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, missing]) => ({ name, missing, settled: pastDays.length - missing }))

  const topMissingDriver = driverRanking[0]?.name ?? null
  const topMissingCount = driverRanking[0]?.missing ?? 0

  // Driver payment summary: expected vs paid vs debt
  const driverPayments = periodDrivers.map((driver) => {
    let expected = 0
    let paid = 0

    for (const day of pastDays) {
      // Skip days outside driver's active range
      if (driver.startDate && driver.startDate > day.dateStr) continue
      if (driver.endDate && driver.endDate < day.dateStr) continue
      // Skip pico y placa days for this driver's vehicle
      if (driver.defaultVehicle && (day.picoPlacaVehicles ?? []).includes(driver.defaultVehicle))
        continue

      const rate =
        day.isSunday || day.isHoliday
          ? driver.defaultAmountSunday || driver.defaultAmount || 0
          : driver.defaultAmount || 0
      expected += rate

      // Amount actually paid this day
      const record = day.dayRecords?.find((r) => r.driver === driver.name)
      if (record) paid += record.amount ?? 0
    }

    return {
      name: driver.name,
      expected,
      paid,
      debt: expected - paid,
    }
  })

  // Driver settled counts (perfect attendance)
  const driverSettledMap = {}
  for (const day of pastDays) {
    for (const dr of day.settled ?? []) {
      driverSettledMap[dr] = (driverSettledMap[dr] ?? 0) + 1
    }
  }
  const perfectDrivers = periodDrivers
    .filter((d) => (driverSettledMap[d.name] ?? 0) === pastDays.length)
    .map((d) => d.name)

  // Max consecutive missing per driver
  let maxConsecDriver = null
  let maxConsecCount = 0
  for (const driver of periodDrivers) {
    let consec = 0
    let maxC = 0
    for (const day of pastDays) {
      if ((day.missing ?? []).includes(driver.name)) {
        consec++
        if (consec > maxC) maxC = consec
      } else {
        consec = 0
      }
    }
    if (maxC > maxConsecCount) {
      maxConsecCount = maxC
      maxConsecDriver = driver.name
    }
  }

  // Best / worst day
  const paidDays = pastDays.filter((d) => d.total > 0)
  const bestDay = paidDays.reduce((b, d) => (!b || d.total > b.total ? d : b), null)
  const worstDay = paidDays.reduce((w, d) => (!w || d.total < w.total ? d : w), null)

  // Pico y placa
  const picoPlacaDaysCount = pastDays.filter((d) => d.hasPicoPlaca).length

  // Totals / averages
  const totalCollected = pastDays.reduce((s, d) => s + (d.total ?? 0), 0)
  const avgDaily = pastDays.length > 0 ? Math.round(totalCollected / pastDays.length) : 0
  const lowDays = pastDays.filter((d) => d.total > 0 && d.total < avgDaily * 0.5)

  const summary = {
    pastDays: pastDays.length,
    totalCollected,
    avgDaily,
    bestDay,
    worstDay,
    fullPercent,
    partialPercent,
    nonePercent,
    noneCount,
    partialCount,
    fullCount,
  }

  // --- Rules engine ---
  const facts = {
    noneCount,
    nonePercent,
    partialPercent,
    fullPercent,
    topMissingCount,
    maxConsecCount,
    picoPlacaDaysCount,
    lowDaysCount: lowDays.length,
    perfectDriversCount: perfectDrivers.length,
  }

  const engine = new Engine()

  engine.addRule({
    name: 'critical-none',
    conditions: { all: [{ fact: 'nonePercent', operator: 'greaterThan', value: 50 }] },
    event: {
      type: 'finding',
      params: {
        level: 'danger',
        message: `Más de la mitad de los días (${noneCount} de ${pastDays.length}) no tienen ninguna liquidación registrada.`,
      },
    },
  })

  engine.addRule({
    name: 'some-none',
    conditions: {
      all: [
        { fact: 'nonePercent', operator: 'greaterThan', value: 10 },
        { fact: 'nonePercent', operator: 'lessThanInclusive', value: 50 },
      ],
    },
    event: {
      type: 'finding',
      params: {
        level: 'warning',
        message: `${noneCount} días del período no tienen ninguna liquidación registrada.`,
      },
    },
  })

  engine.addRule({
    name: 'perfect-coverage',
    conditions: { all: [{ fact: 'fullPercent', operator: 'equal', value: 100 }] },
    event: {
      type: 'finding',
      params: {
        level: 'success',
        message: `Cobertura perfecta: todos los ${pastDays.length} días tienen liquidación completa.`,
      },
    },
  })

  engine.addRule({
    name: 'top-missing-high',
    conditions: { all: [{ fact: 'topMissingCount', operator: 'greaterThan', value: 4 }] },
    event: {
      type: 'finding',
      params: {
        level: 'danger',
        message: `"${topMissingDriver}" es el conductor más ausente con ${topMissingCount} días sin liquidar.`,
      },
    },
  })

  engine.addRule({
    name: 'top-missing-medium',
    conditions: {
      all: [
        { fact: 'topMissingCount', operator: 'greaterThan', value: 1 },
        { fact: 'topMissingCount', operator: 'lessThanInclusive', value: 4 },
      ],
    },
    event: {
      type: 'finding',
      params: {
        level: 'warning',
        message: `"${topMissingDriver}" acumula ${topMissingCount} días sin liquidar en el período.`,
      },
    },
  })

  engine.addRule({
    name: 'consecutive-missing-high',
    conditions: { all: [{ fact: 'maxConsecCount', operator: 'greaterThan', value: 3 }] },
    event: {
      type: 'finding',
      params: {
        level: 'danger',
        message: `"${maxConsecDriver}" tuvo ${maxConsecCount} días consecutivos sin liquidar.`,
      },
    },
  })

  engine.addRule({
    name: 'consecutive-missing-medium',
    conditions: {
      all: [
        { fact: 'maxConsecCount', operator: 'greaterThan', value: 1 },
        { fact: 'maxConsecCount', operator: 'lessThanInclusive', value: 3 },
      ],
    },
    event: {
      type: 'finding',
      params: {
        level: 'warning',
        message: `"${maxConsecDriver}" tuvo ${maxConsecCount} días consecutivos sin liquidar.`,
      },
    },
  })

  engine.addRule({
    name: 'pico-placa',
    conditions: { all: [{ fact: 'picoPlacaDaysCount', operator: 'greaterThan', value: 0 }] },
    event: {
      type: 'finding',
      params: {
        level: 'info',
        message: `El pico y placa estuvo activo en ${picoPlacaDaysCount} día${picoPlacaDaysCount !== 1 ? 's' : ''} del período.`,
      },
    },
  })

  engine.addRule({
    name: 'low-collection',
    conditions: { all: [{ fact: 'lowDaysCount', operator: 'greaterThan', value: 0 }] },
    event: {
      type: 'finding',
      params: {
        level: 'warning',
        message: `${lowDays.length} día${lowDays.length !== 1 ? 's tuvieron' : ' tuvo'} recaudación menor al 50% del promedio diario (${fmt(avgDaily)}).`,
      },
    },
  })

  engine.addRule({
    name: 'perfect-attendance',
    conditions: { all: [{ fact: 'perfectDriversCount', operator: 'greaterThan', value: 0 }] },
    event: {
      type: 'finding',
      params: {
        level: 'success',
        message: `${perfectDrivers.length} conductor${perfectDrivers.length !== 1 ? 'es' : ''} con asistencia perfecta: ${perfectDrivers.join(', ')}.`,
      },
    },
  })

  const LEVEL_ORDER = { danger: 0, warning: 1, info: 2, success: 3 }
  const { events } = await engine.run(facts)
  const findings = events
    .filter((e) => e.type === 'finding')
    .map((e) => e.params)
    .sort((a, b) => (LEVEL_ORDER[a.level] ?? 9) - (LEVEL_ORDER[b.level] ?? 9))

  return { summary, findings, driverRanking, driverPayments }
}
