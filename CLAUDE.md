# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:3000
npm run build      # Production build (outputs to /build)
npm run serve      # Preview production build
npm run lint       # ESLint on src/**/*.js
npm run deploy     # Build + deploy to GitHub Pages
```

## Architecture

**React 18 SPA** using Vite, HashRouter, and CoreUI as the component framework. Built as a financial cash-flow management dashboard.

### State Management
Redux Toolkit + Redux-Saga + redux-act pattern:
- `src/actions/` — Action creators (redux-act style)
- `src/reducers/` — State slices (login, account, payment, paymentVaucher)
- `src/sagas/` — Async side effects via redux-saga
- `src/store/store.js` — Store config wiring it all together

Data flows: Component → dispatch action → saga intercepts → service call → reducer update → component re-renders.

#### RULE: No direct API or database calls from views
Views and components must **never** import from `src/services/`, `src/services/providers/firebase/`, or call `fetch`/`axios` directly. All async operations (Firestore reads/writes, REST calls) go exclusively through the Redux layer:

```
view dispatches action → saga calls service → reducer stores result → view reads from selector
```

- ✅ `dispatch(actions.fetchRequest())` from a component
- ✅ `useSelector((s) => s.someSlice.data)` from a component
- ❌ `import { getDocs } from 'firebase/firestore'` in a view
- ❌ `import { firestoreCall } from 'src/services/...'` in a view
- ❌ `fetch(...)` or `axios.get(...)` directly inside a component

The only exception is `src/services/auth/firebaseAuth.js` used in `AppContent.js` for the auth state listener, which is infrastructure-level, not feature data.

### Routing & Auth
- **HashRouter** — all URLs are hash-based (`#/path`)
- **Auth guard** in `src/components/AppContent.js` — uses Firebase Auth `onAuthStateChanged`; shows spinner while resolving, redirects to `/login` when signed out
- Route definitions in `src/routes.js`; sidebar nav config in `src/_nav.js`

#### Firebase Authentication (refresh token)
Auth is handled by **Firebase Auth (email/password provider)** — no separate backend needed.

- **Service**: `src/services/auth/firebaseAuth.js`
- **Email convention**: users sign in with username; Firebase Auth account uses `${username}@cashflow.app` as synthetic email
- **Refresh token**: Firebase SDK stores it in IndexedDB automatically — session survives page reloads with no manual handling
- **Hybrid / lazy migration**: on first login, if the user has no Firebase Auth account yet, the system verifies via the legacy Firestore `passwordHash`, then auto-creates the Firebase Auth account transparently
- **Key functions**:
  - `signIn(username, password)` — hybrid login (Firebase Auth → legacy fallback → auto-migrate)
  - `signOut()` — Firebase signOut + clears localStorage
  - `getToken()` — returns a fresh ID token (auto-refreshes if expired)
  - `forceTokenRefresh()` — forces network refresh; call after a 401 response
  - `onAuthChange(cb)` — subscribes to auth state changes (used in AppContent)
  - `changePassword(username, currentPw, newPw)` — re-authenticates then updates password
- **Required Firebase console step**: enable **Email/Password** under Authentication → Sign-in method

#### RULE: Services receive generic parameters — no business logic inside

Service files (`src/services/firebase/**`) must be pure data-access functions. They receive ready-to-use primitive parameters (strings, numbers, dates) and execute the Firestore/API call. Business logic (computing date ranges, deriving values, formatting, conditionals based on domain rules) belongs in the saga or the caller before invoking the service.

- ✅ `getSettlements({ from: '2025-05-01', to: '2025-05-31' })` — service gets ready strings
- ✅ Saga computes `from`/`to` from `{ month, year }` before calling the service
- ❌ Service receives `{ month, year }` and computes the date range internally
- ❌ Service contains `if/else` branches based on domain state (e.g. `if month === 0`)

#### RULE: Static domain constants must live in `src/constants/`

All static domain values (option lists, type enumerations, label maps, color maps tied to a domain status/type) must be exported from the appropriate file in `src/constants/`. **Never define them inline inside a view or component file.**

Available constants files and their scope:
- `src/constants/taxi.js` — Taxi module (categories, colors, audit status, chart palettes)
- `src/constants/cashFlow.js` — CashFlow module (account categories, payment methods, asset types, salary distribution)
- `src/constants/accounting.js` — Accounting module (account types, nature/type color maps)
- `src/constants/domotica.js` — Domotica module (device types, status labels/colors, serial categories)
- `src/constants/admin.js` — Admin/auth (plans, roles, role labels/colors)
- `src/constants/commons.js` — Cross-module shared values

