import React from 'react'
import { CTooltip } from '@coreui/react'

const InfoTip = ({ content }) => (
  <CTooltip content={content} placement="top">
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 14,
        height: 14,
        borderRadius: '50%',
        border: '1.5px solid #adb5bd',
        color: '#adb5bd',
        fontSize: 9,
        fontWeight: 700,
        cursor: 'help',
        marginLeft: 5,
        verticalAlign: 'middle',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      !
    </span>
  </CTooltip>
)

const StatCard = ({ label, value, color, tip, children, onClick, fade }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--cui-card-bg, #fff)',
      borderRadius: 10,
      border: '1px solid var(--cui-border-color, #dee2e6)',
      borderLeft: `4px solid ${color}`,
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      cursor: onClick ? 'pointer' : 'default',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      height: '100%',
      transition: 'box-shadow 0.18s, transform 0.18s',
      opacity: fade ? 0.5 : 1,
    }}
    onMouseEnter={
      onClick
        ? (e) => {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }
        : undefined
    }
    onMouseLeave={
      onClick
        ? (e) => {
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
            e.currentTarget.style.transform = 'translateY(0)'
          }
        : undefined
    }
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--cui-secondary-color)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      {label}
      {tip && <InfoTip content={tip} />}
    </div>
    {value !== undefined && (
      <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1.15 }}>{value}</div>
    )}
    {children}
  </div>
)

export { InfoTip }
export default StatCard
