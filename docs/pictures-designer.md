# Pictures Designer — Módulo Finance

Editor de composiciones gráficas con figuras geométricas. Permite crear cuadros vectoriales directamente en el navegador con persistencia en Firestore.

---

## Navegación

**Finance → Pictures**
Ruta lista: `#/finance/pictures`
Ruta editor: `#/finance/pictures/:id` (`:id = 'new'` para crear)
Ítem: suelto al final del bloque Finance en `_nav.js`, fuera de cualquier `CNavGroup`.

---

## Pantallas

### 1. Pictures — lista

Pantalla de gestión de cuadros guardados. Igual en estructura a `Inmobiliaria/Planos`:

- Header con botón **Nuevo cuadro**
- `StandardGrid` con columnas: Nombre · Tamaño · Unidad · Figuras · Grupos · Última edición · Acciones
- Acciones por fila: Editar (navega al editor) · Duplicar · Eliminar (confirm)

Archivo: `src/views/Finance/Pictures/index.js`

### 2. PicturesEditor — editor

Editor de canvas de pantalla completa. Layout de tres columnas:

```
┌─────────────────────────────────────────────────────┐
│  Header: nombre editable · tamaño/unidad · acciones │
├──────────────┬──────────────────────────┬───────────┤
│              │                          │           │
│  Toolbar     │   Canvas (+ reglas)      │  Panel    │
│  (izquierda) │                          │  Nodos    │
│              │                          │  & Grupos │
│              │                          │           │
└──────────────┴──────────────────────────┴───────────┘
```

Archivos:
```
src/views/Finance/PicturesEditor/
  index.js              ← estado global, hotkeys, save/load
  Toolbar.js            ← herramientas + propiedades de figura activa
  EditorCanvas.js       ← canvas SVG/Canvas con reglas
  NodesPanel.js         ← árbol de nodos y grupos
  PicturesEditor.scss   ← estilos BEM prefijo .pic-
```

---

## Configuración del lienzo

El usuario define el lienzo al crear o desde el header del editor.

### Unidades soportadas

| Key    | Label        | Conversión a px (referencia) |
|--------|--------------|------------------------------|
| `px`   | Píxeles      | 1 px = 1 px                  |
| `mm`   | Milímetros   | 1 mm ≈ 3.78 px (96 dpi)      |
| `cm`   | Centímetros  | 1 cm ≈ 37.8 px (96 dpi)      |
| `m`    | Metros       | 1 m = 100 cm                 |
| `in`   | Pulgadas     | 1 in = 96 px (96 dpi)        |
| `ft`   | Pies         | 1 ft = 12 in                 |

La constante `PICTURES_UNITS` en `src/constants/finance.js` exporta este array.

La conversión se hace siempre a **px internamente**. El canvas renderiza en px; las reglas muestran el valor en la unidad elegida.

### Parámetros del lienzo

| Campo    | Tipo    | Descripción                          |
|----------|---------|--------------------------------------|
| `width`  | number  | Ancho en la unidad elegida           |
| `height` | number  | Alto en la unidad elegida            |
| `unit`   | string  | Key de la unidad (`cm`, `m`, etc.)   |
| `dpi`    | number  | DPI para conversión mm/cm/in (def. 96) |
| `grid`   | number  | Tamaño de celda de grilla en la unidad |
| `snap`   | boolean | Snap al grid activado/desactivado    |
| `bg`     | string  | Color de fondo del lienzo (hex)      |

### Reglas

Las reglas (rulers) son barras de ~20 px que rodean el canvas por arriba y por la izquierda. Muestran marcas en la unidad activa. La densidad de marcas se adapta al zoom:

- Marca principal cada unidad entera
- Marca menor cada fracción (0.5, 0.25 según zoom)
- Origen en la esquina superior-izquierda del lienzo

Constante: `PICTURES_RULER_SIZE = 20` (px de ancho/alto de la regla).

---

## Herramientas (Toolbar)

### Herramientas de selección y edición

| Key        | Icono | Descripción                               |
|------------|-------|-------------------------------------------|
| `select`   | ↖     | Seleccionar, mover, redimensionar figuras |
| `text`     | T     | Agregar etiqueta de texto libre           |
| `eraser`   | ✕     | Eliminar figura con clic                  |

### Figuras geométricas

| Key           | Icono | Descripción                               |
|---------------|-------|-------------------------------------------|
| `rect`        | ▬     | Rectángulo / cuadrado                     |
| `circle`      | ○     | Círculo / elipse                          |
| `triangle`    | △     | Triángulo (isósceles por defecto)         |
| `polygon`     | ⬡     | Polígono regular — N lados configurable   |
| `star`        | ★     | Estrella — N puntas configurable          |
| `line`        | /     | Línea recta                               |
| `arrow`       | →     | Flecha con cabeza configurable            |

Las figuras se dibujan con **click + drag** para definir el bounding box.

### Propiedades de figura (panel inferior del Toolbar)

Cuando hay una figura seleccionada, el Toolbar muestra su inspector:

