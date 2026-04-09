import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

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
  const day = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return day.charAt(0).toUpperCase() + day.slice(1)
}

const fmtTime = () =>
  new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

const ShortcutCard = ({ item }) => {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => navigate(item.path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: item.bg,
        border: `1.5px solid ${hovered ? item.color : item.border}`,
        borderRadius: 16,
        padding: '28px 20px 24px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        boxShadow: hovered
          ? `0 12px 32px ${item.shadow}, 0 2px 8px rgba(0,0,0,0.06)`
          : `0 2px 8px rgba(0,0,0,0.04)`,
        transform: hovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          fontSize: 42,
          lineHeight: 1,
          filter: hovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'none',
          transition: 'filter 0.2s',
        }}
      >
        {item.icon}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: item.color,
            marginBottom: 4,
            letterSpacing: '-0.01em',
          }}
        >
          {item.label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#64748b',
            lineHeight: 1.4,
          }}
        >
          {item.description}
        </div>
      </div>
      <div
        style={{
          width: 28,
          height: 2,
          borderRadius: 2,
          background: item.color,
          opacity: hovered ? 1 : 0.3,
          transition: 'opacity 0.2s, width 0.2s',
          ...(hovered && { width: 44 }),
        }}
      />
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
    <div style={{ padding: '8px 4px 32px' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5282 100%)',
          borderRadius: 16,
          padding: '28px 32px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 4px 24px rgba(30,58,95,0.18)',
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4, fontWeight: 500 }}>
            {greeting()}{username ? `, ${username}` : ''} 👋
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Mi Admin
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
            Panel de gestión · Accesos rápidos
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {time}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
            {fmtDate()}
          </div>
        </div>
      </div>

      {/* Section label */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#94a3b8',
          marginBottom: 14,
          paddingLeft: 2,
        }}
      >
        Accesos directos
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 14,
        }}
      >
        {SHORTCUTS.map((item) => (
          <ShortcutCard key={item.key} item={item} />
        ))}
      </div>
    </div>
  )
}

export default Dashboard
