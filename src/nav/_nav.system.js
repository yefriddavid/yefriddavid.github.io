import { buildNav } from './renderNav'
import navConfig from './nav.system.json'

const getSystemNav = () => buildNav(navConfig)

export default getSystemNav
