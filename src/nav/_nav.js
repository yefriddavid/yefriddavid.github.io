import { buildNav } from './renderNav'
import navConfig from './nav.finance.json'

// role: 'superAdmin' | 'manager' | 'conductor' | null (null = no profile, show all for backward compat)
const getNav = (t, role) => buildNav(navConfig, { t, role })

export default getNav
