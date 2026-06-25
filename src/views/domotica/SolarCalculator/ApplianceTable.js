import React, { useState, useMemo, useEffect, useRef } from 'react'
import { SOLAR_APPLIANCE_PRESETS } from 'src/constants/domotica'
import './ApplianceTable.scss'

let nextId = 1
const newRow = (preset = {}) => ({
  id: nextId++,
  name: preset.name ?? '',
  qty: 1,
  watts: preset.watts ?? 0,
  hours: preset.hours ?? 0,
})

export default function ApplianceTable({ onChange, initialRows }) {
  const [rows, setRows] = useState(() =>
    initialRows?.length ? initialRows.map((r) => ({ ...r, id: nextId++ })) : [newRow()],
  )
  const [showPresets, setShowPresets] = useState(false)
  const presetsRef = useRef(null)

  const totals = useMemo(() => {
    const dailyWh = rows.reduce((s, r) => s + r.qty * r.watts * r.hours, 0)
    const peakW = rows.reduce((s, r) => s + r.qty * r.watts, 0)
    return { dailyWh: Math.round(dailyWh), peakW: Math.round(peakW) }
  }, [rows])

  useEffect(() => { onChange({ ...totals, rows }) }, [totals]) // eslint-disable-line

  useEffect(() => {
    if (!showPresets) return
    const handler = (e) => { if (!presetsRef.current?.contains(e.target)) setShowPresets(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPresets])

  const upd = (id, field, val) =>
    setRows((p) => p.map((r) => r.id === id ? { ...r, [field]: val } : r))

  const del = (id) => setRows((p) => p.filter((r) => r.id !== id))

  const addPreset = (preset) => {
    setRows((p) => [...p, newRow(preset)])
    setShowPresets(false)
  }

  const rowWh = (r) => Math.round(r.qty * r.watts * r.hours)
  const rowPeak = (r) => Math.round(r.qty * r.watts)

  return (
    <div className="at">
      <div className="at__header">
        <span className="at__header-title">Electrodomésticos</span>
        <div className="at__header-actions">
          <div className="at__preset-wrap" ref={presetsRef}>
            <button className="at__btn at__btn--preset" onClick={() => setShowPresets((p) => !p)}>
              + Preset
            </button>
            {showPresets && (
              <div className="at__preset-dropdown">
                {SOLAR_APPLIANCE_PRESETS.map((p) => (
                  <button key={p.name} className="at__preset-item" onClick={() => addPreset(p)}>
                    <span className="at__preset-name">{p.name}</span>
                    <span className="at__preset-meta">{p.watts}W · {p.hours}h</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="at__btn" onClick={() => setRows((p) => [...p, newRow()])}>
            + Agregar
          </button>
        </div>
      </div>

      <div className="at__table-wrap">
        <table className="at__table">
          <thead>
            <tr>
              <th className="at__th at__th--name">Electrodoméstico</th>
              <th className="at__th at__th--num">Cant.</th>
              <th className="at__th at__th--num">Watts</th>
              <th className="at__th at__th--num">h/día</th>
              <th className="at__th at__th--num">Wh/día</th>
              <th className="at__th at__th--num">Pico W</th>
              <th className="at__th at__th--del" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="at__tr">
                <td className="at__td">
                  <input
                    className="at__input at__input--name"
                    type="text"
                    placeholder="Nombre"
                    value={r.name}
                    onChange={(e) => upd(r.id, 'name', e.target.value)}
                  />
                </td>
                <td className="at__td">
                  <input className="at__input at__input--num" type="number" min="1" value={r.qty}
                    onChange={(e) => upd(r.id, 'qty', parseFloat(e.target.value) || 1)} />
                </td>
                <td className="at__td">
                  <input className="at__input at__input--num" type="number" min="0" value={r.watts}
                    onChange={(e) => upd(r.id, 'watts', parseFloat(e.target.value) || 0)} />
                </td>
                <td className="at__td">
                  <input className="at__input at__input--num" type="number" min="0" max="24" step="0.5" value={r.hours}
                    onChange={(e) => upd(r.id, 'hours', parseFloat(e.target.value) || 0)} />
                </td>
                <td className="at__td at__td--calc">{rowWh(r)}</td>
                <td className="at__td at__td--calc at__td--peak">{rowPeak(r)}</td>
                <td className="at__td">
                  <button className="at__del" onClick={() => del(r.id)} title="Eliminar">×</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="at__tfoot-row">
              <td colSpan={4} className="at__tfoot-label">Total diario</td>
              <td className="at__tfoot-val at__tfoot-val--wh">{totals.dailyWh} Wh</td>
              <td className="at__tfoot-val at__tfoot-val--peak">{totals.peakW} W</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