- ✅ `export const TAXI_AUDIT_STATUS_DEFS = [...]` in `src/constants/taxi.js`
- ✅ `import { TAXI_AUDIT_STATUS_DEFS as STATUS_DEFS } from 'src/constants/taxi'` in the view
- ❌ `const STATUS_DEFS = [{ key: 'none', ... }]` defined inline inside a component file
- ❌ Duplicating the same list in multiple files

This also applies to color maps that are semantically tied to domain types (e.g. `{ active: 'success', inactive: 'secondary' }`).

#### RULE: All Firestore collection names must be defined in `settings.js`

Every Firestore collection name must be exported as a named constant from `src/services/firebase/settings.js`. **Never hardcode a collection name string inside a service file.**

- ✅ `export const COL_TAXI_PERIOD_ATTACHMENTS = 'Taxi_period_attachments'` in `settings.js`
- ✅ `import { COL_TAXI_PERIOD_ATTACHMENTS } from '../settings'` in the service file
- ❌ `const COL = 'Taxi_period_attachments'` hardcoded inside a service file

Collection name convention: `Prefix_tableName` where prefix matches the module (`Taxi_`, `CashFlow_`, `Contratos_`, `Domotica_`, `Admin_`, etc.).

#### Firestore Middleware
All Firestore operations should go through `src/services/providers/firebase/firebaseClient.js`:

```js
import { firestoreCall } from 'src/services/providers/firebase/firebaseClient'
const snap = await firestoreCall(() => getDocs(q))
```

- Refreshes the Firebase ID token before each call
- On `permission-denied` / `unauthenticated` → signs out and redirects to `/login`
- Retries transient errors (`unavailable`, `deadline-exceeded`) with exponential backoff
- Normalizes all Firebase error codes to Spanish user messages

### File / Image Storage — NEVER use Firebase Storage

**Firebase Storage is forbidden in this project.** All images and file attachments are stored as **base64 strings directly in Firestore documents**.

- Images → compressed to JPEG base64 via `compressImage()` in `src/utils/fileHelpers.js`
- PDFs → all pages rendered to a single concatenated JPEG base64 via `pdfToSingleImage()` in `src/utils/fileHelpers.js`
- The resulting base64 string is saved directly as a field in the Firestore document (e.g. `image`, `file`)
- ❌ Never import or use `firebase/storage`, `getStorage`, `uploadBytes`, `getDownloadURL`, or any Firebase Storage API

### Backend / API
Dual backend:
1. **Google Apps Script** (primary) — POST requests with FormData (`action`, `token`, params). Base URL configured in `src/services/providers/api/utilApi.js`. A fresh Firebase ID token is injected automatically into every request via an axios request interceptor. On 401, the interceptor forces a token refresh and retries once.
2. **Firebase Firestore** — Primary data store for all modules. Config in `src/services/providers/firebase/settings.js`. Exports: `db` (Firestore), `auth` (Firebase Auth), `messaging` (FCM).

### Layout

The app has multiple layouts, each handling its own section. All are registered in `src/App.js`:

| Layout | Route prefix | File |
|---|---|---|
| `DefaultLayout` | `/*` (catch-all) | `src/layout/DefaultLayout.js` |
| `TaxisLayout` | `/taxis/*` | `src/layout/TaxisLayout.js` |
| `DomoticaLayout` | `/domotica/*` | `src/layout/DomoticaLayout.js` |
| `SystemLayout` | `/system/*` | `src/layout/SystemLayout.js` |

Public pages (login, register, 404) render outside any layout.

#### RULE: Every layout must include `NotificationToaster`

`src/components/shared/NotificationToaster.js` reads from `state.notifications` and renders toasts. It must be mounted in **every** layout — if it is missing from a layout, toasts will never appear on any page served by that layout.

```js
import NotificationToaster from '../components/shared/NotificationToaster'
// inside return:
<NotificationToaster />
```

#### RULE: Toast notifications must be dispatched from sagas, not from views

Dispatching `push` (from `notificationsSlice`) directly in a view handler fires before the async operation completes, so the toast shows even on failure and the timing races with React's re-render cycle. Always dispatch from the saga **after** the service call resolves:

