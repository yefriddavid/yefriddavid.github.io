import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilSettings,
  cilBell,
  cilGroup,
  cilBug,
  cilList,
  cilSpeedometer,
  cilEnvelopeClosed,
  cilTerminal,
  cilShareBoxed,
} from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const getSystemNav = () => [
  {
    component: CNavItem,
    name: 'Usuarios',
    to: '/system/users',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Tenants',
    to: '/system/tenants',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Push Notifications',
    to: '/system/push-subscribers',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Visitas',
    to: '/system/visits',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Mensajes',
    to: '/system/messages',
    icon: <CIcon icon={cilEnvelopeClosed} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Configuración',
    to: '/system/settings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Error Monitor',
    to: '/system/error-logs',
    icon: <CIcon icon={cilBug} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Audit Log',
    to: '/system/audit-logs',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Performance',
    to: '/system/perf-logs',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Programas',
    to: '/system/programs',
    icon: <CIcon icon={cilTerminal} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Share Debug',
    to: '/system/share-debug',
    icon: <CIcon icon={cilShareBoxed} customClassName="nav-icon" />,
  },
]

export default getSystemNav
