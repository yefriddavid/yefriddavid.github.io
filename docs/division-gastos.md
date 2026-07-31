# División de gastos — Personal vs Inmobiliaria

## Motivación

El usuario maneja 3 divisiones de gastos: Taxi (módulo propio), Personales y
Inmobiliaria. Los gastos/ingresos de Inmobiliaria estaban mezclados dentro del
dashboard de Personales (`AccountStatus`). Se separaron visualmente sin duplicar
código: mismo componente, mismos slices de Redux, mismas colecciones de Firestore,
parametrizado por un campo `division`.

## Mecanismo

```
Ruta                                → division
/finance/management/account-status  → 'personal'  (default, retrocompatible)
/inmobiliaria/account-status         → 'inmobiliaria'
```

`AccountStatus/index.js` deriva `division` de `useLocation().pathname` (si empieza
con `/inmobiliaria/`, es `'inmobiliaria'`; si no, `'personal'`) — no es un campo de
formulario, el usuario nunca lo elige a mano al crear un gasto.

**Lectura**: el fetch de `accountsMaster`/`transaction`/`accountStatusNote` no cambió
(sigue trayendo todo el año, scoped solo por `tenantId`, igual que antes). El filtro
por división es **client-side**, dentro de los `useMemo` de `index.js`
(`applicable`, `adHocTransactions`, `totalIncome/totalExpenses`, notas de período):
`(doc.division ?? 'personal') === division`. Los documentos viejos sin el campo
`division` se tratan como `'personal'` — no hizo falta backfill en Firestore.

**Escritura**: `division` se agrega al payload en los 3 `createRequest` de
`index.js` (`handleSavePayment`, `handleSaveAdHoc`, `handleAddNote`). Los servicios
(`src/services/firebase/cashflow/{accountsMaster,transactions,accountStatusNotes}.js`)
ya escriben el objeto recibido tal cual (spread), así que no hizo falta cambiar sus
firmas — solo se agregó `division` al mapeo de lectura de `accountsMaster.js` y
`accountStatusNotes.js` (`transactions.js` ya hacía spread completo).

**Mover gastos ya mezclados**: botón "→ Inmobiliaria" / "→ Personal" en
`AccountCard.js` y `AdHocSection.js` — dispatcha el `updateRequest` genérico ya
existente con `{ id, division: otraDivision }`. Reclasifica sin editar el resto de
los campos.

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `src/services/firebase/cashflow/accountsMaster.js` | `division` en el mapeo de lectura |
| `src/services/firebase/cashflow/accountStatusNotes.js` | `division` en lectura + `createPeriodNote` |
| `src/views/Accounting/AccountStatus/index.js` | derivación de `division`, filtros client-side, `division` en payloads de creación, handlers de "mover" |
| `src/views/Accounting/AccountStatus/AccountCard.js` | botón mover división |
| `src/views/Accounting/AccountStatus/AdHocSection.js` | botón mover división |
| `src/routes.js` | ruta `/inmobiliaria/account-status` → mismo lazy `AccountStatus` |
| `src/_nav.js` | ítem "Estado de Cuentas" dentro del `CNavGroup` Inmobiliaria existente |

No se tocó: `combineReducers.js`, `sagas/index.js`, `settings.js` (sin colecciones
nuevas), ningún slice/reducer/saga nuevo, ninguna vista forkeada.

## Categorías

Inmobiliaria reutiliza las mismas `EXPENSE_CATEGORIES`/`ACCOUNT_CATEGORIES` de
`src/constants/cashFlow.js` que Personal — decisión deliberada para no forkear
`DetailModal.js`/`AdHocExpenseModal.js`.

## Limitación conocida

No hay botón "Nueva cuenta maestra" dentro de este dashboard (ni lo había antes) —
las cuentas maestras nuevas solo se crean clonando una existente (`handleClone`,
conserva la división de origen) o desde el CRUD plano `AccountsMaster/index.js`
(fuera del alcance de este cambio).
