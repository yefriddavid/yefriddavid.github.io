import { buildNav } from './renderNav'
import navConfig from './nav.domotica.json'

const getDomoticaNav = () => buildNav(navConfig)

export default getDomoticaNav
