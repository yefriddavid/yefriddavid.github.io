# Routing & Layouts

## Estructura de rutas (`src/App.js`)

```
EmptyLayout          — sin auth, sin sidebar
├── /login/super
├── /login
├── /register
├── /404  /500
├── /aboutMe
├── /hard-refresh
├── /selectApp
├── /contratos/generar
├── /gallery/:folder
└── /tools/calc

FinanceLayout        — auth guard, sidebar, header
├── /finance/*       → financeRoutes (dashboard, accounts, payments, trade…)
└── /*               → routes (home, contratos/list, inmobiliaria/*)

MiscelaneaLayout     → /miscelanea/*
DomoticaLayout       → /domotica/*
TaxisLayout          → /taxis/*
SystemLayout         → /system/*
```

## Layouts

| Layout | Archivo | Auth | Contenido |
|---|---|---|---|
| `EmptyLayout` | `src/layout/EmptyLayout.js` | No | Solo `<Outlet>` + `NotificationToaster` |
| `FinanceLayout` | `src/layout/FinanceLayout.js` | Sí | Sidebar + Header + `AppContent` |
| `MiscelaneaLayout` | `src/layout/MiscelaneaLayout.js` | Sí | Layout propio del módulo |
| `DomoticaLayout` | `src/layout/DomoticaLayout.js` | Sí | Layout propio del módulo |
| `TaxisLayout` | `src/layout/TaxisLayout.js` | Sí | Layout propio del módulo |
| `SystemLayout` | `src/layout/SystemLayout.js` | Sí | Layout propio del módulo |

`DefaultLayout.js` existe pero no se usa — fue reemplazado por `FinanceLayout`.

## Auth guard — `AppContent`

`src/components/layout/AppContent/index.js` es el guard de autenticación para `FinanceLayout`.
Usa Firebase `onAuthChange` y maneja tres estados:

```
firebaseUser === undefined  →  <Spinner mode="page" />   (Firebase resolviendo)
firebaseUser === null       →  <Navigate to="/login" />  (no autenticado)
firebaseUser === object     →  renderiza rutas            (autenticado)
```

Además valida el `sessionId` en Firestore como segunda capa anti-robo de sesión.

## Archivos de rutas

| Archivo | Usado por | Paths |
|---|---|---|
| `src/routes.js` | `AppContent` | Absolutos: `/home`, `/contratos/*`, `/inmobiliaria/*` |
| `src/routes.finance.js` | `AppContent` | Con prefijo `/finance/`: `/finance/dashboard`, `/finance/management/*`, etc. |

`AppContent` carga ambos archivos. Las rutas de `routes.finance.js` se registran con el prefijo `/finance` añadido en tiempo de render:

```js
financeRoutes.map((route, idx) => (
  <Route key={`f${idx}`} path={`/finance${route.path}`} element={<Component />} />
))
```

## Rutas públicas vs protegidas

Para hacer una ruta **pública**: agregarla al bloque `<Route element={<EmptyLayout />}>` en `App.js`.

Para hacer una ruta **protegida**: agregarla a `routes.js` o `routes.finance.js` según el módulo. El guard en `AppContent` la protege automáticamente.

## Control de acceso por rol

Las rutas pueden declarar `roles` para restringir el acceso:

```js
// src/routes.finance.js
{ path: '/management/users', element: Users, roles: ['superAdmin'] }
```

`AppContent` filtra con `canAccess(route)` — si el rol del usuario no está en el array, la ruta no se registra.
