# Auditoría de Componentes Compartidos

> Fecha: 2026-05-13
> Objetivo: Identificar patrones de código repetido en `src/views` para extraerlos como componentes reutilizables.

---

## Componentes compartidos existentes

Antes de crear nuevos, lo que ya está abstraído en `src/components/shared/`:

| Componente | Archivo | Descripción |
|---|---|---|
| `AppModal` | `AppModal/AppModal.js` | Bottom sheet + center modal con backdrop |
| `StandardForm` | `StandardForm.js` | Wrapper de formulario con Cancel/Save |
| `StandardGrid` | `StandardGrid/Index.js` | Wrapper de DevExtreme DataGrid |
| `AttachmentViewer` | `AttachmentViewer.js` | Visor de archivos adjuntos (base64) |
| `DetailPanel` | `DetailPanel.js` | Panel de detalle con secciones/filas |
| `MultiSelectDropdown` | `MultiSelectDropdown.js` | Dropdown con selección múltiple |
| `ErrorBoundary` | `ErrorBoundary.js` | Boundary de errores React |

---

## Patrones repetidos detectados

### 🔴 Alta prioridad

---

#### 1. `fmt()` — Formateador de moneda COP

**Apariciones:** 6 archivos con definición propia

| Archivo | Línea aprox. |
|---|---|
| `src/views/Accounting/AccountStatus/helpers.js` | ~5 |
| `src/views/CashFlow/assets/Assets.js` | ~10 |
| `src/views/CashFlow/assets/assetHelpers.js` | ~5 |
| `src/views/CashFlow/projects/MyProjects/helpers.js` | ~5 |
| `src/views/taxis/Home.js` | ~66 |
| `src/views/taxis/Settlements/Components/utils.js` | ~5 |

**Código duplicado:**
```js
const fmt = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n ?? 0)
```

**Solución propuesta:** Centralizar en `src/utils/formatters.js` y exportar `fmt`, `fmtNum`, `fmtDate`.

---

#### 2. `PeriodSelector` — Selector de mes/año

**Apariciones:** 8+ vistas con implementación propia

| Archivo |
|---|
| `src/views/taxis/Settlements/Index/index.js` |
| `src/views/taxis/Expenses.js` |
| `src/views/taxis/Operations.js` |
| `src/views/taxis/Summary.js` |
| `src/views/taxis/Home.js` |
| `src/views/Accounting/AccountStatus/index.js` |
| `src/views/CashFlow/assets/Assets.js` |
| `src/views/CashFlow/eggs/Eggs.js` |

**Código duplicado:**
```jsx
const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })

<CFormSelect
  value={period.month}
  onChange={(e) => setPeriod(p => ({ ...p, month: Number(e.target.value) }))}>
  {MONTHS.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
</CFormSelect>
<CFormSelect
  value={period.year}
  onChange={(e) => setPeriod(p => ({ ...p, year: Number(e.target.value) }))}>
  {years.map(y => <option key={y} value={y}>{y}</option>)}
</CFormSelect>
```

**Solución propuesta:** `src/components/shared/PeriodSelector.js`
```jsx
<PeriodSelector value={period} onChange={setPeriod} years={availableYears} />
```

---

#### 3. `StatusBadge` — Badge activo/inactivo

**Apariciones:** 12+ usos con estilos definidos inline cada vez

| Archivo |
|---|
| `src/views/taxis/Drivers.js` |
| `src/views/taxis/Vehicles.js` |
| `src/views/taxis/Partners.js` |
| `src/views/Accounting/AccountStatus/AccountCard.js` |
| `src/views/domotica/Devices/Devices.js` |
| `src/views/domotica/SolarPanel/Components/BatteryInfoCard.js` |

**Código duplicado:**
```jsx
<span style={{
  fontSize: 12,
  fontWeight: 700,
  borderRadius: 20,
  padding: '3px 10px',
  background: item.active ? '#d3f9d8' : '#ffe3e3',
  color: item.active ? '#2f9e44' : '#c92a2a',
  border: `1px solid ${item.active ? '#8ce99a' : '#ffa8a8'}`,
}}>
  {item.active ? 'Activo' : 'Inactivo'}
</span>
```

**Solución propuesta:** `src/components/shared/StatusBadge.js`
```jsx
<StatusBadge active={item.active} />
// o con label custom:
<StatusBadge value={status} labels={{ ok: 'Conectado', error: 'Error' }} colors={...} />
```

---

### 🟡 Media prioridad

---

#### 4. `KPICard` — Tarjeta de métrica

**Apariciones:** 6 usos en dashboards, definida localmente en `taxis/Home.js`

**Código actual (local en Home.js ~línea 94):**
```jsx
const KpiCard = ({ label, value, sub, accent, icon, delta, deltaInvert }) => (
  <CCard style={{ '--kpi-accent': accent }}>
    <div className="kpi-card__label">{label}</div>
    <div className="kpi-card__value">{value}</div>
    <div className="kpi-card__bottom">
      <span className="kpi-card__sub">{sub}</span>
      <Delta value={delta} invert={deltaInvert} />
    </div>
  </CCard>
)
```

**Solución propuesta:** `src/components/shared/KPICard.js` — mover el componente existente y compartir entre dashboards.

