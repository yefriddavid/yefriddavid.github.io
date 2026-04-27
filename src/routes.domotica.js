import React from 'react'

const DomoticaHome = React.lazy(() => import('./views/domotica/Home'))
const SolarPanel = React.lazy(() => import('./views/domotica/SolarPanel/SolarPanel'))
const Devices = React.lazy(() => import('./views/domotica/Devices/Devices'))

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
  {
    path: '/domotica/devices',
    name: 'Dispositivos',
    element: Devices,
  },
]

export default domoticaRoutes
