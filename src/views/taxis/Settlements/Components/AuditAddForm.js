import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

const fieldError = (err) =>
  err ? (
    <span style={{ fontSize: 10, color: '#e03131', display: 'block', marginTop: 2 }}>
      {err.message}
    </span>
  ) : null

const AuditAddForm = ({ day, activeDrivers, periodDrivers, onSave, onCancel }) => {
  const defaultDriver = (() => {
    const vehicles = [...(day.missingVehicles || []), ...(day.underpaidVehicles || [])]
    for (const pl of vehicles) {
      const d = periodDrivers.find((dr) => {
        if (dr.defaultVehicle !== pl) return false
        if (dr.startDate && dr.startDate > day.dateStr) return false
        if (dr.endDate && dr.endDate < day.dateStr) return false
        return true
      })
      if (d && d.active !== false) return d
    }
    return activeDrivers[0] || null
  })()

  const getDefaultAmount = (driver) => {
    if (!driver) return ''
    const amt =
      day.isSunday || day.isHoliday
        ? driver.defaultAmountSunday || driver.defaultAmount || 0
        : driver.defaultAmount || 0
    return amt ? String(amt) : ''
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      driverName: defaultDriver?.name || '',
      amount: getDefaultAmount(defaultDriver),
    },
  })

  const driverName = watch('driverName')

  useEffect(() => {
    const d = activeDrivers.find((dr) => dr.name === driverName)
    setValue('amount', getDefaultAmount(d))
  }, [driverName])

  const onSubmit = ({ driverName: name, amount }) => {
    const driver = activeDrivers.find((d) => d.name === name)
    onSave({
      driver: name,
      plate: driver?.defaultVehicle || '',
      amount: Number(amount),
      date: day.dateStr,
    })
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 2 }}
    >
      <select
        {...register('driverName', { required: 'Requerido' })}
        style={{
          fontSize: 11,
          padding: '2px 6px',
          borderRadius: 4,
          border: '1px solid #cbd5e1',
          outline: 'none',
          maxWidth: 150,
        }}
      >
        {activeDrivers.map((d) => (
          <option key={d.id} value={d.name}>
            {d.name}
          </option>
        ))}
      </select>
      {fieldError(errors.driverName)}
      <input
        type="number"
        {...register('amount', { required: 'Requerido', min: { value: 1, message: '> 0' } })}
        style={{
          fontSize: 11,
          padding: '2px 6px',
          borderRadius: 4,
          border: '1px solid #cbd5e1',
          outline: 'none',
          width: 100,
        }}
      />
      {fieldError(errors.amount)}
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={handleSubmit(onSubmit)}
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 4,
            background: '#1e3a5f',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          ✓
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCancel()
          }}
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 4,
            background: '#f1f5f9',
            color: '#64748b',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default AuditAddForm