```js
// ✅ Correct — dispatched from saga after Firestore confirms
import { push as notify } from '../../reducers/notificationsSlice'

export function* createSomething({ payload }) {
  try {
    yield call(service.create, payload)
    yield put(successAction(payload))
    yield put(notify({ type: 'success', message: 'Creado correctamente.' }))
  } catch (e) {
    yield put(errorAction(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

// ❌ Wrong — dispatched from view before saga completes
const handleCreate = (form) => {
  dispatch(createRequest(form))
  dispatch(push({ type: 'success', message: '...' })) // fires before Firestore responds
}
```

#### RULE: Every layout component lives in its own folder under `src/components/layout/`

Each component in `src/components/layout/` must have its own dedicated folder containing its JS and SCSS files. **Never place component files loose at the root of `src/components/layout/`.**

```
src/components/layout/
  ComponentName/
    index.js          ← main component (lowercase index for auto-resolution)
    ComponentName.scss
```

- ✅ `src/components/layout/AppHeader/index.js`
- ✅ `src/components/layout/AppSidebar/index.js`
- ❌ `src/components/layout/AppHeader.js` — loose file at layout root
- ❌ `src/components/layout/AppSidebar.js` — always create the folder

Imports from outside resolve automatically without explicit `/index`:
```js
import AppHeader from '../components/layout/AppHeader'     // ✅ resolves to AppHeader/index.js
import { AppSidebarNav } from '../layout/AppSidebarNav'    // ✅
```

Cross-references between sibling layout folders use `../Sibling`, not `./Sibling`. Paths going up beyond `layout/` get an extra `../` compared to when files lived flat:
```js
// inside AppHeader/index.js
import AppHeaderDropdown from '../AppHeaderDropdown'        // ✅ sibling folder
import LanguageSwitcher from '../../shared/LanguageSwitcher' // ✅ up two levels to components/
import useVersionCheck from '../../../hooks/useVersionCheck'  // ✅ up three levels to src/

// ❌ Wrong — assumes flat layout root
import AppHeaderDropdown from './AppHeaderDropdown'
import LanguageSwitcher from '../shared/LanguageSwitcher'
```

### Styling
SCSS with CoreUI variables. Custom overrides in `src/scss/_custom.scss` and `src/scss/_variables.scss`. Prettier enforces: no semicolons, single quotes, trailing commas, 100-char line width, 2-space indent.

#### RULE: All SCSS must use BEM methodology

Every SCSS file in this project must follow **BEM (Block Element Modifier)**. No exceptions.

- **Block**: standalone component root — `.cmd-dict`, `.cp-panel`, `.cp-profile`
- **Element**: part of a block, separated by `__` — `.cp-panel__header`, `.cp-profile__name`, `.cp-item__value`
- **Modifier**: variant or state, separated by `--` — `.cp-panel--loading`, `.cp-icon-btn--danger`, `.cmd-cat--gps`

Rules:
- ✅ Use `&__element` and `&--modifier` shorthand inside the block declaration
- ✅ Standalone helper classes (`.cp-icon-btn`, `.cp-text-btn`) are allowed when they are reused across multiple blocks
- ❌ Never nest descendant selectors inside a block (`.block { .child {} }`) — use `&__child` instead
- ❌ Never use non-BEM class names like `.history-list`, `.route-controls`, `.empty-state` as scoped children

```scss
// ✅ Correct
.cp-profile {
  &__header { ... }
  &__name   { ... }
  &--open   { ... }
}

// ❌ Wrong — descendant selector, not BEM
.cp-profile {
  .header { ... }
  .name   { ... }
}
```

### i18n
`i18next` with Spanish (`es`) as default. Translation files loaded via HTTP backend. Use `useTranslation()` hook and `t('key')` in components.

### Key Libraries
- **DevExtreme / DevExpress** — DataGrid (via `StandardGrid` wrapper) and reporting views
- **Chart.js + CoreUI Charts** — Dashboard charts
- **React Hook Form** — Form handling and validation (see pattern below)
- **Moment.js** — Date manipulation

### Shared Components — folder structure

#### RULE: Every shared component lives in its own folder under `src/components/shared/`

Each component in `src/components/shared/` must have its own dedicated folder containing its JS and SCSS files. **Never place component files loose at the root of `src/components/shared/`.**

```
src/components/shared/
  ComponentName/
    index.js          ← main component (lowercase index for auto-resolution)
    ComponentName.scss
```

- ✅ `src/components/shared/Spinner/index.js`
- ✅ `src/components/shared/StandardForm/index.js`
- ❌ `src/components/shared/Spinner.js` — loose file at shared root
- ❌ `src/components/shared/MyWidget.js` — always create the folder

