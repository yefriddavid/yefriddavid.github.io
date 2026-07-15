# Esquema de Base de Datos

> Documentación de referencia de la base de datos de My-Admin. **Solo describe la estructura de datos** (colecciones, campos, tipos y relaciones) — no contiene código ni detalles de implementación de la app.

## 1. Motor de base de datos

La aplicación usa **Cloud Firestore** (NoSQL orientado a documentos, sin esquema forzado a nivel de motor). El "esquema" descrito aquí es el **esquema de facto**: la forma consistente que cada colección tiene en la práctica, según cómo la escribe y la lee la aplicación.

Existen **tres proyectos de Firebase independientes**, cada uno con su propia base Firestore:

| Proyecto | Instancia | Módulos que lo usan |
|---|---|---|
| Principal (`db`) | `firebaseConfig` | Admin/Tenants, Seguridad (users/sessions/fcm_tokens), CashFlow, Finance, Contratos, Inmobiliaria, Misc, System |
| Taxi (`dbTaxi`) | `taxiConfig` | Todas las colecciones `Taxi_*` |
| Domótica (`dbDomotica`) | `domoticaConfig` | Todas las colecciones `Domotica_*` |

Al ser proyectos separados, **no existen relaciones (FK) directas entre colecciones de proyectos distintos** salvo el campo `tenantId`, que referencia `Admin_Tenants` (proyecto principal) desde colecciones que viven en `dbTaxi` o `dbDomotica` — es decir, es una referencia cruzada de proyecto, resuelta a nivel de aplicación, no de base de datos.

Además de Firestore, se usan:
- **Firebase Realtime Database** (`rtdb` / `rtdbDomotica`) para telemetría en vivo y comandos de Domótica (`solar/battery`, `solar/commands`) — no está documentada aquí por ser un árbol JSON en tiempo real, no colecciones de documentos.
- **REST API externa** para lectura de batería solar en vivo (no es parte de la base de datos de la app).

## 2. Multi-tenencia

La app es multi-tenant. `Admin_Tenants` es la tabla raíz de tenants (organizaciones/cuentas). La mayoría de colecciones del proyecto principal y de `dbTaxi` llevan un campo `tenantId` (string) que referencia el `id` de un documento en `Admin_Tenants`, escrito al crear el documento y usado como filtro obligatorio (`where('tenantId', '==', ...)`) en toda lectura — cada documento de negocio sigue perteneciendo a **un solo** tenant.

La relación **usuario↔tenant** es distinta: un usuario puede pertenecer a **varios** tenants (`users.tenantIds`, array — ver §5). El tenant "activo" con el que se opera en una sesión dada es un id resuelto en el cliente (no un campo de BD): se guarda en `profile.data.activeTenantId` (Redux) y se cachea vía `tenantContext` (localStorage cifrado). Con más de un tenant asignado, el usuario elige cuál activar mediante el selector `TenantPicker`.

Colecciones **sin** `tenantId` (no multi-tenant): `App_Settings`, `sessions`, `fcm_tokens`, `page_visits`, `System_error_logs`, `System_audit_logs`, `System_perf_logs`, `System_contact_messages`, `Finance_sync_sessions`, todas las colecciones `Domotica_*`, y la subcolección `versions` de `Finance_Pictures` (hereda el tenant del documento padre).

## 3. Almacenamiento de archivos

No se usa Firebase Storage (prohibido en este proyecto). Todas las imágenes/archivos adjuntos (fotos de vehículos/conductores, comprobantes, adjuntos de contrato, fotos de diseño) se guardan como **strings base64** directamente dentro del documento Firestore (campos como `image`, `photo`, `data`, `attachment`, `propertyPhoto`, etc.).

---

## 4. Índice de colecciones por módulo

| Módulo | Proyecto | Colecciones |
|---|---|---|
| App / Sistema | Principal | `App_Settings` |
| Admin / Seguridad | Principal | `Admin_Tenants`, `users`, `sessions`, `fcm_tokens` |
| CashFlow | Principal | `CashFlow_AccountsMaster`, `CashFlow_Transactions`, `CashFlow_assets`, `CashFlow_eggs`, `CashFlow_my_projects`, `CashFlow_salary_distribution`, `CashFlow_account_status_period_notes` |
| Taxi | Taxi (`dbTaxi`) | `Taxi_liquidaciones`, `Taxi_conductores`, `Taxi_vehiculos`, `Taxi_gastos`, `Taxi_partners`, `Taxi_distributions`, `Taxi_period_notes`, `Taxi_audit_notas`, `Taxi_period_attachments`, `Taxi_vehicle_location_history`, `Taxi_driver_documents`, `Taxi_driver_gen_docs` |
| Finance | Principal | `Finance_grid_trades`, `Finance_Custom_Grid_Trades`, `Finance_Increase_Decrease`, `Finance_Crypto_Purchases`, `Finance_Pictures` (+ subcolección `versions`), `Finance_Scenes3D`, `Finance_sync_sessions` (+ subcolecciones `offerCandidates`/`answerCandidates`) |
| Inmobiliaria | Principal | `Inmobiliaria_Designs`, `Inmobiliaria_Planos` |
| Contratos | Principal | `Contratos_Contratos`, `Contratos_Inmuebles`, `Contratos_Propietarios`, `Contratos_CuentasBancarias`, `Contratos_contract_notes`, `Contratos_contract_attachments`, `Contratos_module_notes` |
| Domótica | Domótica (`dbDomotica`) | `Domotica_devices`, `Domotica_transactions`, `Domotica_current`, `Domotica_command_dictionary`, `Domotica_command_profiles`, `Domotica_command_profile_items`, `Domotica_solar_calc`; `Domotica_Solar` y `Domotica_command` definidas pero sin uso en Firestore (datos viven en Realtime Database / API REST) |
| Misc | Principal | `Misc_tasks`, `Misc_notes` |
| System / Analítica | Principal | `page_visits`, `System_error_logs`, `System_audit_logs`, `System_perf_logs`, `System_contact_messages` |

