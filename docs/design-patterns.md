# Design Patterns — My Admin

## Estado global — Flux (Redux)

`Component → dispatch(action) → saga → service → reducer → selector → Component`

- **Command**: actions son comandos inmutables que describen intenciones
- **Mediator**: sagas coordinan side effects sin que componentes se conozcan entre sí
- **Observer**: `useSelector` suscribe el componente al store; re-renderiza solo cuando cambia el slice relevante

## Componentes — Custom Hook + Presentational

El hook concentra todo el estado y la lógica; el componente es JSX puro. Versión moderna del patrón Container/Presentational.

```
useTradeVisualGrid.js  ← estado, efectos, handlers, valores derivados
TradeVisualGrid.js     ← solo JSX, recibe props del hook
```

Ejemplos en el proyecto: `useTradeVisualGrid`, `useAuditView`.

## Composición — Composite / Orchestrator

Los `index.js` son orquestadores: no tienen lógica propia, solo ensamblan sub-componentes.

```
AuditView/index.js   ← llama al hook, pasa props a AuditStatusStrip + AuditFiltersBar + AuditTable
TradeVisualGrid.js   ← llama al hook, pasa props a GridTopControls + GridSvg + GridActionButtons + ...
```

## Acceso a datos — Repository

`src/services/firebase/**` son repositorios: funciones puras que reciben parámetros primitivos y ejecutan la llamada a Firestore. No contienen lógica de negocio.

Regla del proyecto: las vistas nunca importan de `src/services/`. Todo pasa por el stack Redux.

## Formularios — Template Method (vía React Hook Form)

`handleSubmit(onSave)` define el esqueleto del flujo de submit; la validación y el callback son los pasos variables. RHF implementa esto internamente.

```js
const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initial })
// handleSubmit valida → llama onSave solo si todo es válido
```

## Acceso a datos — Strategy (facade configurable)

Cuando una feature necesita soportar múltiples fuentes de datos (Firebase, IndexedDB, REST…) sin que el saga ni el componente sepan cuál está activa, se usa un facade con estado de implementación intercambiable.

```js
// domoticaSolarCalcFacade.js
let _impl = remote   // default

export const configure = (storage) => {
  _impl = storage === 'local' ? local : remote
}

export const fetchSolarCalcConfigs = () => _impl.fetchSolarCalcConfigs()
export const createSolarCalcConfig = (data) => _impl.createSolarCalcConfig(data)
```

El componente llama `configureFacade('local' | 'remote')` al montar. El saga solo conoce la interfaz del facade — nunca sabe si habla con Firestore o IndexedDB.

**Cuándo usarlo**: misma pantalla, misma lógica, distinta persistencia. Ejemplo: calculadora solar con versión Firebase (multi-config, nube) y versión local (una config, offline, sin login).

**Trade-off**: el facade tiene estado mutable global a nivel de módulo. Funciona correctamente porque las dos rutas nunca coexisten. En una app con rutas concurrentes o tests paralelos habría que usar inyección de dependencia explícita.

## Resumen por capa

| Capa | Patrón |
|------|--------|
| Estado global | Flux / Redux |
| Side effects async | Mediator (sagas) |
| Estado local + lógica | Custom Hook |
| Composición de UI | Composite / Orchestrator |
| Acceso a datos | Repository |
| Multi-storage | Strategy (facade configurable) |
| Formularios | Template Method (RHF) |
