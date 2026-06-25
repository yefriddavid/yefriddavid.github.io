# Calculadora Solar — Documentación

## Rutas

| Ruta | Layout | Storage | Descripción |
|------|--------|---------|-------------|
| `/domotica/solar-calculator-configs` | DomoticaLayout | Firebase | Lista de configuraciones guardadas |
| `/domotica/solar-calculator` | DomoticaLayout | Firebase | Calculadora — nueva o carga por `?id=` |
| `/domotica/solar-calculator-local` | EmptyLayout (sin nav) | IndexedDB | Calculadora offline, una sola config |

La ruta local está indexada en `public/robots.txt` y `public/sitemap.xml` como URL pública.

---

## Arquitectura — capas

```
Vista (SolarCalculator / SolarCalculatorLocal)
  │  configura facade al montar
  ▼
Facade  (services/facade/domotica/domoticaSolarCalcFacade.js)   ← Strategy
  │  _impl = remote | local
  ├─ remote → services/firebase/domotica/solarCalc.js          → Firestore
  └─ local  → services/idb/solarCalcLocal.js                   → IndexedDB
  ▼
Saga    (sagas/domotica/domoticaSolarCalcSagas.js)               ← no sabe de storage
  ▼
Reducer (reducers/domotica/domoticaSolarCalcReducer.js)
  slice: domoticaSolarCalc  { data, fetching, error, isError }
  ▼
Actions (actions/domotica/domoticaSolarCalcActions.js)
  fetchRequest / createRequest / updateRequest / deleteRequest
```

### Patrón Strategy en el facade

El facade expone la misma interfaz (`fetchSolarCalcConfigs`, `createSolarCalcConfig`, `updateSolarCalcConfig`, `deleteSolarCalcConfig`) independientemente de la fuente de datos. La implementación activa se configura una vez al montar el componente raíz:

```js
// SolarCalculator.js
configureFacade(local ? 'local' : 'remote')

// SolarCalculatorLocal.js
<SolarCalculator local />
```

El saga, el reducer y las actions son únicos — no saben si hablan con Firebase o IndexedDB.

### Comportamiento por fuente

| | Firebase (remote) | IndexedDB (local) |
|--|--|--|
| Múltiples configs | Sí — con nombre | No — una sola (`id = 'default'`) |
| `createSolarCalcConfig` | Genera ID Firestore | Sobreescribe `'default'` |
| `updateSolarCalcConfig` | Actualiza doc por ID | Sobreescribe `'default'` |
| `fetchSolarCalcConfigs` | Array de N docs | Array de 0 ó 1 elemento |
| Persistencia | Nube, multi-dispositivo | Solo el navegador actual |

---

## Archivos

```
src/
├── actions/domotica/
│   └── domoticaSolarCalcActions.js          # fetch / create / update / delete
│
├── reducers/domotica/
│   └── domoticaSolarCalcReducer.js          # slice domoticaSolarCalc
│
├── sagas/domotica/
│   └── domoticaSolarCalcSagas.js            # orquesta facade, notificaciones
│
├── services/
│   ├── facade/domotica/
│   │   └── domoticaSolarCalcFacade.js       # Strategy — configure() + interfaz unificada
│   ├── firebase/domotica/
│   │   └── solarCalc.js                     # CRUD Firestore (colección Domotica_solar_calc)
│   └── idb/
│       └── solarCalcLocal.js                # CRUD IndexedDB (store domotica_solar_calc, id fijo)
│
└── views/domotica/
    ├── SolarCalculatorConfigs/
    │   └── index.js                         # Lista Firebase — navega a la calculadora
    └── SolarCalculator/
        ├── SolarCalculator.js               # Componente principal (prop: local)
        ├── SolarCalculatorLocal.js          # Wrapper: <SolarCalculator local />
        ├── SolarCanvas.js                   # Canvas HTML5 — diagrama interactivo
        ├── ApplianceTable.js                # Tabla de electrodomésticos
        ├── SolarLocationModal.js            # Modal mapa + NASA POWER API
        ├── useSolarCalc.js                  # Funciones de cálculo puras
        ├── SolarCalculator.scss
        ├── ApplianceTable.scss
        └── SolarLocationModal.scss
```

