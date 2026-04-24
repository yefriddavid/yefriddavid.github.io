import React from 'react'

const DomoticaHome = React.lazy(() => import('./views/domotica/Home'))
const SolarPanel = React.lazy(() => import('./views/domotica/SolarPanel'))

const domoticaRoutes = [
  {
    path: '/domotica/home',
    name: 'Home',
    element: DomoticaHome,
  },
  {
    path: '/domotica/solar',
    name: 'Panel Solar',
    element: SolarPanel,
  },
]

export default domoticaRoutes
