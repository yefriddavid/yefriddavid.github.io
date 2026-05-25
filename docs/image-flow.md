# Flujo de manejo de imágenes

Esta aplicación centraliza **todas** las operaciones de imágenes a través de `imageFacade.js`, una fachada agnóstica de backend. Las vistas y sagas nunca llaman a `fileHelpers.js` directamente ni acceden a Firebase Storage (prohibido); en su lugar, interactúan únicamente con la fachada. El backend activo se controla con la constante `BACKEND_ID` (actualmente `'base64'`): cambiarla es el único paso necesario para migrar a un backend remoto sin tocar vistas, sagas ni servicios.

---

```mermaid
flowchart TD
    %% ─── UPLOAD FLOW ────────────────────────────────────────────────────────────
    subgraph VIEW["Capa Vista"]
        V_UP["Vista (ej. Drivers.js, FileUploadField)\nUsuario selecciona archivo"]
        V_STATE["Estado local\nsetHandle(handle)"]
        V_DISPATCH["dispatch(action con handle en payload)"]
    end

    subgraph FACADE["Capa Fachada — imageFacade.js"]
        F_UPLOAD["uploadImage(file)\nrouter por BACKEND_ID"]
        F_PREVIEW["createPreview(file)\nURL.createObjectURL"]
        F_DISPLAY["toDisplayUrlSync(handle)\nretorna handle directamente (base64)"]
        F_DELETE["deleteImage(handle)\nno-op en backend base64"]
    end

    subgraph HELPERS["Capa Helpers — fileHelpers.js"]
        H_PROCESS["processAttachmentFile(file)\nvalida tipo y tamaño"]
        H_PDF["pdfToSingleImage(file)\npdfjs-dist · todas las páginas\n→ un solo JPEG concatenado"]
        H_IMG["compressImage(file)\ncanvas resize ≤ 1200 px\n→ JPEG calidad 0.75"]
    end

    subgraph REDUX["Capa Redux"]
        R_ACTION["Acción Redux"]
        R_SAGA["Saga (redux-saga)"]
        R_SERVICE["Servicio Firestore"]
        R_REDUCER["Reducer → store"]
    end

    subgraph STORAGE["Capa Almacenamiento — Firestore"]
        FS_DOC["Documento Firestore\ncampo: photo / image / file\n(string base64)"]
        FS_NULL["Campo puesto a null"]
    end

    %% ── Upload ──────────────────────────────────────────────────────────────────
    V_UP -->|"uploadImage(file)"| F_UPLOAD
    F_UPLOAD -->|"_base64UploadSingle(file)"| H_PROCESS
    H_PROCESS -->|"isPDF"| H_PDF
    H_PROCESS -->|"isImage"| H_IMG
    H_PDF -->|"base64 JPEG"| H_HANDLE(["handle\n(data-URI base64)"])
    H_IMG -->|"base64 JPEG"| H_HANDLE
    H_HANDLE --> V_STATE
    V_STATE --> V_DISPATCH
    V_DISPATCH --> R_ACTION
    R_ACTION --> R_SAGA
    R_SAGA --> R_SERVICE
    R_SERVICE -->|"set(doc, { photo: handle })"| FS_DOC
    R_SERVICE --> R_REDUCER

    %% ── Display ─────────────────────────────────────────────────────────────────
    R_REDUCER -->|"useSelector"| V_DISPLAY["Vista\nlee handle del store"]
    V_DISPLAY -->|"toDisplayUrlSync(handle)"| F_DISPLAY
    F_DISPLAY -->|"retorna handle sin cambios"| IMG["&lt;img src={handle} /&gt;"]

    %% ── Preview ─────────────────────────────────────────────────────────────────
    V_UP -->|"createPreview(file)"| F_PREVIEW
    F_PREVIEW -->|"{ url: objectURL, revoke }"| V_PREV["Vista muestra preview\nantes de subir"]
    V_PREV -->|"onUnmount: revoke()"| MEM["Libera memoria\n(URL.revokeObjectURL)"]

    %% ── Delete ──────────────────────────────────────────────────────────────────
    V_DEL["Vista\ndispatch(deleteAction)"] --> R_ACTION_DEL["Acción Redux"]
    R_ACTION_DEL --> R_SAGA_DEL["Saga"]
    R_SAGA_DEL -->|"deleteImage(handle)"| F_DELETE
    F_DELETE -->|"no-op (base64)"| NOOP(["Sin operación\nen storage"])
    R_SAGA_DEL -->|"set(doc, { photo: null })"| FS_NULL

    %% ── Future backend switch ───────────────────────────────────────────────────
    subgraph FUTURE["Cambio de backend (futuro)"]
        FUTURE_ID["BACKEND_ID = 'firebase-storage'\nen imageFacade.js"]
        FUTURE_ADAPTER["Nuevo adaptador\n_storageUpload / _remoteDisplayUrl\n_remoteDelete"]
        FUTURE_ZERO["Cero cambios en\nvistas · sagas · servicios"]
    end
    FUTURE_ID --> FUTURE_ADAPTER --> FUTURE_ZERO
```

---

## Leyenda — ¿qué es un "handle"?

Un **handle** es el valor opaco que la fachada devuelve tras subir un archivo y que se persiste directamente en Firestore. Las vistas lo tratan como una caja negra:

| Operación | Qué hace la vista con el handle |
|---|---|
| `uploadImage(file)` | Recibe el handle y lo guarda en estado local / dispatcha acción |
| `toDisplayUrlSync(handle)` | Obtiene la URL lista para `<img src>` |
| `deleteImage(handle)` | Solicita borrar el recurso en el backend |
| Inspeccionar el handle | **Nunca** — su formato es un detalle de implementación |

**Backend actual (`base64`):** el handle es el propio data-URI JPEG (`"data:image/jpeg;base64,/9j/…"`). `toDisplayUrlSync` lo devuelve sin modificar porque ya es una URL válida para el navegador. `deleteImage` es un no-op porque el dato vive dentro del documento Firestore; borrarlo significa poner el campo a `null`.

**Backend futuro (ej. Firebase Storage):** el handle sería la ruta del objeto (`"tenants/abc/drivers/xyz.jpg"`). `toDisplayUrl` haría una llamada de red para obtener una signed URL. Las vistas **no cambiarían**.
