# Diccionario de Vistas y Componentes

> Generado: 2026-04-19 | Rama: `feature/landing-redesign`

---

## Layout

| Ruta (`src/`) | Componente | Descripción |
|---|---|---|
| `layout/DefaultLayout.js` | `DefaultLayout` | Composición principal: sidebar + header + contenido + footer |

---

## Components / Layout

| Ruta (`src/`) | Componente | Descripción |
|---|---|---|
| `components/layout/AppContent.js` | `AppContent` | Router principal — valida auth Firebase y sesiones activas |
| `components/layout/AppHeader.js` | `AppHeader` | Encabezado sticky con tema, idioma, notificaciones y menú de usuario |
| `components/layout/AppHeaderDropdown.js` | `AppHeaderDropdown` | Dropdown del header: perfil, versión, configuración y logout |
| `components/layout/AppSidebar.js` | `AppSidebar` | Barra lateral replegable con nav dinámica según rol |
| `components/layout/AppSidebarNav.js` | `AppSidebarNav` | Renderizado recursivo de items de navegación con grupos y badges |
| `components/layout/AppBreadcrumb.js` | `AppBreadcrumb` | Breadcrumb dinámico basado en la ruta actual |
| `components/layout/AppFooter.js` | `AppFooter` | Pie de página con links y copyright |
| `components/layout/VersionModal.js` | `VersionModal` | Modal que muestra versión local vs servidor con opción de actualización forzada |

---

## Components / Shared

| Ruta (`src/`) | Componente | Descripción |
|---|---|---|
| `components/shared/StandardForm.js` | `StandardForm`, `StandardField`, `SF` | Wrapper reutilizable para formularios con estilos consistentes |
| `components/shared/StandardGrid/index.js` | `StandardGrid` | Wrapper de DevExtreme DataGrid con configuración compartida |
| `components/shared/DetailPanel.js` | `DetailPanel`, `DetailSection`, `DetailRow` | Panel de detalles en formato clave-valor con secciones |
| `components/shared/MultiSelectDropdown.js` | `MultiSelectDropdown` | Dropdown multi-select con checkboxes y opción "Todos" |
| `components/shared/AttachmentViewer.js` | `AttachmentViewer` | Visor fullscreen de imágenes base64 con zoom, descarga y compartir |
| `components/shared/LanguageSwitcher.js` | `LanguageSwitcher` | Selector de idioma (ES/EN) con banderas en el header |
| `components/shared/InstallBanner.js` | `InstallBanner` | Banner inferior para instalar la app como PWA |
| `components/Captcha/index.js` | `Captcha` | CAPTCHA propio con canvas: código distorsionado, ruido y checker ámbar |

---

## Vistas — Públicas

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/login/Login.js` | `Login` | `/login` | Pantalla de inicio de sesión con Firebase Auth |
| `views/register/Register.js` | `Register` | `/register` | Registro de cuenta nueva con captcha propio y medidor de contraseña |
| `views/page404/Page404.js` | `Page404` | `/404` | Página de error 404 |
| `views/page500/Page500.js` | `Page500` | `/500` | Página de error 500 |
| `views/aboutMe/Index.js` | `AboutMe` | `/aboutMe` | Portfolio y skills del desarrollador |
| `views/hard-refresh/HardRefresh.js` | `HardRefresh` | `/hard-refresh` | Fuerza actualización de caché y service worker |

---

## Vistas — Dashboard

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/dashboard/Dashboard.js` | `Dashboard` | `/cash_flow/dashboard` | Página principal con shortcuts a módulos y KPIs |
| `views/dashboard/MainChart.js` | `MainChart` | _(widget)_ | Gráfico de línea responsivo con sincronización de tema |

---

