import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilHome, cilLightbulb, cilSun, cilTerminal, cilBook, cilTrash } from '@coreui/icons'
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
  {
    component: CNavItem,
    name: 'Consola Serial',
    to: '/domotica/serial',
    icon: <CIcon icon={cilTerminal} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Diccionario AT',
    to: '/domotica/commands',
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Limpieza',
    to: '/domotica/cleanup',
    icon: <CIcon icon={cilTrash} customClassName="nav-icon" />,
  },
]

export default getDomoticaNav
