# Planos Designer

Editor 2D de planos arquitectónicos (vista superior) integrado en el módulo Inmobiliaria.

## Rutas

| Ruta | Vista | Descripción |
|---|---|---|
| `/inmobiliaria/planos` | `Planos/index.js` | Lista de planos guardados |
| `/inmobiliaria/planos/new` | `PlanosEditor/index.js` | Editor — plano nuevo |
| `/inmobiliaria/planos/:id` | `PlanosEditor/index.js` | Editor — editar plano existente |

## Modelo de datos (Firestore)

Colección: `Inmobiliaria_Planos`

```js
{
  id: string,
  name: string,
  tenantId: string,
  walls:     [{ id, x1, y1, x2, y2 }],
  doors:     [{ id, x, y, width, rotation }],
  windows:   [{ id, x, y, width, rotation }],
  furniture: [{ id, type, x, y, width, height, rotation }],
  labels:    [{ id, text, x, y }],
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

Coordenadas en píxeles del canvas. La escala es **0.5 m por celda** (1 metro = 40 px, celda = 20 px).

## Arquitectura del editor

```
PlanosEditor/index.js      — estado del editor + save/load
  ├── Toolbar.js            — herramientas (izquierda)
  └── EditorCanvas.js       — Stage Konva (centro)
        ├── Layer grid       — cuadrícula de fondo
        ├── Layer principal  — paredes, puertas, ventanas, muebles, etiquetas
        └── Layer overlay    — selección + preview de dibujo
```

## Herramientas

| Herramienta | Acción en canvas |
|---|---|
| `select` | Click → seleccionar; drag → mover; R → rotar 90°; Delete → eliminar |
| `wall` | Click → punto inicial; click → crear pared (encadenadas); Escape → cancelar |
| `door` | Click → colocar puerta (4 celdas de ancho por defecto) |
| `window` | Click → colocar ventana (3 celdas de ancho) |
| `label` | Click → ingresar texto con prompt |
| + mueble activo | Click → colocar mueble en posición |

## Catálogo de muebles

Organizado por categoría. Definido en `src/constants/inmobiliaria.js` → `FURNITURE_CATALOG`.

| Categoría | Elementos |
|---|---|
| Dormitorio | Cama sencilla, Cama doble, Armario |
| Baño | Inodoro, Bañera, Ducha, Lavamanos |
| Cocina | Lavaplatos, Estufa, Nevera |
| Sala | Sofá, Sillón, Mesa café, Mueble TV |
| Comedor | Mesa comedor, Silla |

## Sistema de coordenadas

- `GRID_SIZE = 20 px` — tamaño de celda
- `PIXELS_PER_METER = 40 px` — 1 metro = 40 px = 2 celdas
- `WALL_THICKNESS = 8 px` — grosor visual de pared
- Todos los puntos se ajustan automáticamente a la cuadrícula (snap)
- Canvas lógico: 2000 × 1500 px → 50 m × 37.5 m

## Redux

```
actions/inmobiliaria/planosActions.js
reducers/inmobiliaria/planosReducer.js   → state.inmobiliariaPlanos
sagas/inmobiliaria/planosSagas.js
services/firebase/inmobiliaria/planos.js
services/facade/inmobiliaria/planosFacade.js
```

## Zoom y paneo

- Rueda del mouse → zoom in/out (escala 0.2–3×)
- Drag del Stage (herramienta `select`) → panear el canvas