## Vistas — Taxis

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/taxis/Home.js` | `TaxisHome` | `/taxis/home` | Dashboard de taxis con KPIs y gráficos mensuales |
| `views/taxis/Drivers.js` | `Drivers` | `/taxis/drivers` | CRUD de conductores con monto default y vehículo asignado |
| `views/taxis/Vehicles.js` | `Vehicles` | `/taxis/vehicles` | CRUD de vehículos con placas, restricciones y mantenimiento |
| `views/taxis/Expenses.js` | `Expenses` | `/taxis/expenses` | Gastos operativos por categoría y mantenimiento |
| `views/taxis/Partners.js` | `Partners` | `/taxis/partners` | CRUD de socios con porcentajes de distribución |
| `views/taxis/Distributions.js` | `Distributions` | `/taxis/profit-sharing` | Distribución de ganancias entre socios |
| `views/taxis/Summary.js` | `Summary` | `/taxis/summary` | Resumen mensual de liquidaciones y gastos |
| `views/taxis/Operations.js` | `Operations` | `/taxis/operations` | Control de restricciones por vehículo y mes |
| `views/taxis/auditHelpers.js` | _(helpers)_ | — | Funciones utilitarias de auditoría de liquidaciones |

### Taxis / Settlements

| Ruta (`src/`) | Componente | Descripción |
|---|---|---|
| `views/taxis/Settlements/Index/index.js` | `Settlements` | Vista principal de liquidaciones diarias con auditoría |
| `views/taxis/Settlements/Index/auditExport.js` | _(helpers)_ | Exportadores de auditoría a Excel |
| `views/taxis/Settlements/Components/SettlementMasterDetail.js` | `SettlementMasterDetail` | Detalle de liquidación individual con edición inline |
| `views/taxis/Settlements/Components/SettlementCreateForm.js` | `SettlementCreateForm` | Formulario para crear nueva liquidación |
| `views/taxis/Settlements/Components/AuditSettledCell.js` | `AuditSettledCell` | Celda para marcar liquidaciones como auditadas |
| `views/taxis/Settlements/Components/AuditMissingCell.js` | `AuditMissingCell` | Celda para registrar liquidaciones pendientes |
| `views/taxis/Settlements/Components/AuditDayDetail.js` | `AuditDayDetail` | Detalle de auditoría por día |
| `views/taxis/Settlements/Components/AuditView/index.js` | `AuditView` | Matriz de auditoría con días y estados por vehículo |
| `views/taxis/Settlements/Components/AuditView/AnalysisModal.js` | `AnalysisModal` | Modal con análisis de inconsistencias detectadas |
| `views/taxis/Settlements/Components/auditAnalysisRules.js` | _(helpers)_ | Reglas para detectar inconsistencias en liquidaciones |
| `views/taxis/Settlements/Components/PeriodNotes.js` | `PeriodNotes` | Notas por período de auditoría |

---

## Vistas — Contabilidad

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/Accounting/Accounts.js` | `Accounts` | `/cash_flow/management/accounts` | Cuentas contables desde Google Apps Script (DevExtreme) |
| `views/Accounting/AccountsSimple.js` | `AccountsSimple` | _(modal)_ | Vista simplificada de cuentas |
| `views/Accounting/InlinePaymentMethod.js` | `InlinePaymentMethod` | _(inline)_ | Método de pago inline para transacciones |
| `views/Accounting/OcrReceiptImporter.js` | `OcrReceiptImporter` | _(modal)_ | Importador de recibos con OCR: detecta monto e identificador |
| `views/Accounting/ocrAccountRules.js` | _(helpers)_ | — | Reglas OCR por tipo de recibo |

### Accounting / AccountsMaster

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/Accounting/AccountsMaster/index.js` | `AccountsMaster` | `/cash_flow/management/accounts-master` | Maestro de cuentas (ACTIVOS, PASIVOS, ING, EGR) |
| `views/Accounting/AccountsMaster/AccountMasterForm.js` | `AccountMasterForm` | _(modal)_ | Formulario para crear/editar cuenta maestra |

### Accounting / AccountStatus

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/Accounting/AccountStatus/index.js` | `AccountStatus` | `/cash_flow/management/account-status` | Estado de cuentas con importación OCR de recibos |
| `views/Accounting/AccountStatus/AccountCard.js` | `AccountCard` | _(tarjeta)_ | Tarjeta de resumen por cuenta |
| `views/Accounting/AccountStatus/DetailModal.js` | `DetailModal` | _(modal)_ | Detalles de una transacción |
| `views/Accounting/AccountStatus/PayModal.js` | `PayModal` | _(modal)_ | Registro de pago |
| `views/Accounting/AccountStatus/AdHocExpenseModal.js` | `AdHocExpenseModal` | _(modal)_ | Gastos ad-hoc fuera de categoría |
| `views/Accounting/AccountStatus/AdHocSection.js` | `AdHocSection` | _(sección)_ | Sección de gastos adicionales |
| `views/Accounting/AccountStatus/PeriodNotes.js` | `PeriodNotes` | _(sección)_ | Notas por período contable |
| `views/Accounting/AccountStatus/helpers.js` | _(helpers)_ | — | Funciones utilitarias |

