# Auditoría de Seguridad — App en producción
**URL:** https://yefriddavid.github.io/  
**Fecha:** 2026-06-10  
**Método:** Análisis dinámico con Playwright (Chrome headless) + inspección de bundles JS

---

## Resumen ejecutivo

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Crítico | 1 |
| 🟠 Alto | 3 |
| 🟡 Medio | 2 |
| 🔵 Bajo | 2 |

---

## 🔴 CRÍTICO

### 1. API Keys de Firebase expuestas en el bundle público

**Archivo:** `assets/index-CzECzZHE.js` y `sw.js`

Los tres proyectos Firebase tienen sus API keys, project IDs y auth domains hardcodeados directamente en el JavaScript que descarga cualquier visitante:

```
apiKey: "AIzaSy***"  → cashflow-9cbbc
apiKey: "AIzaSy***"  → tapsi-f2345
apiKey: "AIzaSy***"  → domotica-eb00c
```

**¿Por qué es crítico?**  
Con estas claves cualquier persona puede:
- Hacer consultas directas a Firestore si las **Security Rules** no están bien configuradas
- Abusar la cuota del proyecto (intentos de auth masivos, lectura de documentos)
- Registrar dispositivos en FCM y enviar notificaciones push arbitrarias
- Enumerar colecciones si las reglas son permisivas

**Mitigación:**
- Las claves en sí no pueden ocultarse en una SPA (el SDK las necesita en cliente). La defensa real está en las **Firestore Security Rules** y **Firebase Auth Rules**:
  - Regla mínima: `allow read, write: if request.auth != null;` en todas las colecciones
  - Revisar que ninguna colección tenga `allow read, write: if true;`
- Habilitar **restricciones de dominio** para cada API key en Google Cloud Console → solo `yefriddavid.github.io` puede usarlas
- Habilitar **App Check** para que solo la app verificada pueda llamar a Firestore

---

## 🟠 ALTO

### 2. URL de Google Apps Script expuesta

**Archivo:** `assets/index-CzECzZHE.js`

```
https://script.google.com/macros/s/***/exec
```

Cualquier persona con esta URL puede hacer POST directos al backend sin autenticación adicional. El único control es el token Firebase que el interceptor inyecta en cada request — si ese token no se valida en el Apps Script, el endpoint es accesible sin auth.

**Mitigación:**
- Verificar que el Apps Script valide el ID token de Firebase en cada request (`verifyIdToken` desde Admin SDK o validación manual del JWT)
- Si no se valida, agregar esa verificación

### 3. Sin cabeceras de seguridad HTTP

**Todas las cabeceras de seguridad están ausentes:**

| Header | Riesgo por ausencia |
|--------|---------------------|
| `Content-Security-Policy` | Sin restricción a scripts externos; XSS puede cargar recursos arbitrarios |
| `X-Frame-Options` | La app puede embeberse en un iframe (clickjacking) |
| `X-Content-Type-Options` | El browser puede interpretar archivos con MIME incorrecto |
| `Strict-Transport-Security` | Sin forzar HTTPS en visitas futuras |
| `Referrer-Policy` | La URL completa (con hash) se filtra en requests a terceros |
| `Permissions-Policy` | Sin restricción de APIs del browser (cámara, micrófono, geolocalización) |

**Nota:** GitHub Pages no permite configurar headers HTTP personalizados. La única solución sería migrar el hosting a Cloudflare Pages, Vercel, o Netlify (todos permiten cabeceras custom vía archivo de configuración).

### 4. Dependencias de CDN externo sin integridad (SRI)

Los assets de DevExtreme se cargan desde:
- `cdn3.devexpress.com`
- `developer.mescius.com`

Sin atributos `integrity` (Subresource Integrity). Si alguno de esos CDNs es comprometido, código malicioso se ejecutaría en la app sin ningún aviso.

**Mitigación:** Migrar DevExtreme a un bundle local (ya está en `node_modules`), eliminando la dependencia de CDN externo.

---

## 🟡 MEDIO

### 5. Llamada no autenticada a ipinfo.io

**En el bundle:** `ipinfo.io/json`

La app hace un fetch a `ipinfo.io/json` sin token de API. Esto:
- Envía la IP del usuario a un tercero (GDPR/privacidad)
- Está limitado a 50.000 requests/mes en el plan free — en producción puede fallar silenciosamente
- Si el endpoint queda sin rate-limit, cualquier script externo puede forzar que la cuota se agote

**Mitigación:** Registrar una cuenta en ipinfo.io y usar el token autenticado: `ipinfo.io/json?token=YOUR_TOKEN`

### 6. Meta tags del template por defecto

```html
<meta name="description" content="CoreUI for React - Open Source Bootstrap Admin Template">
<meta name="author" content="Łukasz Holeczek">
<meta name="keyword" content="Bootstrap,Admin,Template,Open,Source,CSS,SCSS,HTML,RWD,Dashboard,React">
```

Revelan exactamente qué framework/template se usa, lo que permite a un atacante buscar vulnerabilidades conocidas de esa versión específica.

**Mitigación:** Actualizar el `index.html` con los meta tags correctos del proyecto.

---

## 🔵 BAJO

### 7. Nombre real en el `<title>`

```html
<title>David Rios</title>
```

Expone el nombre real del propietario/desarrollador. Puede ser intencional (portafolio personal), pero vale la pena considerar si es apropiado para una app financiera.

### 8. Cache muy corto para assets con hash

Todos los assets usan `cache-control: max-age=600` (10 minutos), incluso los archivos con hash en el nombre (`index-CzECzZHE.js`). Los archivos hasheados deberían tener `max-age=31536000, immutable` ya que el hash cambia con cada build.

**Impacto:** Performance degradada para usuarios recurrentes.  
**Mitigación:** Esto también es una limitación de GitHub Pages. Migrar a Vercel/Cloudflare permite configurar cache headers por patrón de archivo.

---

## Resumen de acciones prioritarias

| Prioridad | Acción |
|-----------|--------|
| 1 | Auditar y endurecer las Firestore Security Rules para los tres proyectos |
| 2 | Restringir las API keys en Google Cloud Console al dominio `yefriddavid.github.io` |
| 3 | Verificar que Apps Script valide el Firebase ID token en cada request |
| 4 | Migrar hosting a Cloudflare Pages o Vercel para poder agregar cabeceras HTTP |
| 5 | Agregar token de ipinfo.io |
| 6 | Actualizar meta tags del `index.html` |
