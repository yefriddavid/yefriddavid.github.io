import React from 'react'

const Settlements = React.lazy(() => import('./views/taxis/Settlements/Index'))
const Drivers = React.lazy(() => import('./views/taxis/Drivers'))
const Vehicles = React.lazy(() => import('./views/taxis/Vehicles'))
const Expenses = React.lazy(() => import('./views/taxis/Expenses'))
const Summary = React.lazy(() => import('./views/taxis/Summary'))
const TaxisHome = React.lazy(() => import('./views/taxis/Home'))
const Partners = React.lazy(() => import('./views/taxis/Partners'))
const Distributions = React.lazy(() => import('./views/taxis/Distributions'))
const Operations = React.lazy(() => import('./views/taxis/Operations'))
const MapLocation = React.lazy(() => import('./views/taxis/MapLocation'))
const VehicleRoute = React.lazy(() => import('./views/taxis/VehicleRoute'))

const taxisRoutes = [
  {
    path: '/taxis/home',
    name: 'Home',
    element: TaxisHome,
  },
  {
    path: '/taxis/settlements',
    name: 'Settlements',
    element: Settlements,
  },
  {
    path: '/taxis/drivers',
    name: 'Drivers',
    element: Drivers,
  },
  {
    path: '/taxis/vehicles',
    name: 'Vehicles',
    element: Vehicles,
  },
  {
    path: '/taxis/expenses',
    name: 'Expenses',
    element: Expenses,
  },
  {
    path: '/taxis/summary',
    name: 'Summary',
    element: Summary,
  },
  {
    path: '/taxis/operations',
    name: 'Operaciones',
    element: Operations,
  },
  {
    path: '/taxis/map',
    name: 'Mapa/Ubicación',
    element: MapLocation,
  },
  {
    path: '/taxis/route-history',
    name: 'Ruta de Vehículo',
    element: VehicleRoute,
  },
  {
    path: '/taxis/partners',
    name: 'Partners',
    element: Partners,
  },
  {
    path: '/taxis/profit-sharing',
    name: 'Distributions',
    element: Distributions,
  },
]

export default taxisRoutes
