import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilHome, cilLightbulb, cilSun } from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const getDomoticaNav = () => [
  {
    component: CNavItem,
    name: 'Home',
    to: '/domotica/home',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Dispositivos',
    to: '/domotica/devices',
    icon: <CIcon icon={cilLightbulb} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Panel Solar',
    to: '/domotica/solar',
    icon: <CIcon icon={cilSun} customClassName="nav-icon" />,
  },
]

export default getDomoticaNav
