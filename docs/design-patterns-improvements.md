# Design Patterns — Mejoras pendientes

## 1. Dividir hooks grandes

**Problema:** `useTradeVisualGrid` (274 líneas) y `useAuditView` (249 líneas) manejan múltiples responsabilidades en un solo hook.

**Solución:** Dividir por concern siguiendo el principio de responsabilidad única.

```
useTradeVisualGrid.js  →  useGridLevels.js    (cálculo de niveles, toY, fmt, fmtVal, fs)
                          useGridPan.js       (drag, pointer events, panEnabled)
                          useGridFilters.js   (priceFilter, hiddenTrades, showHiddenOnly)
                          useGridPnl.js       (totals, loanCost, pnlNet por trade)

useAuditView.js        →  useAuditFilters.js  (plate/driver/status filters, auditFilteredDays)
                          useAuditCols.js     (visibleCols, colOrder, drag-reorder, colMgr)
                          useAuditActions.js  (AI analysis, Excel/PDF export, fullscreen)
```

**Esfuerzo:** Bajo | **Riesgo:** Bajo | **Impacto:** Alto (legibilidad, testabilidad)

---

## 2. Context para estado compartido del grid

**Problema:** `GridSvg` recibe ~30 props. Props drilling de este nivel indica que el estado debería vivir en un Context accesible por toda la subárbol.

**Solución:** `GridContext` con `useGridContext()` hook de consumo.

```js
// GridContext.js
const GridContext = createContext(null)
export const GridProvider = ({ hook, children }) => (
  <GridContext.Provider value={hook}>{children}</GridContext.Provider>
)
export const useGridContext = () => useContext(GridContext)

// TradeVisualGrid.js
<GridProvider hook={hook}>
  <GridTopControls />   {/* consume lo que necesita via useGridContext() */}
  <GridSvg />           {/* ya no recibe 30 props */}
  <GridActionButtons />
</GridProvider>
```

**Esfuerzo:** Medio | **Riesgo:** Bajo | **Impacto:** Alto (elimina props drilling)

---

## 3. Migrar redux-act → RTK createSlice

**Problema:** El proyecto usa `redux-act` (2016). Cada slice requiere `createAction` + `createReducer` por separado con mucho boilerplate.

**Solución:** Migrar a `@reduxjs/toolkit` `createSlice` que unifica actions y reducers, tiene Immer integrado y es el estándar actual.

```js
// Antes (redux-act)
export const fetchRequest = createAction('account/fetchRequest')
export const fetchSuccess = createAction('account/fetchSuccess')
const reducer = createReducer({ data: null }, {
  [fetchRequest]: (state) => ({ ...state, loading: true }),
  [fetchSuccess]: (state, payload) => ({ ...state, data: payload }),
})

// Después (createSlice)
const accountSlice = createSlice({
  name: 'account',
  initialState: { data: null, loading: false },
  reducers: {
    fetchRequest: (state) => { state.loading = true },
    fetchSuccess: (state, { payload }) => { state.data = payload },
  },
})
export const { fetchRequest, fetchSuccess } = accountSlice.actions
export default accountSlice.reducer
```

**Esfuerzo:** Alto (afecta todos los slices + sagas) | **Riesgo:** Medio | **Impacto:** Alto (menos código, mejor DX)

---

## 4. Error Bus centralizado para errores async

**Problema:** Los errores de sagas no tienen destino uniforme. Algunos muestran toast, otros se pierden silenciosamente. No hay patrón consistente.

**Solución:** Un slice `notifications` + hook `useNotify()` como único canal de feedback al usuario.

```js
// notificationsSlice.js
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: [],
  reducers: {
    push: (state, { payload }) => { state.push({ id: Date.now(), ...payload }) },
    dismiss: (state, { payload }) => state.filter((n) => n.id !== payload),
  },
})

// En cualquier saga:
yield put(push({ type: 'error', message: 'No se pudo guardar el pago' }))
yield put(push({ type: 'success', message: 'Liquidación creada' }))

// En AppContent o DefaultLayout:
const useNotify = () => useSelector((s) => s.notifications)
```

**Esfuerzo:** Medio | **Riesgo:** Bajo | **Impacto:** Medio (UX consistente)

---

## 5. Facade entre sagas y servicios Firebase

**Problema:** Las sagas llaman directamente a funciones de `src/services/firebase/`. Si cambia el proveedor de datos, hay que modificar cada saga.

**Solución:** Una capa Facade que expone una interfaz estable; los servicios concretos quedan detrás.

```js
// src/services/facade/accountFacade.js
import { getAccounts, saveAccount } from '../firebase/accountService'
export const accountFacade = { getAll: getAccounts, save: saveAccount }

// saga
import { accountFacade } from 'src/services/facade/accountFacade'
const data = yield call(accountFacade.getAll, params)
```

**Esfuerzo:** Medio | **Riesgo:** Bajo | **Impacto:** Medio (desacoplamiento, testabilidad)

---

## Resumen priorizado

| # | Mejora | Esfuerzo | Riesgo | Impacto |
|---|--------|----------|--------|---------|
| 1 | Dividir hooks grandes | Bajo | Bajo | Alto |
| 2 | Context para grid | Medio | Bajo | Alto |
| 3 | redux-act → createSlice | Alto | Medio | Alto |
| 4 | Error Bus centralizado | Medio | Bajo | Medio |
| 5 | Facade Firebase | Medio | Bajo | Medio |
