# MyAdmin Local Runner — Chrome Extension

Permite ejecutar binarios locales desde la app MyAdmin vía Native Messaging.

## Arquitectura

```
App (chrome.runtime.sendMessage)
  ↓
background.js (service worker)
  ↓ Native Messaging
native-host/localrunner-host (Go binary)
  ↓
Ejecuta el binario en el OS
```

## Instalación completa

### 1. Cargar la extensión en Chrome

1. Abre `chrome://extensions/`
2. Activa **Modo de desarrollador** (toggle arriba a la derecha)
3. Clic en **Cargar sin empaquetar** → selecciona esta carpeta (`extension/`)
4. Copia el **ID** que aparece bajo el nombre (ej. `mpmkckmilocmmaaiminkihchhapgadh`)

### 2. Instalar el native host

Desde la raíz del proyecto:

```bash
cd extension/native-host
./install.sh <EXTENSION_ID>
```

Esto compila el binario Go y registra el host `com.myadmin.localrunner` en
`~/.config/google-chrome/NativeMessagingHosts/` con el `allowed_origins` correcto.

> **Importante:** si quitas y vuelves a cargar la extensión, el ID puede cambiar.
> Hay que re-ejecutar `./install.sh <NUEVO_ID>` cada vez.

### 3. Recargar y verificar

1. En `chrome://extensions/` recarga la extensión (ícono 🔄)
2. Recarga la página de la app (`Ctrl+R`)
3. El banner "Extensión no detectada" debe desaparecer

### Allowlist de binarios (`allowlist.json`)

`background.js` solo reenvía al native host binarios que estén **exactamente**
listados en `extension/allowlist.json`. Cualquier otro `binary` recibido por
`onMessageExternal` se rechaza con `Binario no autorizado`, sin importar qué
página lo haya mandado.

Esto evita que una página comprometida (XSS, dependencia npm maliciosa) le
pida al native host ejecutar cualquier binario arbitrario del sistema
(`/bin/bash`, `curl`, etc.) — solo puede ejecutar lo que ya está en la lista.

**Al agregar/quitar un programa en `/system/programs`, hay que reflejar el
cambio a mano en `allowlist.json`** (agregar o borrar la ruta del binario) y
recargar la extensión en `chrome://extensions`. Si no está en la lista, el
programa configurado en la app no va a poder ejecutarse.

## Notas técnicas

### Detección desde la app (content script → página)

El content script corre en **mundo aislado** (isolated world) — `world: "MAIN"`
declarativo no se aplica en Chrome para scripts cargados sin empaquetar.

El mundo aislado **comparte `sessionStorage`** con la página, así que el content
script escribe el ID ahí en `document_start` y el componente lo lee al montar:

```js
// content.js (isolated world)
sessionStorage.setItem('__localrunner_ext_id__', chrome.runtime.id)

// Programs/index.js (React)
const id = sessionStorage.getItem('__localrunner_ext_id__')
```

### Error "Access to the specified native messaging host is forbidden"

Significa que el `allowed_origins` en el manifest del native host no coincide
con el ID actual de la extensión. Solución: re-ejecutar `./install.sh <ID>`.
