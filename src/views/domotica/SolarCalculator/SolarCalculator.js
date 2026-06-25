import React, { useState, useMemo, lazy, Suspense, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import SolarCanvas from './SolarCanvas'
import ApplianceTable from './ApplianceTable'
import { calcFromSystem, calcFromConsumption } from './useSolarCalc'
import { configure as configureFacade } from '../../../services/facade/domotica/domoticaSolarCalcFacade'
import * as actions from '../../../actions/domotica/domoticaSolarCalcActions'
import './SolarCalculator.scss'

const SolarLocationModal = lazy(() => import('./SolarLocationModal'))

function useAppTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.coreuiTheme || 'light')
  useEffect(() => {
    const handler = () => setTheme(document.documentElement.dataset.coreuiTheme || 'light')
    document.documentElement.addEventListener('ColorSchemeChange', handler)
    return () => document.documentElement.removeEventListener('ColorSchemeChange', handler)
  }, [])
  return theme
}

const DEFAULTS = {
  panels: { count: 2, wp: 200, hsp: 5.0 },
  controller: { efficiency: 97, type: 'MPPT' },
  battery: { count: 2, ah: 100, voltage: 12, dod: 50, type: 'lead-acid' },
  inverter: { capacity: 1000, efficiency: 92 },
  consumption: { dailyWh: 500, peakW: 800, autonomyDays: 1 },
  appliances: [],
}

const n = (v) => parseFloat(v) || 0

function Field({ label, children }) {
  return (
    <div className="sc-calc__field">
      <label className="sc-calc__label">{label}</label>
      {children}
    </div>
  )
}

function Section({ id, title, color, selected, onSelect, children }) {
  const isActive = selected === id
  return (
    <div
      id={`sc-section-${id}`}
      className={`sc-calc__section${isActive ? ' sc-calc__section--active' : ''}`}
      style={{ '--sc': color }}
      onClick={() => onSelect(id)}
    >
      <div className="sc-calc__section-title" style={{ color: isActive ? color : undefined }}>
        {title}
      </div>
      <div className="sc-calc__section-fields">{children}</div>
    </div>
  )
}

function ConfigsBar({ configs, fetching, activeId, savingName, onLoad, onDelete, onUpdate, onSaveNew, onStartSave, onCancelSave, onNameChange }) {
  return (
    <div className="sc-calc__configs-bar" onClick={(e) => e.stopPropagation()}>
      <div className="sc-calc__configs-chips">
        {!configs?.length
          ? <span className="sc-calc__configs-empty">Sin configuraciones guardadas</span>
          : configs.map((c) => (
            <span key={c.id} className={`sc-calc__config-chip${activeId === c.id ? ' sc-calc__config-chip--active' : ''}`}>
              <button className="sc-calc__chip-load" onClick={() => onLoad(c)}>{c.name}</button>
              <button className="sc-calc__chip-del" onClick={() => onDelete(c.id)}>×</button>
            </span>
          ))
        }
      </div>
      <div className="sc-calc__configs-actions">
        {activeId && (
          <button className="sc-calc__save-btn sc-calc__save-btn--update" onClick={onUpdate} disabled={fetching}>
            {fetching ? '…' : 'Actualizar'}
          </button>
        )}
        {savingName !== null ? (
          <div className="sc-calc__save-form">
            <input
              className="sc-calc__input sc-calc__save-input"
              placeholder="Nombre de la configuración…"
              value={savingName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSaveNew(); if (e.key === 'Escape') onCancelSave() }}
              autoFocus
            />
            <button className="sc-calc__save-confirm" onClick={onSaveNew} disabled={!savingName.trim()}>✓</button>
            <button className="sc-calc__save-cancel" onClick={onCancelSave}>×</button>
          </div>
        ) : (
          <button className="sc-calc__save-btn" onClick={onStartSave} disabled={fetching}>
            + Guardar
          </button>
        )}
      </div>
    </div>
  )
}

function ResultCard({ icon, label, value, sub, color, highlight }) {
  return (
    <div
      className={`sc-calc__result-card${highlight ? ' sc-calc__result-card--highlight' : ''}`}
      style={{ '--rc': color }}
    >
      <span className="sc-calc__result-icon">{icon}</span>
      <div className="sc-calc__result-body">
        <div className="sc-calc__result-label">{label}</div>
        <div className="sc-calc__result-value">{value}</div>
        {sub && <div className="sc-calc__result-sub">{sub}</div>}
      </div>
    </div>
  )
}