### Accounting / Transactions

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/Accounting/Transactions/index.js` | `Transactions` | `/cash_flow/management/transactions` | Registro contable anual con filtros por mes y categoría |
| `views/Accounting/Transactions/TransactionForm.js` | `TransactionForm` | _(modal)_ | Formulario para crear transacción |
| `views/Accounting/Transactions/AnnualView.js` | `AnnualView` | _(tab)_ | Vista anual de transacciones por mes |
| `views/Accounting/Transactions/SummaryCard.js` | `SummaryCard` | _(widget)_ | Tarjeta con totales del período |
| `views/Accounting/Transactions/MaestroRow.js` | `MaestroRow` | _(fila)_ | Fila de cuenta maestra en la tabla |
| `views/Accounting/Transactions/MigrationModal.js` | `MigrationModal` | _(modal)_ | Herramienta de migración de datos |
| `views/Accounting/Transactions/helpers.js` | _(helpers)_ | — | Funciones utilitarias |

---

## Vistas — Pagos / Movimientos

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/movements/payments/Payments.js` | `Payments` | `/cash_flow/management/payments` | Cuadre de pagos con edición inline |
| `views/movements/payments/Services.js` | `Services` | _(modal)_ | Servicios asociados a pagos |
| `views/movements/payments/Alert.js` | `Alert` | _(modal)_ | Alertas de pagos |
| `views/movements/payments/VaucherControlViewer.js` | `VaucherControlViewer` | _(modal)_ | Visor de control de vauchers |

---

## Vistas — Reportes

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/reports/Reports.js` | `Reports` | `/cash_flow/management/reports` | Reportes exportables por período |
| `views/reports/payments/Payments.js` | `PaymentsReport` | _(tab)_ | Reporte de pagos |
| `views/reports/payments/Services.js` | `ServicesReport` | _(tab)_ | Reporte de servicios |
| `views/reports/payments/VaucherControlViewer.js` | `VaucherControlViewerReport` | _(modal)_ | Visor de vauchers en reportes |
| `views/reports/payments/Alert.js` | `AlertReport` | _(tab)_ | Alertas en reportes |

---

## Vistas — CashFlow Personal

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/CashFlow/eggs/Eggs.js` | `Eggs` | `/cash_flow/eggs` | Registro de producción de huevos con cantidad y precio |
| `views/CashFlow/assets/Assets.js` | `Assets` | `/cash_flow/assets` | Portafolio de activos (BTC, inversiones) con valuación |
| `views/CashFlow/projects/MyProjects/index.js` | `MyProjects` | `/cash_flow/projects` | Proyectos personales con presupuestos y tarjetas |
| `views/CashFlow/projects/MyProjects/ProjectCard.js` | `ProjectCard` | _(tarjeta)_ | Tarjeta de proyecto con acciones rápidas |
| `views/CashFlow/projects/MyProjects/ProjectSheet.js` | `ProjectSheet` | _(modal)_ | Hoja de proyecto con detalles y presupuesto |
| `views/CashFlow/projects/MyProjects/helpers.js` | _(helpers)_ | — | Funciones utilitarias para proyectos |
| `views/CashFlow/tools/SalaryDistribution.js` | `SalaryDistribution` | `/cash_flow/tools/salary-distribution` | Distribución de salarios entre beneficiarios |
| `views/CashFlow/tools/DistributionTabs.js` | `DistributionTabs` | _(tabs)_ | Tabs para distribución de salarios |
| `views/CashFlow/tools/SummaryTable.js` | `SummaryTable` | _(tabla)_ | Tabla resumen de distribuciones |
| `views/CashFlow/tools/DistributionEditor.js` | `DistributionEditor` | _(editor)_ | Editor de distribuciones |
| `views/CashFlow/tools/salaryUtils.js` | _(helpers)_ | — | Utilidades de cálculo de salarios |