---

## 5. Admin / Seguridad

### `Admin_Tenants`
Tabla raíz de tenants (organizaciones). Sin colección de miembros propia: los miembros se resuelven consultando `users` donde `tenantId == tenant.id`.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| id | string (id doc) | — | — |
| name | string | Nombre del tenant/empresa | — |
| slug | string | Identificador URL-safe (`^[a-z0-9-]+$`) | — |
| plan | string (enum) | `basic` \| `pro` \| `enterprise` | — |
| contactName | string \| null | Contacto principal | — |
| contactEmail | string \| null | Email de contacto | — |
| active | boolean | Activo/pendiente de aprobación | — |
| createdAt | timestamp | — | — |

### `users`
Id de documento = `username`.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| username | string (id doc) | Identificador de login | — |
| name | string | Nombre visible | — |
| role | string (enum) | `superAdmin` \| `manager` \| `conductor` (registro propio también crea `admin`, fuera del enum declarado) | — |
| email | string \| null | Email de contacto; deriva el email sintético de Firebase Auth `${username}@cashflow.app` | — |
| avatar | string base64 \| null | Foto de perfil | — |
| active | boolean | — | — |
| passwordHash | string | Hash SHA-256 (fallback de login legado) | — |
| salt | string | Password cifrado con AES para resincronizar Firebase Auth | — |
| landingPage | string \| null | Ruta de aterrizaje por defecto tras login | — |
| tenantIds | array\<string\> | Tenants a los que pertenece el usuario (relación N:M usuario↔tenant; reemplazó al antiguo campo `tenantId` de un solo valor — ver migración `scripts/migrate-user-tenantids.mjs`) | → `Admin_Tenants.id` (cada elemento) |
| createdAt | timestamp | — | — |

> El **tenant activo** de la sesión (`activeTenantId`) no se persiste en Firestore: vive en `profile.data.activeTenantId` (Redux) y se cachea en el cliente (`tenantContext`, localStorage cifrado). Si `tenantIds` tiene 0 o 1 elemento se activa automáticamente; si tiene más de uno, se conserva el último activo si sigue siendo válido o, si no, se fuerza un selector (`TenantPicker`) para que el usuario elija con cuál trabajar.

### `sessions`
Id de documento = `sessionId` (UUID).

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| sessionId | string (id doc) | UUID generado al login | — |
| username | string | Usuario propietario | → `users.username` |
| token | string | Token de sesión (ID token de Firebase o fallback legado) | — |
| userAgent | string | Navegador/dispositivo | — |
| createdAt | timestamp | — | — |

### `fcm_tokens`
Id de documento = el propio token FCM.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| token | string (id doc + campo) | Token push de Firebase Cloud Messaging | — |
| userAgent | string | — | — |
| origin | string | Origen (`window.location.origin`) | — |
| createdAt | timestamp | — | — |

---

## 6. App / Sistema

### `App_Settings`
Almacén global clave/valor. Id de documento = la clave del setting.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| key (id doc) | string | Clave del setting (ej. `egg_current_price`) | — |
| value | string | Valor del setting | — |
| updatedAt | timestamp | — | — |

---

## 7. CashFlow

### `CashFlow_AccountsMaster`
Líneas maestras de cuentas/presupuesto recurrentes contra las que se pagan transacciones.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | Nombre de la cuenta/línea | — |
| type | string | `Outcoming` / `Incoming` | — |
| code | string | Código contable libre | — |
| period | string | `Anuales`, `Mensuales`, `Trimestrales`, `Cuatrimestrales`, `Semestrales`, `N/A` | — |
| classification | string | `dispensable` / `indispensable` | — |
| category | string enum | `ACCOUNT_CATEGORIES`: Gastos Fijos, Servicios, Impuestos, Salarios, Prestamos, Ayudas, Ocio, Gastos Ocasionales, Alimentación, Transporte, Salud, Educación, Otros | — |
| paymentMethod | string enum | `PAYMENT_METHODS`: Cash, Deel Card, Transferencia, Débito automático | — |
| active | boolean | — | — |
| accountingName | string | Nombre contable alterno | — |
| defaultValue | number | Monto por defecto | — |
| targetAmount | number | Monto objetivo | — |
| maxDatePay | number | Día del mes límite de pago | — |
| monthStartAt | string | Mes de inicio (nombre en inglés, `MONTH_NAMES`) | — |
| important | boolean | Marca de prioridad | — |
| description | string | — | — |
| notes | string | — | — |
| definition | string | `Indefinidos`, `N/A`, etc. | — |
| bankName | string enum | `BANK_NAMES`: Bancolombia, Davivienda, Banco de Bogotá, BBVA, Itaú, Nequi, Daviplata, Av Villas, Otro | — |
| bankAccountType | string enum | `BANK_ACCOUNT_TYPES`: Ahorros, Corriente, Nómina, Billetera digital | — |
| bankAccountNumber | string | — | — |
| bankAccountHolder | string | — | — |
| created_at | timestamp | — | — |
| tenantId | string | — | → `Admin_Tenants` |

