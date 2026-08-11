import { useEffect } from 'react'
import { useLocation, matchPath } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import routes from '../routes'
import taxisRoutes from '../routes.taxis'
import domoticaRoutes from '../routes.domotica'
import systemRoutes from '../routes.system'
import financeRoutes from '../routes.finance'
import miscelaneaRoutes from '../routes.miscelanea'

const ALL_ROUTES = [
  ...routes,
  ...taxisRoutes,
  ...domoticaRoutes,
  ...systemRoutes,
  ...financeRoutes.map((r) => ({ ...r, path: `/finance${r.path}` })),
  ...miscelaneaRoutes.map((r) => ({ ...r, path: `/miscelanea${r.path}` })),
]

// Sets document.title to "<prefix> - <page name>", falling back to just <prefix>
// when the current route isn't found (e.g. a redirect target).
const usePageTitle = (prefix) => {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  useEffect(() => {
    const route = ALL_ROUTES.find((r) => matchPath(r.path, pathname))
    const translated = route?.tKey && t(route.tKey)
    const pageName = (translated !== route?.tKey && translated) || route?.name
    document.title = pageName ? `${prefix} - ${pageName}` : prefix
  }, [pathname, prefix, t])
}

export default usePageTitle