Imports resolve automatically without explicit `/index`:
```js
import Spinner from 'src/components/shared/Spinner'         // ✅ resolves to Spinner/index.js
import StandardForm from 'src/components/shared/StandardForm' // ✅
```

Exception: `StandardGrid` and `StandardList`/`StandardCard` use `Index.js` (uppercase) and must be imported with the explicit `/Index` suffix:
```js
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import StandardList, { SL } from 'src/components/shared/StandardList/Index'
import StandardCard, { SC } from 'src/components/shared/StandardCard/Index'
```

### Data Grids and Tables

#### RULE: Always use `StandardGrid` — never `DataGrid` directly or `CTable`

All data tables must go through `src/components/shared/StandardGrid/Index.js`. **Never import `DataGrid` from `devextreme-react/data-grid` directly. Never use CoreUI `CTable`.**

```js
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { Column, Paging, FilterRow, Toolbar, Item, MasterDetail } from 'devextreme-react/data-grid'
```

`StandardGrid` is a `React.forwardRef` wrapper around DevExtreme `DataGrid` with shared defaults: borders, column resizing, alternating rows, hover state, native scroll. All DevExtreme child components (`Column`, `Paging`, `FilterRow`, etc.) are used as children of `StandardGrid` exactly as they would be with `DataGrid`.

```js
// ✅ Correct
<StandardGrid dataSource={records} keyExpr="id">
  <Column dataField="name" caption="Nombre" />
  <Column dataField="amount" caption="Valor" dataType="number" />
  <Paging defaultPageSize={25} />
  <FilterRow visible />
</StandardGrid>

// ✅ Override defaults when needed (e.g. compact display in a settings panel)
<StandardGrid dataSource={rows} keyExpr="name" showBorders={false} rowAlternationEnabled={false}>
  <Paging enabled={false} />
  <Column dataField="label" caption="Colección" />
  <Column dataField="count" caption="Docs" width={90} alignment="right" />
</StandardGrid>

// ✅ Editable grid (e.g. month restrictions form)
<StandardGrid
  dataSource={data}
  keyExpr="id"
  editing={{ mode: 'cell', allowUpdating: true, allowAdding: false, allowDeleting: false }}
  onCellValueChanged={handleCellChanged}
>
  <Paging enabled={false} />
  <Column dataField="name" caption="Mes" allowEditing={false} />
  <Column dataField="d1" caption="Día 1" dataType="number" />
</StandardGrid>
```

- ❌ `import DataGrid from 'devextreme-react/data-grid'` — never import DataGrid directly
- ❌ `import { CTable, CTableBody, ... } from '@coreui/react'` — never use CTable
- ❌ `<DataGrid dataSource={...}>` — wrap in StandardGrid instead

### Spinner — Loading states

#### RULE: Never use `CSpinner` directly — always use `<Spinner>`

All loading indicators must go through `src/components/shared/Spinner/index.js`. **Never import `CSpinner` from `@coreui/react`.**

```js
import Spinner from 'src/components/shared/Spinner'
```

| Prop | Values | When to use |
|---|---|---|
| `mode` | `'inline'` (default) | Inside buttons, next to text, small indicators |
| `mode` | `'section'` | Centered in a content area — Suspense fallbacks, data loading |
| `mode` | `'page'` | Fixed full-screen overlay — auth resolving, initial app load |
| `color` | `'primary'` (default), `'info'`, `'light'`, … | Any CoreUI color |
| `variant` | `'border'` (default), `'grow'` | Spinner animation style |
| `size` | `'sm'` | Small spinner for buttons |

```js
// ✅ button saving state
{saving ? <Spinner size="sm" /> : 'Guardar'}

// ✅ Suspense fallback / data loading in a section
<Suspense fallback={<Spinner mode="section" />}>

// ✅ Full-screen overlay while Firebase resolves auth
if (firebaseUser === undefined) return <Spinner mode="page" />
```

- ❌ `import { CSpinner } from '@coreui/react'` — never use CSpinner directly
- ❌ Hand-rolling a centered div + CSpinner — use `mode="section"` or `mode="page"` instead

### Form Layout — StandardForm

#### RULE: All CRUD / panel forms must use `StandardForm`

Every create/edit form rendered as a panel or modal must use the shared component `src/components/shared/StandardForm/index.js`. **Never recreate the form shell manually.**