### `CashFlow_Transactions`
Movimientos individuales de ingreso/egreso, opcionalmente ligados a una línea de `AccountsMaster`.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| type | string | `income` / `expense` | — |
| category | string enum | `EXPENSE_CATEGORIES` o `INCOME_CATEGORIES` según `type` | — |
| description | string | — | — |
| amount | number | — | — |
| date | string (YYYY-MM-DD) | Fecha real de la transacción | — |
| accountMonth | string (YYYY-MM) | Periodo contable (puede diferir de `date`) | — |
| paymentMethod | string enum | `PAYMENT_METHODS` | — |
| accountMasterId | string \| null | Cuenta maestra pagada | → `CashFlow_AccountsMaster` |
| accountMasterName / accountMasterImportant | string / boolean | Snapshot denormalizado ocasional | — |
| attachment | string base64 | Comprobante adjunto | — |
| attachmentName | string | Nombre original del archivo | — |
| tenantId | string | — | → `Admin_Tenants` |
| created_at | timestamp | — | — |

### `CashFlow_assets`
Seguimiento de activos/patrimonio personal.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | — | — |
| quantity | number | — | — |
| unitPrice | number | — | — |
| type | string enum | `financial` / `fixed` | — |
| liquid | boolean | — | — |
| projection | boolean | Activo proyectado vs. real | — |
| horizon | string enum | `largo`, `mediano`, `corto` | — |
| monthlyGain | number | Ingreso mensual esperado/real | — |
| archived | boolean | — | — |
| notes | string | — | — |
| date | string \| null | Campo legado | — |
| price | number \| null | Campo legado (distinto de `unitPrice`) | — |
| createdAt | timestamp | — | — |
| updatedAt | timestamp | — | — |
| syncedAt | timestamp | Sincronización local→remoto | — |
| tenantId | string | — | → `Admin_Tenants` |

### `CashFlow_eggs`
Seguimiento tipo hueveras/ahorro, con precio referenciado a `App_Settings.egg_current_price`.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | — | — |
| date | string | — | — |
| quantity | number | — | — |
| price | number | — | — |
| createdAt | timestamp | — | — |
| tenantId | string | — | → `Admin_Tenants` |

### `CashFlow_my_projects`
Proyectos de ahorro/financiación con ítems de aporte y notas.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| description | string | Nombre del proyecto | — |
| date | string | — | — |
| goal | number | Monto objetivo | — |
| notes | string | — | — |
| items | array\<map\> | `{ id, origen: string, value: number, paid: boolean }` | — |
| projectNotes | array\<map\> | `{ id, text, reference?, createdAt }` | — |
| createdAt | string ISO | — | — |
| updatedAt | string ISO | — | — |
| syncedAt | timestamp | — | — |
| tenantId | string | — | → `Admin_Tenants` |

### `CashFlow_salary_distribution`
Plantillas de distribución de salario.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | Nombre de la distribución | — |
| salary | number | Salario base | — |
| invert | number | Monto a inversión antes de distribuir el resto | — |
| invertTarget | string enum | `SALARY_TARGET_OPTIONS`: bcol, col-bnc, bnc arg, bnc arg 2, bnc loan, ctb | — |
| rows | array\<map\> | `{ id, name, type: 'percent'\|'value'\|'remainder', value: number, target }` | — |
| notes | string | — | — |
| order | number | Orden entre distribuciones | — |
| syncedAt | timestamp | — | — |
| tenantId | string | — | → `Admin_Tenants` |

### `CashFlow_account_status_period_notes`
Notas/checklist por periodo mensual de revisión de cuentas.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| period | string (YYYY-MM) | Coincide con `Transactions.accountMonth` | — |
| text | string | — | — |
| checked | boolean | — | — |
| createdAt | timestamp | — | — |
| updatedAt | timestamp | — | — |
| tenantId | string | — | → `Admin_Tenants` |

---

## 8. Taxi (proyecto `dbTaxi`)

Todas tenant-scoped vía `tenantId` (referencia cruzada de proyecto a `Admin_Tenants`, en el proyecto principal).

