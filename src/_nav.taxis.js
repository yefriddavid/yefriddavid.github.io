import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilHome,
  cilCalendarCheck,
  cilWarning,
  cilLocationPin,
  cilUser,
  cilCarAlt,
  cilCash,
  cilBarChart,
  cilPeople,
  cilTransfer,
} from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const getTaxisNav = (t) => [
  {
    component: CNavItem,
    name: t('nav.taxiHome'),
    to: '/taxis/home',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: t('nav.liquidaciones'),
    to: '/taxis/settlements',
    icon: <CIcon icon={cilCalendarCheck} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Operaciones',
    to: '/taxis/operations',
    icon: <CIcon icon={cilWarning} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Mapa/Ubicación',
    to: '/taxis/map',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Ruta de Vehículo',
    to: '/taxis/route-history',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: t('nav.conductores'),
    to: '/taxis/drivers',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: t('nav.vehiculos'),
    to: '/taxis/vehicles',
    icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: t('nav.taxiExpenses'),
    to: '/taxis/expenses',
    icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: t('nav.taxiResumen'),
    to: '/taxis/summary',
    icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: t('nav.partners'),
    to: '/taxis/partners',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: t('nav.distributions'),
    to: '/taxis/profit-sharing',
    icon: <CIcon icon={cilTransfer} customClassName="nav-icon" />,
  },
]

export default getTaxisNav
