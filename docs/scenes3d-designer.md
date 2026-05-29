# Scenes 3D Designer

Editor de escenas 3D basado en Three.js / React Three Fiber. Permite crear, editar y guardar escenas con objetos 3D primitivos, persistidas en Firestore.

---

## Rutas

| Ruta | Vista | Descripción |
|---|---|---|
| `/finance/scenes3d` | `Scenes3D` | Lista de escenas |
| `/finance/scenes3d/new` | `Scenes3DEditor` | Nueva escena |
| `/finance/scenes3d/:id` | `Scenes3DEditor` | Editar escena existente |

---

## Arquitectura

Sigue exactamente el mismo patrón Redux que el módulo Pictures 2D:

```
Component → dispatch action → saga → service (Firestore) → reducer → selector
```

### Capa de datos

| Archivo | Rol |
|---|---|
| `src/actions/finance/scenes3dActions.js` | Action creators (fetch/load/create/update/delete/clear) |
| `src/reducers/finance/scenes3dReducer.js` | Estado: `{ list, current, fetching, loading, saving, error }` |
| `src/sagas/finance/scenes3dSagas.js` | Efectos async, toasts de éxito/error |
| `src/services/firebase/finance/scenes3d.js` | Firestore CRUD |
| `src/services/facade/finance/scenes3dFacade.js` | Re-exporta el servicio |

Colección Firestore: `Finance_Scenes3D` (constante `COL_FINANCE_SCENES_3D` en `settings.js`).

---

## Modelo de datos

### Escena (`Scene`)

```js
{
  id: string,           // Firestore doc ID
  name: string,
  tenantId: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  scene: SceneConfig,
  objects: SceneObject[],
}
```

### Configuración de escena (`SceneConfig`)

```js
{
  bg: string,               // Color de fondo CSS (#1a1a2e)
  grid: boolean,            // Mostrar grilla
  ambientIntensity: number, // Intensidad luz ambiente (0-3)
  dirLightIntensity: number,// Intensidad luz direccional
  dirLightColor: string,    // Color luz direccional (#ffffff)
}
```

### Objeto 3D (`SceneObject`)

```js
{
  id: string,
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane',
  name: string,
  position: [x, y, z],     // Three.js world units
  rotation: [x, y, z],     // Radianes (Euler XYZ)
  scale: [x, y, z],
  color: string,            // Color CSS
  opacity: number,          // 0-1
  wireframe: boolean,
  visible: boolean,
  locked: boolean,          // No se puede seleccionar/mover si true
}
```

---

## Vistas

### `Scenes3D/index.js`
Lista de escenas con StandardGrid. Permite crear, duplicar y eliminar escenas.

### `Scenes3DEditor/index.js`
Editor principal. Gestiona todo el estado local (objetos, selección, modo de transformación, dirty flag) y despacha las acciones Redux para guardar.

Estructura del layout:
```
┌───────────────────────────────────────────────────────┐
│  Header: nombre | config escena | Guardar | ↓ PNG      │
├────────────┬──────────────────────────┬───────────────┤
│ Toolbar3D  │      EditorScene          │ ObjectsPanel  │
│ (140px)    │   (Three.js Canvas)       │  (200px)      │
└────────────┴──────────────────────────┴───────────────┘
```

### `EditorScene.js`
Componente `forwardRef` que envuelve el `<Canvas>` de R3F. Expone `exportPNG(filename)` vía `useImperativeHandle`.

Internamente contiene:
- `SceneObject` — renderiza la geometría según `type`, maneja click para seleccionar
- `CanvasExporter` — accede a `gl`/`scene`/`camera` con `useThree()` para exportar PNG
- `SceneContent` — monta luces, grid (`@react-three/drei`), objetos y controles
- `OrbitControls` — navegación de cámara (click+drag orbitar, scroll zoom)
- `TransformControls` — gizmo de transformación sobre el objeto seleccionado; se desactiva OrbitControls mientras se arrastra

### `Toolbar3D.js`
Panel izquierdo con dos secciones:
1. **Primitivas** — botones para añadir cada tipo de objeto
2. **Transformar** — W/E/R para Mover/Rotar/Escalar
3. **Propiedades** — inspector del objeto seleccionado (color, opacidad, wireframe, posición XYZ, rotación XYZ, escala XYZ)

### `ObjectsPanel.js`
Panel derecho: lista de todos los objetos de la escena (en orden inverso al de creación). Permite renombrar (doble clic), toggle visibilidad/lock, eliminar.

---

## Atajos de teclado

| Tecla | Acción |
|---|---|
| `W` | Modo Mover (translate) |
| `E` | Modo Rotar (rotate) |
| `R` | Modo Escalar (scale) |
| `Escape` | Deseleccionar |
| `Delete` / `Backspace` | Eliminar objeto seleccionado |
| `Ctrl+S` | Guardar |

---

## Dependencias

| Paquete | Versión | Uso |
|---|---|---|
| `three` | latest | Motor 3D WebGL |
| `@react-three/fiber` | latest | Wrapper React para Three.js |
| `@react-three/drei` | latest | Helpers: OrbitControls, TransformControls, Grid |

---

## Exportar a PNG

El botón **↓ PNG** en el header llama a `sceneRef.current.exportPNG(name)`. Internamente:
1. `gl.render(scene, camera)` — fuerza un render frame
2. `gl.domElement.toDataURL('image/png')` — captura el canvas WebGL
3. Descarga automática vía `<a download>`

> El Canvas debe inicializarse con `gl={{ preserveDrawingBuffer: true }}` para que `toDataURL` funcione correctamente.

---

## Agregar un nuevo tipo de primitiva

1. Añadir la entrada en `SCENES3D_OBJECT_TYPES` en `src/constants/finance.js`
2. Añadir el case en `buildGeometry(type)` en `EditorScene.js`
