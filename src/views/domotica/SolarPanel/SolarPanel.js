import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as domoticaSolarBatteryActions from 'src/actions/domotica/domoticaSolarBatteryActions'
import * as domoticaTransactionActions from 'src/actions/domotica/domoticaTransactionActions'
import * as domoticaCommandActions from 'src/actions/domotica/domoticaCommandActions'
import { selectBatteryDerived, selectBatteryFetching } from 'src/selectors/domoticaSelectors'
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

  const battery = useSelector(selectBatteryDerived)
  const fetching = useSelector(selectBatteryFetching)

  const [online, setOnline] = useState(false)
  const relativeTime = useRelativeTime(battery?.updatedAt)

  useEffect(() => {
    if (battery?.updatedAt) {
      setOnline(Date.now() - new Date(battery.updatedAt).getTime() < 10 * 60 * 1000)
    }
  }, [battery?.updatedAt])

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

  const {
    soc,
    voltage,
    solar,
    alert,
    status,
    statusCfg,
    energyWh,
    color,
    amps,
    watts,
    currentAlert,
    hoursRemaining,
  } = battery ?? {}

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