### Colección Firestore

`Domotica_solar_calc` — definida en `src/services/firebase/settings.js` como `COL_DOMOTICA_SOLAR_CALC`.

### Store IndexedDB

`domotica_solar_calc` — definido en `src/services/idb/idbStores.js` como `IDB_STORES.DOMOTICA_SOLAR_CALC`. Creado en `db.js` en la versión 11.

---

## Modelo de datos

```js
{
  id: string,                   // Firestore doc ID | 'default' en IDB
  name: string,                 // Nombre de la configuración
  mode: 'from_system' | 'from_consumption',
  panels: {
    count: number,              // Cantidad de paneles
    wp: number,                 // Vatios pico por panel
    hsp: number,                // Horas sol pico / día
  },
  controller: {
    efficiency: number,         // % (ej. 97)
    type: 'MPPT' | 'PWM',
  },
  battery: {
    count: number,
    ah: number,                 // Amperios-hora
    voltage: number,            // 12 | 24 | 48
    dod: number,                // Profundidad de descarga %
    type: string,
  },
  inverter: {
    capacity: number,           // W
    efficiency: number,         // %
  },
  consumption: {
    dailyWh: number,
    peakW: number,
    autonomyDays: number,
  },
  appliances: [                 // Filas de la tabla de electrodomésticos
    { name, qty, watts, hours }
  ],
  location: {                   // null si no se seleccionó
    lat: number,
    lng: number,
    name: string,               // Nombre reverse-geocodificado (Nominatim)
    hsp: number,                // Promedio anual NASA POWER
    monthly: { [1..12]: number } // Irradiancia mensual kWh/m²/día
  } | null,
  createdAt: Timestamp | number,
  updatedAt: Timestamp | number,
}
```

---

## Cálculos (useSolarCalc.js)

### Modo: Sistema → Consumo (`calcFromSystem`)

| Resultado | Fórmula |
|-----------|---------|
| `dailyWh` | `panels.count × panels.wp × hsp × ctrl.eff × inv.eff` |
| `peakW` | `inverter.capacity` |
| `autonomyH` | `battWh / (dailyWh / 24)` |
| `solarWh` | `panels.count × panels.wp × hsp × ctrl.eff` |
| `battWh` | `battery.count × battery.ah × battery.voltage × battery.dod` |

### Modo: Consumo → Sistema (`calcFromConsumption`)

| Resultado | Fórmula |
|-----------|---------|
| `panelsN` | `ceil(dailyWh / (wp × hsp × ctrl.eff × inv.eff))` |
| `batteriesN` | `ceil((dailyWh × autonomyDays) / (ah × voltage × dod))` |
| `ctrlA` | `ceil((panelsN × wp / voltage) × 1.25)` — margen 25% |
| `invW` | `ceil((peakW / inv.eff) × 1.10)` — margen 10% |

---

## Flujo de navegación (Firebase)

```
Nav "Calc. Solar"
  └─ /domotica/solar-calculator-configs
       ├─ "Nueva configuración" → /domotica/solar-calculator
       └─ clic en fila         → /domotica/solar-calculator?id=<id>
                                    └─ SolarCalculator lee ?id=,
                                       espera configs en Redux,
                                       llama handleLoad(config)
```

## Datos externos

- **NASA POWER API** — `https://power.larc.nasa.gov/api/temporal/climatology/point`
  - Parámetro: `ALLSKY_SFC_SW_DWN` = irradiancia solar kWh/m²/día = HSP
  - Sin API key, datos climatológicos de largo plazo
- **Nominatim OSM** — reverse geocoding para nombre de ubicación