### `Taxi_liquidaciones`
Liquidaciones diarias de conductores.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| driver | string | Nombre del conductor (texto libre, no FK) | ref. suave → `Taxi_conductores.name` |
| plate | string | Placa del vehículo (mayúsculas) | ref. suave → `Taxi_vehiculos.plate` |
| amount | number | Monto liquidado | — |
| date | string (YYYY-MM-DD) | — | — |
| comment | string \| null | — | — |
| paid_at | string \| null | Fecha en que se marcó pagada | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Taxi_conductores`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | — | — |
| idNumber | string | Cédula | — |
| phone | string \| null | — | — |
| defaultAmount | number \| null | Liquidación por defecto entre semana | — |
| defaultAmountSunday | number \| null | Liquidación por defecto domingo | — |
| defaultVehicle | string \| null | Placa asignada por defecto | ref. suave → `Taxi_vehiculos.plate` |
| active | boolean | — | — |
| startDate / endDate | string (fecha) \| null | Inicio/fin de contrato | — |
| comment | string \| null | — | — |
| photo | string base64 \| null | Foto | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Taxi_vehiculos`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| plate | string | Placa (mayúsculas) | — |
| brand / model / year | string/number | — | — |
| active | boolean | — | — |
| restrictions | map | Pico y placa por mes: `{ "1".."12": { d1: string, d2: string } }` | — |
| comment | string \| null | — | — |
| photos | array\<string base64\> | — | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Taxi_gastos`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| description | string | — | — |
| category | string enum | `TAXI_EXPENSE_CATEGORIES`: Administración, Combustible, Mantenimiento, Préstamos, Repuestos, Lavado, Cambio Aceite, Cambio de Correa Dentada, SOAT, RTM, Póliza Resp. Civil, Tarjeta de Operación, Impuestos, Multa, Otro | — |
| amount | number | — | — |
| date | string (fecha) | — | — |
| plate | string \| null | — | ref. suave → `Taxi_vehiculos.plate` |
| driverName | string \| null | — | ref. suave → `Taxi_conductores.name` |
| comment | string \| null | — | — |
| paid | boolean | — | — |
| nextDate | string (fecha) \| null | Próximo vencimiento (mantenimiento/regulatorio) | — |
| payedAt | string (fecha) \| null | — | — |
| receipt | string base64 \| null | — | — |
| receiptName | string \| null | — | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Taxi_partners`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | — | — |
| percentage | number | % de participación | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Taxi_distributions`
Distribución periódica de utilidades entre socios.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| period | string (YYYY-MM) | — | — |
| date | string (fecha) | — | — |
| totalIncome | number | — | — |
| totalExpenses | number | — | — |
| net | number | `totalIncome - totalExpenses` | — |
| payments | map (clave = partnerId) | `{ partnerName, percentage, calculatedAmount, paidAmount, paidDate, paid }` | clave → `Taxi_partners` (id) |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Taxi_period_notes`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| period | string (YYYY-MM) | — | — |
| text | string | — | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt / updatedAt | timestamp | — | — |

### `Taxi_audit_notas`
Id de documento compuesto: `{noteType}__{date}__{driver}` (upsert).

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| date | string (fecha) \| null | — | — |
| driver | string \| null | — | ref. suave → `Taxi_conductores.name` |
| note | string \| null | — | — |
| resolved | boolean | — | — |
| noteType | string | Categoría libre, parte del id compuesto | — |
| tenantId | string | — | → `Admin_Tenants` |

### `Taxi_period_attachments`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| period | string (YYYY-MM) | — | — |
| image | string base64 | — | — |
| description | string | — | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Taxi_vehicle_location_history`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| vehicleId | string | — | → `Taxi_vehiculos` (id) |
| plate | string | Fallback de búsqueda | ref. suave → `Taxi_vehiculos.plate` |
| latitude / lat | number | — | — |
| longitude / lng | number | — | — |
| source | string | Origen del dato (ej. `wss`) | — |
| timestamp | timestamp | — | — |
| tenantId | string | — | → `Admin_Tenants` |

### `Taxi_driver_documents`
Plantillas reutilizables de documentos (mail-merge).

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | — | — |
| template | string | Cuerpo con placeholders: `[NombreConductor]`, `[Cedula]`, `[Telefono]`, `[Vehiculo]`, `[Fecha]` | — |
| comment | string | — | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Taxi_driver_gen_docs`
Documentos generados (instanciados) para un conductor específico.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| driverId | string | — | → `Taxi_conductores` (id) |
| templateId | string | — | → `Taxi_driver_documents` (id) |
| templateName | string | Snapshot del nombre de plantilla | — |
| title | string | — | — |
| content | string | Contenido ya resuelto | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

---

## 9. Finance

### `Finance_grid_trades`
Operaciones de grid trading (versión "cashflow" original).

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| asset | string | — | — |
| platform | string | Ej. Binance, Bybit, Bitget, OKX, KuCoin, Gate.io, MEXC, Pionex | — |
| gridType | string enum | `long` / `short` | — |
| centerPrice / upperPrice / lowerPrice | number | — | — |
| gridCount | number | — | — |
| investment | number | — | — |
| startDate / endDate | string (fecha) \| null | Grid activo si `endDate` es null | — |
| loanRate | number | Tasa anual de préstamo/margen | — |
| loanStartDate | string (fecha) \| null | — | — |
| notes | string | — | — |
| items | array\<map\> | `{ id, value: number, date, type: 'buy'\|'sell' }` | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt / updatedAt | timestamp | — | — |

