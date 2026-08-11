import { buildNav } from './renderNav'
import navConfig from './nav.taxis.json'

const getTaxisNav = (t) => buildNav(navConfig, { t })

export default getTaxisNav
