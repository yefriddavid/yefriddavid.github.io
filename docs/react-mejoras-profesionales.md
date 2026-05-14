# Mejoras profesionales — React Webapp

Audit realizado sobre el estado actual del codebase. Organizado por prioridad de impacto.

---

## 1. Error Boundaries — CRÍTICO

**Problema**: No existe ningún Error Boundary en el proyecto. Cualquier excepción no capturada en un componente rompe toda la app sin posibilidad de recuperación.

**Archivos afectados**: toda la app — `src/layout/DefaultLayout.js`, `src/components/AppContent.js`

**Implementación**:

```jsx
// src/components/ErrorBoundary.js
class ErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-fallback">
          <p>Algo salió mal.</p>
          <button onClick={() => this.setState({ error: null })}>Reintentar</button>
        </div>
      )
    }
    return this.props.children
  }
}
```

Envolver en `DefaultLayout.js` y alrededor de cada módulo crítico (Taxis, Domotica, Finance).

---

## 2. Selectores sin memoización — ALTO

**Problema**: 151 llamadas a `useSelector` en el proyecto sin `createSelector`. Cada cambio en cualquier slice de Redux provoca re-renders innecesarios en todos los componentes suscritos.

**Archivos más críticos**:
- `src/views/domotica/SolarPanel/Components/HistoryCharts.js`
- `src/views/taxis/Settlements/Index/index.js` (4 selectores consecutivos)
- `src/views/Accounting/AccountStatus/index.js` (12 selectores en un solo componente)

**Implementación**:

```js
// ❌ Actual — nuevo objeto en cada render
const voltageData = useSelector((s) => s.domoticaTransaction.voltageData)

// ✅ Con createSelector (reselect ya es dependencia transitiva de RTK)
import { createSelector } from '@reduxjs/toolkit'

const selectVoltageData = createSelector(
  (s) => s.domoticaTransaction.voltageData,
  (data) => data ?? [],
)

// En el componente
const voltageData = useSelector(selectVoltageData)
```

Centralizar los selectores en archivos `src/selectors/<módulo>.js` para reutilización.

---

## 3. Componentes gigantes — ALTO

**Problema**: Varios archivos superan las 1000 líneas mezclando lógica de negocio, estado, efectos y render. Son inmantenibles y no se pueden testear de forma aislada.

| Archivo | Líneas | Problema principal |
|---|---|---|
| `src/views/CashFlow/assets/Assets.js` | 1503 | 42 hooks `useState`, lógica mezclada |
| `src/views/Contratos/GenerarContrato/index.js` | 1333 | Modales, forms y validación juntos |
| `src/views/taxis/Settlements/Index/index.js` | 1242 | Lógica de auditoría + UI + cálculos |
| `src/views/taxis/Settlements/Components/AuditView/index.js` | 1231 | Similar al anterior |
| `src/views/Finance/CustomGridTrade/TradeVisualGrid.js` | 1186 | Grid + datos realtime |
| `src/views/CashFlow/projects/MyProjects/ProjectCard.js` | 1007 | 31 hooks `useState` |

**Estrategia de refactor**:

```
Antes: SettlementsIndex.js (1242 líneas)

Después:
  hooks/useSettlementsData.js     ← fetch + estado Redux
  hooks/useAuditLogic.js          ← cálculos y derivaciones
  Components/AuditTable.js        ← tabla DevExtreme
  Components/SummaryCards.js      ← tarjetas resumen
  index.js                        ← orquestador (~150 líneas)
```

Regla: ningún archivo de vista supera 400 líneas.

---

## 4. Formularios mixtos — react-hook-form no se usa consistentemente — MEDIO

**Problema**: RHF ya está instalado y hay un patrón definido en `CLAUDE.md`, pero varios componentes todavía usan validación manual con `useState`.

**Archivos que deben migrarse**:
- `src/views/login/Login.js` — validación manual con estado
- `src/views/domotica/Devices/Devices.js` — `DeviceForm` con `onChange` manual
- `src/views/movements/payments/Payments.js` — **único class component** de la app, usa `connect()` de Redux v4

**Patrón correcto** (ver `src/views/taxis/Expenses.js` como referencia):

```js
const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initial })
```

---

## 5. Sagas sin manejo de errores parciales — MEDIO

**Problema**: operaciones en batch no tienen recuperación por iteración. Si falla el paso 5 de 10, los 5 restantes se abandonan silenciosamente.

**Archivo**: `src/sagas/cashflow/accountsMasterSagas.js` — funciones `createManyAccountsMaster` y `patchManyAccountsMaster`

**Implementación**:

