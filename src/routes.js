import React from 'react'

const Home = React.lazy(() => import('./views/Home'))

const InmobiliariaGallery = React.lazy(() => import('./views/Inmobiliaria/Gallery'))
const InmobiliariaDesigns = React.lazy(() => import('./views/Inmobiliaria/Designs'))
const InmobiliariaDesignEditor = React.lazy(() => import('./views/Inmobiliaria/DesignEditor'))
const InmobiliariaPlanos = React.lazy(() => import('./views/Inmobiliaria/Planos'))
const InmobiliariaPlanoEditor = React.lazy(() => import('./views/Inmobiliaria/PlanosEditor'))

const routes = [
  {
    path: '/home',
    name: 'Home',
    element: Home,
  },
  {
    path: '/inmobiliaria/gallery',
    name: 'Gallery',
    longName: 'Galería — Inmobiliaria',
    element: InmobiliariaGallery,
    landingPage: true,
  },
  {
    path: '/inmobiliaria/designs',
    name: 'Designs',
    longName: 'Diseños — Inmobiliaria',
    tKey: 'nav.inmobiliariaDesigns',
    element: InmobiliariaDesigns,
    landingPage: true,
  },
  {
    path: '/inmobiliaria/designs/new',
    name: 'New Design',
    longName: 'Nuevo Diseño',
    tKey: 'nav.inmobiliariaDesignNew',
    element: InmobiliariaDesignEditor,
  },
  {
    path: '/inmobiliaria/designs/:id',
    name: 'Edit Design',
    longName: 'Editar Diseño',
    tKey: 'nav.inmobiliariaDesignEdit',
    element: InmobiliariaDesignEditor,
  },
  {
    path: '/inmobiliaria/planos',
    name: 'Planos',
    longName: 'Planos — Inmobiliaria',
    tKey: 'nav.inmobiliariaPlanos',
    element: InmobiliariaPlanos,
    landingPage: true,
  },
  {
    path: '/inmobiliaria/planos/new',
    name: 'New Plano',
    longName: 'Nuevo Plano',
    tKey: 'nav.inmobiliariaPlanoNew',
    element: InmobiliariaPlanoEditor,
  },
  {
    path: '/inmobiliaria/planos/:id',
    name: 'Edit Plano',
    longName: 'Editar Plano',
    tKey: 'nav.inmobiliariaPlanoEdit',
    element: InmobiliariaPlanoEditor,
  },
]

export default routes
