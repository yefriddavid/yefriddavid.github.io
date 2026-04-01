import React, { useState } from 'react'

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

  const [driverName, setDriverName] = useState(defaultDriver?.name || '')
  const [amount, setAmount] = useState(getDefaultAmount(defaultDriver))

  const handleDriverChange = (name) => {
    setDriverName(name)
    const d = activeDrivers.find((dr) => dr.name === name)
    setAmount(getDefaultAmount(d))
  }

  const handleSave = () => {
    if (!driverName || !amount) return
    const driver = activeDrivers.find((d) => d.name === driverName)
    onSave({
      driver: driverName,
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
        value={driverName}
        onChange={(e) => handleDriverChange(e.target.value)}
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
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          fontSize: 11,
          padding: '2px 6px',
          borderRadius: 4,
          border: '1px solid #cbd5e1',
          outline: 'none',
          width: 100,
        }}
      />
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={handleSave}
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
