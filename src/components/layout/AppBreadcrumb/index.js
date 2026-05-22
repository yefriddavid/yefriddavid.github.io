import React from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import routes from '../../../routes'
import taxisRoutes from '../../../routes.taxis'
import domoticaRoutes from '../../../routes.domotica'
import systemRoutes from '../../../routes.system'

import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'
import './AppBreadcrumb.scss'

const SECTION_LABELS = [
  { path: '/finance', tKey: 'nav.finance' },
  { path: '/finance/management', tKey: 'nav.contabilidad' },
  { path: '/finance/tools', tKey: 'nav.tools' },
  { path: '/finance/trade', tKey: 'nav.trade' },
  { path: '/taxis', tKey: 'nav.taxiSection' },
  { path: '/domotica', tKey: 'nav.domotica' },
  { path: '/system', tKey: 'nav.system' },
]

const ALL_ROUTES = [...routes, ...taxisRoutes, ...domoticaRoutes, ...systemRoutes, ...SECTION_LABELS]

const AppBreadcrumb = () => {
  const { t } = useTranslation()
  const currentLocation = useLocation().pathname

  const getRouteName = (route) => {
    if (route.tKey) return t(route.tKey)
    if (route.longName) return route.longName
    return route.name
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.slice(1).split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const currentRoute = ALL_ROUTES.find((route) => route.path === currentPathname)
      if (currentRoute) {
        const name = getRouteName(currentRoute)
        breadcrumbs.push({
          pathname: currentPathname,
          name: typeof name === 'string' ? name : String(name || ''),
          active: index + 1 === array.length,
        })
      }
      return currentPathname
    }, '')
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  return (
    <CBreadcrumb className="my-0">
      <CBreadcrumbItem href="/">{t('nav.home')}</CBreadcrumbItem>
      {breadcrumbs.map((breadcrumb, index) => (
        <CBreadcrumbItem
          {...(breadcrumb.active ? { active: true } : { href: `#${breadcrumb.pathname}` })}
          key={index}
        >
          {breadcrumb.name}
        </CBreadcrumbItem>
      ))}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)
