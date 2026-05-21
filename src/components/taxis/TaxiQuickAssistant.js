import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as taxiVehicleActions from 'src/actions/taxi/taxiVehicleActions'
import * as taxiDriverActions from 'src/actions/taxi/taxiDriverActions'
import * as taxiSettlementActions from 'src/actions/taxi/taxiSettlementActions'
import { fmt } from 'src/utils/formatters'
import './TaxiQuickAssistant.scss'

const TYPE_VEHICLE = 'vehicle'
const TYPE_DRIVER = 'driver'
const TYPE_SETTLEMENT = 'settlement'

const TYPE_LABELS = {
  [TYPE_VEHICLE]: '🚕 Vehículo',
  [TYPE_DRIVER]: '👤 Conductor',
  [TYPE_SETTLEMENT]: '💵 Liquidación',
}

const today = () => new Date().toISOString().split('T')[0]

const fmtDateDisplay = (iso) => {
  if (!iso) return iso
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const getPicoPlacaWarning = (plate, date, vehiclesMap) => {
  if (!plate || !date) return null
  const [, monthStr, dayStr] = date.split('-')
  const month = parseInt(monthStr, 10)
  const day = parseInt(dayStr, 10)
  const vehicle = vehiclesMap.get(plate)
  const restr = vehicle?.restrictions?.[month] ?? vehicle?.restrictions?.[String(month)]
  if (restr && new Set([restr.d1, restr.d2].filter(Boolean).map(Number)).has(day)) {
    return `⚠ Pico y placa: ${plate} no puede circular el día ${day}`
  }
  return null
}

const STEPS = {
  [TYPE_VEHICLE]: [
    {
      id: 'plate',
      question: '¿Cuál es la placa?',
      inputType: 'text',
      placeholder: 'ABC-123',
      required: true,
    },
    {
      id: 'brand',
      question: '¿La marca?',
      inputType: 'text',
      placeholder: 'Renault',
      required: true,
    },
    {
      id: 'model',
      question: '¿El modelo?',
      inputType: 'text',
      placeholder: 'Logan',
      required: false,
    },
    {
      id: 'year',
      question: '¿El año?',
      inputType: 'number',
      placeholder: String(new Date().getFullYear()),
      required: false,
    },
  ],
  [TYPE_DRIVER]: [
    {
      id: 'name',
      question: '¿Nombre completo del conductor?',
      inputType: 'text',
      placeholder: 'Juan Pérez',
      required: true,
    },
    {
      id: 'idNumber',
      question: '¿Número de cédula?',
      inputType: 'text',
      placeholder: '123456789',
      required: true,
    },
    {
      id: 'phone',
      question: '¿Teléfono de contacto?',
      inputType: 'text',
      placeholder: '300 000 0000',
      required: false,
    },
    {
      id: 'defaultAmount',
      question: '¿Valor de liquidación normal?',
      inputType: 'number',
      placeholder: '85000',
      required: false,
    },
    {
      id: 'defaultVehicle',
      question: '¿Taxi asignado por defecto?',
      inputType: 'vehicle-select',
      required: false,
    },
  ],
  [TYPE_SETTLEMENT]: [
    {
      id: 'driver',
      question: '¿Qué conductor vas a liquidar?',
      inputType: 'driver-select',
      required: true,
    },
    { id: 'date', question: '¿La fecha?', inputType: 'date', required: true },
    {
      id: 'amount',
      question: '¿El valor de la liquidación?',
      inputType: 'number',
      placeholder: '85000',
      required: true,
    },
    {
      id: 'comment',
      question: '¿Algún comentario?',
      inputType: 'text',
      placeholder: 'Opcional...',
      required: false,
    },
  ],
}

const WandIcon = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
    <path d="m14 7 3 3" />
    <path d="M5 6v4" />
    <path d="M19 14v4" />
    <path d="M10 2v2" />
    <path d="M7 8H3" />
    <path d="M21 16h-4" />
    <path d="M11 3H9" />
  </svg>
)

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
    }
    setDone(true)
    setTimeout(() => {
      const labels = {
        [TYPE_VEHICLE]: 'Vehículo',
        [TYPE_DRIVER]: 'Conductor',
        [TYPE_SETTLEMENT]: 'Liquidación',
      }
      pushBot(`✓ ${labels[type]} creado correctamente.`)
    }, 350)
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

    // pre-fill next input based on context
    let nextInputVal = ''
    if (type === TYPE_SETTLEMENT && nextStep.id === 'date') nextInputVal = today()
    if (type === TYPE_SETTLEMENT && nextStep.id === 'amount' && newData.amount)
      nextInputVal = newData.amount
    setInputVal(nextInputVal)

    // build bot message with context after driver selection
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

  const renderInputArea = () => {
    if (!currentStep || done) return null
    const { inputType, placeholder, required } = currentStep

    if (inputType === 'driver-select') {
      return (
        <div className="tqa__input-area">
          <select
            ref={inputRef}
            className="tqa__select"
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value
              if (!val) return
              advance(val, val)
            }}
          >
            <option value="" disabled>
              Selecciona un conductor...
            </option>
            {activeDrivers.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )
    }

    if (inputType === 'vehicle-select') {
      return (
        <div className="tqa__input-area">
          <select
            ref={inputRef}
            className="tqa__select"
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value
              if (val === '__skip') {
                handleSkip()
                return
              }
              const v = (vehicles ?? []).find((x) => x.plate === val)
              const display = v ? `${v.plate}${v.brand ? ` · ${v.brand}` : ''}` : val
              advance(val || null, display)
            }}
          >
            <option value="" disabled>
              Selecciona un taxi...
            </option>
            {(vehicles ?? []).map((v) => (
              <option key={v.id} value={v.plate}>
                {v.plate}
                {v.brand ? ` · ${v.brand}` : ''}
                {v.active === false ? ' (Inactivo)' : ''}
              </option>
            ))}
            {!required && <option value="__skip">— Ninguno / Omitir —</option>}
          </select>
        </div>
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
              {[TYPE_VEHICLE, TYPE_DRIVER, TYPE_SETTLEMENT].map((t) => (
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
