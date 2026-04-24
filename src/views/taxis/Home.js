import React, { useEffect, useMemo, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CRow,
  CCol,
  CFormSelect,
} from '@coreui/react'
import { CChartBar, CChartDoughnut, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import {
  cilCash,
  cilBurn,
  cilChartLine,
  cilCalendar,
  cilPeople,
  cilCarAlt,
  cilBarChart,
  cilChartPie,
  cilArrowTop,
  cilArrowBottom,
  cilStar,
} from '@coreui/icons'
import { getSettlements } from 'src/services/firebase/taxi/taxiSettlements'
import { fetchExpenses } from 'src/services/firebase/taxi/taxiExpenses'
import { getDrivers } from 'src/services/firebase/taxi/taxiDrivers'
import { getVehicles } from 'src/services/firebase/taxi/taxiVehicles'
import './Home.scss'

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const CATEGORY_COLORS = ['#1971c2', '#e67700', '#2f9e44', '#ae3ec9', '#e03131', '#868e96']

const AVATAR_COLORS = [
  '#1e3a5f',
  '#e67700',
  '#2f9e44',
  '#ae3ec9',
  '#e03131',
  '#1971c2',
  '#0c8599',
  '#c92a2a',
]

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n ?? 0)

const fmtM = (n) => {
  if (!n) return '$0'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return fmt(n)
}

const pctChange = (curr, prev) => (prev > 0 ? ((curr - prev) / prev) * 100 : null)

