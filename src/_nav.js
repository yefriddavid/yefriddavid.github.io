import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilCalculator,
  cilChartPie,
  cilNotes,
  cilPeople,
  cilSpeedometer,
  cilTask,
  cilUser,
  cilCarAlt,
  cilMoney,
  cilDescription,
  cilSettings,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const getNav = (t) => [
  {
    component: CNavItem,
    name: t('nav.dashboard'),
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: t('nav.management'),
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: t('nav.accounts'),
        to: '/management/accounts',
        icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t('nav.payments'),
        to: '/management/payments',
        icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
      },
    ],
  },
  {
    component: CNavGroup,
    name: t('nav.tools'),
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: t('nav.increaseDecrease'),
        to: '/tools/adjustments',
        icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t('nav.visits'),
        to: '/tools/visits',
        icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
      },
    ],
  },
  {
    component: CNavGroup,
    name: t('nav.taxiManagement'),
    icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: t('nav.taxiHome'),
        to: '/management/taxis/home',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t('nav.liquidaciones'),
        to: '/management/taxis/settlements',
        icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t('nav.conductores'),
        to: '/management/taxis/drivers',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t('nav.vehiculos'),
        to: '/management/taxis/vehicles',
        icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t('nav.taxiExpenses'),
        to: '/management/taxis/expenses',
        icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t('nav.taxiResumen'),
        to: '/management/taxis/summary',
        icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t('nav.partners'),
        to: '/management/taxis/partners',
        icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t('nav.distributions'),
        to: '/management/taxis/profit-sharing',
        icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
      },
    ],
  },
]

export default getNav
