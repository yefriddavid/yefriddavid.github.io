import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import * as taxiSettlementActions from 'src/actions/taxi/taxiSettlementActions'
import * as taxiExpenseActions from 'src/actions/taxi/taxiExpenseActions'
import { TAXI_EXPENSE_CATEGORIES } from 'src/constants/taxi'
import { fmt } from 'src/utils/formatters'
import {
  TYPE_VEHICLE,
  TYPE_DRIVER,
  TYPE_SETTLEMENT,
  TYPE_EXPENSE,
  TYPE_LABELS,
  TYPE_DISPLAY_NAME,
  STEPS,
} from './constants'
import { today, fmtDateDisplay, getPicoPlacaWarning } from './utils'
import WandIcon from './WandIcon'
import './TaxiQuickAssistant.scss'

const TaxiQuickAssistant = () => {
  const dispatch = useDispatch()
  const drivers = useSelector((s) => s.taxiDriver.data ?? [])
  const vehicles = useSelector((s) => s.taxiVehicle.data ?? [])

  const [open, setOpen] = useState(false)
  const [type, setType] = useState(null)
  const [stepIdx, setStepIdx] = useState(0)
  const [formData, setFormData] = useState({})
  const [messages, setMessages] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [done, setDone] = useState(false)

  const inputRef = useRef()
  const msgsRef = useRef()

  const vehiclesMap = useMemo(() => {
    const m = new Map()
    ;(vehicles ?? []).forEach((v) => m.set(v.plate, v))
    return m
  }, [vehicles])

  const activeDrivers = useMemo(() => (drivers ?? []).filter((d) => d.active !== false), [drivers])

  const steps = type ? STEPS[type] : []
  const currentStep = steps[stepIdx] ?? null

  const picoPlacaWarning = useMemo(() => {
    if (type !== TYPE_SETTLEMENT || currentStep?.id !== 'date') return null
    return getPicoPlacaWarning(formData.plate, inputVal, vehiclesMap)
  }, [type, currentStep, formData.plate, inputVal, vehiclesMap])

  useEffect(() => {
    if (open) {
      dispatch(taxiDriverActions.fetchRequest())
      dispatch(taxiVehicleActions.fetchRequest())
    }
  }, [open, dispatch])

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (open && type && !done) {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [stepIdx, type, open, done])

  const pushBot = (text) => setMessages((prev) => [...prev, { from: 'bot', text }])
  const pushUser = (text) => setMessages((prev) => [...prev, { from: 'user', text }])

  const handleOpen = () => {
    setOpen(true)
    setType(null)
    setStepIdx(0)
    setFormData({})
    setInputVal('')
    setDone(false)
    setMessages([{ from: 'bot', text: '¡Hola! ¿Qué quieres crear?' }])
  }

  const handleClose = () => setOpen(false)

  const handleReset = () => {
    setType(null)
    setStepIdx(0)
    setFormData({})
    setInputVal('')
    setDone(false)
    setMessages([{ from: 'bot', text: '¿Qué más quieres crear?' }])
  }

  const handleChooseType = (t) => {
    pushUser(TYPE_LABELS[t])
    setType(t)
    setStepIdx(0)
    setFormData({})
    setInputVal(t === TYPE_SETTLEMENT ? today() : '')
    setTimeout(() => pushBot(STEPS[t][0].question), 280)
  }

  const save = (data) => {
    if (type === TYPE_VEHICLE) {
      dispatch(
        taxiVehicleActions.createRequest({
          plate: data.plate,
          brand: data.brand,
          model: data.model || null,
          year: data.year ? Number(data.year) : null,
          active: true,
        }),
      )
    } else if (type === TYPE_DRIVER) {
      dispatch(
        taxiDriverActions.createRequest({
          name: data.name,
          idNumber: data.idNumber,
          phone: data.phone || null,
          defaultAmount: data.defaultAmount ? Number(data.defaultAmount) : null,
          defaultVehicle: data.defaultVehicle || null,
          active: true,
        }),
      )
    } else if (type === TYPE_SETTLEMENT) {
      dispatch(
        taxiSettlementActions.createRequest({
          driver: data.driver,
          plate: data.plate,
          amount: data.amount,
          date: data.date,
          comment: data.comment || null,
        }),
      )
    } else if (type === TYPE_EXPENSE) {
      const expenseDriver = data.plate
        ? (drivers ?? []).find((d) => d.defaultVehicle === data.plate)?.name || null
        : null
      dispatch(
        taxiExpenseActions.createRequest({
          category: data.category,
          description: data.description,
          amount: Number(data.amount),
          date: data.date,
          plate: data.plate || null,
          driverName: expenseDriver,
          comment: data.comment || null,
        }),
      )
    }
    setDone(true)
    setTimeout(() => pushBot(`✓ ${TYPE_DISPLAY_NAME[type]} creado correctamente.`), 350)
  }

  const advance = (value, display) => {
    const step = steps[stepIdx]
    const newData = { ...formData, [step.id]: value }

    // auto-fill plate + amount when driver is selected in settlement
    if (type === TYPE_SETTLEMENT && step.id === 'driver') {
      const driver = (drivers ?? []).find((d) => d.name === value)
      if (driver?.defaultVehicle) newData.plate = driver.defaultVehicle
      if (driver?.defaultAmount) newData.amount = String(driver.defaultAmount)
    }

    setFormData(newData)
    pushUser(display ?? String(value ?? '(omitido)'))

    const nextIdx = stepIdx + 1
    if (nextIdx >= steps.length) {
      setTimeout(() => {
        pushBot('Un momento, guardando...')
        save(newData)
      }, 280)
      return
    }

    const nextStep = steps[nextIdx]
    setStepIdx(nextIdx)

    let nextInputVal = ''
    if (type === TYPE_SETTLEMENT && nextStep.id === 'date') nextInputVal = today()
    if (type === TYPE_SETTLEMENT && nextStep.id === 'amount' && newData.amount)
      nextInputVal = newData.amount
    if (type === TYPE_EXPENSE && nextStep.id === 'date') nextInputVal = today()
    setInputVal(nextInputVal)

    let botMsg = nextStep.question
    if (type === TYPE_SETTLEMENT && step.id === 'driver') {
      const driver = (drivers ?? []).find((d) => d.name === value)
      const taxiLabel = driver?.defaultVehicle ? `Taxi: ${driver.defaultVehicle}` : null
      const amtLabel = driver?.defaultAmount ? `Valor sugerido: ${fmt(driver.defaultAmount)}` : null
      const ctx = [taxiLabel, amtLabel].filter(Boolean).join(' · ')
      if (ctx) botMsg = `${ctx}. ${nextStep.question}`
    }

    setTimeout(() => pushBot(botMsg), 280)
  }

  const handleSubmitInput = () => {
    if (!currentStep) return
    const val = inputVal.trim()
    if (!val && currentStep.required) return
    if (picoPlacaWarning) return
    const display = currentStep.inputType === 'date' ? fmtDateDisplay(val) : val || null
    advance(val || null, display)
  }

  const handleSkip = () => {
    if (!currentStep || currentStep.required) return
    advance(null, '(omitido)')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmitInput()
  }

  const renderSelect = (placeholder, options, onChange) => (
    <div className="tqa__input-area">
      <select ref={inputRef} className="tqa__select" defaultValue="" onChange={onChange}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options}
      </select>
    </div>
  )

  const renderInputArea = () => {
    if (!currentStep || done) return null
    const { inputType, placeholder, required } = currentStep

    if (inputType === 'category-select') {
      return renderSelect(
        'Selecciona una categoría...',
        TAXI_EXPENSE_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        )),
        (e) => {
          const val = e.target.value
          if (val) advance(val, val)
        },
      )
    }

    if (inputType === 'driver-select') {
      return renderSelect(
        'Selecciona un conductor...',
        activeDrivers.map((d) => (
          <option key={d.id} value={d.name}>
            {d.name}
          </option>
        )),
        (e) => {
          const val = e.target.value
          if (val) advance(val, val)
        },
      )
    }

    if (inputType === 'vehicle-select') {
      return renderSelect(
        'Selecciona un taxi...',
        <>
          {(vehicles ?? []).map((v) => (
            <option key={v.id} value={v.plate}>
              {v.plate}
              {v.brand ? ` · ${v.brand}` : ''}
              {v.active === false ? ' (Inactivo)' : ''}
            </option>
          ))}
          {!required && <option value="__skip">— Ninguno / Omitir —</option>}
        </>,
        (e) => {
          const val = e.target.value
          if (val === '__skip') {
            handleSkip()
            return
          }
          const v = (vehicles ?? []).find((x) => x.plate === val)
          const display = v ? `${v.plate}${v.brand ? ` · ${v.brand}` : ''}` : val
          advance(val || null, display)
        },
      )
    }

    return (
      <div className="tqa__input-area">
        <input
          ref={inputRef}
          type={inputType === 'number' ? 'number' : inputType === 'date' ? 'date' : 'text'}
          className={`tqa__input${picoPlacaWarning ? ' tqa__input--error' : ''}`}
          placeholder={placeholder}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {picoPlacaWarning && <div className="tqa__warning">{picoPlacaWarning}</div>}
        <div className="tqa__input-actions">
          <button
            className="tqa__submit-btn"
            onClick={handleSubmitInput}
            disabled={(required && !inputVal.trim()) || !!picoPlacaWarning}
          >
            Continuar →
          </button>
          {!required && (
            <button className="tqa__skip-btn" type="button" onClick={handleSkip}>
              Omitir
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        className={`tqa__fab${open ? ' tqa__fab--open' : ''}`}
        onClick={open ? handleClose : handleOpen}
        title="Asistente rápido"
        aria-label="Abrir asistente rápido"
      >
        <WandIcon />
      </button>

      {open && (
        <div className="tqa__panel">
          <div className="tqa__header">
            <span className="tqa__header-title">
              <WandIcon /> Asistente rápido
            </span>
            <button className="tqa__close-btn" onClick={handleClose} aria-label="Cerrar">
              ✕
            </button>
          </div>

          <div className="tqa__messages" ref={msgsRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`tqa__msg tqa__msg--${msg.from}`}>
                {msg.text}
              </div>
            ))}
          </div>

          {!type && (
            <div className="tqa__choices">
              {[TYPE_VEHICLE, TYPE_DRIVER, TYPE_SETTLEMENT, TYPE_EXPENSE].map((t) => (
                <button key={t} className="tqa__choice-btn" onClick={() => handleChooseType(t)}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          )}

          {type && renderInputArea()}

          {type && !done && (
            <div className="tqa__cancel-bar">
              <button className="tqa__cancel-btn" onClick={handleReset}>
                ← Volver al inicio
              </button>
            </div>
          )}

          {done && (
            <div className="tqa__done-actions">
              <button className="tqa__choice-btn" style={{ flex: 1 }} onClick={handleOpen}>
                Crear otro
              </button>
              <button className="tqa__done-secondary-btn" onClick={handleClose}>
                Cerrar
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default TaxiQuickAssistant