---

#### 5. `EmptyState` — Estado vacío

**Apariciones:** 15+ usos con estilos y mensajes distintos

| Archivo | Contexto |
|---|---|
| `src/views/taxis/Home.js` | ~4 secciones de gráficas vacías |
| `src/views/Accounting/AccountStatus/index.js` | `as-empty-container` |
| `src/views/domotica/SolarPanel/Components/VoltageChart.js` | "Sin datos de voltaje para hoy." |
| `src/views/domotica/Cleanup/Cleanup.js` | `cleanup__empty` |
| Múltiples vistas con `noDataText` en grids | — |

**Código duplicado:**
```jsx
<div className="taxis-home__empty">
  <span>📭</span>
  <p>Sin datos para este período</p>
</div>
```

**Solución propuesta:** `src/components/shared/EmptyState.js`
```jsx
<EmptyState message="Sin datos para este período" icon="📭" />
```

---

#### 6. `ConfirmDelete` — Confirmación de borrado

**Apariciones:** 10+ usos de `window.confirm()` con mensaje personalizado

| Archivo | Línea aprox. |
|---|---|
| `src/views/Accounting/AccountStatus/index.js` | ~230 |
| `src/views/Accounting/AccountsMaster/index.js` | ~72, ~79, ~97 |
| `src/views/CashFlow/trade/GridTrade/index.js` | ~42 |
| `src/views/CashFlow/assets/Assets.js` | ~972 |
| `src/views/CashFlow/eggs/Eggs.js` | ~415 |
| `src/views/taxis/Partners.js` | ~104 |
| `src/views/taxis/Settlements/Index/index.js` | ~194 |

**Código duplicado:**
```js
const handleDelete = (id, name) => {
  if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
  dispatch(deleteRequest({ id }))
}
```

**Solución propuesta:** Hook `src/hooks/useConfirmDelete.js`
```js
const { confirm, ConfirmDialog } = useConfirmDelete()

const handleDelete = async (item) => {
  const ok = await confirm(`¿Eliminar "${item.name}"?`)
  if (ok) dispatch(deleteRequest({ id: item.id }))
}
```

---

#### 7. `FileUploadField` — Upload con preview

**Apariciones:** 2 usos con código casi idéntico (~90 líneas cada uno)

| Archivo | Línea aprox. |
|---|---|
| `src/views/Accounting/AccountStatus/AdHocExpenseModal.js` | ~228 |
| `src/views/Accounting/AccountStatus/PayModal.js` | ~172 |

**Código duplicado:**
```jsx
const [attachment, setAttachment] = useState(null)
const [attachName, setAttachName] = useState('')
const [processing, setProcessing] = useState(false)
const [fileError, setFileError] = useState('')
const fileRef = useRef()

const handleFile = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  setProcessing(true)
  try {
    const data = await processAttachmentFile(file)
    setAttachment(data)
    setAttachName(file.name)
  } catch (err) {
    setFileError(`Error procesando archivo: ${err.message}`)
  } finally {
    setProcessing(false)
  }
}

// JSX: input hidden + botón + spinner + preview + Cambiar/Quitar
```

**Solución propuesta:** `src/components/shared/FileUploadField.js`
```jsx
<FileUploadField
  value={attachment}
  name={attachName}
  onChange={(data, name) => { setAttachment(data); setAttachName(name) }}
/>
```

---

### 🟢 Baja prioridad

---

#### 8. `SummaryRow` — Fila de total monetario

**Apariciones:** 8+ usos en vistas de contabilidad y taxis

Patrón: label + valor formateado + barra de progreso opcional. Solución: `src/components/shared/SummaryRow.js`.

---

#### 9. `InlineEditingCell` — Celda editable en place

**Apariciones:** 1 uso principal (`AccountCard.js`)

Patrón: modo vista con click → modo edición con input + Save/Cancel. Solución: `src/components/shared/InlineEditingCell.js`.

---

## Plan de implementación sugerido

| Prioridad | Artefacto | Tipo | Impacto |
|---|---|---|---|
| 1 | `src/utils/formatters.js` | Utility | Elimina 6 definiciones duplicadas de `fmt` |
| 2 | `src/components/shared/StatusBadge.js` | Component | Unifica 12+ badges de estado |
| 3 | `src/components/shared/EmptyState.js` | Component | Unifica 15+ estados vacíos |
| 4 | `src/components/shared/PeriodSelector.js` | Component | Centraliza 8 selectores de período |
| 5 | `src/components/shared/FileUploadField.js` | Component | Elimina ~270 líneas duplicadas |
| 6 | `src/hooks/useConfirmDelete.js` | Hook | Reemplaza 10+ `window.confirm()` |
| 7 | `src/components/shared/KPICard.js` | Component | Extrae componente ya existente en Home.js |

---

## Notas

- Los componentes nuevos deben seguir el patrón CSS existente (clases BEM o `payment-form__*` según contexto).
- No usar Firebase Storage — adjuntos siguen en base64 vía `processAttachmentFile`.
- Toda tabla de datos debe seguir usando `StandardGrid` (DevExtreme), no CTable.
- Los formularios siguen usando `react-hook-form` con el patrón `StandardForm` + `fieldError`.