### `Finance_Custom_Grid_Trades`
Registro de compras/ventas individuales de un grid personalizado.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| price | number | Precio de compra | — |
| quantity | number | — | — |
| fecha | string (fecha) \| null | — | — |
| notes | string | — | — |
| hidden | boolean | Excluida del cálculo | — |
| sellPrice | number \| null | — | — |
| sellDate | string (fecha) \| null | — | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt / updatedAt | timestamp | — | — |

### `Finance_Increase_Decrease`
Calculadora de incremento/decremento porcentual de inversión.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | — | — |
| initialValue / finalValue | number | — | — |
| diff | number | `finalValue - initialValue` | — |
| increaseValue / decreaseValue | number \| null | % según signo de `diff` | — |
| inversionValue | number | — | — |
| profit / loss | number \| null | Según signo de `diff` | — |
| earnUSD / earnCOP | number | Ganancia/pérdida (COP con FX fijo) | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Finance_Crypto_Purchases`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| symbol | string enum | `CRYPTO_PURCHASE_SYMBOLS`: BTCUSDT, ETHUSDT, SOLUSDT, LINKUSDT, BNBUSDT | — |
| quantity | number | — | — |
| purchasePrice | number | USD | — |
| purchaseDate | string (fecha) | — | — |
| notes | string | — | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Finance_Pictures`
Modelo del editor 2D de "cuadros".

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | — | — |
| canvas | map | `{ width, height, unit: px\|mm\|cm\|m\|in\|ft, dpi, grid, showGrid, snap, bg }` | — |
| nodes | array\<Node\> | Formas dibujadas (ver abajo) | — |
| groups | array\<Group\> | `{ id, name, collapsed }` | — |
| autosave | boolean | — | — |
| thumbnail | string base64 \| null | — | — |
| versionCount | number | Contador de versiones guardadas | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt / updatedAt | timestamp | — | — |

`Node` (elemento de `nodes`):

| Campo | Tipo | Descripción / valores |
|---|---|---|
| id | string | — |
| type | string enum | `rect`, `roundRect`, `circle`, `triangle`, `polygon`, `star`, `diamond`, `semicircle`, `line`, `vline`, `cota`, `arrow`, `elbow90`, `elbowRound`, `text` |
| name | string | — |
| groupId | string \| null | → `groups[].id` (mismo documento) |
| x, y, w, h, rotation | number | — |
| fill, fillOpacity, fillPattern | string/number | `fillPattern`: `acrylic-green`, `acrylic-black`, `wood-v-light`, `wood-v-dark`, `wood-v-walnut`, `wood-h-light`, `wood-h-dark` |
| stroke, strokeWidth, strokePattern | string/number | mismo set de patrones |
| shadow, visible, locked | number/boolean | — |
| sides, points, rx, armWidth | number | Según `type` (polygon/star/roundRect/elbow) |
| text, fontSize, fontColor | string/number | Según `type` (text/cota) |

### `Finance_Pictures/{id}/versions` (subcolección)
Snapshots históricos de un `Finance_Pictures`.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | Etiqueta de versión | — |
| canvas / nodes / groups | (igual que arriba) | Snapshot al momento de guardar | — |
| thumbnail | string base64 \| null | — | — |
| createdAt | timestamp | — | — |

FK implícita: el id del documento padre `Finance_Pictures` es el segmento de ruta (no se guarda como campo).

### `Finance_Scenes3D`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | — | — |
| scene | map | `{ bg, grid: boolean, ambientIntensity, dirLightIntensity, dirLightColor }` | — |
| objects | array\<Object3D\> | Ver abajo | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt / updatedAt | timestamp | — | — |

`Object3D` (elemento de `objects`):

| Campo | Tipo | Descripción / valores |
|---|---|---|
| id, name | string | — |
| type | string enum | `box`, `sphere`, `cylinder`, `cone`, `torus`, `plane` |
| position, rotation, scale | array\<number\>[3] | `[x, y, z]` |
| color | string | — |
| opacity | number | — |
| wireframe, visible, locked | boolean | — |

### `Finance_sync_sessions`
Señalización WebRTC para sincronizar listas entre dispositivos. No tenant-scoped; id = UUID aleatorio.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| id (id doc) | string | UUID generado en cliente | — |
| createdAt | timestamp | — | — |
| offerSdp | string | SDP de oferta WebRTC | — |
| answerSdp | string | SDP de respuesta WebRTC | — |

Subcolecciones `offerCandidates` / `answerCandidates`: candidatos ICE serializados — `{ candidate, sdpMid, sdpMLineIndex, usernameFragment }`.

---

## 10. Inmobiliaria