const Delta = ({ value, invert = false }) => {
  if (value === null || value === undefined) return null
  const positive = invert ? value < 0 : value > 0
  const icon = value >= 0 ? cilArrowTop : cilArrowBottom
  return (
    <span className={`kpi-delta kpi-delta--${positive ? 'pos' : 'neg'}`}>
      <CIcon icon={icon} className="kpi-delta__icon" />
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

const KpiCard = ({ label, value, sub, accent, icon, delta, deltaInvert }) => (
  <CCard className="kpi-card" style={{ '--kpi-accent': accent }}>
    <CCardBody className="kpi-card__body">
      <div className="kpi-card__top">
        <span className="kpi-card__label">{label}</span>
        {icon && (
          <div className="kpi-card__icon-wrap">
            <CIcon icon={icon} className="kpi-card__icon" />
          </div>
        )}
      </div>
      <div className="kpi-card__value">{value}</div>
      <div className="kpi-card__bottom">
        {sub && <span className="kpi-card__sub">{sub}</span>}
        <Delta value={delta} invert={deltaInvert} />
      </div>
    </CCardBody>
  </CCard>
)

const DriverAvatar = ({ name, rank }) => (
  <div
    className="driver-avatar"
    style={{ background: AVATAR_COLORS[rank % AVATAR_COLORS.length] }}
  >
    {name ? name[0].toUpperCase() : '?'}
  </div>
)

const TaxisHome = () => {
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [settlements, setSettlements] = useState([])
  const [expenses, setExpenses] = useState([])
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSettlements(), fetchExpenses(), getDrivers(), getVehicles()]).then(
      ([s, e, d, v]) => {
        setSettlements(s)
        setExpenses(e)
        setDrivers(d)
        setVehicles(v)
        setLoading(false)
      },
    )
  }, [])

  const availableYears = useMemo(() => {
    const years = [
      ...new Set([...settlements, ...expenses].map((r) => r.date?.slice(0, 4)).filter(Boolean)),
    ]
      .map(Number)
      .sort((a, b) => b - a)
    if (!years.includes(period.year)) years.unshift(period.year)
    return years
  }, [settlements, expenses, period.year])

  const monthStr = `${period.year}-${String(period.month).padStart(2, '0')}`

  const prevMonthStr = useMemo(() => {
    const m = period.month === 1 ? 12 : period.month - 1
    const y = period.month === 1 ? period.year - 1 : period.year
    return `${y}-${String(m).padStart(2, '0')}`
  }, [period])

  const monthSettlements = useMemo(
    () => settlements.filter((r) => r.date?.startsWith(monthStr)),
    [settlements, monthStr],
  )
  const monthExpenses = useMemo(
    () => expenses.filter((r) => r.date?.startsWith(monthStr)),
    [expenses, monthStr],
  )
  const prevSettlements = useMemo(
    () => settlements.filter((r) => r.date?.startsWith(prevMonthStr)),
    [settlements, prevMonthStr],
  )
  const prevExpenses = useMemo(
    () => expenses.filter((r) => r.date?.startsWith(prevMonthStr)),
    [expenses, prevMonthStr],
  )

  const totalSettled = monthSettlements.reduce((s, r) => s + (r.amount || 0), 0)
  const totalExp = monthExpenses.reduce((s, r) => s + (r.amount || 0), 0)
  const totalExpPending = monthExpenses
    .filter((r) => !r.paid)
    .reduce((s, r) => s + (r.amount || 0), 0)
  const netBalance = totalSettled - totalExp

  const prevTotalSettled = prevSettlements.reduce((s, r) => s + (r.amount || 0), 0)
  const prevTotalExp = prevExpenses.reduce((s, r) => s + (r.amount || 0), 0)
  const prevNetBalance = prevTotalSettled - prevTotalExp

  const activeDriverNames = new Set(drivers.filter((d) => d.active !== false).map((d) => d.name))
  const activeDrivers = new Set(
    monthSettlements.map((r) => r.driver).filter((dr) => dr && activeDriverNames.has(dr)),
  ).size
  const activeVehicles = new Set(monthSettlements.map((r) => r.plate).filter(Boolean)).size
  const activeDays = new Set(monthSettlements.map((r) => r.date)).size
  const avgPerDay = activeDays > 0 ? totalSettled / activeDays : 0

  const prevActiveDays = new Set(prevSettlements.map((r) => r.date)).size
  const prevAvgPerDay = prevActiveDays > 0 ? prevTotalSettled / prevActiveDays : 0

  const daysInMonth = new Date(period.year, period.month, 0).getDate()
  const dailyLabels = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  )
  const dailySettled = useMemo(() => {
    const map = {}
    monthSettlements.forEach((r) => {
      if (r.date) map[r.date] = (map[r.date] || 0) + (r.amount || 0)
    })
    return dailyLabels.map((d) => map[`${monthStr}-${String(d).padStart(2, '0')}`] || 0)
  }, [monthSettlements, dailyLabels, monthStr])
  const dailyExpenses = useMemo(() => {
    const map = {}
    monthExpenses.forEach((r) => {
      if (r.date) map[r.date] = (map[r.date] || 0) + (r.amount || 0)
    })
    return dailyLabels.map((d) => map[`${monthStr}-${String(d).padStart(2, '0')}`] || 0)
  }, [monthExpenses, dailyLabels, monthStr])

  const byDriver = useMemo(() => {
    const map = monthSettlements.reduce((acc, r) => {
      if (!r.driver) return acc
      acc[r.driver] = (acc[r.driver] || 0) + (r.amount || 0)
      return acc
    }, {})
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [monthSettlements])

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

  const last6 = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(period.year, period.month - 1 - (5 - i), 1)
      return {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: MONTHS[d.getMonth()].slice(0, 3),
      }
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
      trendSettled: last6.map(
        ({ year, month }) => settledByMonth[`${year}-${String(month).padStart(2, '0')}`] || 0,
      ),
      trendExp: last6.map(
        ({ year, month }) => expByMonth[`${year}-${String(month).padStart(2, '0')}`] || 0,
      ),
    }
  }, [settlements, expenses, last6])
  const trendNet = trendSettled.map((v, i) => v - trendExp[i])

  const byVehicle = useMemo(() => {
    const map = monthSettlements.reduce((acc, r) => {
      if (!r.plate) return acc
      acc[r.plate] = (acc[r.plate] || 0) + (r.amount || 0)
      return acc
    }, {})
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [monthSettlements])

  const cardHeader = (title, icon) => (
    <CCardHeader className="home-card-header">
      {icon && <CIcon icon={icon} className="home-card-header__icon" />}
      {title}
    </CCardHeader>
  )

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center taxis-home__loader">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      <div className="d-flex align-items-center gap-2 mb-4 taxis-home__period-bar">
        <span className="taxis-home__period-label">Periodo</span>
        <CFormSelect
          size="sm"
          className="taxis-home__period-select-month"
          value={period.month}
          onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
        >
          {MONTHS.map((name, i) => (
            <option key={i + 1} value={i + 1}>
              {name}
            </option>
          ))}
        </CFormSelect>
        <CFormSelect
          size="sm"
          className="taxis-home__period-select-year"
          value={period.year}
          onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </CFormSelect>
        <div className="period-stats-pill">
          <span className="period-stats-pill__item">
            <CIcon icon={cilPeople} className="period-stats-pill__icon" />
            {drivers.length} conductores
          </span>
          <span className="period-stats-pill__sep" />
          <span className="period-stats-pill__item">
            <CIcon icon={cilCarAlt} className="period-stats-pill__icon" />
            {vehicles.length} vehículos
          </span>
        </div>
      </div>

      <CRow className="g-3 mb-4">
        <CCol sm={6} lg={4} xl={2}>
          <KpiCard
            label="Total liquidado"
            value={fmtM(totalSettled)}
            sub={`${monthSettlements.length} liquidaciones`}
            accent="#1e3a5f"
            icon={cilCash}
            delta={pctChange(totalSettled, prevTotalSettled)}
          />
        </CCol>
        <CCol sm={6} lg={4} xl={2}>
          <KpiCard
            label="Total gastos"
            value={fmtM(totalExp)}
            sub={
              totalExpPending > 0
                ? `⏳ ${fmtM(totalExpPending)} pendiente`
                : `${monthExpenses.length} registros`
            }
            accent="#e03131"
            icon={cilBurn}
            delta={pctChange(totalExp, prevTotalExp)}
            deltaInvert
          />
        </CCol>
        <CCol sm={6} lg={4} xl={2}>
          <KpiCard
            label="Balance neto"
            value={fmtM(netBalance)}
            sub={netBalance >= 0 ? 'Positivo ✓' : 'Negativo ✗'}
            accent={netBalance >= 0 ? '#2f9e44' : '#e03131'}
            icon={cilChartLine}
            delta={pctChange(netBalance, prevNetBalance)}
          />
        </CCol>
        <CCol sm={6} lg={4} xl={2}>
          <KpiCard
            label="Promedio por día"
            value={fmtM(avgPerDay)}
            sub={`${activeDays} días con actividad`}
            accent="#1971c2"
            icon={cilCalendar}
            delta={pctChange(avgPerDay, prevAvgPerDay)}
          />
        </CCol>
        <CCol sm={6} lg={4} xl={2}>
          <KpiCard
            label="Conductores activos"
            value={activeDrivers}
            sub={`de ${drivers.length} registrados`}
            accent="#ae3ec9"
            icon={cilPeople}
          />
        </CCol>
        <CCol sm={6} lg={4} xl={2}>
          <KpiCard
            label="Vehículos activos"
            value={activeVehicles}
            sub={`de ${vehicles.length} registrados`}
            accent="#e67700"
            icon={cilCarAlt}
          />
        </CCol>
      </CRow>

      <CRow className="g-3 mb-4">
        <CCol lg={8}>
          <CCard className="taxis-home__card">
            {cardHeader(
              `Liquidaciones por día — ${MONTHS[period.month - 1]} ${period.year}`,
              cilBarChart,
            )}
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
                      order: 1,
                    },
                    {
                      label: 'Gastos',
                      backgroundColor: 'rgba(224,49,49,0.65)',
                      data: dailyExpenses,
                      borderRadius: 4,
                      order: 1,
                    },
                    {
                      type: 'line',
                      label: 'Promedio',
                      data: Array(daysInMonth).fill(avgPerDay),
                      borderColor: 'rgba(25,113,194,0.6)',
                      borderWidth: 1.5,
                      borderDash: [6, 4],
                      pointRadius: 0,
                      fill: false,
                      tension: 0,
                      order: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: { font: { size: 11 } },
                    },
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
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
        <CCol lg={4}>
          <CCard className="taxis-home__card">
            {cardHeader('Gastos por categoría', cilChartPie)}
            <CCardBody className="d-flex flex-column align-items-center justify-content-center">
              {byCategory.length === 0 ? (
                <span className="taxis-home__empty">Sin gastos este periodo</span>
              ) : (
                <>
                  <CChartDoughnut
                    style={{ maxHeight: 200 }}
                    data={{
                      labels: byCategory.map((c) => c.label),
                      datasets: [
                        {
                          data: byCategory.map((c) => c.value),
                          backgroundColor: CATEGORY_COLORS,
                          borderWidth: 2,
                        },
                      ],
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
                  <div className="category-legend">
                    {byCategory.map((c, i) => (
                      <div key={c.label} className="category-legend__row">
                        <span>
                          <span
                            className="category-legend__dot"
                            style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                          />
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

      <CRow className="g-3 mb-4">
        <CCol lg={7}>
          <CCard className="taxis-home__card">
            {cardHeader('Tendencia últimos 6 meses', cilChartLine)}
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
          <CCard className="taxis-home__card">
            {cardHeader('Top conductores del mes', cilStar)}
            <CCardBody>
              {byDriver.length === 0 ? (
                <span className="taxis-home__empty">Sin liquidaciones este periodo</span>
              ) : (
                <CChartBar
                  style={{ maxHeight: 260 }}
                  data={{
                    labels: byDriver.map(([name]) => name.split(' ')[0]),
                    datasets: [
                      {
                        label: 'Total',
                        data: byDriver.map(([, v]) => v),
                        backgroundColor: byDriver.map((_, i) =>
                          i === 0 ? '#1e3a5f' : `rgba(30,58,95,${0.7 - i * 0.07})`,
                        ),
                        borderRadius: 5,
                      },
                    ],
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

      <CRow className="g-3">
        <CCol lg={5}>
          <CCard className="taxis-home__card">
            {cardHeader('Liquidaciones por vehículo', cilCarAlt)}
            <CCardBody>
              {byVehicle.length === 0 ? (
                <span className="taxis-home__empty">Sin datos</span>
              ) : (
                <CChartBar
                  style={{ maxHeight: 240 }}
                  data={{
                    labels: byVehicle.map(([plate]) => plate),
                    datasets: [
                      {
                        label: 'Total',
                        data: byVehicle.map(([, v]) => v),
                        backgroundColor: 'rgba(230, 119, 0, 0.75)',
                        borderRadius: 5,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { font: { size: 11, family: 'monospace' } },
                      },
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
          <CCard className="taxis-home__card">
            {cardHeader('Ranking de conductores', cilPeople)}
            <CCardBody className="taxis-home__card-body--flush">
              {byDriver.length === 0 ? (
                <div className="taxis-home__empty--padded">Sin datos</div>
              ) : (
                <table className="driver-ranking">
                  <thead>
                    <tr className="driver-ranking__head-row">
                      <th className="driver-ranking__th">#</th>
                      <th className="driver-ranking__th">Conductor</th>
                      <th className="driver-ranking__th driver-ranking__th--right">Total</th>
                      <th className="driver-ranking__th driver-ranking__th--right">Liq.</th>
                      <th className="driver-ranking__th">Participación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byDriver.map(([name, total], i) => {
                      const count = monthSettlements.filter((r) => r.driver === name).length
                      const pct = totalSettled > 0 ? Math.round((total / totalSettled) * 100) : 0
                      return (
                        <tr key={name} className="driver-ranking__row">
                          <td className="driver-ranking__rank">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                          </td>
                          <td className="driver-ranking__name-cell">
                            <DriverAvatar name={name} rank={i} />
                            <span className="driver-ranking__name">{name}</span>
                          </td>
                          <td className="driver-ranking__total">{fmt(total)}</td>
                          <td className="driver-ranking__count">{count}</td>
                          <td className="driver-ranking__share">
                            <div className="driver-ranking__bar-wrap">
                              <div className="driver-ranking__bar-track">
                                <div
                                  className="driver-ranking__bar-fill"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="driver-ranking__pct">{pct}%</span>
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
