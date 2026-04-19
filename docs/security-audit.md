# Security Audit — My-Admin

**Fecha:** 2026-04-18  
**Alcance:** Código fuente completo (`src/`)  
**Stack:** React 18, Firebase Auth + Firestore, Google Apps Script, Redux Toolkit

---

## Resumen ejecutivo

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Crítico | 3 |
| 🟠 Alto    | 3 |
| 🟡 Medio   | 6 |
| 🔵 Bajo    | 4 |

---

## 🔴 Críticos

### C1 — Contraseña guardada en cookie en texto plano
- **Archivo:** `src/views/login/Login.js` líneas 124–125, 152–154
- **Descripción:** Al activar "Recuérdame", la contraseña se guarda en una cookie sin flags `httpOnly` ni `secure`, en texto plano.
- **Impacto:** Cualquier XSS en la app expone la contraseña del usuario. También viaja en cada request HTTP.
- **Fix:** Eliminar la contraseña de la cookie completamente. Guardar solo el username o un token opaco. La sesión ya la mantiene Firebase SDK en IndexedDB.

---

### C2 — `innerHTML` con datos de usuario en generación de PDFs
- **Archivos:** `src/views/Contratos/contratos/contractPdf.js` ~línea 427, `contractPdf_legacy.js` ~línea 410
- **Descripción:** Campos de formulario (nombres, datos del inmueble, etc.) se interpolan directamente en strings HTML que se asignan a `container.innerHTML`.
- **Impacto:** Si algún campo contiene `<script>` o handlers de evento, se ejecuta JavaScript arbitrario (XSS).
- **Fix:** Sanitizar con [DOMPurify](https://github.com/cure53/DOMPurify) antes de asignar a `innerHTML`, o construir el DOM programáticamente con `textContent`/`createElement`.

---

### C3 — "Cifrado" de tenantId trivialmente reversible
- **Archivo:** `src/services/tenantContext.js` líneas 2–10
- **Descripción:** El `tenantId` se ofusca con base64 + XOR usando la clave hardcodeada `'cf_multitenant_2025'`. XOR con clave fija no es cifrado.
- **Impacto:** Cualquier usuario puede decodificar el tenantId de otro tenant leyendo el localStorage y acceder a sus datos si las Firestore Security Rules no lo bloquean a nivel servidor.
- **Fix:** La separación de tenants debe aplicarse en las **Firebase Security Rules** (servidor), no en el cliente. El "cifrado" del cliente puede eliminarse o reemplazarse por un UUID opaco asignado por el backend.

---

## 🟠 Altos

### A1 — Token Firebase en `localStorage`
- **Archivos:** `src/services/firebase/auth.js` líneas 91, 111–114; `src/views/login/Login.js` líneas 147–150; múltiples archivos
- **Descripción:** El token Firebase ID y el username se persisten en `localStorage`, accesible a cualquier script de la página.
- **Impacto:** Un XSS permite robar el token y suplantar al usuario sin conocer la contraseña.
- **Fix:** Mantener el token solo en memoria (Redux store). Firebase SDK ya maneja la persistencia de sesión internamente en IndexedDB; no es necesario guardarlo manualmente en `localStorage`.

---

### A2 — Sin protección CSRF en llamadas a Google Apps Script
- **Archivos:** `src/services/providers/api/utilApi.js`, `src/services/api/payments.js`, `src/services/api/accounts.js`
- **Descripción:** Las llamadas POST al endpoint de GAS usan `FormData` con el token en el body, pero sin token CSRF. La URL del endpoint es pública y fija.
- **Impacto:** Desde otro origen se puede forzar al navegador autenticado a hacer requests maliciosos que modifiquen datos financieros.
- **Fix:** Validar el header `Origin` en el GAS. Considerar incluir un nonce de un solo uso en cada request o exigir un header custom que los navegadores no envían en requests cross-origin simples.

---

### A3 — Control de acceso por rol solo en el cliente
- **Archivo:** `src/components/layout/AppContent.js` líneas 87–91
- **Descripción:** Las rutas protegidas por rol (superAdmin, admin) se filtran en el frontend. La regla es `if (!role) return true` — sin rol asignado, se permite el acceso.
- **Impacto:** Modificar el store de Redux o borrar el rol del estado da acceso a páginas de administración (Usuarios, Tenants, Configuración).
- **Fix:** Validar el rol en cada operación sensible en **Firestore Security Rules** y en el GAS backend. El frontend puede ocultar rutas por UX, pero la autorización real debe ser servidor.

---

## 🟡 Medios

### M1 — Token de sesión legacy débil (base64 no firmado)
- **Archivo:** `src/services/firebase/auth.js` línea ~91
- **Descripción:** Para usuarios sin cuenta Firebase Auth, el session token se genera como `btoa(username + ':' + Date.now())` — decodificable trivialmente, sin firma criptográfica.
- **Fix:** Usar `crypto.randomUUID()` (ya disponible en el proyecto) y validar la existencia del token en Firestore con expiración.

---

### M2 — Inputs de URL usados directamente en Firestore sin validar
- **Archivos:** `src/services/firebase/cashflow/paymentVaucher.js` líneas 17–19; `src/views/Contratos/contratos/GenerarContrato/index.js` línea ~96
- **Descripción:** Parámetros de query string (`searchParams.get('id')`) y valores de formulario se pasan directamente a `where()` de Firestore sin validar tipo ni formato.
- **Fix:** Validar que los IDs sean strings no vacíos con formato esperado antes de usarlos. Considerar Zod para schemas de validación en los sagas.

---

### M3 — tenantId no verificado server-side en consultas Firestore
- **Archivos:** Múltiples servicios que llaman `getTenantId()` y lo usan en cláusulas `where()`
- **Descripción:** Si las Firebase Security Rules no verifican que el `tenantId` en la query corresponde al del usuario autenticado, un usuario puede cambiar el `tenantId` en localStorage y leer datos de otro tenant.
- **Fix:** Agregar en las Security Rules: `allow read, write: if request.auth != null && resource.data.tenantId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.tenantId;`

---

### M4 — Cambio de contraseña sin verificar la contraseña actual
- **Archivo:** `src/services/firebase/security/users.js` líneas ~87–90
- **Descripción:** La función `changePassword()` no requiere re-autenticación con la contraseña actual antes de actualizarla.
- **Impacto:** Si la sesión es robada, el atacante puede cambiar la contraseña y tomar el control permanente de la cuenta.
- **Fix:** Llamar `reauthenticateWithCredential()` de Firebase Auth antes de `updatePassword()`.

---

### M5 — Política de contraseñas insuficiente
- **Archivo:** `src/views/profile/Profile.js` línea ~78
- **Descripción:** Solo se requieren 6 caracteres como mínimo, sin requisitos de complejidad.
- **Fix:** Exigir mínimo 12 caracteres con al menos una mayúscula, un número y un símbolo. Considerar [zxcvbn](https://github.com/dropbox/zxcvbn) para mostrar fortaleza en tiempo real.

---

### M6 — `console.error()` puede filtrar datos sensibles en producción
- **Archivos:** `src/services/firebase/cashflow/paymentVaucher.js` líneas 27, 38, 48 y otros
- **Descripción:** Objetos de error completos se loguean a consola, pudiendo incluir IDs de usuarios, paths de Firestore o datos financieros.
- **Fix:** En producción, loguear solo el mensaje genérico. Usar un servicio como Sentry con `beforeSend` para filtrar datos sensibles antes de enviar.

---

## 🔵 Bajos

### B1 — Número de teléfono personal hardcodeado
- **Archivo:** `src/views/aboutMe/Index.js` líneas ~177–178
- **Descripción:** Número de teléfono y links personales en el código fuente público.
- **Fix:** Mover a variables de entorno o eliminar del código.

---

### B2 — Commit hash expuesto en build de producción
- **Archivos:** `vite.config.mjs` líneas 43–46; `build/version.json`
- **Descripción:** El hash y mensaje del último commit son accesibles públicamente, facilitando identificar versiones con vulnerabilidades conocidas.
- **Fix:** Considerar no exponer el hash completo en producción, o al menos no el mensaje del commit.

---

### B3 — Uso excesivo de `localStorage` para estado de UI
- **Archivos:** 50+ archivos (preferencias de vista, modo, filtros)
- **Descripción:** Toda preferencia de UI se persiste en `localStorage`. Un XSS puede leer/escribir estas preferencias y manipular el estado de la UI.
- **Fix:** Para estado de UI no sensible es aceptable, pero limitar qué se guarda. Asegurarse de hacer `localStorage.clear()` en logout (ya se hace).

---

### B4 — Logs detallados activos potencialmente en producción
- **Descripción:** Varios `console.log` con datos de operaciones financieras visibles en DevTools.
- **Fix:** Implementar un wrapper de logging que en producción (`import.meta.env.PROD`) silencie los logs o los envíe a un backend de monitoreo.

---

## Acciones prioritarias

1. **Inmediato:** Eliminar la contraseña de las cookies (`Login.js`)
2. **Inmediato:** Sanitizar con DOMPurify antes de `innerHTML` en generación de contratos
3. **Corto plazo:** Revisar y endurecer las Firebase Security Rules para tenantId y roles
4. **Corto plazo:** Agregar `reauthenticateWithCredential()` antes del cambio de contraseña
5. **Medio plazo:** Mover tokens fuera de `localStorage`, confiar en Firebase SDK para persistencia
6. **Medio plazo:** Validar inputs con schemas (Zod) en sagas antes de escribir a Firestore
