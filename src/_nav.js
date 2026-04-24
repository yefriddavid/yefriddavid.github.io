import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBalanceScale,
  cilBarChart,
  cilBasket,
  cilBell,
  cilBook,
  cilCalendarCheck,
  cilCarAlt,
  cilCash,
  cilCheck,
  cilFile,
  cilFolder,
  cilGroup,
  cilHome,
  cilLightbulb,
  cilLocationPin,
  cilChart,
  cilPeople,
  cilSettings,
  cilSpeedometer,
  cilSwapHorizontal,
  cilTransfer,
  cilUser,
  cilWarning,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

// role: 'superAdmin' | 'manager' | 'conductor' | null (null = no profile, show all for backward compat)
const getNav = (t, role) => {
  const isSuperAdmin = !role || role === 'superAdmin'
  const isManager = !role || role === 'manager' || role === 'superAdmin'
  const items = []

  items.push({
    component: CNavItem,
    name: t('nav.dashboard'),
    to: '/cash_flow/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  })

  if (isManager) {
    items.push({
      component: CNavGroup,
      // name: t('nav.management'),
      name: 'Contabilidad',
      icon: <CIcon icon={cilFolder} customClassName="nav-icon" />,
      items: [
        /*{
          component: CNavItem,
          name: t('nav.accounts'),
          to: '/cash_flow/management/accounts',
          icon: <CIcon icon={cilList} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: t('nav.payments'),
          to: '/cash_flow/management/payments',
          icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
        },*/
        {
          component: CNavItem,
          name: 'Transacciones',
          to: '/cash_flow/management/transactions',
          icon: <CIcon icon={cilSwapHorizontal} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Maestro de Cuentas',
          to: '/cash_flow/management/accounts-master',
          icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Estado de Cuentas',
          to: '/cash_flow/management/account-status',
          icon: <CIcon icon={cilCheck} customClassName="nav-icon" />,
        },
      ],
    })
  }

  if (isManager) {
    items.push({
      component: CNavGroup,
      name: 'Trade',
      icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: t('nav.increaseDecrease'),
          to: '/cash_flow/tools/adjustments',
          icon: <CIcon icon={cilBalanceScale} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: t('nav.visits'),
          to: '/cash_flow/tools/visits',
          icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Salary Distribution',
          to: '/cash_flow/tools/salary-distribution',
          icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'My Projects',
          to: '/cash_flow/projects',
          icon: <CIcon icon={cilLightbulb} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Assets',
          to: '/cash_flow/assets',
          icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Eggs',
          to: '/cash_flow/eggs',
          icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
        },
      ],
    })
  }
  items.push({
    component: CNavGroup,
    name: 'Sistema',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: t('nav.visits'),
        to: '/cash_flow/tools/visits',
        icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
      },
      ...(isSuperAdmin
        ? [
            {
              component: CNavItem,
              name: t('nav.users'),
              to: '/cash_flow/management/users',
              icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: t('nav.pushSubscribers'),
              to: '/cash_flow/management/push-subscribers',
              icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'Tenants',
              to: '/admin/tenants',
              icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
            },
          ]
        : []),
    ],
  })

  items.push({
    component: CNavItem,
    name: 'Contratos de alquiler',
    to: '/contratos/generar',
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
  })

  return items
}

export default getNav
