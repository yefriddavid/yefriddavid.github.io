import React from 'react'

const DomoticaHome = React.lazy(() => import('./views/domotica/Home'))
const SolarPanel = React.lazy(() => import('./views/domotica/SolarPanel/SolarPanel'))
const Devices = React.lazy(() => import('./views/domotica/Devices/Devices'))
const SerialConsole = React.lazy(() => import('./views/domotica/SerialConsole/SerialConsole'))
const CommandDictionary = React.lazy(
  () => import('./views/domotica/SerialConsole/CommandDictionary'),
)
const Cleanup = React.lazy(() => import('./views/domotica/Cleanup/Cleanup'))
const SolarCalculator = React.lazy(() => import('./views/domotica/SolarCalculator/SolarCalculator'))
const SolarCalculatorConfigs = React.lazy(() => import('./views/domotica/SolarCalculatorConfigs'))

const domoticaRoutes = [
  {
    path: '/domotica/home',
    name: 'Home',
    tKey: 'nav.domoticaHome',
    element: DomoticaHome,
  },
  {
    path: '/domotica/solar',
    name: 'Solar Panel',
    tKey: 'nav.solar',
    element: SolarPanel,
  },
  {
    path: '/domotica/devices',
    name: 'Devices',
    tKey: 'nav.devices',
    element: Devices,
  },
  {
    path: '/domotica/serial',
    name: 'Serial Console',
    tKey: 'nav.serial',
    element: SerialConsole,
  },
  {
    path: '/domotica/commands',
    name: 'Command Dictionary',
    tKey: 'nav.commands',
    element: CommandDictionary,
  },
  {
    path: '/domotica/cleanup',
    name: 'Cleanup',
    tKey: 'nav.cleanup',
    element: Cleanup,
  },
  {
    path: '/domotica/solar-calculator-configs',
    name: 'Solar Calculator Configs',
    tKey: 'nav.solarCalculatorConfigs',
    element: SolarCalculatorConfigs,
  },
  {
    path: '/domotica/solar-calculator',
    name: 'Solar Calculator',
    tKey: 'nav.solarCalculator',
    element: SolarCalculator,
  },
]

export default domoticaRoutes
