import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CCard, CCardBody, CFormSwitch } from '@coreui/react'
import * as domoticaCommandActions from 'src/actions/domotica/domoticaCommandActions'

const CommandRow = ({
  label,
  commandKey,
  value,
  interval,
  updating,
  onIntervalCommit,
  onToggle,
}) => {
  const [localInterval, setLocalInterval] = useState('')

  useEffect(() => {
    setLocalInterval(interval !== '' ? String(interval) : '')
  }, [interval])

  return (
    <div className="solar-panel__command-row">
      <div>
        <div className="solar-panel__command-label">{label}</div>
        <div className="solar-panel__command-sub">{commandKey}</div>
      </div>
      <div className="solar-panel__command-controls">
        <div className="solar-panel__interval-wrap">
          <input
            className="solar-panel__interval-input"
            type="number"
            min={1}
            placeholder="interval"
            value={localInterval}
            onChange={(e) => setLocalInterval(e.target.value)}
            onBlur={(e) => onIntervalCommit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onIntervalCommit(e.target.value)}
          />
          <span className="solar-panel__interval-unit">mins</span>
        </div>
        <CFormSwitch checked={value} disabled={updating} onChange={onToggle} />
      </div>
    </div>
  )
}

const CommandPanel = () => {
  const dispatch = useDispatch()
  const commands = useSelector((s) => s.domoticaCommand.commands)
  const updatingIds = useSelector((s) => s.domoticaCommand.updatingIds)

  const commit = (id, value) => {
    const num = Number(value)
    if (value === '' || isNaN(num)) return
    dispatch(domoticaCommandActions.updateRequest({ id, interval: num }))
  }

  const toggle = (id, checked) => {
    dispatch(domoticaCommandActions.updateRequest({ id, read: checked }))
  }

  return (
    <>
      <div className="solar-panel__section-label">Comandos al dispositivo</div>
      <CCard className="solar-panel__commands-card">
        <CCardBody className="solar-panel__commands-body">
          <CommandRow
            label="Leer voltaje"
            commandKey="voltage_read"
            value={commands['voltage_read']?.read ?? false}
            interval={commands['voltage_read']?.interval ?? ''}
            updating={!!updatingIds['voltage_read']}
            onIntervalCommit={(v) => commit('voltage_read', v)}
            onToggle={(e) => toggle('voltage_read', e.target.checked)}
          />
          <CommandRow
            label="Leer corriente"
            commandKey="current_read"
            value={commands['current_read']?.read ?? false}
            interval={commands['current_read']?.interval ?? ''}
            updating={!!updatingIds['current_read']}
            onIntervalCommit={(v) => commit('current_read', v)}
            onToggle={(e) => toggle('current_read', e.target.checked)}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default CommandPanel
