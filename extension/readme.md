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
