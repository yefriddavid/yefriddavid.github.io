import { createSelector } from '@reduxjs/toolkit'
import {
  getSocColor,
  STATUS_CONFIG,
  BATTERY_CAPACITY_WH,
  BATTERY_CAPACITY_AH,
} from 'src/views/domotica/SolarPanel/constants'

// ── Battery (RTDB) ────────────────────────────────────────────────────────────

const selectBatteryRaw = (s) => s.domoticaSolarBattery.battery
export const selectBatteryFetching = (s) => s.domoticaSolarBattery.fetching

export const selectBatteryDerived = createSelector(selectBatteryRaw, (battery) => {
  const soc = battery?.percent ?? null
  const voltage = battery?.voltage ?? null
  const solar = battery?.solar ?? null
  const alert = battery?.alert ?? null
  const status = battery?.status ?? null
  const amps = battery?.current ?? null
  const currentAlert = battery?.currentAlert ?? null
  const updatedAt = battery?.updatedAt ?? null
  return {
    soc,
    voltage,
    solar,
    alert,
    status,
    amps,
    currentAlert,
    updatedAt,
    statusCfg: STATUS_CONFIG[status] ?? null,
    energyWh: soc != null ? Math.round((soc / 100) * BATTERY_CAPACITY_WH) : null,
    color: getSocColor(soc),
    watts: amps != null && voltage != null ? Math.abs(amps) * voltage : null,
    hoursRemaining: amps > 0 && soc > 0 ? ((soc / 100) * BATTERY_CAPACITY_AH) / amps : null,
  }
})

// ── History charts (Firestore) ────────────────────────────────────────────────

export const selectVoltageHistory = (s) => s.domoticaTransaction.voltageData
export const selectVoltageFetching = (s) => s.domoticaTransaction.voltageFetching
export const selectCurrentHistory = (s) => s.domoticaTransaction.currentData
export const selectCurrentFetching = (s) => s.domoticaTransaction.currentFetching

export const selectLastVoltageAt = createSelector(
  selectVoltageHistory,
  (data) => data?.at(-1)?.createdAt ?? null,
)

export const selectLastCurrentAt = createSelector(
  selectCurrentHistory,
  (data) => data?.at(-1)?.createdAt ?? null,
)