| Propiedad      | Tipo            | Descripción                          |
|----------------|-----------------|--------------------------------------|
| `fill`         | color + opacity | Color de relleno y transparencia     |
| `stroke`       | color           | Color del borde                      |
| `strokeWidth`  | number          | Grosor del borde en px               |
| `rotation`     | number (0-360)  | Rotación en grados                   |
| `x`, `y`       | number          | Posición en unidad activa            |
| `w`, `h`       | number          | Tamaño en unidad activa              |
| `sides`        | number          | Lados (solo polygon, min 3)          |
| `points`       | number          | Puntas (solo star, min 3)            |
| `fontSize`     | number          | Tamaño de fuente (solo text)         |
| `fontColor`    | color           | Color del texto (solo text)          |

### Acciones de teclado (igual que PlanosEditor)

| Tecla          | Acción                           |
|----------------|----------------------------------|
| `Supr` / `Del` | Eliminar seleccionados           |
| `Ctrl+C`       | Copiar                           |
| `Ctrl+V`       | Pegar                            |
| `Ctrl+D`       | Duplicar                         |
| `↑↓←→`        | Mover 1 unidad de grid           |
| `Shift+↑↓←→`  | Mover 10 unidades de grid        |
| `R`            | Rotar 90° (figura seleccionada)  |
| `Ctrl+G`       | Agrupar seleccionados            |
| `Ctrl+Shift+G` | Desagrupar grupo seleccionado    |
| `Ctrl+Z`       | Deshacer                         |
| `Ctrl+Shift+Z` | Rehacer                          |
| `Ctrl+S`       | Guardar                          |
| `Esc`          | Cancelar herramienta activa      |

---

## Panel de Nodos y Grupos (NodesPanel)

Panel derecho. Muestra el árbol completo del lienzo como una jerarquía:

```
▼ Grupo A
    ○ Círculo 1
    □ Rect 2
▷ Grupo B   (colapsado)
  ★ Estrella 3
  / Línea 4
```

### Nodo

Cada figura en el canvas es un **nodo**. Tiene:
- Ícono según tipo (`□ ○ △ ⬡ ★ / → T`)
- Nombre editable (doble clic en el panel)
- Indicador de visibilidad (ojo) — ocultar sin eliminar
- Indicador de bloqueo (candado) — bloquear posición/edición
- Orden: los nodos de arriba en el panel están al frente en el canvas (z-index)

### Grupo

Un grupo contiene uno o más nodos. Comportamiento:
- Mover el grupo mueve todos sus nodos juntos manteniendo posiciones relativas
- Rotar el grupo rota el conjunto alrededor del centroide del grupo
- Seleccionar el grupo en el panel selecciona todos sus nodos en el canvas
- Un grupo puede contener otros grupos (anidamiento de un nivel)
- Clic en un nodo dentro de un grupo seleccionado → edita el nodo individual

### Interacciones del panel

| Acción | Resultado |
|--------|-----------|
| Clic en nodo/grupo | Selecciona en canvas |
| Shift+clic | Selección múltiple |
| Arrastrar nodo sobre grupo | Agrega nodo al grupo |
| Arrastrar nodo fuera del grupo | Saca nodo del grupo |
| Doble clic en nombre | Renombrar inline |
| Clic en ojo | Toggle visibilidad |
| Clic en candado | Toggle bloqueo |
| Arrastrar fila | Reordenar z-index |

---

## Modelo de datos — Firestore

### Colección

`Finance_Pictures` — constante `COL_FINANCE_PICTURES` en `src/services/firebase/settings.js`

### Documento (picture)

```js
{
  id: string,           // auto Firestore
  name: string,         // nombre del cuadro
  canvas: {
    width: number,      // en la unidad del documento
    height: number,
    unit: string,       // 'px' | 'mm' | 'cm' | 'm' | 'in' | 'ft'
    dpi: number,        // 96 por defecto
    grid: number,       // tamaño celda grilla en la unidad
    snap: boolean,
    bg: string,         // color fondo hex
  },
  nodes: [              // array plano de nodos
    {
      id: string,
      type: string,     // 'rect' | 'circle' | 'triangle' | 'polygon' | 'star' | 'line' | 'arrow' | 'text'
      name: string,     // nombre editable
      groupId: string | null,  // id del grupo padre
      visible: boolean,
      locked: boolean,
      x: number,        // posición en px internos
      y: number,
      w: number,        // tamaño en px
      h: number,
      rotation: number, // grados
      fill: string,     // hex
      fillOpacity: number, // 0-1
      stroke: string,
      strokeWidth: number,
      sides: number | null,    // polygon
      points: number | null,   // star
      text: string | null,     // text
      fontSize: number | null,
      fontColor: string | null,
    }
  ],
  groups: [             // array de grupos
    {
      id: string,
      name: string,
      collapsed: boolean,
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

> Los nodos se guardan en array plano. La pertenencia a un grupo la define `node.groupId`. Esto simplifica las queries Firestore y evita sub-colecciones.

---

## Constantes — `src/constants/finance.js`

Agregar a las constantes existentes del módulo Finance:

```js
export const PICTURES_UNITS = [
  { key: 'px', label: 'Píxeles',      pxPerUnit: 1 },
  { key: 'mm', label: 'Milímetros',   pxPerUnit: 3.7795275591 },
  { key: 'cm', label: 'Centímetros',  pxPerUnit: 37.795275591 },
  { key: 'm',  label: 'Metros',       pxPerUnit: 3779.5275591 },
  { key: 'in', label: 'Pulgadas',     pxPerUnit: 96 },
  { key: 'ft', label: 'Pies',         pxPerUnit: 1152 },
]