```js
import StandardForm, { StandardField, SF } from 'src/components/shared/StandardForm'
```

Exports:
- `StandardForm` — wrapper with title, subtitle, cancel/save buttons and spinner
- `StandardField` — label + input pair (`payment-form__field` + `payment-form__label`)
- `SF` — CSS class helpers: `SF.input`, `SF.select`, `SF.textarea`, `SF.readonly`

```jsx
<StandardForm
  title="Nueva cuenta"
  subtitle="ID: abc123"   // optional — shown below title
  onCancel={onCancel}
  onSave={handleSubmit(onSave)}
  saving={saving}
  saveLabel="Crear"       // optional — defaults to i18n common.save
  cancelLabel="Volver"    // optional — defaults to i18n common.cancel
>
  <StandardField label="Nombre *">
    <input className={SF.input} {...register('name', { required: 'Requerido' })} />
    {fieldError(errors.name)}
  </StandardField>

  {/* 2-column grid — wrap StandardFields in a plain div */}
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
    <StandardField label="Tipo">
      <select className={SF.select} {...register('type')} />
    </StandardField>
    <StandardField label="Estado">
      <select className={SF.select} {...register('status')} />
    </StandardField>
  </div>
</StandardForm>
```

- ✅ `StandardField` accepts any ReactNode as `label` — use JSX for inline annotations
- ✅ For readonly inputs use `SF.readonly` + the `readOnly` attribute
- ✅ Custom children (e.g. a button next to an input) go inside `StandardField` as children
- ❌ Never hand-write `<div className="payment-form">`, `__header`, `__body`, `__actions`
- ❌ Never import `CButton` or `CSpinner` inside a form — `StandardForm` owns the action buttons and spinner
- ❌ Never create a separate per-module form SCSS — `StandardForm` brings `payment-form__*` styles automatically

**Intentional exceptions** — these are NOT wrapped in `StandardForm`:
- Bottom-sheet modals (`AdHocExpenseModal`, `PayModal`) — mobile-style overlay with custom layout
- Compact inline/horizontal forms (`SettlementCreateForm`) — row grid embedded in a table header
- Micro-forms inside table cells (`AuditAddForm`) — tiny inputs rendered inside a cell
- Login page — public page with its own branded design

### Form Validation Pattern — React Hook Form

#### RULE: Every form must use `react-hook-form`

**No exceptions.** Every component that collects user input for create or edit must use `react-hook-form`. Never use manual `useState` validation logic or guard clauses like `if (!form.name) return`. The library handles all state, validation, and submission.

```js
import { useForm } from 'react-hook-form'

const fieldError = (err) =>
  err ? <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 2, display: 'block' }}>{err.message}</span> : null

const MyForm = ({ initial, onSave, onCancel, saving }) => {
  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm({ defaultValues: initial })

  return (
    <StandardForm onSave={handleSubmit(onSave)} onCancel={onCancel} saving={saving}>
      <StandardField label="Descripción">
        <input className={SF.input} {...register('description', { required: 'La descripción es obligatoria' })} />
        {fieldError(errors.description)}
      </StandardField>
      <StandardField label="Valor">
        <input className={SF.input} type="number" {...register('amount', {
          required: 'El valor es obligatorio',
          min: { value: 1, message: 'El valor debe ser mayor a 0' },
        })} />
        {fieldError(errors.amount)}
      </StandardField>
    </StandardForm>
  )
}
```

**Core rules:**
- `defaultValues` receives the initial data object — works for both create (EMPTY) and edit (existing record)
- Native inputs (`input`, `select`, `textarea`) use `{...register('field', rules)}` — no `value`/`onChange`
- `handleSubmit(onSave)` validates before calling `onSave`; wire it to the save button or form `onSubmit`
- Render errors inline: `{fieldError(errors.fieldName)}` immediately below each field
- Async/server errors (e.g. 401) stay in `useState` — RHF is only for field-level validation

**Selects with side effects** (e.g. auto-filling other fields when a select changes): destructure `onChange` from `register` and merge:

```js
const { onChange: rhfChange, ...driverReg } = register('driver', { required: 'Requerido' })

<select {...driverReg} onChange={(e) => {
  rhfChange(e)                         // keeps RHF state in sync
  const d = drivers.find(...)
  if (d?.defaultAmount) setValue('amount', String(d.defaultAmount))
}}>
```

**Boolean toggles / custom controls** — use `watch` + `setValue`, never controlled `useState`:

