import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './Dashboard.scss'

const SHORTCUTS = [
  {
    key: 'settlements',
    label: 'Liquidaciones',
    description: 'Auditoría diaria de turnos',
    path: '/taxis/settlements',
    icon: '🚕',
    color: '#2f9e44',
    bg: 'linear-gradient(135deg, #ebfbee 0%, #d3f9d8 100%)',
    border: '#b2f2bb',
    shadow: 'rgba(47,158,68,0.18)',
  },
  {
    key: 'accounts',
    label: 'Cuentas',
    description: 'Maestro de cuentas contables',
    path: '/cash_flow/management/accounts',
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
    key: 'expenses',
    label: 'Gastos',
    description: 'Gastos operativos de la flota',
    path: '/taxis/expenses',
    icon: '💸',
    color: '#c05621',
    bg: 'linear-gradient(135deg, #fff8ed 0%, #feebc8 100%)',
    border: '#fbd38d',
    shadow: 'rgba(192,86,33,0.18)',
  },
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
    key: 'payments',
    label: 'Pagos',
    description: 'Comprobantes y vouchers de pago',
    path: '/cash_flow/management/payments',
    icon: '🧾',
    color: '#be185d',
    bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    border: '#f9a8d4',
    shadow: 'rgba(190,24,93,0.18)',
  },
  {
    key: 'drivers',
    label: 'Conductores',
    description: 'Gestión de conductores activos',
    path: '/taxis/drivers',
    icon: '👤',
    color: '#0f766e',
    bg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
    border: '#99f6e4',
    shadow: 'rgba(15,118,110,0.18)',
  },
  {
    key: 'vehicles',
    label: 'Vehículos',
    description: 'Flota de taxis registrados',
    path: '/taxis/vehicles',
    icon: '🚗',
    color: '#4338ca',
    bg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    border: '#a5b4fc',
    shadow: 'rgba(67,56,202,0.18)',
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
          <div className="dashboard__title">Mi Admin</div>
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
