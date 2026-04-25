import React from 'react'

const MyToolsHome = React.lazy(() => import('./views/mytools/Home'))
const SerialConsole = React.lazy(() => import('./views/mytools/SerialConsole'))
const CommandDictionary = React.lazy(() => import('./views/mytools/CommandDictionary'))

const mytoolsRoutes = [
  { path: '/mytools/home', name: 'Home', element: MyToolsHome },
  { path: '/mytools/serial', name: 'Serial Console', element: SerialConsole },
  { path: '/mytools/commands', name: 'Diccionario de Comandos', element: CommandDictionary },
]

export default mytoolsRoutes