```js
const active = watch('active') ?? true

<button type="button" onClick={() => setValue('active', !active)}>
  {active ? '✓ Activo' : '✗ Inactivo'}
</button>
```

**Checkboxes**: `register` handles them natively; for side effects use the `onChange` option:

```js
{...register('rememberMe', {
  onChange: (e) => { if (e.target.checked) saveCookies() else clearCookies() }
})}
```

**Cross-field validation** (e.g. confirm password):

```js
{...register('confirmPassword', {
  validate: (val) => val === getValues('password') || 'Las contraseñas no coinciden'
})}
```

**File inputs** — not registered; keep attachment state in `useState` and merge on submit:

```js
const [attachment, setAttachment] = useState(null)
const onSubmit = (data) => onSave({ ...data, attachment })
```

**Form reset after save**: pass a changing `key` prop to the form component — React remounts it fresh with empty `defaultValues`. Do not call `reset()` manually.

```jsx
<MyForm key={createKey} initial={EMPTY} onSave={handleCreate} />
// After successful save: setCreateKey(k => k + 1)
```



nunca usar esto:
const REGULATORY = ['SOAT', 'RTM', 'Póliza Resp. Civil', 'Tarjeta de Operación'] dentro de las vistas o archivos esto debe ir en settings

### Mobile List Views — StandardList and StandardCard

#### RULE: Use `StandardList` for row lists and `StandardCard` for card grids — never inline mobile lists

All mobile list/card views must use one of the two shared components. **Never write inline `map()` with hand-coded `<div>` or `<li>` markup for mobile records.**

| Component | Use when | Visual style |
|---|---|---|
| `StandardList` | Compact scannable rows (master records: drivers, users) | Rows with dividers |
| `StandardCard` | Rich items with multiple data points (expenses, vehicles, partners) | Bordered cards with gap |

```js
// List — compact rows with dividers
import StandardList, { SL } from 'src/components/shared/StandardList/Index'

<StandardList
  data={records}
  keyExpr="id"
  emptyText="Sin conductores."
  inactive={(d) => d.active === false}
  renderTitle={(d) => d.name}
  renderBadge={(d) => ({ label: 'Activo', variant: 'active', onClick: () => toggle(d) })}
  renderRows={(d) => [
    [d.idNumber && `CC ${d.idNumber}`, d.phone && <><span className={SL.label}>Cel </span>{d.phone}</>],
    [(d.plate) && <span className={SL.mono}>{d.plate}</span>],
  ]}
  renderActions={(d) => [
    { icon: cilPencil, color: 'primary', title: 'Editar', onClick: () => edit(d) },
    { icon: cilTrash,  color: 'danger',  title: 'Eliminar', onClick: () => del(d.id) },
  ]}
/>

// Card — bordered cards with optional right-side value
import StandardCard, { SC } from 'src/components/shared/StandardCard/Index'

<StandardCard
  data={records}
  keyExpr="id"
  emptyText="Sin gastos."
  renderTitle={(r) => <><span className={SC.tag}>{r.category}</span>{r.description}</>}
  renderValue={(r) => fmt(r.amount)}
  renderBadge={(r) => ({ label: r.paid ? 'Pagado' : 'Pendiente', variant: r.paid ? 'active' : 'warning', onClick: () => toggle(r) })}
  renderRows={(r) => [[r.plate && <span className={SC.mono}>{r.plate}</span>, r.driver, r.date]]}
  renderActions={(r) => [
    { icon: cilPencil, color: 'primary', title: 'Editar', onClick: () => edit(r) },
    { icon: cilTrash,  color: 'danger',  title: 'Eliminar', onClick: () => del(r.id) },
  ]}
/>
```

**Cell helpers (`SL` / `SC`):**
- `.label` — muted prefix text (`Liq `, `Cel `, `CC `)
- `.mono`  — monospace + bold (plates, codes)
- `.muted` — secondary color (brand names, subtitles)
- `.tag`   — small category pill (SC only)

**`renderActions` accepts:**
- `{ icon, color, title, onClick }` — renders a `CIcon`
- `{ label, color, title, onClick }` — renders text or emoji (`'📅'`, `'📎'`)

**`renderBadge` variants:** `'active'` `'inactive'` `'warning'` `'info'` `'default'`

- ❌ Never write a `VehicleCardList`, `ExpenseCardList`, or similar inline component
- ❌ Never render mobile records as raw `<div style={{...}}>` maps
