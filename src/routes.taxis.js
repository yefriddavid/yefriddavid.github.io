import React from 'react'

const Settlements = React.lazy(() => import('./views/taxis/Settlements/Index'))
const Drivers = React.lazy(() => import('./views/taxis/Drivers'))
const DriverEditor = React.lazy(() => import('./views/taxis/DriverEditor'))
const Vehicles = React.lazy(() => import('./views/taxis/Vehicles'))
const Expenses = React.lazy(() => import('./views/taxis/Expenses'))
const Summary = React.lazy(() => import('./views/taxis/Summary'))
const AnnualSummary = React.lazy(() => import('./views/taxis/AnnualSummary'))
const TaxisHome = React.lazy(() => import('./views/taxis/Home'))
const Partners = React.lazy(() => import('./views/taxis/Partners'))
const Distributions = React.lazy(() => import('./views/taxis/Distributions'))
const DriverDocuments = React.lazy(() => import('./views/taxis/DriverDocuments'))
const Operations = React.lazy(() => import('./views/taxis/Operations'))
const MapLocation = React.lazy(() => import('./views/taxis/MapLocation'))
const VehicleRoute = React.lazy(() => import('./views/taxis/VehicleRoute'))

const taxisRoutes = [
  {
    path: '/taxis/home',
    name: 'Home',
    tKey: 'nav.taxiHome',
    element: TaxisHome,
  },
  {
    path: '/taxis/settlements',
    name: 'Settlements',
    tKey: 'nav.liquidaciones',
    element: Settlements,
  },
  {
    path: '/taxis/drivers',
    name: 'Drivers',
    tKey: 'nav.conductores',
    element: Drivers,
  },
  {
    path: '/taxis/drivers/new',
    name: 'New Driver',
    tKey: 'nav.driverNew',
    element: DriverEditor,
  },
  {
    path: '/taxis/drivers/:id',
    name: 'Edit Driver',
    tKey: 'nav.driverEdit',
    element: DriverEditor,
  },
  {
    path: '/taxis/vehicles',
    name: 'Vehicles',
    tKey: 'nav.vehiculos',
    element: Vehicles,
  },
  {
    path: '/taxis/expenses',
    name: 'Expenses',
    tKey: 'nav.expenses',
    element: Expenses,
  },
  {
    path: '/taxis/summary',
    name: 'Summary',
    tKey: 'nav.summary',
    element: Summary,
  },
  {
    path: '/taxis/annual-summary',
    name: 'Annual Summary',
    tKey: 'nav.taxiAnnualSummary',
    element: AnnualSummary,
  },
  {
    path: '/taxis/operations',
    name: 'Operations',
    tKey: 'nav.operations',
    element: Operations,
  },
  {
    path: '/taxis/map',
    name: 'Map',
    tKey: 'nav.map',
    element: MapLocation,
  },
  {
    path: '/taxis/route-history',
    name: 'Vehicle Route',
    tKey: 'nav.routeHistory',
    element: VehicleRoute,
  },
  {
    path: '/taxis/partners',
    name: 'Partners',
    tKey: 'nav.partners',
    element: Partners,
  },
  {
    path: '/taxis/profit-sharing',
    name: 'Profit Sharing',
    tKey: 'nav.distributions',
    element: Distributions,
  },
  {
    path: '/taxis/driver-documents',
    name: 'Driver Documents',
    tKey: 'nav.driverDocuments',
    element: DriverDocuments,
  },
]

export default taxisRoutes
