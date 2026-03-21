import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilCalculator,
  cilChartPie,
  cilNotes,
  cilPeople,
  cilSpeedometer,
  cilTask,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const getNav = (t) => [
  {
    component: CNavItem,
    name: t('nav.dashboard'),
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
  {
    component: CNavTitle,
    name: t('nav.management'),
  },
  {
    component: CNavItem,
    name: t('nav.accounts'),
    to: '/managment/accounts',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: t('nav.payments'),
    to: '/managment/payments',
    icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: t('nav.taxis'),
    to: '/managment/taxis',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: t('nav.movements'),
  },
  {
    component: CNavItem,
    name: t('nav.accounts'),
    to: '/movements/accounts',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: t('nav.tools'),
  },
  {
    component: CNavItem,
    name: t('nav.increaseDecrease'),
    to: '/tools/increase-decrease',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: t('nav.visits'),
    to: '/tools/visits',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
]

export default getNav
