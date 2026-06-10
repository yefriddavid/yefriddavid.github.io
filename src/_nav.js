import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBalanceScale,
  cilList,
  cilBarChart,
  cilBasket,
  cilBell,
  cilImage,
  cilBook,
  cilCalendarCheck,
  cilCarAlt,
  cilCash,
  cilCheck,
  cilDollar,
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
    name: 'Home',
    to: '/home',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  })

  items.push({
    component: CNavItem,
    name: t('nav.dashboard'),
    to: '/finance/dashboard',
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
          to: '/finance/management/accounts',
          icon: <CIcon icon={cilList} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: t('nav.payments'),
          to: '/finance/management/payments',
          icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
        },*/
        {
          component: CNavItem,
          name: 'Transacciones',
          to: '/finance/management/transactions',
          icon: <CIcon icon={cilSwapHorizontal} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Maestro de Cuentas',
          to: '/finance/management/accounts-master',
          icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Estado de Cuentas',
          to: '/finance/management/account-status',
          icon: <CIcon icon={cilCheck} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Declaración de Renta',
          to: '/finance/management/declaracion-renta',
          icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
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
          to: '/finance/tools/adjustments',
          icon: <CIcon icon={cilBalanceScale} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Salary Distribution',
          to: '/finance/tools/salary-distribution',
          icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'My Projects',
          to: '/finance/projects',
          icon: <CIcon icon={cilLightbulb} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Assets',
          to: '/finance/assets',
          icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Eggs',
          to: '/finance/eggs',
          icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Grid Trading',
          to: '/finance/trade/grid',
          icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Custom Grid Trades',
          to: '/finance/trade/custom-grid',
          icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
        },
        {
          component: CNavGroup,
          name: 'Tools',
          icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Calculators',
              to: '/finance/trade/tools',
              icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'Prices',
              to: '/finance/trade/prices',
              icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'Calc List',
              to: '/finance/trade/calc-list',
              icon: <CIcon icon={cilList} customClassName="nav-icon" />,
            },
          ],
        },
      ],
    })
  }


  items.push({
    component: CNavGroup,
    name: 'Inmobiliaria',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Galería',
        to: '/inmobiliaria/gallery',
        icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Contratos de alquiler',
        to: '/contratos/generar',
        icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Vencimientos canon',
        to: '/contratos/list',
        icon: <CIcon icon={cilCalendarCheck} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Designs',
        to: '/inmobiliaria/designs',
        icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Planos',
        to: '/inmobiliaria/planos',
        icon: <CIcon icon={cilFolder} customClassName="nav-icon" />,
      },
    ],
  })


  return items
}

export default getNav