export const PICTURES_UNITS_MAP = Object.fromEntries(PICTURES_UNITS.map(u => [u.key, u]))

export const PICTURES_RULER_SIZE = 20  // px

export const PICTURES_SHAPE_TOOLS = [
  { key: 'select',   label: 'Seleccionar' },
  { key: 'rect',     label: 'Rectángulo'  },
  { key: 'circle',   label: 'Círculo'     },
  { key: 'triangle', label: 'Triángulo'   },
  { key: 'polygon',  label: 'Polígono'    },
  { key: 'star',     label: 'Estrella'    },
  { key: 'line',     label: 'Línea'       },
  { key: 'arrow',    label: 'Flecha'      },
  { key: 'text',     label: 'Texto'       },
  { key: 'eraser',   label: 'Borrador'    },
]

export const PICTURES_DEFAULT_CANVAS = {
  width: 20,
  height: 15,
  unit: 'cm',
  dpi: 96,
  grid: 1,
  snap: true,
  bg: '#ffffff',
}

export const PICTURES_DEFAULT_NODE = {
  fill: '#4488ff',
  fillOpacity: 1,
  stroke: '#2244aa',
  strokeWidth: 2,
  rotation: 0,
  visible: true,
  locked: false,
  sides: 6,    // polygon default
  points: 5,   // star default
}
```

---

## Stack Redux

Sigue exactamente el mismo patrón que Planos:

| Archivo | Descripción |
|---------|-------------|
| `src/actions/finance/picturesActions.js` | `fetchRequest/Success/Failure`, `saveRequest/Success/Failure`, `deleteRequest/Success/Failure` |
| `src/reducers/finance/picturesReducer.js` | Slice: `{ list, current, fetching, saving }` |
| `src/sagas/finance/picturesSaga.js` | fetch (getAll), save (set doc), delete (deleteDoc) |
| `src/services/firebase/finance/picturesService.js` | `getAll()`, `save(doc)`, `remove(id)` |

Wiring en `src/store/store.js` y `src/sagas/rootSaga.js`.

---

## Rutas — `src/routes.js`

```js
{ path: '/finance/pictures',       element: lazy(() => import('./views/Finance/Pictures')) },
{ path: '/finance/pictures/:id',   element: lazy(() => import('./views/Finance/PicturesEditor')) },
```

---

## Entrada en `_nav.js`

```js
{
  component: CNavItem,
  name: 'Pictures',
  to: '/finance/pictures',
  icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
}
```

Se inserta después del último grupo de Finance (Trade), antes de la sección Inmobiliaria. Sin condición de rol por ahora.

---

## Diferencias clave con PlanosEditor

| Aspecto             | PlanosEditor                    | PicturesEditor                      |
|---------------------|---------------------------------|-------------------------------------|
| Dominio             | Planos arquitectónicos          | Composición geométrica libre        |
| Unidades            | Solo metros (fija)              | Configurable: px, mm, cm, m, in, ft |
| Tamaño lienzo       | Fijo por preset                 | Definido por el usuario             |
| Herramientas        | Pared, puerta, muebles          | Figuras geométricas + texto         |
| Panel lateral       | Layers (lista plana)            | Nodes & Groups (árbol con grupos)   |
| Historial           | No                              | Deshacer/Rehacer (Ctrl+Z/Y)         |
| Grupos              | No                              | Sí — Ctrl+G / Ctrl+Shift+G          |
| Visibilidad/Bloqueo | No                              | Sí — por nodo                       |
| Renderizado         | Canvas 2D                       | SVG (permite exportar a SVG/PNG)    |

> **SVG sobre Canvas 2D**: se elige SVG porque facilita la exportación futura a SVG/PNG, la selección precisa de formas, y el escalado sin pérdida a cualquier DPI.

---

## Consideraciones de implementación

- **Coordenadas internas siempre en px** — la conversión se hace al mostrar en reglas y en el inspector. Fórmula: `px = valorEnUnidad × pxPerUnit`.
- **Sin Firebase Storage** — los cuadros se guardan como JSON puro en Firestore. No hay imágenes embebidas.
- **Autoguardado** — guardar es explícito (Ctrl+S o botón). No hay autoguardado automático para evitar guardados parciales durante edición.
- **Zoom** — el canvas es zoomeable con rueda del ratón. Las reglas se actualizan con el zoom. El zoom no se persiste en Firestore.
- **Exportar** (fase futura, no en v1) — botón para descargar el SVG o renderizar a PNG a la resolución del lienzo.