export default function SolarCalculator({ local = false }) {
  configureFacade(local ? 'local' : 'remote')

  const dispatch = useDispatch()
  const { data: configs, fetching } = useSelector((s) => s.domoticaSolarCalc)
  const [searchParams] = useSearchParams()

  const appTheme = useAppTheme()
  const dayMode = appTheme === 'light'

  const [mode, setMode] = useState('from_system')
  const [form, setForm] = useState(DEFAULTS)
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [locationModal, setLocationModal] = useState(false)
  const [locationInfo, setLocationInfo] = useState(null)
  const [activeConfigId, setActiveConfigId] = useState(null)
  const [savingName, setSavingName] = useState(null)
  const [tableKey, setTableKey] = useState(0)

  useEffect(() => { dispatch(actions.fetchRequest()) }, [dispatch])

  useEffect(() => {
    const id = searchParams.get('id')
    if (!id || !configs) return
    const config = configs.find((c) => c.id === id)
    if (config) handleLoad(config)
  }, [configs, searchParams]) // eslint-disable-line

  const handleLoad = useCallback((config) => {
    setForm({
      panels: config.panels ?? DEFAULTS.panels,
      controller: config.controller ?? DEFAULTS.controller,
      battery: config.battery ?? DEFAULTS.battery,
      inverter: config.inverter ?? DEFAULTS.inverter,
      consumption: config.consumption ?? DEFAULTS.consumption,
      appliances: config.appliances ?? [],
    })
    setMode(config.mode ?? 'from_system')
    setLocationInfo(config.location ?? null)
    setActiveConfigId(config.id)
    setTableKey((k) => k + 1)
  }, [])

  const handleSaveNew = useCallback(() => {
    if (!savingName?.trim()) return
    dispatch(actions.createRequest({ name: savingName.trim(), mode, ...form, location: locationInfo }))
    setSavingName(null)
  }, [dispatch, savingName, mode, form, locationInfo])

  const handleUpdate = useCallback(() => {
    if (!activeConfigId) return
    const name = configs?.find((c) => c.id === activeConfigId)?.name ?? ''
    dispatch(actions.updateRequest({ id: activeConfigId, name, mode, ...form, location: locationInfo }))
  }, [dispatch, activeConfigId, configs, mode, form, locationInfo])

  const handleDelete = useCallback((id) => {
    dispatch(actions.deleteRequest({ id }))
    if (activeConfigId === id) setActiveConfigId(null)
  }, [dispatch, activeConfigId])

  const upd = (section, field) => (e) =>
    setForm((p) => ({ ...p, [section]: { ...p[section], [field]: e.target.value } }))

  const handleSelect = (id) => setSelected((p) => (p === id ? null : id))

  const sys = useMemo(() => ({
    panels: { count: n(form.panels.count), wp: n(form.panels.wp), hsp: n(form.panels.hsp) },
    controller: { efficiency: n(form.controller.efficiency) / 100 },
    battery: {
      count: n(form.battery.count),
      ah: n(form.battery.ah),
      voltage: n(form.battery.voltage),
      dod: n(form.battery.dod) / 100,
    },
    inverter: { capacity: n(form.inverter.capacity), efficiency: n(form.inverter.efficiency) / 100 },
    consumption: {
      dailyWh: n(form.consumption.dailyWh),
      peakW: n(form.consumption.peakW),
      autonomyDays: n(form.consumption.autonomyDays),
    },
  }), [form])

  const results = useMemo(
    () => (mode === 'from_system' ? calcFromSystem(sys) : calcFromConsumption(sys)),
    [mode, sys],
  )

  const flowLabels = useMemo(() => {
    if (mode === 'from_system') {
      return {
        panels: `${form.panels.count}×${form.panels.wp}Wp`,
        battery: `${form.battery.count}×${form.battery.ah}Ah`,
        loads: results.dailyWh ? `${results.dailyWh} Wh/d` : '',
      }
    }
    return {
      panels: results.panelsN ? `${results.panelsN} panel${results.panelsN !== 1 ? 'es' : ''}` : '',
      battery: results.batteriesN ? `${results.batteriesN} bat.` : '',
      loads: `${form.consumption.dailyWh} Wh/d`,
    }
  }, [mode, form, results])

  const handleApplianceChange = useCallback(({ dailyWh, peakW, rows }) => {
    setForm((p) => ({
      ...p,
      consumption: { ...p.consumption, dailyWh, peakW },
      appliances: rows,
    }))
  }, [])

  const handleLocationApply = ({ hsp, name, lat, lng }) => {
    setForm((p) => ({ ...p, panels: { ...p.panels, hsp } }))
    setLocationInfo({ name, lat, lng, hsp })
  }

  const handleCompClick = (id) => {
    setSelected((prev) => (prev === id ? null : id))
    setTimeout(() => {
      document.getElementById(`sc-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  const sp = { selected, onSelect: handleSelect }

  return (
    <div className="sc-calc">
      <div className="sc-calc__header">
        <h4 className="sc-calc__title">Calculadora Sistema Solar</h4>
        <div className="sc-calc__mode-toggle">
          <button
            className={`sc-calc__mode-btn${mode === 'from_system' ? ' sc-calc__mode-btn--active' : ''}`}
            onClick={() => setMode('from_system')}
          >
            Sistema → Consumo
          </button>
          <button
            className={`sc-calc__mode-btn${mode === 'from_consumption' ? ' sc-calc__mode-btn--active' : ''}`}
            onClick={() => setMode('from_consumption')}
          >
            Consumo → Sistema
          </button>
        </div>
      </div>

      <ConfigsBar
        configs={configs}
        fetching={fetching}
        activeId={activeConfigId}
        savingName={savingName}
        onLoad={handleLoad}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        onSaveNew={handleSaveNew}
        onStartSave={() => setSavingName('')}
        onCancelSave={() => setSavingName(null)}
        onNameChange={setSavingName}
      />

      <div className="sc-calc__canvas-wrap">
        <SolarCanvas
          hovered={hovered}
          selected={selected}
          onHover={setHovered}
          onClick={handleCompClick}
          flowLabels={flowLabels}
          dayMode={dayMode}
        />
      </div>

      <div className="sc-calc__body">
        <div className="sc-calc__inputs">

          <Section id="panels" title="Paneles Solares" color="#f59e0b" {...sp}>
            <Field label="Cantidad">
              <input className="sc-calc__input" type="number" min="1" value={form.panels.count} onChange={upd('panels', 'count')} />
            </Field>
            <Field label="Potencia (Wp)">
              <input className="sc-calc__input" type="number" min="1" value={form.panels.wp} onChange={upd('panels', 'wp')} />
            </Field>
            <Field label="Horas sol pico / día">
              <div className="sc-calc__hsp-row">
                <input className="sc-calc__input" type="number" min="0.5" step="0.1" value={form.panels.hsp} onChange={upd('panels', 'hsp')} />
                <button
                  className="sc-calc__location-btn"
                  title="Seleccionar ubicación en mapa"
                  onClick={(e) => { e.stopPropagation(); setLocationModal(true) }}
                >
                  📍
                </button>
              </div>
              {locationInfo && (
                <div className="sc-calc__location-tag">
                  📍 {locationInfo.name || `${locationInfo.lat.toFixed(2)}, ${locationInfo.lng.toFixed(2)}`}
                </div>
              )}
            </Field>
          </Section>

          <Section id="controller" title="Controlador de Carga" color="#3b82f6" {...sp}>
            <Field label="Tipo">
              <select
                className="sc-calc__input"
                value={form.controller.type}
                onChange={(e) => setForm((p) => ({
                  ...p,
                  controller: { type: e.target.value, efficiency: e.target.value === 'MPPT' ? 97 : 80 },
                }))}
              >
                <option value="MPPT">MPPT</option>
                <option value="PWM">PWM</option>
              </select>
            </Field>
            <Field label="Eficiencia (%)">
              <input className="sc-calc__input" type="number" min="50" max="100" value={form.controller.efficiency} onChange={upd('controller', 'efficiency')} />
            </Field>
          </Section>

          <Section id="battery" title="Banco de Baterías" color="#10b981" {...sp}>
            <Field label="Cantidad">
              <input className="sc-calc__input" type="number" min="1" value={form.battery.count} onChange={upd('battery', 'count')} />
            </Field>
            <Field label="Capacidad (Ah)">
              <input className="sc-calc__input" type="number" min="1" value={form.battery.ah} onChange={upd('battery', 'ah')} />
            </Field>
            <Field label="Voltaje">
              <select className="sc-calc__input" value={form.battery.voltage} onChange={upd('battery', 'voltage')}>
                <option value={12}>12 V</option>
                <option value={24}>24 V</option>
                <option value={48}>48 V</option>
              </select>
            </Field>
            <Field label="Prof. descarga (%)">
              <input className="sc-calc__input" type="number" min="10" max="100" value={form.battery.dod} onChange={upd('battery', 'dod')} />
            </Field>
          </Section>

          <Section id="inverter" title="Inversor" color="#8b5cf6" {...sp}>
            <Field label="Capacidad (W)">
              <input className="sc-calc__input" type="number" min="1" value={form.inverter.capacity} onChange={upd('inverter', 'capacity')} />
            </Field>
            <Field label="Eficiencia (%)">
              <input className="sc-calc__input" type="number" min="50" max="100" value={form.inverter.efficiency} onChange={upd('inverter', 'efficiency')} />
            </Field>
          </Section>

          {mode === 'from_consumption' && (
            <Section id="loads" title="Consumo Requerido" color="#ef4444" {...sp}>
              <div className="sc-calc__appliance-wrap" onClick={(e) => e.stopPropagation()}>
                <ApplianceTable
                  key={tableKey}
                  initialRows={form.appliances}
                  onChange={handleApplianceChange}
                />
              </div>
              <div className="sc-calc__consumption-summary">
                <Field label="Consumo diario (Wh)">
                  <input className="sc-calc__input" type="number" min="1" value={form.consumption.dailyWh} onChange={upd('consumption', 'dailyWh')} />
                </Field>
                <Field label="Carga pico (W)">
                  <input className="sc-calc__input" type="number" min="1" value={form.consumption.peakW} onChange={upd('consumption', 'peakW')} />
                </Field>
                <Field label="Autonomía (días)">
                  <input className="sc-calc__input" type="number" min="0.5" step="0.5" value={form.consumption.autonomyDays} onChange={upd('consumption', 'autonomyDays')} />
                </Field>
              </div>
            </Section>
          )}

        </div>

        <div className="sc-calc__results">
          <div className="sc-calc__results-title">Resultados</div>

          {mode === 'from_system' ? (
            <>
              <ResultCard icon="⚡" label="Consumo diario máximo" value={`${results.dailyWh} Wh`} color="#10b981" sub="Energía disponible por día" highlight />
              <ResultCard icon="🔆" label="Potencia pico soportada" value={`${results.peakW} W`} color="#f59e0b" sub="Carga máxima simultánea" />
              <ResultCard icon="🕐" label="Autonomía sin sol" value={`${results.autonomyH} h`} color="#3b82f6" sub={`≈ ${results.autonomyD} días`} />
              <ResultCard icon="☀" label="Energía solar generada" value={`${results.solarWh} Wh/d`} color="#f59e0b" sub={`${results.totalWp} Wp instalados`} />
              <ResultCard icon="🔋" label="Batería utilizable" value={`${results.battWh} Wh`} color="#10b981" sub={`${form.battery.count}×${form.battery.ah}Ah @ ${form.battery.voltage}V`} />
            </>
          ) : (
            <>
              <ResultCard icon="☀" label="Paneles necesarios" value={String(results.panelsN)} color="#f59e0b" sub={`${results.totalWp} Wp total`} highlight />
              <ResultCard icon="🔋" label="Baterías necesarias" value={String(results.batteriesN)} color="#10b981" sub={`${results.totalBattWh} Wh utilizable`} highlight />
              <ResultCard icon="⚡" label="Controlador mínimo" value={`${results.ctrlA} A`} color="#3b82f6" sub="Margen de seguridad 25%" />
              <ResultCard icon="~" label="Inversor mínimo" value={`${results.invW} W`} color="#8b5cf6" sub="Margen de seguridad 10%" />
              <ResultCard icon="✓" label="Cubre diario" value={`${results.coveredWh} Wh`} color="#10b981" sub={`Req: ${form.consumption.dailyWh} Wh`} />
            </>
          )}
        </div>
      </div>

      {locationModal && (
        <Suspense fallback={null}>
          <SolarLocationModal
            visible={locationModal}
            onClose={() => setLocationModal(false)}
            onApply={handleLocationApply}
          />
        </Suspense>
      )}
    </div>
  )
}