### `Inmobiliaria_Designs`
Modelo de panfleto de arrendamiento.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | Nombre interno | — |
| title | string | Título principal del panfleto | — |
| location, ownerType, neighborhood | string | — | — |
| requirements, openUnit, facilities, propertyFeatures | string | Listas separadas por salto de línea | — |
| rentAmount | string | Ej. "950.000$" | — |
| servicesIncluded | string | — | — |
| phone | string | — | — |
| sectionFontSize | number | 12–26px | — |
| propertyPhoto / buildingPhoto | string base64 | — | — |
| propertyPhotoX/Y/Size, buildingPhotoX/Y/Size | number | Offset/zoom de imagen | — |
| photoLink | string | URL usada para generar QR | — |
| canonColor, orangeAccentColor, darkAccentColor, elegantAccentColor | string | Colores hex | — |
| template | string enum | `orange`, `dark`, `elegant` | — |
| observations | string | Notas internas | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt / updatedAt | timestamp | — | — |

### `Inmobiliaria_Planos`
Editor de planos arquitectónicos 2D.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | — | — |
| walls | array\<Wall\> | `{ id, name, x1, y1, x2, y2 }` | — |
| doors | array\<Door\> | `{ id, name, x, y, width, rotation }` | — |
| windows | array\<Window\> | `{ id, name, x, y, width, rotation }` | — |
| furniture | array\<Furniture\> | `{ id, name, type: (catálogo — cama, closet, sanitario, sofá, escaleras, jardín, etc.), x, y, width, height, rotation }` | — |
| labels | array\<Label\> | `{ id, name, text, x, y, fontSize }` | — |
| rulers | array\<Ruler\> | `{ id, name, x1, y1, x2, y2 }` | — |
| zOrder | array\<string\> | Ids ordenados de todos los elementos | referencia ids internos |
| groups | array\<Group\> | `{ id, name, itemIds: array<string> }` | referencia ids internos |
| hiddenIds | array\<string\> | Ids ocultos en el editor | referencia ids internos |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt / updatedAt | timestamp | — | — |

---

## 11. Contratos

Nota sobre "tenant": en este módulo, `tenantId` (multi-tenencia SaaS) y el campo `tenant` (mapa de inquilino/arrendatario dentro de `Contratos_Contratos`) son conceptos distintos y no relacionados.

Este módulo **no usa FKs normalizadas** entre `Contratos_Contratos` y Propietarios/Inmuebles/Cuentas Bancarias: al crear un contrato, el registro elegido se **copia (denormaliza)** dentro del documento del contrato en vez de guardarse como id de referencia. Editar el maestro después no actualiza retroactivamente los contratos ya creados.

### `Contratos_Contratos`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | Nombre del contrato | — |
| archived | boolean | — | — |
| tenant | map | Inquilino: `{ full_name, identification: { number, city } }` | — |
| guarantor | map | Codeudor: `{ full_name, identification: { number, city } }` | — |
| owner | map | Snapshot del propietario: `{ full_name, identification: { number, city } }` | (copiado de) `Contratos_Propietarios` |
| property | map | Snapshot del inmueble: `{ full_address, address, appartment_number, city, state, urbanization_name }` | (copiado de) `Contratos_Inmuebles` |
| rental | map | `{ value, duration, start_date, payment_day, canon_history: array, payments: array }` | — |
| rental.canon_history | array\<map\> | `{ id, date, value, percentage, createdAt }` — historial de incrementos de canon | — |
| rental.payments | array\<map\> | `{ id, date, value, surcharge, description, createdAt }` — pagos registrados | — |
| contract | map | `{ city, date }` — ciudad/fecha de firma | — |
| account | map | Snapshot de cuenta bancaria: `{ bank_name, type, number, name }` | (copiado de) `Contratos_CuentasBancarias` |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt / updatedAt | timestamp | — | — |

