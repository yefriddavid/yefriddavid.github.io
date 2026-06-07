# Web Share Target — Compartir imágenes desde el celular

Permite que la PWA aparezca en el menú de compartir de Android cuando el usuario selecciona una imagen. Al tocarla, la app abre Account Status y lanza automáticamente el asistente OCR con la imagen ya cargada.

## Flujo completo

```
Usuario comparte imagen (galería, WhatsApp, etc.)
  → selecciona "Mi Admin" en el share sheet
  → Android hace POST /share-target (multipart/form-data, campo "file")
  → Service Worker intercepta el POST
      → lee el File del FormData
      → guarda { buffer, type, name } en IDB METADATA bajo la clave "pending-share"
      → responde con redirect 303 → /#/finance/management/account-status?share=<timestamp>
  → App carga AccountStatus con ?share=<timestamp> en la URL
      → useEffect([shareToken]): detecta el param, llama getPendingShare()
      → si hay entrada: clearPendingShare() + elimina ?share de la URL (replace)
      → reconstruye File desde buffer, setSharedFile(file)
      → pasa File como initialFile a <OcrReceiptImporter>
  → OcrReceiptImporter detecta initialFile
      → abre modal automáticamente
      → salta al step "processing" (OCR se lanza de inmediato)
  → Usuario confirma en step 3 y registra el pago
```

## Archivos involucrados

| Archivo | Responsabilidad |
|---|---|
| `vite.config.mjs` | Declara `share_target` en el manifest de la PWA |
| `src/sw/sw.js` | Handler `fetch` que intercepta POST `/share-target` |
| `src/services/idb/pendingShare.js` | `getPendingShare()` / `clearPendingShare()` (app side) |
| `src/views/Accounting/OcrReceiptImporter/OcrReceiptImporter.js` | Prop `initialFile`, auto-open + skip step 1 |
| `src/views/Accounting/AccountStatus/index.js` | Detecta `?share` param vía `useSearchParams`, lee IDB, limpia URL, pasa `sharedFile` como `initialFile` |

## Configuración del manifest

En `vite.config.mjs`, dentro del bloque `manifest` del plugin VitePWA:

```js
share_target: {
  action: '/share-target',
  method: 'POST',
  enctype: 'multipart/form-data',
  params: {
    files: [{ name: 'file', accept: ['image/*'] }],
  },
},
```

`action` debe ser una ruta real (no hash) porque Android hace un POST HTTP directo.

## Service Worker

El handler vive en `src/sw/sw.js` y se registra antes que los handlers de Workbox. Escucha `fetch` y filtra `pathname === '/share-target' && method === 'POST'`:

1. Lee el `File` del FormData.
2. Convierte a `ArrayBuffer` (serializable en IDB).
3. Guarda en `IDB.METADATA['pending-share']` como `{ buffer, type, name }`.
4. Devuelve `Response.redirect('/#/finance/management/account-status?share=<timestamp>', 303)`.

El `?share=<timestamp>` garantiza que la URL siempre sea diferente a la actual, forzando que `useEffect([shareToken])` se dispare incluso si el usuario ya estaba en AccountStatus. El archivo persiste en IDB hasta que AccountStatus lo consume (una sola lectura).

## IDB helper — pendingShare.js

```js
getPendingShare()   // → { buffer: ArrayBuffer, type: string, name: string } | null
clearPendingShare() // → void
```

Usa el store `METADATA` existente (no requiere migraciones de DB).

## OcrReceiptImporter — prop initialFile

```jsx
<OcrReceiptImporter
  masters={masters}
  monthStr={monthStr}
  transactions={transactions}
  onConfirm={handleSavePayment}
  initialFile={sharedFile}   // File | null | undefined
/>
```

Cuando `initialFile` está presente, un `useEffect` lo detecta y:
- Crea el object URL con `URL.createObjectURL`.
- Setea `file`, `imageUrl`, `step = 'processing'`, `open = true`.
- El cleanup del effect revoca el URL con `URL.revokeObjectURL`.

El botón `📷 Leer comprobante` sigue funcionando igual (flujo manual).

## Requisitos

- La PWA debe estar **instalada** en el dispositivo (Agregar a pantalla de inicio). Sin instalación, `share_target` no se registra.
- **Android + Chrome/Edge**: soporte completo para compartir archivos.
- **iOS Safari**: no soporta `share_target` con archivos (solo texto/URL). La feature no está disponible en iOS.

## Despliegue

Tras cualquier cambio en `vite.config.mjs` o `sw.js`, el nuevo Service Worker debe activarse en el dispositivo. Chrome lo hace automáticamente en el siguiente reload cuando no hay otras pestañas abiertas. En producción, el `registerType: 'autoUpdate'` del plugin maneja esto.
