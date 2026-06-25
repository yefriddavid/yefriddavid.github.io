export function calcFromSystem({ panels, controller, battery, inverter }) {
  const solarWh = panels.count * panels.wp * panels.hsp * controller.efficiency
  const usableWh = solarWh * inverter.efficiency
  const battWh = battery.count * battery.ah * battery.voltage * battery.dod
  const autonomyH = usableWh > 0 ? battWh / (usableWh / 24) : 0
  return {
    dailyWh: Math.round(usableWh),
    peakW: inverter.capacity,
    autonomyH: parseFloat(autonomyH.toFixed(1)),
    autonomyD: parseFloat((autonomyH / 24).toFixed(2)),
    solarWh: Math.round(solarWh),
    battWh: Math.round(battWh),
    totalWp: panels.count * panels.wp,
  }
}

export function calcFromConsumption({ consumption, panels, controller, battery, inverter }) {
  const { dailyWh, peakW, autonomyDays } = consumption
  const panelsN = Math.ceil(dailyWh / (panels.wp * panels.hsp * controller.efficiency * inverter.efficiency))
  const batteriesN = Math.ceil((dailyWh * autonomyDays) / (battery.ah * battery.voltage * battery.dod))
  const ctrlA = Math.ceil((panelsN * panels.wp / battery.voltage) * 1.25)
  const invW = Math.ceil((peakW / inverter.efficiency) * 1.1)
  return {
    panelsN,
    batteriesN,
    ctrlA,
    invW,
    totalWp: panelsN * panels.wp,
    totalBattWh: batteriesN * battery.ah * battery.voltage,
    coveredWh: Math.round(panelsN * panels.wp * panels.hsp * controller.efficiency * inverter.efficiency),
  }
}