---

## Vistas — Herramientas

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/tools/visits/Visits.js` | `Visits` | `/cash_flow/tools/visits` | Log de visitas con detección de device/browser |
| `views/tools/increase-decrease/IncreaseDecrease.js` | `IncreaseDecrease` | `/cash_flow/tools/adjustments` | Calculadora de variación porcentual de inversiones |

---

## Vistas — Contratos

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/Contratos/contratos/GenerarContrato/index.js` | `GenerarContrato` | `/contratos/generar` | Generador de contratos con múltiples anexos y firma |
| `views/Contratos/contratos/GenerarContrato/NameModal.js` | `NameModal` | _(modal)_ | Modal para nombre del contrato |
| `views/Contratos/contratos/GenerarContrato/AttachmentsSection.js` | `AttachmentsSection` | _(sección)_ | Sección de anexos del contrato |
| `views/Contratos/contratos/GenerarContrato/NotesSection.js` | `NotesSection` | _(sección)_ | Sección de notas del contrato |
| `views/Contratos/contratos/GenerarContrato/helpers.js` | _(helpers)_ | — | Funciones utilitarias para contratos |
| `views/Contratos/contratos/contractPdf.js` | `contractPdf` | — | Generador de PDF con jsPDF y html2canvas |
| `views/Contratos/contratos/contractPdf_legacy.js` | `contractPdf_legacy` | — | Versión anterior del generador de PDF |
| `views/Contratos/contratos/templates/actaEntrega.js` | `actaEntrega` | — | Template de acta de entrega |
| `views/Contratos/contratos/templates/inventario.js` | `inventario` | — | Template de inventario |

---

## Vistas — Administración

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/users/Users.js` | `Users` | `/cash_flow/management/users` | CRUD de usuarios con roles (`superAdmin`, `manager`, `conductor`) |
| `views/users/PushSubscribers.js` | `PushSubscribers` | `/management/push-subscribers` | Dispositivos registrados con notificaciones FCM |
| `views/admin/Tenants.js` | `Tenants` | `/admin/tenants` | Gestión de tenants multi-empresa |
| `views/profile/Profile.js` | `Profile` | `/cash_flow/profile` | Perfil del usuario actual con edición y cambio de contraseña |
| `views/settings/AppSettings.js` | `AppSettings` | `/cash_flow/settings` | Configuración global de la app (solo `superAdmin`) |
| `views/settings/tabs/AppVariablesSettings.js` | `AppVariablesSettings` | _(tab)_ | Variables globales configurables |
| `views/settings/tabs/NotificationSettings.js` | `NotificationSettings` | _(tab)_ | Config de notificaciones push y horarios de pico y placa |
| `views/settings/tabs/DisplayPreferences.js` | `DisplayPreferences` | _(tab)_ | Preferencias de visualización (formato de fecha, etc.) |
| `views/settings/tabs/StorageSettings.js` | `StorageSettings` | _(tab)_ | Monitoreo de uso de storage en Firestore |

---

## Vistas — Tema / Dev (CoreUI)

| Ruta (`src/`) | Componente | URL | Descripción |
|---|---|---|---|
| `views/theme/colors/Colors.js` | `Colors` | — | Paleta de colores del tema |
| `views/theme/typography/Typography.js` | `Typography` | — | Demostración de tipografía |
| `views/widgets/Widgets.js` | `Widgets` | — | Galería de widgets CoreUI |
| `views/widgets/WidgetsBrand.js` | `WidgetsBrand` | — | Widgets con branding de redes sociales |
| `views/widgets/WidgetsDropdown.js` | `WidgetsDropdown` | — | Widgets con gráficos y dropdowns |

---

## Resumen

| Categoría | Archivos |
|---|---|
| Layout + Components | ~18 |
| Vistas públicas | 6 |
| Dashboard | 2 |
| Taxis + Settlements | 19 |
| Contabilidad | 20 |
| Pagos + Reportes | 9 |
| CashFlow personal | 11 |
| Herramientas | 2 |
| Contratos | 9 |
| Administración + Settings | 9 |
| **Total** | **~105** |
