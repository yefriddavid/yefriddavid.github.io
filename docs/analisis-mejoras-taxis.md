# Análisis y Propuestas de Mejora: Módulo de Liquidaciones de Taxis

Este documento detalla el estado actual del módulo de liquidaciones de taxis y propone una serie de mejoras para optimizar su funcionamiento, mantenibilidad y la experiencia de usuario.

## 1. Estado Actual

El módulo de liquidaciones de taxis es una herramienta robusta que permite gestionar el recaudo diario de los vehículos. Cuenta con funcionalidades avanzadas como:
- **Cálculo Automático de Festivos:** Incluye la Ley Emiliani y el algoritmo Computus para Semana Santa en Colombia.
- **Proyecciones de Ingresos:** Calcula cuánto se debería recibir basándose en los conductores activos y sus tarifas por defecto.
- **Auditoría en Tiempo Real:** Identifica días faltantes, pagos incompletos y restricciones de "Pico y Placa".
- **Resumen del Período:** Ofrece métricas de rentabilidad neta descontando gastos.

---

## 2. Puntos Fuertes

- **Lógica de Negocio Centralizada:** `auditHelpers.js` abstrae correctamente la lógica compleja de fechas y festivos.
- **Persistencia de Preferencias:** El uso de `localStorage` para guardar el estado de la UI (filtros, modo de vista) mejora la UX recurrente.
- **Validación de Pico y Placa:** Previene errores de registro en días donde el vehículo no debería estar operando.
- **Integración con Gastos:** Permite ver la utilidad real del período.

---

## 3. Oportunidades de Mejora

### A. Arquitectura y Mantenibilidad
1.  **Refactorización de `Index/index.js`:** El archivo principal supera las 1,100 líneas. Se recomienda:
    - Extraer la lógica de filtros a un hook personalizado (`useSettlementFilters`).
    - Dividir el componente en sub-componentes más pequeños (ej. `SettlementToolbar`, `SettlementGrid`).
2.  **Migración a TypeScript:** El módulo maneja estructuras de datos complejas (objetos de auditoría, récords de liquidación). TypeScript proporcionaría seguridad en el manejo de estos datos y reduciría errores en tiempo de ejecución.
3.  **Cobertura de Tests:** Aunque existe `__tests__`, se deben fortalecer los tests unitarios para los casos borde de `buildAuditDay` (ej. cambios de conductor a mitad de mes, años bisiestos).

### B. Funcionalidades de Usuario (UX)
1.  **Registro Masivo (Batch Actions):** Actualmente, las liquidaciones se registran una a una. Se propone una herramienta de "Liquidación Rápida" que permita marcar como liquidados todos los vehículos de un día con sus valores por defecto en un solo clic.
2.  **Sugerencias Inteligentes:** Al crear una nueva liquidación, el sistema podría sugerir automáticamente el conductor y el monto basándose en el historial reciente o el "default" del vehículo.
3.  **Validación de Duplicados:** Implementar una alerta más agresiva si se intenta registrar dos veces el mismo vehículo para la misma fecha con conductores diferentes.

### C. Visualización y Reportes
1.  **Dashboard Visual:** Añadir gráficas de barras para comparar Ingresos vs. Gastos a lo largo del año.
2.  **Exportación Avanzada:** Además de la auditoría, permitir exportar reportes mensuales en PDF con un formato listo para imprimir y entregar a los socios/dueños de los vehículos.
3.  **Indicadores de Tendencia:** Mostrar si el recaudo de este mes es mayor o menor al del mes anterior (%).

### D. Integración y Notificaciones
1.  **Sistema de Alertas:** Notificar (vía UI o email/push si se implementa) cuando un vehículo lleve más de 3 días sin liquidar.
2.  **Sincronización con Caja:** Permitir que al registrar una liquidación, se cree automáticamente un movimiento de entrada en el flujo de caja general (Cashflow).

---

## 4. Roadmap Sugerido

| Fase | Tarea | Prioridad |
| :--- | :--- | :--- |
| **1. Estabilización** | Refactorizar `Index/index.js` y añadir tests a `auditHelpers`. | Alta |
| **2. Eficiencia** | Implementar "Liquidación Masiva" por fecha. | Alta |
| **3. Visualización** | Añadir gráficas básicas de tendencia en el `PeriodSummary`. | Media |
| **4. Integración** | Automatizar entradas en Cashflow al liquidar. | Media |
| **5. Robustez** | Migración gradual a TypeScript. | Baja |

---
*Documento generado por Gemini CLI - Abril 2026*
