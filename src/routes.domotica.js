import React from 'react'

const DomoticaHome = React.lazy(() => import('./views/domotica/Home'))
const SolarPanel = React.lazy(() => import('./views/domotica/SolarPanel/SolarPanel'))
const Devices = React.lazy(() => import('./views/domotica/Devices/Devices'))
const SerialConsole = React.lazy(() => import('./views/domotica/SerialConsole/SerialConsole'))
const CommandDictionary = React.lazy(
  () => import('./views/domotica/SerialConsole/CommandDictionary'),
)
const Cleanup = React.lazy(() => import('./views/domotica/Cleanup/Cleanup'))

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
  {
    path: '/domotica/serial',
    name: 'Consola Serial',
    element: SerialConsole,
  },
  {
    path: '/domotica/commands',
    name: 'Diccionario de Comandos',
    element: CommandDictionary,
  },
  {
    path: '/domotica/cleanup',
    name: 'Limpieza',
    element: Cleanup,
  },
]

export default domoticaRoutes
