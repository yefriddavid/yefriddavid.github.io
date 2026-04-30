# My Admin — Cash Flow Dashboard

> Panel de administración financiera y de taxis, construido sobre React 18 + Vite con Firebase Auth, Firestore y Google Apps Script.

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764abc?style=flat-square&logo=redux)](https://redux-toolkit.js.org)
[![Firebase](https://img.shields.io/badge/Firebase-11-ffca28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Módulos](#módulos)
- [Arquitectura](#arquitectura)
- [Autenticación](#autenticación)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación y comandos](#instalación-y-comandos)
- [Pruebas](#pruebas)
- [Backend y fuentes de datos](#backend-y-fuentes-de-datos)
- [Estado global (Redux)](#estado-global-redux)
- [Constantes por dominio](#constantes-por-dominio)
- [Sistema de temas](#sistema-de-temas)
- [Internacionalización](#internacionalización)
- [Rutas y archivos](#rutas-y-archivos)
- [Despliegue](#despliegue)

---

## Descripción

**My Admin** es una SPA multi-módulo para gestión financiera y operacional. Incluye control de flujo de caja, liquidaciones de taxis, contratos de arrendamiento, herramientas de análisis y un portfolio público. Desplegado en GitHub Pages, consume Firebase Firestore como base de datos principal y Google Apps Script como API secundaria.

---

## Módulos

![Diagrama de módulos — Software de Gestión de Taxis](docs/Gemini_Generated_Image_epllpfepllpfepll.png)

| Módulo | Ruta base | Descripción |
|---|---|---|
| **Contabilidad** | `/cash_flow/management/` | Transacciones, maestro de cuentas, estado de cuentas con OCR |
| **Taxis** | `/taxis/` | Liquidaciones diarias, conductores, vehículos, gastos, socios, distribuciones, análisis IA |
| **Trade** | `/cash_flow/tools/` | Ajustes, distribución de salarios, activos, proyectos |
| **Sistema** | `/cash_flow/management/` | Usuarios, sesiones activas, suscriptores FCM |
| **Contratos** | `/contratos/` | Generación de contratos de arrendamiento en PDF |
| **About Me** | `/about-me` | Portfolio público (Matrix rain, cursor glow) |

---

## Arquitectura

```
Browser (HashRouter)
│
├── DefaultLayout                        ← AppSidebar + AppHeader + AppContent + AppFooter
│   │
│   ├── Contabilidad
│   │   ├── Transactions.js              ← CRUD de transacciones
│   │   ├── AccountStatus.js             ← Estado de cuentas + OCR importer
│   │   └── AccountsMaster.js            ← Maestro de cuentas
│   │
│   ├── Taxis
│   │   ├── Settlements/Index.js         ← Liquidaciones + Análisis IA (json-rules-engine)
│   │   ├── Drivers.js                   ← Conductores
│   │   ├── Vehicles.js                  ← Vehículos + pico y placa
│   │   ├── Expenses.js                  ← Gastos operativos
│   │   ├── Operations.js                ← Mantenimientos programados
│   │   ├── Summary.js                   ← Resumen financiero
│   │   ├── Partners.js                  ← Socios
│   │   └── Distributions.js             ← Distribución de utilidades
│   │
│   ├── Trade
│   │   ├── SalaryDistribution.js
│   │   ├── Assets.js
│   │   └── MyProjects.js
│   │
│   └── Sistema
│       ├── Users.js                     ← Usuarios + sesiones activas
│       └── PushSubscribers.js           ← Suscriptores FCM
│
└── Public pages (sin layout)
    ├── /login                           ← Firebase Auth
    ├── /about-me                        ← Portfolio público
    └── /404
```

**Reglas de Capas:**

| Capa | Archivos | Responsabilidad |
|---|---|---|
| **View** | `src/views/**` | Renderizar UI, despachar acciones, leer el store con `useSelector` |
| **Actions** | `src/actions/**` | Definir los eventos del sistema (qué pasó) |
| **Sagas** | `src/sagas/**` | Orquestar efectos asíncronos, calcular parámetros, llamar servicios |
| **Reducers** | `src/reducers/**` | Actualizar el estado de forma pura y predecible |
| **Services** | `src/services/**` | Comunicación con Firebase / APIs — puros, sin lógica de negocio |

**Regla estricta — las vistas NO acceden a APIs ni bases de datos directamente:**

Las vistas y componentes (`src/views/**`) **nunca** deben importar servicios, Firebase SDK ni llamar `fetch`/`axios`. Todo acceso a datos pasa obligatoriamente por el flujo Redux:

```
✅ Correcto
  Vista → dispatch(action) → Saga → Service → Reducer → useSelector → Vista

❌ Prohibido en src/views/**
  import { getDocs } from 'firebase/firestore'
  import { firestoreCall } from 'src/services/...'
  fetch('https://...')  /  axios.get('...')
```

La única excepción es `src/services/auth/firebaseAuth.js` usado en `AppContent.js` para el listener de auth (`onAuthStateChanged`), que es infraestructura, no datos de feature.

**Flujo de datos:**

```
Component
  └─► dispatch(action)
        └─► Redux Saga (side effect)
              ├─► Firestore via firestoreCall()   ← middleware token + retry
              ├─► Google Apps Script API           ← axios con token interceptor
              └─► IndexedDB (caché local)
                    └─► reducer update ─► re-render
```

---

## Autenticación

![Flujo de autenticación CashFlow](docs/Gemini_Generated_Image_86mr6n86mr6n86mr.png)

El sistema usa **Firebase Auth (email/password)** con una estrategia de migración lazy: intenta autenticar con Firebase Auth primero; si el usuario aún no existe allí, verifica contra el hash legacy en Firestore y crea la cuenta en Firebase Auth automáticamente.

| Etapa | Descripción |
|---|---|
| **Arranque** | `onAuthStateChanged` resuelve la sesión desde IndexedDB antes de renderizar rutas |
| **Login normal** | `signInWithEmailAndPassword` → perfil Firestore → session record |
| **Login legacy** | Hash Firestore → migración automática a Firebase Auth |
| **Session validation** | Verifica `sessionId` en Firestore al arrancar (previene sesiones robadas) |
| **Refresh token** | Firebase SDK lo maneja automáticamente en IndexedDB — sin código manual |
| **Middleware Firestore** | `firestoreCall()` inyecta token fresco antes de cada operación; en error de permisos hace signOut |
| **Middleware Axios** | Interceptor inyecta token en cada POST; en 401 fuerza refresh y reintenta una vez |
| **Logout** | Elimina sesión en Firestore + `Firebase signOut` (invalida IndexedDB) + limpia localStorage |

> Ver diagrama interactivo completo en [`docs/login-flow.md`](docs/login-flow.md).

**Archivos clave de auth:**

| Archivo | Responsabilidad |
|---|---|
| `src/services/auth/firebaseAuth.js` | `signIn`, `signOut`, `getToken`, `onAuthChange`, `changePassword` |
| `src/services/providers/firebase/firebaseClient.js` | Middleware Firestore: token + retry + normalización de errores |
| `src/services/providers/api/utilApi.js` | Axios con interceptor de token + retry en 401 |
| `src/components/AppContent.js` | Guard de rutas vía `onAuthStateChanged` |
| `src/services/providers/firebase/Security/sessions.js` | CRUD de sesiones en Firestore |

---

## Estructura del proyecto

```
src/
├── actions/                          # Creadores de acciones (redux-act)
│   ├── authActions.js
│   ├── usersActions.js
│   ├── CashFlow/                     ← accountActions, paymentActions, transactionActions…
│   ├── Contratos/                    ← contractActions, ownerActions, propertyActions…
│   └── Taxi/                         ← taxiDriverActions, taxiSettlementActions…
│
├── reducers/                         # Slices de estado (RTK createSlice)
│   ├── CashFlow/
│   ├── Contratos/
│   ├── Taxi/
│   ├── loginReducer.js
│   ├── profileReducer.js
│   ├── uiReducer.js                  ← sidebarShow, appTheme
│   └── usersReducer.js
│
├── sagas/                            # Efectos asíncronos (redux-saga)
│   ├── CashFlow/
│   ├── Contratos/
│   ├── Taxi/
│   └── profileSagas.js
│
├── services/
│   ├── auth/
│   │   └── firebaseAuth.js           ← signIn (híbrido), signOut, getToken, onAuthChange
│   ├── providers/
│   │   ├── api/
│   │   │   └── utilApi.js            ← axios instance + interceptor de token Firebase
│   │   ├── firebase/
│   │   │   ├── firebaseClient.js     ← middleware Firestore (token + retry + errores)
│   │   │   ├── settings.js           ← db, auth, messaging
│   │   │   ├── CashFlow/             ← accountsMaster, transactions, paymentVaucher…
│   │   │   ├── Contratos/            ← contracts, owners, properties…
│   │   │   ├── Taxi/                 ← taxiDrivers, taxiSettlements, taxiExpenses…
│   │   │   └── Security/             ← users, sessions, fcmTokens
│   │   └── indexeddb/                ← caché local (accountsMaster, assets…)
│   └── voucherCache.js               ← caché localStorage con prefijo vchr_
│
├── constants/
│   ├── commons.js                    ← MONTH_NAMES (genérico, agnóstico de dominio)
│   ├── cashFlow.js                   ← ACCOUNT_CATEGORIES, PAYMENT_METHODS, EXPENSE_CATEGORIES
│   ├── taxi.js                       ← TAXI_EXPENSE_CATEGORIES, TAXI_MAINTENANCE_CATEGORIES
│   └── accounting.js
│
├── components/
│   ├── AppContent.js                 ← Guard de rutas (Firebase Auth)
│   ├── AppHeader.js
│   ├── AppSidebar.js
│   ├── header/
│   │   ├── AppHeaderDropdown.js      ← Logout con Firebase signOut
│   │   └── VersionModal.js
│   └── App/
│       ├── StandardForm.js
│       ├── StandardGrid/Index.js
│       ├── DetailPanel.js
│       └── MultiSelectDropdown.js
│
├── views/pages/
│   ├── login/Login.js                ← Firebase Auth (híbrido + lazy migration)
│   ├── dashboard/Dashboard.js
│   ├── aboutMe/Index.js              ← Portfolio público
│   ├── profile/Profile.js
│   │
│   ├── CashFlow/
│   │   ├── movements/
│   │   │   ├── Transactions.js       ← CRUD transacciones con método de pago
│   │   │   ├── AccountStatus.js      ← Estado de cuentas + botón OCR
│   │   │   ├── OcrReceiptImporter.js ← OCR con Tesseract.js (browser, sin backend)
│   │   │   └── ocrAccountRules.js    ← Diccionario OCR por tipo de recibo (EPM, Claro…)
│   │   ├── assets/Assets.js
│   │   ├── eggs/Eggs.js
│   │   ├── projects/MyProjects.js
│   │   └── tools/SalaryDistribution.js
│   │
│   ├── Accounting/
│   │   ├── Accounts.js               ← DevExtreme DataGrid
│   │   └── AccountsMaster.js
│   │
│   ├── taxis/
│   │   ├── Settlements/
│   │   │   ├── Index.js
│   │   │   └── Components/
│   │   │       ├── AuditView.js      ← Vista de auditoría + modal Análisis IA
│   │   │       ├── auditAnalysisRules.js ← Reglas json-rules-engine (10 reglas)
│   │   │       ├── AuditDayDetail.js
│   │   │       ├── PeriodSummary.js
│   │   │       └── SettlementMasterDetail.js
│   │   ├── Drivers.js
│   │   ├── Vehicles.js
│   │   ├── Expenses.js
│   │   ├── Operations.js             ← Mantenimientos programados
│   │   ├── Summary.js
│   │   ├── Partners.js
│   │   └── Distributions.js
│   │
│   ├── Contratos/
│   │   └── contratos/GenerarContrato.js
│   │
│   ├── users/
│   │   ├── Users.js                  ← Lista usuarios + sesiones activas
│   │   └── PushSubscribers.js        ← Suscriptores FCM (superAdmin)
│   │
│   ├── movements/payments/           ← Módulo legacy de pagos + vouchers
│   ├── reports/payments/             ← Visor de comprobantes
│   └── tools/
│       ├── increase-decrease/
│       └── visits/
│
├── hooks/
│   ├── useNotifications.js           ← FCM push notifications
│   ├── useVersionCheck.js
│   └── useInstallPrompt.js
│
├── utils/
│   └── moment.js                     ← Instancia configurada de moment.js
│
├── _nav.js                           # Menú lateral dinámico por rol
├── routes.js                         # Definición de rutas
└── store/store.js                    # Store Redux
```

---

## Instalación y comandos

```bash
npm install             # Instalar dependencias
npm start               # Dev server (http://localhost:3000)
npm run build           # Build de producción → /build
npm run serve           # Preview del build
npm run lint            # ESLint en src/**/*.js
npm test                # Ejecutar pruebas unitarias (Vitest)
npm run cy:comp         # Pruebas de componente Cypress (headless)
npm run cy:comp:open    # Pruebas de componente Cypress (panel interactivo)
npm run cy:run          # Pruebas E2E headless (requiere build previo)
npm run cy:open         # Panel interactivo Cypress (E2E)
npm run deploy          # Build + deploy a GitHub Pages
```

---

## Pruebas

El proyecto cuenta con tres niveles de pruebas:

### Unitarias e integración — Vitest

```bash
npm test            # headless, una sola pasada
npm run test:watch  # modo watch para desarrollo
```

Archivos en `src/**/__tests__/` y `src/**/*.test.js`. Cubren reducers, sagas y helpers de dominio.

### Componentes — Cypress Component Testing

Las pruebas de componente montan componentes React de forma aislada dentro de Vite, sin necesidad de levantar ningún servidor externo.

```bash
npm run cy:comp        # headless (CI / terminal)
npm run cy:comp:open   # panel interactivo con hot-reload
```

| Archivo | Componente | Cobertura |
|---|---|---|
| `cypress/component/AuditView.cy.js` | `AuditView` | Strip de estados, filtros, tabla, exportación, modal Análisis IA, filtro de vehículo, estado Redux |

**Infraestructura de soporte:**

| Archivo | Función |
|---|---|
| `cypress/support/component.jsx` | Comando `cy.mount` con `Provider` (Redux) + `I18nextProvider` |
| `cypress/support/component-index.html` | HTML base con `data-cy-root` requerido por `cypress/react` |
| `cypress.config.js` → sección `component` | Bundler Vite, patrón de specs, soporte |

### E2E — Cypress

```bash
npm run build && npm run cy:run   # headless (requiere build previo)
npm run cy:open                   # panel interactivo
```

Specs en `cypress/e2e/`. Levantan el preview del build en el puerto 3005.

---

## Backend y fuentes de datos

### Firebase Firestore (principal)

Todas las operaciones pasan por `firestoreCall()` en `src/services/providers/firebase/firebaseClient.js`:
- Refresca el token antes de cada operación
- En `permission-denied` / `unauthenticated` → signOut + redirect a `/login`
- Reintenta errores transitorios (`unavailable`, `deadline-exceeded`) con backoff exponencial
- Normaliza todos los errores a mensajes en español

| Colección Firestore | Módulo | Uso |
|---|---|---|
| `users` | Sistema | Perfiles, roles, hash legacy |
| `sessions` | Sistema | Sesiones activas por usuario |
| `fcmTokens` | Sistema | Tokens FCM para push notifications |
| `accountsMaster` | Contabilidad | Maestro de cuentas |
| `transactions` | Contabilidad | Registro de transacciones |
| `paymentVauchers` | Contabilidad | Comprobantes de pago (imágenes) |
| `taxiDrivers` | Taxis | Conductores |
| `taxiVehicles` | Taxis | Vehículos |
| `taxiSettlements` | Taxis | Liquidaciones diarias |
| `taxiExpenses` | Taxis | Gastos operativos |
| `taxiPartners` | Taxis | Socios |
| `taxiDistributions` | Taxis | Distribuciones de utilidades |
| `contracts` | Contratos | Contratos de arrendamiento |
| `owners` / `properties` | Contratos | Propietarios y propiedades |
| `page_visits` | About Me | Registro de visitas |

### Google Apps Script (secundario)

POST con `FormData` a endpoint configurado en `utilApi.js`. Un token Firebase fresco se inyecta automáticamente vía interceptor de Axios en cada request. En 401, fuerza refresh del token y reintenta una vez.

### IndexedDB (caché local)

Usado para `accountsMaster`, `assets`, `myProjects` y `salaryDistribution`. Reduce lecturas repetidas a Firestore en datos que cambian poco.

---

## Estado global (Redux)

```
store
├── profile           → { data: { username, name, role, landingPage, avatar } }
├── ui                → { sidebarShow, appTheme }
├── users             → { list, sessions }
│
├── CashFlow/
│   ├── account       → { data, selectedAccount }
│   ├── accountsMaster
│   ├── transaction
│   ├── paymentVaucher
│   └── salaryDistribution
│
├── Taxi/
│   ├── taxiDriver
│   ├── taxiVehicle
│   ├── taxiSettlement
│   ├── taxiExpense
│   ├── taxiPartner
│   ├── taxiDistribution
│   └── taxiAuditNote
│
└── Contratos/
    ├── contract
    ├── owner
    ├── property
    └── bankAccount
```

---

## Constantes por dominio

Los valores de dominio están separados por módulo — nunca hardcodear en componentes:

| Archivo | Exporta | Usado en |
|---|---|---|
| `src/constants/commons.js` | `MONTH_NAMES` | Genérico (nombres de meses en inglés para claves Firestore) |
| `src/constants/cashFlow.js` | `ACCOUNT_CATEGORIES`, `PAYMENT_METHODS`, `EXPENSE_CATEGORIES`, `INCOME_CATEGORIES` | Módulo Contabilidad |
| `src/constants/taxi.js` | `TAXI_EXPENSE_CATEGORIES`, `TAXI_MAINTENANCE_CATEGORIES` | Módulo Taxis |
| `src/constants/accounting.js` | Categorías contables | Módulo Accounting |

---

## Sistema de temas

El tema se aplica mediante `data-app-theme` en `<body>` y se persiste en Redux (`uiReducer`). Estilos en `src/scss/_custom.scss`:

```scss
@mixin app-theme($bg, $accent) { ... }

body[data-app-theme="yellow"] { @include app-theme(#000000, #ffc107); } // Cash
body[data-app-theme="blue"]   { @include app-theme(#1e3a5f, #10b981); } // Ocean
```

---

## Internacionalización

`i18next` + `i18next-http-backend`. Idioma por defecto: **español (`es`)**. Archivos en `public/locales/`. Usar siempre `useTranslation()` + `t('key')` en componentes.

---

## Rutas y archivos

| Ruta (`#/...`) | Archivo fuente | Rol mínimo |
|---|---|---|
| `/cash_flow/dashboard` | `views/pages/dashboard/Dashboard.js` | todos |
| `/cash_flow/management/accounts` | `views/pages/Accounting/Accounts.js` | manager |
| `/cash_flow/management/accounts-master` | `views/pages/Accounting/AccountsMaster.js` | manager |
| `/cash_flow/management/transactions` | `views/pages/CashFlow/movements/Transactions.js` | manager |
| `/cash_flow/management/account-status` | `views/pages/CashFlow/movements/AccountStatus.js` | manager |
| `/cash_flow/management/payments` | `views/pages/movements/payments/Payments.js` | manager |
| `/cash_flow/management/reports` | `views/pages/reports/Reports.js` | manager |
| `/cash_flow/management/users` | `views/pages/users/Users.js` | superAdmin |
| `/cash_flow/management/push-subscribers` | `views/pages/users/PushSubscribers.js` | superAdmin |
| `/cash_flow/tools/adjustments` | `views/pages/tools/increase-decrease/IncreaseDecrease.js` | manager |
| `/cash_flow/tools/visits` | `views/pages/tools/visits/Visits.js` | manager |
| `/cash_flow/tools/salary-distribution` | `views/pages/CashFlow/tools/SalaryDistribution.js` | manager |
| `/cash_flow/projects` | `views/pages/CashFlow/projects/MyProjects.js` | manager |
| `/cash_flow/assets` | `views/pages/CashFlow/assets/Assets.js` | manager |
| `/cash_flow/eggs` | `views/pages/CashFlow/eggs/Eggs.js` | manager |
| `/cash_flow/profile` | `views/pages/profile/Profile.js` | todos |
| `/taxis` | `views/pages/taxis/Home.js` | todos |
| `/taxis/home` | `views/pages/taxis/Home.js` | todos |
| `/taxis/settlements` | `views/pages/taxis/Settlements/Index.js` | todos |
| `/taxis/operations` | `views/pages/taxis/Operations.js` | todos |
| `/taxis/drivers` | `views/pages/taxis/Drivers.js` | manager |
| `/taxis/vehicles` | `views/pages/taxis/Vehicles.js` | manager |
| `/taxis/expenses` | `views/pages/taxis/Expenses.js` | manager |
| `/taxis/summary` | `views/pages/taxis/Summary.js` | manager |
| `/taxis/partners` | `views/pages/taxis/Partners.js` | manager |
| `/taxis/profit-sharing` | `views/pages/taxis/Distributions.js` | manager |
| `/contratos/contratos/generar` | `views/pages/Contratos/contratos/GenerarContrato.js` | manager |
| `/about-me` | `views/pages/aboutMe/Index.js` | público |
| `/login` | `views/pages/login/Login.js` | público |

---

## Despliegue

```bash
git checkout main && git pull origin main
npm run deploy
# → vite build → /build
# → gh-pages -d build → rama gh-pages
```

App publicada en: `https://yefriddavid.github.io/yefriddavid.github.io`

> Verifica la versión desplegada revisando el hash del commit en la consola del navegador: `[app] commit: xxxxxxx`

---

## Tareas pendientes

### 🔴 Migrar vistas que violan la regla Redux
Varias vistas importan servicios Firebase o llaman axios/fetch directamente, saltándose el flujo Redux obligatorio. Cada una debe migrarse al patrón `actions → saga → reducer`.

| Vista | Violación |
|---|---|
| `views/tools/visits/Visits.js` | Firebase SDK directo (`getDocs`, `deleteDoc`, `db`) |
| `views/taxis/Home.js` | `getSettlements`, `fetchExpenses`, `getDrivers`, `getVehicles` |
| `views/taxis/Expenses.js` | `updateExpense`, `getVehicles` |
| `views/taxis/Summary.js` | `getSettlements`, `fetchExpenses` |
| `views/users/PushSubscribers.js` | `getTokens`, `deleteFcmToken` |
| `views/users/Users.js` | `sendUserPasswordReset` |
| `views/settings/tabs/AppVariablesSettings.js` | `appSettings` service directo |
| `views/settings/tabs/StorageSettings.js` | `fetchCollectionCounts` directo |
| `views/Accounting/MigrationModal.js` | `fetchAccounts` directo |
| `views/aboutMe/Index.js` | `trackPageVisit` directo |
| `views/Accounting/AccountsSimple.js` | `axios.post` directo |
| `views/movements/payments/Services.js` | 3× `axios.post` directo |
| `views/reports/payments/Services.js` | 3× `axios.post` directo |

### 🟡 Migrar imágenes de vouchers a Firebase Storage
Las imágenes de comprobantes se guardan como base64 en documentos Firestore, causando documentos pesados y carga lenta sin CDN. La solución está diseñada e implementada (build verificado), revertida a pedido del usuario para aplicar después.

**Archivos a modificar:**
- `src/services/providers/firebase/settings.js` — exportar `storage = getStorage(app)`
- `src/services/providers/firebase/paymentVaucher.js` — subir a Firebase Storage, guardar URL en Firestore
- `src/views/movements/payments/ItemDetail.js` — cambiar `pdfToBase64` → `pdfToBlob`, pasar blob al servicio

**Nota:** los vouchers existentes con campo `file` (base64) mostrarán "sin voucher" hasta re-subirse. Se puede hacer migración batch.

### 🟡 Migrar HashRouter → BrowserRouter
Eliminar el `#` de las URLs migrando de `HashRouter` a `BrowserRouter`.

**Pasos:**
1. Reemplazar `HashRouter` por `BrowserRouter` en `src/index.js` / `src/App.js`
2. Configurar el servidor para redirigir todas las rutas a `index.html`
3. Revisar usos de `window.location.hash` o links con `#/` hardcodeados
4. GitHub Pages requiere truco con `404.html` para soportar BrowserRouter — evaluar si vale la pena dado el hosting actual

### 🔵 Seguimiento Familiar GPS
Conectar el GPS del celular a un mapa donde va a estar toda mi familia. El cliente será Flutter o la misma app que usa la posición del celular y la reporta a Firebase.

### 🟡 Migración de Monitoreo Eléctrico
Migrar el read de voltios y corriente que está en Firebase Firestore a Firebase Realtime Database (optimización para datos en tiempo real).

---

*Desarrollado por [David Rios](https://www.linkedin.com/in/yefriddavid) · [@yefriddavid](https://github.com/yefriddavid)*