### `Contratos_Inmuebles`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| alias | string | Nombre corto para búsqueda | — |
| full_address | string | — | — |
| address | string | — | — |
| appartment_number | string | Número de apartamento/unidad | — |
| city, state | string | — | — |
| urbanization_name | string | — | — |
| rental_value | number/string | Campo general legado | — |
| default_canon_value | number | Valor de canon precargado al crear contrato | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Contratos_Propietarios`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| full_name | string | — | — |
| identification_number | string | Cédula | — |
| identification_city | string | Ciudad de expedición | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Contratos_CuentasBancarias`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| bank_name | string | — | — |
| type | string | Tipo de cuenta (texto libre) | — |
| number | string | — | — |
| name | string | Titular (por defecto, nombre del propietario) | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Contratos_contract_notes`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| contractId | string | Contrato al que pertenece | → `Contratos_Contratos` |
| text | string | — | — |
| resolved | boolean | — | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt / updatedAt | timestamp | — | — |

### `Contratos_contract_attachments`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| contractId | string | Contrato al que pertenece | → `Contratos_Contratos` |
| filename | string | Nombre original del archivo | — |
| data | string base64 | Contenido del archivo | — |
| active | boolean | Soft-delete | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt | timestamp | — | — |

### `Contratos_module_notes`
Notas generales del módulo (no ligadas a un contrato específico).

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| text | string | — | — |
| tenantId | string | — | → `Admin_Tenants` |
| createdAt / updatedAt | timestamp | — | — |

---

## 12. Domótica (proyecto `dbDomotica`)

No usa multi-tenencia (aislamiento por proyecto en su lugar). `Domotica_Solar` y `Domotica_command` están definidas como constantes pero **sin uso real en Firestore** — la telemetría de batería en vivo llega por API REST y los comandos se envían por Realtime Database (`solar/commands`), no por estas colecciones.

### `Domotica_devices`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | — | — |
| type | string enum \| null | `esp8266`, `esp32`, `relay`, `sensor`, `gateway`, `otro` | — |
| location | string \| null | — | — |
| status | string enum \| null | `active`, `inactive`, `error` | — |
| ipAddress | string \| null | — | — |
| notes | string \| null | — | — |
| internalId | string \| null | Código interno/serial (no es FK) | — |
| createdAt | timestamp | — | — |

### `Domotica_transactions`
Log histórico de lecturas de voltaje/corriente.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| type | string enum | `voltaje`, `current` | — |
| description | string \| null | — | — |
| amount | number \| null | Valor numérico de la lectura | — |
| unit | string \| null | Unidad (V, A) | — |
| device | string \| null | Nombre libre del dispositivo (no FK real) | ref. suave → `Domotica_devices.name` |
| date | string \| null | — | — |
| notes | string \| null | — | — |
| createdAt | timestamp | — | — |
| voltage / amps / value / soc / percent / solar / status | number/string \| null | Campos legados presentes en documentos antiguos | — |

### `Domotica_current`
Lecturas puntuales (snapshot) de corriente/voltaje.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| type | string \| null | — | — |
| device | string \| null | — | ref. suave → `Domotica_devices.name` |
| value | number \| null | Voltaje | — |
| amps | number \| null | — | — |
| watts | number \| null | — | — |
| date | string \| null | — | — |
| notes | string \| null | — | — |
| createdAt | timestamp | — | — |
| soc / percent / solar / status / updatedAt | (legado, solo lectura) | — | — |

### `Domotica_command_dictionary`
Diccionario de comandos AT/serial (consola serial, GPS).

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| category | string | `DOMOTICA_SERIAL_CATEGORIES`: GPS, Misceláneos, Mensajes, Red, IP Router, Reloj RTC, Audio, GPIO, Macros, Funciones, Buzzer, Movimiento, FOTA, PAD, API TCP, Configuración Celular, Personalizado | — |
| command | string | Comando AT (ej. `AT$TTGPSTT`) | — |
| name | string | Nombre legible | — |
| description | string | — | — |
| queryFormat / readFormat / writeFormat | string | Por defecto `'N/A'` | — |
| params | string | — | — |
| notes | string | — | — |
| isCustom | boolean | Entrada agregada por el usuario vs. semilla | — |
| createdAt | timestamp | — | — |

### `Domotica_command_profiles`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | — | — |
| description | string | — | — |
| deviceModel | string | Modelo de dispositivo objetivo | — |
| createdAt | timestamp | — | — |

### `Domotica_command_profile_items`
Ítems ordenados de un perfil de comandos.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| profileId | string | Perfil dueño | → `Domotica_command_profiles` |
| value | string | Contenido del comando | — |
| notes | string | — | — |
| order | number | Posición dentro del perfil | — |
| createdAt | timestamp | — | — |

Nota: al eliminar un perfil se eliminan en cascada (batch) todos sus `profile_items`.

### `Domotica_solar_calc`
Configuraciones guardadas de la calculadora de dimensionamiento solar.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | — | — |
| mode | string enum | `from_system` / `from_consumption` | — |
| panels | map | `{ count, wp, hsp }` | — |
| controller | map | `{ efficiency }` | — |
| battery | map | `{ count, ah, voltage, dod }` | — |
| inverter | map | `{ efficiency, capacity }` | — |
| consumption | map | `{ dailyWh, peakW, autonomyDays }` | — |
| appliances | array\<map\> | `{ name, watts, hours }` (semillas de `SOLAR_APPLIANCE_PRESETS`) | — |
| location | map \| null | `{ hsp, lat, lng, name, monthly: [{ month, hsp }] }` (vía NASA POWER API) | — |
| createdAt / updatedAt | timestamp | — | — |

---

## 13. Misc

### `Misc_tasks`
Id de documento = id generado en cliente (modelo offline-first sincronizado).

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| title | string | — | — |
| notes | string | — | — |
| priority | string enum | `high`, `medium`, `low` | — |
| dueDate | string (fecha) \| null | — | — |
| tags | array\<string\> | — | — |
| done | boolean | — | — |
| doneAt | string/timestamp \| null | — | — |
| listMode | boolean | Vista lista vs. tablero | — |
| tenantId | string \| null | — | → `Admin_Tenants` |
| createdAt | string ISO | — | — |
| localUpdatedAt | string/timestamp \| null | Marca local para resolución de conflictos | — |
| syncedAt | timestamp | Marca de agua de sincronización | — |

### `Misc_notes`

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| title | string | — | — |
| content | string | Cuerpo (texto/HTML, o JSON si `mode='checklist'`) | — |
| color | string enum | Hex: `#ffffff`,`#fef9c3`,`#dcfce7`,`#dbeafe`,`#f3e8ff`,`#fce7f3`,`#ffedd5`,`#f1f5f9` | — |
| mode | string enum | `textarea` (por defecto), `table`, `checklist` | — |
| category | string | Por defecto `general` | — |
| body | string | Payload extra en modo `table` | — |
| private | boolean | Nota gateada por contraseña (verificación en cliente) | — |
| archived | boolean | — | — |
| starred | boolean | — | — |
| order | number | Orden manual | — |
| tenantId | string \| null | — | → `Admin_Tenants` |
| createdAt / updatedAt | timestamp | — | — |

