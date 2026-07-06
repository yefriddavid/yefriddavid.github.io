import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './Home.scss'

const SHORTCUTS = [
  {
    key: 'tasks',
    label: 'Tareas',
    description: 'Pendientes y seguimiento',
    path: '/miscelanea/tasks',
    icon: '✅',
    color: '#0f766e',
    bg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
    border: '#5eead4',
    shadow: 'rgba(15,118,110,0.18)',
  },
  {
    key: 'notes',
    label: 'Notas',
    description: 'Apuntes y recordatorios',
    path: '/miscelanea/notes',
    icon: '📝',
    color: '#be185d',
    bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    border: '#f9a8d4',
    shadow: 'rgba(190,24,93,0.18)',
  },
  {
    key: 'account-status',
    label: 'Estado de Cuentas',
    description: 'Saldos y comprobantes',
    path: '/finance/management/account-status',
    icon: '📊',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
    border: '#c4b5fd',
    shadow: 'rgba(124,58,237,0.18)',
  },
  {
    key: 'finance',
    label: 'Finance',
    description: 'Flujo de caja · cuentas',
    path: '/finance/dashboard',
    icon: '💳',
    color: '#1e3a5f',
    bg: 'linear-gradient(135deg, #e8f0fb 0%, #d0e4f7 100%)',
    border: '#93c5fd',
    shadow: 'rgba(30,58,95,0.18)',
  },
  {
    key: 'taxis',
    label: 'Taxis',
    description: 'Liquidaciones · conductores',
    path: '/taxis/home',
    icon: '🚕',
    color: '#b8780a',
    bg: 'linear-gradient(135deg, #fff9db 0%, #fff3bf 100%)',
    border: '#ffe066',
    shadow: 'rgba(184,120,10,0.18)',
  },
  {
    key: 'transactions',
    label: 'Transacciones',
    description: 'Movimientos de caja',
    path: '/finance/management/transactions',
    icon: '🔄',
    color: '#0e7490',
    bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
    border: '#67e8f9',
    shadow: 'rgba(14,116,144,0.18)',
  },
  {
    key: 'domotica',
    label: 'Domótica',
    description: 'Dispositivos · hogar',
    path: '/domotica/home',
    icon: '🏠',
    color: '#2d5a4e',
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border: '#86efac',
    shadow: 'rgba(45,90,78,0.18)',
  },
]

const fmtTime = () =>
  new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

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
      className="home-shortcut"
      onClick={() => navigate(item.path)}
      style={{
        background: item.bg,
        border: `1.5px solid ${item.border}`,
        '--card-color': item.color,
        '--card-shadow': item.shadow,
      }}
    >
      <div className="home-shortcut__icon">{item.icon}</div>
      <div className="home-shortcut__info">
        <div className="home-shortcut__label" style={{ color: item.color }}>
          {item.label}
        </div>
        <div className="home-shortcut__desc">{item.description}</div>
      </div>
      <div className="home-shortcut__bar" style={{ background: item.color }} />
    </div>
  )
}

export default function Home() {
  const username = useSelector((s) => s.profile.data?.name || s.profile.data?.username || null)
  const tasks = useSelector((s) => s.task?.data ?? [])
  const pendingCount = tasks.filter((t) => !t.done).length
  const [time, setTime] = useState(fmtTime())

  useEffect(() => {
    const interval = setInterval(() => setTime(fmtTime()), 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="home-view">
      <div className="home-view__header">
        <div>
          <div className="home-view__greeting">
            {greeting()}
            {username ? `, ${username}` : ''} 👋
          </div>
          <div className="home-view__title">Mi Admin</div>
          <div className="home-view__subtitle">Accesos rápidos</div>
        </div>
        <div className="home-view__right">
          <div className="home-view__clock">{time}</div>
          <div className="home-view__date">{fmtDate()}</div>
          {pendingCount > 0 && (
            <div className="home-view__tasks-badge">
              {pendingCount} tarea{pendingCount !== 1 ? 's' : ''} pendiente
              {pendingCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="home-view__section-label">Accesos directos</div>

      <div className="home-view__grid">
        {SHORTCUTS.map((item) => (
          <ShortcutCard key={item.key} item={item} />
        ))}
      </div>
    </div>
  )
}
