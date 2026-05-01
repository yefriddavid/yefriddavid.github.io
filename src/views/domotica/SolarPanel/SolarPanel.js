import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as domoticaSolarBatteryActions from 'src/actions/domotica/domoticaSolarBatteryActions'
import * as domoticaTransactionActions from 'src/actions/domotica/domoticaTransactionActions'
import * as domoticaCommandActions from 'src/actions/domotica/domoticaCommandActions'
import { getSocColor, STATUS_CONFIG, BATTERY_CAPACITY_WH, BATTERY_CAPACITY_AH } from './constants'
import { useRelativeTime } from './hooks/useRelativeTime'
import SolarHeader from './Components/SolarHeader'
import AlertBanner from './Components/AlertBanner'
import BatteryInfoCard from './Components/BatteryInfoCard'
import MetricCards from './Components/MetricCards'
import ConsumptionSection from './Components/ConsumptionSection'
import CommandPanel from './Components/CommandPanel'
import HistoryCharts from './Components/HistoryCharts'

import './SolarPanel.scss'

const SolarPanel = () => {
  const dispatch = useDispatch()

  const battery = useSelector((s) => s.domoticaSolarBattery.battery)
  const fetching = useSelector((s) => s.domoticaSolarBattery.fetching)

  const [online, setOnline] = useState(false)
  const relativeTime = useRelativeTime(battery?.updatedAt)

  useEffect(() => {
    if (battery?.updatedAt) {
      setOnline(Date.now() - new Date(battery.updatedAt).getTime() < 10 * 60 * 1000)
    }
  }, [battery])

  useEffect(() => {
    dispatch(domoticaSolarBatteryActions.subscribeRequest())
    dispatch(domoticaTransactionActions.fetchVoltageRequest())
    dispatch(domoticaTransactionActions.fetchCurrentRequest())
    dispatch(domoticaCommandActions.fetchRequest())
    return () => dispatch(domoticaSolarBatteryActions.unsubscribeRequest())
  }, [dispatch])

  const handleRefresh = () => {
    dispatch(domoticaTransactionActions.fetchVoltageRequest())
    dispatch(domoticaTransactionActions.fetchCurrentRequest())
  }

  // Derived values
  const soc = battery?.percent ?? null
  const voltage = battery?.voltage ?? null
  const solar = battery?.solar ?? null
  const alert = battery?.alert ?? null
  const status = battery?.status ?? null
  const statusCfg = STATUS_CONFIG[status] ?? null
  const energyWh = soc != null ? Math.round((soc / 100) * BATTERY_CAPACITY_WH) : null
  const color = getSocColor(soc)
  const amps = battery?.current ?? null
  const watts = amps != null && voltage != null ? Math.abs(amps) * voltage : null
  const currentAlert = battery?.currentAlert ?? null
  const hoursRemaining = amps > 0 && soc > 0 ? ((soc / 100) * BATTERY_CAPACITY_AH) / amps : null

  return (
    <div className="solar-panel">
      <SolarHeader
        online={online}
        relativeTime={relativeTime}
        loading={fetching}
        onRefresh={handleRefresh}
      />

      {fetching && !battery ? (
        <div className="solar-panel__loading">Cargando datos desde el sistema…</div>
      ) : (
        <>
          <AlertBanner alert={alert} />
          <BatteryInfoCard
            soc={soc}
            status={status}
            statusCfg={statusCfg}
            solar={solar}
            energyWh={energyWh}
            color={color}
            hoursRemaining={hoursRemaining}
          />
          <MetricCards voltage={voltage} solar={solar} alert={alert} />
          <ConsumptionSection amps={amps} watts={watts} currentAlert={currentAlert} />
          <CommandPanel />
          <HistoryCharts />
        </>
      )}
    </div>
  )
}

export default SolarPanel
