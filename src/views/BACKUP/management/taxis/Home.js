import React, { useEffect, useMemo, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CSpinner, CRow, CCol, CFormSelect } from '@coreui/react'
import { CChartBar, CChartDoughnut, CChartLine } from '@coreui/react-chartjs'
import { getSettlements } from 'src/services/providers/firebase/Taxi/taxiSettlements'
import { fetchExpenses } from 'src/services/providers/firebase/Taxi/taxiExpenses'
import { getDrivers } from 'src/services/providers/firebase/Taxi/taxiDrivers'
import { getVehicles } from 'src/services/providers/firebase/Taxi/taxiVehicles'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const CATEGORY_COLORS = [
  '#1971c2', '#e67700', '#2f9e44', '#ae3ec9', '#e03131', '#868e96',
]

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0)

const fmtM = (n) => {
  if (!n) return '$0'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return fmt(n)
}

// ─── KPI Card ───────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, accent }) => (
  <CCard style={{ height: '100%', borderTop: `4px solid ${accent}` }}>
    <CCardBody style={{ padding: '14px 18px' }}>
      <div style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.06em', color: 'var(--cui-secondary-color)', marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginTop: 5 }}>
          {sub}
        </div>
      )}
    </CCardBody>
  </CCard>
)

// ─── Main ────────────────────────────────────────────────────────────────────
const TaxisHome = () => {
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [settlements, setSettlements] = useState([])
  const [expenses, setExpenses] = useState([])
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSettlements(), fetchExpenses(), getDrivers(), getVehicles()])
      .then(([s, e, d, v]) => {
        setSettlements(s)
        setExpenses(e)
        setDrivers(d)
        setVehicles(v)
        setLoading(false)
      })
  }, [])

  const availableYears = useMemo(() => {
    const years = [...new Set([...settlements, ...expenses]
      .map((r) => r.date?.slice(0, 4)).filter(Boolean))].map(Number).sort((a, b) => b - a)
    if (!years.includes(period.year)) years.unshift(period.year)
    return years
  }, [settlements, expenses, period.year])

  // ── Period filter ──────────────────────────────────────────────────────────
  const monthStr = `${period.year}-${String(period.month).padStart(2, '0')}`

  const monthSettlements = useMemo(
    () => settlements.filter((r) => r.date?.startsWith(monthStr)),
    [settlements, monthStr],
  )
  const monthExpenses = useMemo(
    () => expenses.filter((r) => r.date?.startsWith(monthStr)),
    [expenses, monthStr],
  )

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const totalSettled = monthSettlements.reduce((s, r) => s + (r.amount || 0), 0)
  const totalExp = monthExpenses.reduce((s, r) => s + (r.amount || 0), 0)
  const totalExpPending = monthExpenses.filter((r) => !r.paid).reduce((s, r) => s + (r.amount || 0), 0)
  const netBalance = totalSettled - totalExp
  const activeDriverNames = new Set(drivers.filter((d) => d.active !== false).map((d) => d.name))
  const activeDrivers = new Set(monthSettlements.map((r) => r.driver).filter((dr) => dr && activeDriverNames.has(dr))).size
  const activeVehicles = new Set(monthSettlements.map((r) => r.plate).filter(Boolean)).size
  const activeDays = new Set(monthSettlements.map((r) => r.date)).size
  const avgPerDay = activeDays > 0 ? totalSettled / activeDays : 0

  // ── Daily bar data ────────────────────────────────────────────────────────
  const daysInMonth = new Date(period.year, period.month, 0).getDate()
  const dailyLabels = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  )
  const dailySettled = useMemo(() => {
    const map = {}
    monthSettlements.forEach((r) => { if (r.date) map[r.date] = (map[r.date] || 0) + (r.amount || 0) })
    return dailyLabels.map((d) => map[`${monthStr}-${String(d).padStart(2, '0')}`] || 0)
  }, [monthSettlements, dailyLabels, monthStr])
  const dailyExpenses = useMemo(() => {
    const map = {}
    monthExpenses.forEach((r) => { if (r.date) map[r.date] = (map[r.date] || 0) + (r.amount || 0) })
    return dailyLabels.map((d) => map[`${monthStr}-${String(d).padStart(2, '0')}`] || 0)
  }, [monthExpenses, dailyLabels, monthStr])

  // ── By driver ─────────────────────────────────────────────────────────────
  const byDriver = useMemo(() => {
    const map = monthSettlements.reduce((acc, r) => {
      if (!r.driver) return acc
      acc[r.driver] = (acc[r.driver] || 0) + (r.amount || 0)
      return acc
    }, {})
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [monthSettlements])

  // ── By expense category ───────────────────────────────────────────────────
  const byCategory = useMemo(() => {
    const map = {}
    monthExpenses.forEach((e) => {
      if (!e.category) return
      map[e.category] = (map[e.category] || 0) + (e.amount || 0)
    })
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  }, [monthExpenses])

  // ── 6-month trend ─────────────────────────────────────────────────────────
  const last6 = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(period.year, period.month - 1 - (5 - i), 1)
      return { year: d.getFullYear(), month: d.getMonth() + 1, label: MONTHS[d.getMonth()].slice(0, 3) }
    })
  }, [period])

  const { trendSettled, trendExp } = useMemo(() => {
    const settledByMonth = {}
    settlements.forEach((r) => {
      if (r.date) {
        const k = r.date.slice(0, 7)
        settledByMonth[k] = (settledByMonth[k] || 0) + (r.amount || 0)
      }
    })
    const expByMonth = {}
    expenses.forEach((r) => {
      if (r.date) {
        const k = r.date.slice(0, 7)
        expByMonth[k] = (expByMonth[k] || 0) + (r.amount || 0)
      }
    })
    return {
      trendSettled: last6.map(({ year, month }) => settledByMonth[`${year}-${String(month).padStart(2, '0')}`] || 0),
      trendExp: last6.map(({ year, month }) => expByMonth[`${year}-${String(month).padStart(2, '0')}`] || 0),
    }
  }, [settlements, expenses, last6])
  const trendNet = trendSettled.map((v, i) => v - trendExp[i])

  // ── Top vehicles ──────────────────────────────────────────────────────────
  const byVehicle = useMemo(() => {
    const map = monthSettlements.reduce((acc, r) => {
      if (!r.plate) return acc
      acc[r.plate] = (acc[r.plate] || 0) + (r.amount || 0)
      return acc
    }, {})
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [monthSettlements])

  const cardHeader = (title) => (
    <CCardHeader style={{
      background: '#1e3a5f', color: '#fff',
      fontSize: 13, fontWeight: 700, padding: '10px 16px',
    }}>
      {title}
    </CCardHeader>
  )

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      {/* ── Period selector ── */}
      <div className="d-flex align-items-center gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cui-secondary-color)' }}>Periodo</span>
        <CFormSelect
          size="sm"
          style={{ width: 130 }}
          value={period.month}
          onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
        >
          {MONTHS.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
        </CFormSelect>
        <CFormSelect
          size="sm"
          style={{ width: 90 }}
          value={period.year}
          onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
        >
          {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
        </CFormSelect>
        <span style={{ fontSize: 12, color: 'var(--cui-secondary-color)', marginLeft: 8 }}>
          {drivers.length} conductores · {vehicles.length} vehículos registrados
        </span>
      </div>

      {/* ── KPI Cards ── */}
      <CRow className="g-3 mb-4">
        <CCol sm={6} lg={4} xl={2}>
          <KpiCard
            label="Total liquidado"
            value={fmtM(totalSettled)}
            sub={`${monthSettlements.length} liquidaciones`}
            accent="#1e3a5f"
          />
        </CCol>
        <CCol sm={6} lg={4} xl={2}>
          <KpiCard
            label="Total gastos"
            value={fmtM(totalExp)}
            sub={totalExpPending > 0 ? `⏳ ${fmtM(totalExpPending)} pendiente` : `${monthExpenses.length} registros`}
            accent="#e03131"
          />
        </CCol>
        <CCol sm={6} lg={4} xl={2}>
          <KpiCard
            label="Balance neto"
            value={fmtM(netBalance)}
            sub={netBalance >= 0 ? 'Positivo ✓' : 'Negativo ✗'}
            accent={netBalance >= 0 ? '#2f9e44' : '#e03131'}
          />
        </CCol>
        <CCol sm={6} lg={4} xl={2}>
          <KpiCard
            label="Promedio por día"
            value={fmtM(avgPerDay)}
            sub={`${activeDays} días con actividad`}
            accent="#1971c2"
          />
        </CCol>
        <CCol sm={6} lg={4} xl={2}>
          <KpiCard
            label="Conductores activos"
            value={activeDrivers}
            sub={`de ${drivers.length} registrados`}
            accent="#ae3ec9"
          />
        </CCol>
        <CCol sm={6} lg={4} xl={2}>
          <KpiCard
            label="Vehículos activos"
            value={activeVehicles}
            sub={`de ${vehicles.length} registrados`}
            accent="#e67700"
          />
        </CCol>
      </CRow>

      {/* ── Daily chart + expense doughnut ── */}
      <CRow className="g-3 mb-4">
        <CCol lg={8}>
          <CCard style={{ height: '100%' }}>
            {cardHeader(`Liquidaciones por día — ${MONTHS[period.month - 1]} ${period.year}`)}
            <CCardBody>
              <CChartBar
                style={{ maxHeight: 280 }}
                data={{
                  labels: dailyLabels,
                  datasets: [
                    {
                      label: 'Liquidaciones',
                      backgroundColor: 'rgba(30,58,95,0.75)',
                      data: dailySettled,
                      borderRadius: 4,
                    },
                    {
                      label: 'Gastos',
                      backgroundColor: 'rgba(224,49,49,0.65)',
                      data: dailyExpenses,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                    y: {
                      grid: { color: 'rgba(0,0,0,0.06)' },
                      ticks: {
                        font: { size: 10 },
                        callback: (v) => fmtM(v),
                      },
                    },
                  },
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard style={{ height: '100%' }}>
            {cardHeader('Gastos por categoría')}
            <CCardBody className="d-flex flex-column align-items-center justify-content-center">
              {byCategory.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>Sin gastos este periodo</span>
              ) : (
                <>
                  <CChartDoughnut
                    style={{ maxHeight: 200 }}
                    data={{
                      labels: byCategory.map((c) => c.label),
                      datasets: [{
                        data: byCategory.map((c) => c.value),
                        backgroundColor: CATEGORY_COLORS,
                        borderWidth: 2,
                      }],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8 } },
                        tooltip: { callbacks: { label: (ctx) => ` ${fmt(ctx.raw)}` } },
                      },
                      cutout: '62%',
                    }}
                  />
                  <div style={{ width: '100%', marginTop: 12 }}>
                    {byCategory.map((c, i) => (
                      <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0', borderBottom: '1px solid var(--cui-border-color)' }}>
                        <span>
                          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length], marginRight: 6 }} />
                          {c.label}
                        </span>
                        <strong>{fmt(c.value)}</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* ── 6-month trend + by driver ── */}
      <CRow className="g-3 mb-4">
        <CCol lg={7}>
          <CCard style={{ height: '100%' }}>
            {cardHeader('Tendencia últimos 6 meses')}
            <CCardBody>
              <CChartLine
                style={{ maxHeight: 260 }}
                data={{
                  labels: last6.map((m) => m.label),
                  datasets: [
                    {
                      label: 'Liquidaciones',
                      data: trendSettled,
                      borderColor: '#1e3a5f',
                      backgroundColor: 'rgba(30,58,95,0.08)',
                      borderWidth: 2.5,
                      pointBackgroundColor: '#1e3a5f',
                      pointRadius: 5,
                      fill: true,
                      tension: 0.35,
                    },
                    {
                      label: 'Gastos',
                      data: trendExp,
                      borderColor: '#e03131',
                      backgroundColor: 'rgba(224,49,49,0.06)',
                      borderWidth: 2,
                      pointBackgroundColor: '#e03131',
                      pointRadius: 4,
                      fill: true,
                      tension: 0.35,
                    },
                    {
                      label: 'Neto',
                      data: trendNet,
                      borderColor: '#2f9e44',
                      backgroundColor: 'transparent',
                      borderWidth: 2,
                      borderDash: [6, 3],
                      pointBackgroundColor: '#2f9e44',
                      pointRadius: 4,
                      fill: false,
                      tension: 0.35,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                    y: {
                      grid: { color: 'rgba(0,0,0,0.06)' },
                      ticks: { font: { size: 10 }, callback: (v) => fmtM(v) },
                    },
                  },
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={5}>
          <CCard style={{ height: '100%' }}>
            {cardHeader('Top conductores del mes')}
            <CCardBody>
              {byDriver.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>Sin liquidaciones este periodo</span>
              ) : (
                <CChartBar
                  style={{ maxHeight: 260 }}
                  data={{
                    labels: byDriver.map(([name]) => name.split(' ')[0]),
                    datasets: [{
                      label: 'Total',
                      data: byDriver.map(([, v]) => v),
                      backgroundColor: byDriver.map((_, i) =>
                        i === 0 ? '#1e3a5f' : `rgba(30,58,95,${0.7 - i * 0.07})`
                      ),
                      borderRadius: 5,
                    }],
                  }}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: {
                        grid: { color: 'rgba(0,0,0,0.06)' },
                        ticks: { font: { size: 10 }, callback: (v) => fmtM(v) },
                      },
                      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
                    },
                  }}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* ── By vehicle + driver ranking table ── */}
      <CRow className="g-3">
        <CCol lg={5}>
          <CCard style={{ height: '100%' }}>
            {cardHeader('Liquidaciones por vehículo')}
            <CCardBody>
              {byVehicle.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--cui-secondary-color)' }}>Sin datos</span>
              ) : (
                <CChartBar
                  style={{ maxHeight: 240 }}
                  data={{
                    labels: byVehicle.map(([plate]) => plate),
                    datasets: [{
                      label: 'Total',
                      data: byVehicle.map(([, v]) => v),
                      backgroundColor: 'rgba(230, 119, 0, 0.75)',
                      borderRadius: 5,
                    }],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false }, ticks: { font: { size: 11, family: 'monospace' } } },
                      y: {
                        grid: { color: 'rgba(0,0,0,0.06)' },
                        ticks: { font: { size: 10 }, callback: (v) => fmtM(v) },
                      },
                    },
                  }}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={7}>
          <CCard style={{ height: '100%' }}>
            {cardHeader('Ranking de conductores')}
            <CCardBody style={{ padding: 0 }}>
              {byDriver.length === 0 ? (
                <div style={{ padding: 16, fontSize: 13, color: 'var(--cui-secondary-color)' }}>Sin datos</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>#</th>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Conductor</th>
                      <th style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Total</th>
                      <th style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Liq.</th>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Participación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byDriver.map(([name, total], i) => {
                      const count = monthSettlements.filter((r) => r.driver === name).length
                      const pct = totalSettled > 0 ? Math.round((total / totalSettled) * 100) : 0
                      return (
                        <tr key={name} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '9px 16px', color: i === 0 ? '#1e3a5f' : '#94a3b8', fontWeight: 700 }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                          </td>
                          <td style={{ padding: '9px 16px', fontWeight: 600 }}>{name}</td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', fontWeight: 700, color: '#1e3a5f' }}>{fmt(total)}</td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', color: '#64748b' }}>{count}</td>
                          <td style={{ padding: '9px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: '#1e3a5f', borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 11, color: '#64748b', minWidth: 28 }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default TaxisHome