---

## 14. System / Analítica

### `page_visits`
Analítica anónima de visitas (deshabilitada en desarrollo).

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| page | string | Ruta visitada | — |
| userAgent, language, languages, platform | string | — | — |
| referrer | string | — | — |
| screenWidth, screenHeight | number | — | — |
| timezone | string | — | — |
| cookiesEnabled | boolean | — | — |
| url | string | — | — |
| ip, city, region, country, org, loc | string | Datos de geolocalización por IP (ipinfo.io) | — |
| createdAt | timestamp | — | — |

### `System_error_logs`
Reporte global de errores/crashes.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| timestamp | timestamp | — | — |
| context | string | Tipo de acción Redux / contexto de origen | — |
| message | string | — | — |
| stack | string \| null | — | — |
| url | string | — | — |
| username | string \| null | — | → `users.username` |
| recentActions | array\<map\> | Últimas 10 acciones Redux: `{ type, ts, payload }` | — |
| ...extra | any | Contexto adicional serializado (ej. ruta actual) | — |

### `System_audit_logs`
Auditoría automática de operaciones CRUD.

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| operation | string enum | `CREATE`, `UPDATE`, `DELETE` | — |
| actionType | string | Tipo completo de acción Redux | — |
| entity | string | Módulo/slice afectado | — |
| payload | any (serializado) | Payload de la escritura | — |
| username | string \| null | — | → `users.username` |
| route | string | Ruta activa en el momento | — |
| timestamp | timestamp | — | — |

### `System_perf_logs`
Registro de operaciones lentas (solo si duración &gt; 2000ms).

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| label | string | Operación medida | — |
| durationMs | number | — | — |
| route | string | — | — |
| username | string \| null | — | → `users.username` |
| slow | boolean | `true` si superó el umbral | — |
| error | string (opcional) | Presente si la operación falló | — |
| timestamp | timestamp | — | — |

### `System_contact_messages`
Mensajes del formulario público de contacto (escritura no autenticada).

| Campo | Tipo | Descripción / valores | Referencia |
|---|---|---|---|
| name | string | — | — |
| email | string | — | — |
| message | string | — | — |
| read | boolean | Por defecto `false` | — |
| createdAt | timestamp | — | — |

---

## 15. Resumen de relaciones (referencias tipo FK)

| Origen | Campo | Destino |
|---|---|---|
| Todas las colecciones tenant-scoped (documento → 1 tenant) | `tenantId` | `Admin_Tenants.id` |
| `users` (usuario → N tenants) | `tenantIds` (array) | `Admin_Tenants.id` (cada elemento) |
| `sessions` | `username` | `users.username` |
| `System_error_logs` / `System_audit_logs` / `System_perf_logs` | `username` | `users.username` |
| `CashFlow_Transactions` | `accountMasterId` | `CashFlow_AccountsMaster` |
| `Taxi_liquidaciones.driver` (texto) | — | `Taxi_conductores.name` (ref. suave, no FK real) |
| `Taxi_liquidaciones.plate`, `Taxi_gastos.plate`, `Taxi_conductores.defaultVehicle` (texto) | — | `Taxi_vehiculos.plate` (ref. suave) |
| `Taxi_gastos.driverName`, `Taxi_audit_notas.driver` (texto) | — | `Taxi_conductores.name` (ref. suave) |
| `Taxi_distributions.payments` (clave de mapa) | clave = partnerId | `Taxi_partners` (id) |
| `Taxi_vehicle_location_history` | `vehicleId` | `Taxi_vehiculos` (id) |
| `Taxi_driver_gen_docs` | `driverId` | `Taxi_conductores` (id) |
| `Taxi_driver_gen_docs` | `templateId` | `Taxi_driver_documents` (id) |
| `Finance_Pictures/{id}/versions` | ruta del documento | `Finance_Pictures` (id, implícito) |
| `Contratos_contract_notes` / `Contratos_contract_attachments` | `contractId` | `Contratos_Contratos` |
| `Contratos_Contratos.owner/property/account` | — | Copia denormalizada de `Contratos_Propietarios` / `Contratos_Inmuebles` / `Contratos_CuentasBancarias` (sin FK real) |
| `Domotica_command_profile_items` | `profileId` | `Domotica_command_profiles` |
| `Domotica_transactions.device`, `Domotica_current.device` (texto) | — | `Domotica_devices.name` (ref. suave) |

**Nota general:** salvo `tenantId`, casi todas las "relaciones" entre colecciones de un mismo proyecto son referencias por **id de documento** almacenadas como string simple (no hay claves foráneas reales impuestas por Firestore). Varias colecciones del módulo Taxi y Domótica usan referencias por **texto libre** (nombre/placa) en vez de id — es decir, relaciones débiles que dependen de que el texto coincida exactamente.
