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
  cilCreditCard,
  cilFile,
  cilFolder,
  cilGroup,
  cilHome,
  cilList,
  cilPeople,
  cilSettings,
  cilSpeedometer,
  cilSwapHorizontal,
  cilTransfer,
  cilUser,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

// role: 'superAdmin' | 'manager' | 'conductor' | null (null = no profile, show all for backward compat)
const getNav = (t, role) => {
  const isSuperAdmin = !role || role === 'superAdmin'
  const isManager = !role || role === 'manager' || role === 'superAdmin'
  const isConductor = true // all roles can see read-only taxis section

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
      name: t('nav.management'),
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
            ]
          : []),
      ],
    })
  }

  if (isManager) {
    items.push({
      component: CNavGroup,
      name: t('nav.tools'),
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
      ],
    })
  }

  items.push({
    component: CNavGroup,
    name: t('nav.taxiManagement'),
    icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: t('nav.taxiHome'),
        to: '/cash_flow/management/taxis/home',
        icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t('nav.liquidaciones'),
        to: '/cash_flow/management/taxis/settlements',
        icon: <CIcon icon={cilCalendarCheck} customClassName="nav-icon" />,
      },
      ...(isManager
        ? [
            {
              component: CNavItem,
              name: t('nav.conductores'),
              to: '/cash_flow/management/taxis/drivers',
              icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: t('nav.vehiculos'),
              to: '/cash_flow/management/taxis/vehicles',
              icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: t('nav.taxiExpenses'),
              to: '/cash_flow/management/taxis/expenses',
              icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: t('nav.taxiResumen'),
              to: '/cash_flow/management/taxis/summary',
              icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: t('nav.partners'),
              to: '/cash_flow/management/taxis/partners',
              icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: t('nav.distributions'),
              to: '/cash_flow/management/taxis/profit-sharing',
              icon: <CIcon icon={cilTransfer} customClassName="nav-icon" />,
            },
          ]
        : []),
    ],
  })

  items.push({
    component: CNavItem,
    name: 'Eggs',
    to: '/cash_flow/eggs',
    icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
  })

  items.push({
    component: CNavItem,
    name: 'Contratos de alquiler',
    to: '/contratos/contratos/generar',
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
  })

  return items
}

export default getNav
