import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilSettings, cilBell, cilGroup } from '@coreui/icons'
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
    name: 'Configuración',
    to: '/system/settings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
]

export default getSystemNav
