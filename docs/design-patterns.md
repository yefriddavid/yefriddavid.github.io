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

## Resumen por capa

| Capa | Patrón |
|------|--------|
| Estado global | Flux / Redux |
| Side effects async | Mediator (sagas) |
| Estado local + lógica | Custom Hook |
| Composición de UI | Composite / Orchestrator |
| Acceso a datos | Repository |
| Formularios | Template Method (RHF) |
