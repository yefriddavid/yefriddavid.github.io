import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './Dashboard.scss'

const SHORTCUTS = [
  {
    key: 'transactions',
    label: 'Transacciones',
    description: 'Registro de movimientos de caja',
    path: '/cash_flow/management/transactions',
    icon: '💳',
    color: '#0e7490',
    bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
    border: '#67e8f9',
    shadow: 'rgba(14,116,144,0.18)',
  },
  {
    key: 'accounts',
    label: 'Cuentas',
    description: 'Maestro de cuentas contables',
    path: '/cash_flow/management/accounts-master',
    icon: '📒',
    color: '#1e3a5f',
    bg: 'linear-gradient(135deg, #e8f0fb 0%, #d0e4f7 100%)',
    border: '#93c5fd',
    shadow: 'rgba(30,58,95,0.18)',
  },
  {
    key: 'account-status',
    label: 'Estado de cuentas',
    description: 'Saldos y movimientos por cuenta',
    path: '/cash_flow/management/account-status',
    icon: '📊',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
    border: '#c4b5fd',
    shadow: 'rgba(124,58,237,0.18)',
  },
  {
    key: 'projects',
    label: 'Proyectos',
    description: 'Seguimiento de inversiones',
    path: '/cash_flow/projects',
    icon: '💡',
    color: '#b8780a',
    bg: 'linear-gradient(135deg, #fff9db 0%, #fff3bf 100%)',
    border: '#ffe066',
    shadow: 'rgba(184,120,10,0.18)',
  },
  {
    key: 'assets',
    label: 'Activos',
    description: 'Control de bienes y capital',
    path: '/cash_flow/assets',
    icon: '📈',
    color: '#2b8a3e',
    bg: 'linear-gradient(135deg, #ebfbee 0%, #d3f9d8 100%)',
    border: '#b2f2bb',
    shadow: 'rgba(43,138,62,0.18)',
  },
  {
    key: 'eggs',
    label: 'Huevos',
    description: 'Diversificación de ingresos',
    path: '/cash_flow/eggs',
    icon: '🥚',
    color: '#e67e22',
    bg: 'linear-gradient(135deg, #fff4e6 0%, #ffe8cc 100%)',
    border: '#ffd8a8',
    shadow: 'rgba(230,126,34,0.18)',
  },
  {
    key: 'adjustments',
    label: 'Ajustes',
    description: 'Aumento y disminución de capital',
    path: '/cash_flow/tools/adjustments',
    icon: '⚖️',
    color: '#364fc7',
    bg: 'linear-gradient(135deg, #edf2ff 0%, #dbe4ff 100%)',
    border: '#bac8ff',
    shadow: 'rgba(54,79,199,0.18)',
  },
  {
    key: 'visits',
    label: 'Visitas',
    description: 'Gestión de relaciones y CRM',
    path: '/cash_flow/tools/visits',
    icon: '👥',
    color: '#c92a2a',
    bg: 'linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%)',
    border: '#ffc9c9',
    shadow: 'rgba(201,42,42,0.18)',
  },
]

const fmtDate = () => {
  const now = new Date()
  const day = now.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return day.charAt(0).toUpperCase() + day.slice(1)
}

const fmtTime = () => new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

const ShortcutCard = ({ item }) => {
  const navigate = useNavigate()

  return (
    <div
      className="shortcut-card"
      onClick={() => navigate(item.path)}
      style={{
        background: item.bg,
        border: `1.5px solid ${item.border}`,
        '--card-color': item.color,
        '--card-shadow': item.shadow,
      }}
    >
      <div className="shortcut-card__icon">{item.icon}</div>
      <div className="shortcut-card__info">
        <div className="shortcut-card__label" style={{ color: item.color }}>{item.label}</div>
        <div className="shortcut-card__description">{item.description}</div>
      </div>
      <div className="shortcut-card__bar" style={{ background: item.color }} />
    </div>
  )
}

const Dashboard = () => {
  const username = useSelector((s) => s.profile.data?.name || s.profile.data?.username || null)
  const [time, setTime] = useState(fmtTime())

  useEffect(() => {
    const interval = setInterval(() => setTime(fmtTime()), 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <div className="dashboard__greeting">
            {greeting()}{username ? `, ${username}` : ''} 👋
          </div>
          <div className="dashboard__title">CashFlow</div>
          <div className="dashboard__subtitle">Panel de gestión · Accesos rápidos</div>
        </div>
        <div className="dashboard__time">
          <div className="dashboard__clock">{time}</div>
          <div className="dashboard__date">{fmtDate()}</div>
        </div>
      </div>

      <div className="dashboard__section-label">Accesos directos</div>

      <div className="dashboard__grid">
        {SHORTCUTS.map((item) => (
          <ShortcutCard key={item.key} item={item} />
        ))}
      </div>
    </div>
  )
}

export default Dashboard
