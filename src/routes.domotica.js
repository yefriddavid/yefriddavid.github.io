import React from 'react'

const DomoticaHome = React.lazy(() => import('./views/domotica/Home'))

const domoticaRoutes = [
  {
    path: '/domotica/home',
    name: 'Home',
    element: DomoticaHome,
  },
]

export default domoticaRoutes