```js
// ❌ Actual — falla silenciosa
for (const item of items) {
  yield call(service.create, item)
}

// ✅ Con recuperación por ítem
const results = { success: [], failed: [] }
for (const item of items) {
  try {
    const id = yield call(service.create, item)
    results.success.push(id)
  } catch (e) {
    results.failed.push({ item, error: e.message })
  }
}
if (results.failed.length) {
  yield put(actions.partialError(results))
}
```

---

## 6. `useEffect` con timers sin cleanup — MEDIO

**Problema**: `setTimeout` y `setInterval` usados sin retornar la función de cleanup. Si el componente desmonta antes de que dispare el timer, React intenta hacer `setState` en un componente muerto (warning + posible memory leak).

**Archivos afectados**:
- `src/views/domotica/SerialConsole/CommandDictionary.js:122` — `setTimeout` en `useCallback` sin cleanup
- `src/views/domotica/SerialConsole/SerialConsole.js:270` — `setTimeout` fuera de `useEffect`

**Implementación**:

```js
// ❌ Actual
useEffect(() => {
  setTimeout(() => setToasts([]), 2500)
}, [])

// ✅ Con cleanup
useEffect(() => {
  const id = setTimeout(() => setToasts([]), 2500)
  return () => clearTimeout(id)
}, [])
```

---

## 7. Strings en español hardcodeados fuera de i18next — BAJO

**Problema**: el setup de i18next existe y funciona, pero ~20 archivos tienen textos de UI en español hardcodeados sin pasar por `t()`.

**Ejemplos**:
- `src/views/Accounting/Accounts.js:26` — `"Listado de Cuentas"`
- `src/views/Accounting/AccountsMaster/index.js:447` — `"Nueva cuenta maestra"`
- `src/views/domotica/Devices/Devices.js:39,50,63` — labels de dispositivos
- `src/views/Accounting/AccountStatus/AdHocExpenseModal.js` — botón `"Guardar"`

**Fix**:

```js
// ❌
<CButton>Guardar</CButton>

// ✅
const { t } = useTranslation()
<CButton>{t('common.save')}</CButton>
```

---

## 8. Sin TypeScript — BAJO (futuro)

**Estado**: todo el proyecto es `.js` puro. No hay PropTypes en vistas nuevas.

**Impacto**: sin autocompletado en selectores Redux, sin validación de props en componentes, errores de tipado en runtime que TypeScript detectaría en build time.

**Estrategia incremental** (sin migración big-bang):
1. Agregar `// @ts-check` + JSDoc en servicios y reducers críticos
2. Renombrar módulos nuevos a `.ts`/`.tsx` a medida que se crean
3. Configurar `tsconfig.json` con `allowJs: true` para coexistencia

---

## Resumen de prioridades

| # | Mejora | Esfuerzo estimado | Impacto |
|---|---|---|---|
| 1 | Error Boundaries | 2 horas | Estabilidad en producción |
| 2 | Memoización de selectores críticos | 1 día | Performance / re-renders |
| 3 | Extraer hooks de vistas >1000 líneas | 3–5 días | Mantenibilidad |
| 4 | Unificar formularios a RHF | 2 días | Consistencia del patrón |
| 5 | Cleanup de timers en `useEffect` | 1 hora | Memory leaks |
| 6 | Sagas con errores parciales | 4 horas | UX en operaciones batch |
| 7 | i18next consistente | 2 días | Internacionalización |
| 8 | TypeScript incremental | Continuo | Calidad a largo plazo |


  ┌─────┬───────────────────────────────────────────┬──────────┬────────────────────────┐                                                                                                     
  │  #  │                  Mejora                   │ Esfuerzo │        Impacto         │                                                                                                     
  ├─────┼───────────────────────────────────────────┼──────────┼────────────────────────┤                                                                                                     
  │ 1   │ Error Boundaries                          │ 2h       │ Estabilidad producción │                                                                                                     
  ├─────┼───────────────────────────────────────────┼──────────┼────────────────────────┤                                                                                                     
  │ 2   │ Memoización selectores críticos           │ 1 día    │ Performance            │                                                                                                     
  ├─────┼───────────────────────────────────────────┼──────────┼────────────────────────┤                                                                                                     
  │ 3   │ Extraer hooks de componentes >1000 líneas │ 3-5 días │ Mantenibilidad         │                                                                                                     
  ├─────┼───────────────────────────────────────────┼──────────┼────────────────────────┤                                                                                                     
  │ 4   │ Unificar formularios a RHF                │ 2 días   │ Consistencia           │                                                                                                     
  ├─────┼───────────────────────────────────────────┼──────────┼────────────────────────┤                                                                                                     
  │ 5   │ Cleanup de timers en useEffect            │ 1h       │ Memory leaks           │                                                                                                     
  └─────┴───────────────────────────────────────────┴──────────┴────────────────────────┘

