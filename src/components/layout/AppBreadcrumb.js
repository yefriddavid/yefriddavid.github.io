import React from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import routes from '../../routes'

import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

const AppBreadcrumb = () => {
  const { t } = useTranslation()
  const currentLocation = useLocation().pathname

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const currentRoute = routes.find((route) => route.path === currentPathname)
      if (currentRoute) {
        const rawName = currentRoute.tKey ? t(currentRoute.tKey) : currentRoute.name
        const name = typeof rawName === 'string' ? rawName : String(rawName || '')
        breadcrumbs.push({
          pathname: currentPathname,
          name,
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
