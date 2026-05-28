# Declaración de Renta — Módulo My-Admin

Herramienta interactiva para asistir a personas naturales en la elaboración de su declaración de renta ante la DIAN (Colombia).

> **Referencia histórica validada**: "Hoja de Trabajo Renta 2025 Definitiva" — declaración del **año gravable 2024**, ya presentada ante la DIAN. Elaborada por contadora profesional (Diego Hernán Guevara Madrid, publicada junio 4 de 2025). Usada para validar la estructura del Formulario 210, los renglones y los límites normativos que aplican al año gravable 2024. Los valores concretos del caso (patrimonio, ingresos) son del periodo ya cerrado y sirven únicamente como ejemplo de verificación.

## Año gravable activo en la app: 2025

El código tiene `const YEAR = 2025` y `const UVT = 49799`.

| Parámetro | 2024 (referencia histórica) | 2025 (activo) |
|---|---|---|
| UVT | $47.065 | **$49.799** — Decreto 2311 de dic. 2024 |
| Formulario | 210 año gravable 2024 (ya presentado) | 210 año gravable 2025 |
| Plazo presentación | ago-oct 2025 (ya venció) | **ago-oct 2026** |
| Tope patrimonio | $211.792.500 | $224.095.500 |
| Tope ingresos | $65.891.000 | $69.718.600 |

> **Plazo 2025**: la declaración del año gravable 2025 se presenta entre agosto y octubre de 2026, según los dos últimos dígitos del NIT/cédula. Para actualizar a un año futuro basta con cambiar `UVT` y `YEAR` en `DeclaracionRenta.js` — todos los topes y cálculos se recalibran automáticamente.

### Historial de UVT

| Año gravable | UVT | Decreto |
|---|---|---|
| 2024 | $47.065 | Decreto 2609 de 2023 |
| 2025 | $49.799 | Decreto 2311 de 2024 |

---

## ¿Qué hace este módulo?

Guía paso a paso para:

1. Determinar si el usuario **está obligado a declarar**.
2. Recopilar los documentos necesarios.
3. Registrar **ingresos**, **patrimonio** y **deducciones**.
4. Calcular en tiempo real el **impuesto a cargo**, las **retenciones** ya practicadas y el **saldo final** (a favor o a pagar).
5. Mostrar el mapa exacto de **casillas del Formulario 210** DIAN.
6. Proveer una guía de 10 pasos para ingresar los valores en **muisca.dian.gov.co**.

Los datos se procesan localmente en el navegador — no se envía ningún valor a un servidor.

---

## Navegación

**Finance → Contabilidad → Declaración de Renta**  
Ruta: `#/finance/management/declaracion-renta`  
Archivo: `src/views/Accounting/DeclaracionRenta.js`

---

## Pasos del asistente

### Paso 1 — ¿Debo declarar? / Documentos

**Obligación de declarar** — lista de condiciones (cumplir al menos una obliga a declarar):

| Condición | Tope 2024 |
|---|---|
| Patrimonio bruto | > 4.500 UVT = $211.792.500 |
| Ingresos brutos | > 1.400 UVT = $65.891.000 |
| Consumos con tarjeta de crédito | > 1.400 UVT |
| Total compras y consumos | > 1.400 UVT |
| Consignaciones bancarias | > 1.400 UVT |
| Trabajador independiente con retención | — |
| Responsable de IVA régimen común | — |
| Activos, inversiones o cuentas en el exterior | — |

**Documentos requeridos** — checklist interactivo. Marcar cuando tengas cada uno:

| Documento | Quién lo emite |
|---|---|
| Certificado de ingresos y retenciones — Form. 220 | Tu empleador (RR.HH.) |
| Extractos bancarios — saldo al 31 de diciembre | Tu banco |
| Certificado de rendimientos financieros y retenciones | Banco / entidad financiera |
| Certificado aportes a pensión voluntaria y/o AFC | Fondo de pensiones / banco |
| Certificado intereses crédito hipotecario | Banco hipotecario |
| Certificado pagos medicina prepagada o seguro de salud | Entidad de salud prepagada |
| Avalúo catastral de inmuebles (IGAC) o escritura | Catastro / notaría |
| Tabla de precios vehículo — Ministerio de Transporte | mintransporte.gov.co |
| Certificados de inversiones en fondos o acciones | Comisionista / fondo |

> Los documentos no se adjuntan en la DIAN, pero deben conservarse por **5 años**.

---

### Paso 2 — Ingresos

#### Cédula de trabajo

| Campo | Renglón Form. 210 | Fuente |
|---|---|---|
| Salario bruto del año | R32 | Form. 220 empleador |
| Retención practicada por empleador | R132 | Form. 220, casilla retenciones |
| Honorarios (independientes sin costos) | R32 sub | Contratos y facturas |
| Retención sobre honorarios | R132 | Certificados de retención |
| Pensiones recibidas | R99 (cédula pensiones) | Certificado fondo de pensiones |
| Intereses de cesantías | R36 (renta exenta) | Certificado fondo cesantías |

#### Cédula de capital (R58–R73)

| Campo | Renglón Form. 210 | Fuente |
|---|---|---|
| Rendimientos financieros (CDT, cuentas) | R58 | Certificado rendimientos banco |
| Ingresos por arrendamiento | R58 | Contratos y pagos recibidos |

#### Rentas no laborales (R74–R90)

> **Nota del proceso real**: la contadora clasifica "Otros ingresos" que no son laborales ni capital (ej. honorarios con costos, actividades independientes, ingresos esporádicos) en la **subcédula de rentas no laborales** (R74), separada de la subcédula de capital. En nuestro asistente estos ingresos se agrupan en la categoría "Ingresos de capital" por simplificación — en Muisca se deben separar si son de distinta naturaleza.

#### Cédula de dividendos (R104–R115)

| Campo | Renglón Form. 210 | Nota |
|---|---|---|
| Dividendos y participaciones | R104/R106 | Primeras 300 UVT = exentas; exceso al 15% |

---

### Paso 3 — Patrimonio

Registrar el **valor fiscal** (no comercial) de todos los activos al **31 de diciembre de 2024**.

| Campo | Renglón Form. 210 | Fuente |
|---|---|---|
| Cuentas bancarias (saldo 31-dic) | R29 — Efectivo | Extracto bancario |
| CDT e inversiones en fondos | R29 — Acciones/aportes | Certificado inversiones |
| Bienes inmuebles — avalúo catastral | R29 — Bienes raíces | IGAC / escritura |
| Vehículos — valor tabla oficial | R29 — Vehículos | Ministerio de Transporte |
| Muebles, enseres, joyas | R29 — Muebles y enseres | Facturas / avalúos |
| Otros activos | R29 — Otros activos | Facturas / avalúos |
| Deudas hipotecarias (saldo 31-dic) | R30 | Paz y salvo banco |
| Otras deudas vigentes | R30 | Extractos / certificados |

> **Patrimonio líquido (R31)** = R29 − R30

---

### Paso 4 — Deducciones

Las deducciones reducen la base gravable. Todas tienen **límites individuales** y un **límite conjunto**.

| Deducción | Renglón | Límite individual | Fuente |
|---|---|---|---|
| Intereses crédito hipotecario de vivienda | R38 | 1.200 UVT (~$56.478.000) | Certificado banco |
| Dependientes a cargo (art. 387 ET) | R39 | 10% renta líquida, máx. 32 UVT/mes = 384 UVT año | Cédulas y registros civiles |
| Medicina prepagada o seguro de salud | R39 | 16 UVT/mes = 192 UVT año (~$9.036.000) | Certificado entidad |
| Aportes AFC + Pensión voluntaria (FPV) | R35 | 30% de los ingresos, máx. 3.800 UVT | Certificado fondo/banco |

**Deducción adicional por dependientes (R139)** — art. 336, Ley 2277/2022:
- 72 UVT por cada dependiente, hasta 4 dependientes = máximo 288 UVT ($13.555.000)
- Esta deducción se suma directamente al R92 **sin someterse** al límite del 40%
- Solo aplica si se reportan ingresos en R32 o R43 (rentas de trabajo)

**Límite conjunto** — rentas exentas + deducciones (R41) no puede superar:
- 40% de la renta líquida de cada subcédula
- La suma de los cuatro límites de las cuatro subcédulas no puede exceder **1.340 UVT** ($63.067.000)

> ⚠️ **Diferencia con nuestra implementación**: el asistente usa un único límite conjunto de 5.040 UVT (referencia anterior al Formulario 210) en lugar de 1.340 UVT distribuidos entre las 4 subcédulas. Para el caso común de asalariado con un solo empleo, el resultado es equivalente. Para casos con múltiples subcédulas, Muisca calcula el límite distribuido automáticamente.

---

## Estructura real del Formulario 210 (referencia completa)

La cédula general se divide en **4 subcédulas** — importante para Muisca:

### Subcédula 1 — Rentas de trabajo laborales (R32–R42)
Para empleados asalariados. Incluye salarios, cesantías, otros pagos laborales.
- R32: Ingresos brutos laborales
- R33: INCRNGO (aportes obligatorios salud + pensión, art. 55 y 56 ET)
- R34: Renta líquida (R32 − R33)
- R35: Renta exenta aportes AFC/FPV
- R36: Rentas exentas — otras (cesantías, numerales 1-9 art. 206 ET)
- R37: Total rentas exentas (R35 + R36)
- R38: Deducción intereses hipotecarios
- R39: Otras deducciones (dependientes, medicina prepagada, ICETEX, GMF)
- R40: Total deducciones (R38 + R39)
- R41: Rentas exentas + deducciones limitadas (40% de R34, con límite)
- R42: Renta líquida de trabajo (R34 − R41)

> **25% laboral (numeral 10 art. 206 ET)**: exenta el 25% de los pagos netos, **con límite de 790 UVT = $37.181.000** anuales (Ley 2277 de 2022, art. 2). Nuestro asistente usa 2.880 UVT que era el límite anterior — pendiente de corrección.

### Subcédula 2 — Rentas de trabajo con costos y gastos (R43–R57)
Para independientes (honorarios, comisiones, servicios) que **sí asocian costos y gastos** a sus ingresos.
- R43: Ingresos brutos honorarios/servicios
- R44: INCRNGO
- R45: Costos y deducciones procedentes
- R46: Renta líquida
- R47–R53: Rentas exentas y deducciones limitadas
- R54: Renta líquida ordinaria con costos
- > ⚠️ Casilla 140: si costos/gastos (R45) superan el 60% de R43, se debe marcar

### Subcédula 3 — Rentas de capital (R58–R73)
Intereses, rendimientos financieros, arrendamientos.
- R58: Ingresos brutos de capital
- R59: INCRNGO
- R60: Costos y gastos
- R61: Renta líquida
- R62: Rentas líquidas pasivas ECE
- R63–R69: Rentas exentas y deducciones limitadas
- R70: Renta líquida ordinaria de capital

### Subcédula 4 — Rentas no laborales (R74–R90)
Ingresos que no califican en las subcédulas anteriores (otros ingresos, actividades esporádicas).
- R74: Ingresos brutos no laborales
- R75: Devoluciones, rebajas y descuentos
- R76: Ingresos no gravados
- R77: Costos y gastos
- R78: Renta líquida (R74 − R75 − R76 − R77)
- R80–R86: Rentas exentas y deducciones limitadas
- R87: Renta líquida ordinaria no laboral

> **Del proceso real**: en el caso trabajado por la contadora, los ingresos (R74 = $15.600.000) se clasificaron aquí como "Otros ingresos" — sin retenciones ni costos asociados.

### Consolidación cédula general
- R91: Suma de R42 + R57 + R70 + R87 + R90 (renta líquida antes de límites)
- R92: Rentas exentas y deducciones limitadas totales (R28 + R41 + R53 + R69 + R86 + R139)
  - R28 también va al R92: 1% de compras con factura electrónica, máx. 240 UVT ($11.296.000)
- R93: Renta líquida cédula general (R91 − R92)
- R97: Renta líquida gravable

### Cédula de pensiones (R99–R103)
- R99: Ingresos por pensiones (vejez, sobrevivientes, invalidez)
- R100: INCRNGO (aportes obligatorios salud + fondo solidaridad)
- R101: Renta líquida
- R102: Rentas exentas (pensiones hasta 1.000 UVT/mes son exentas)
- R103: Renta líquida gravable pensiones

### Cédula de dividendos (R104–R115)
- R104/R106: Dividendos años 2017+
- R107: Dividendos año 2016
- R108: Dividendos gravados (2a subcédula)
- R109: Dividendos del exterior
- R111: Renta gravable consolidada
- R115: Ganancias ocasionales gravables

### Liquidación privada (R116–R141)
- R116: Impuesto sobre cédula general + pensiones + dividendos
- R121: Total impuesto sobre rentas
- R125: Total descuentos tributarios (impuesto pagado en exterior, donaciones)
- R126: Impuesto neto de renta (R121 − R125)
- R127: Impuesto de ganancias ocasionales
- R129: **Total impuesto a cargo** (R126 + R127 − R128)
- R130: Anticipo año anterior
- R131: Saldo a favor año anterior sin solicitar devolución
- R132: Retenciones y autorretenciones practicadas
- R133: Anticipo para el año siguiente
- R134: **Saldo a pagar** (si R129 + R133 − R130 − R131 − R132 > 0)
- R136: Total saldo a pagar (incluye sanciones R135)
- R137: **Saldo a favor** (si R130 + R131 + R132 > R129 + R133 + R135)

---

## Motor de cálculo (implementación actual)

Archivo: `src/views/Accounting/DeclaracionRenta.js` → `useCalc(d)` (hook con `useMemo`)

### Constantes

```
UVT 2024 = $47.065
```

### Flujo de cálculo — Cédula de trabajo

```
Ingresos de trabajo = Salario bruto + Honorarios + Pensiones

Aportes obligatorios (INCRNGO) = Salario bruto × 8%
  (aportes a salud + pensión obligatoria que descuenta el empleador)

INCRNGO total = Aportes obligatorios + Intereses de cesantías

Renta líquida de trabajo = Ingresos de trabajo − INCRNGO

Renta exenta 25% = min(Renta líquida × 25%, 2.880 UVT)
  ⚠️ PENDIENTE: ajustar a 790 UVT según Ley 2277/2022 y hoja de trabajo contadora

Deducciones efectivas:
  - Intereses hipotecario: min(valor, 1.200 UVT)
  - Dependientes:          min(valor, min(Renta líq. × 10%, 384 UVT))
  - Medicina prepagada:    min(valor, 192 UVT)
  - AFC + FPV:             min(valor, min(Ingresos trabajo × 30%, 3.800 UVT))

Límite conjunto = min(Renta líquida × 40%, 5.040 UVT)
  ⚠️ PENDIENTE: el límite real distribuido entre subcédulas es 1.340 UVT total

Rentas exentas + Deducciones efectivas = min(Renta exenta 25% + Total deducciones, Límite conjunto)

Renta gravable de trabajo = max(0, Renta líquida − (Rentas exentas + Ded. efectivas))
```

### Cédula de capital (incluye no laborales en nuestra impl.)

```
Ingresos de capital = Rendimientos financieros + Arrendamientos
Renta gravable capital = max(0, Ingresos de capital)
```

### Dividendos

```
Exceso sobre 300 UVT = max(0, Dividendos − 300 × UVT)
Impuesto dividendos = Exceso × 15%
```

### Impuesto total y saldo

```
Total renta gravable = Renta gravable trabajo + Renta gravable capital

Impuesto sobre renta gravable (tarifa marginal 2024 — art. 241 ET):
  ≤ 1.090 UVT                        → 0%
  1.091 – 1.700 UVT                  → 19% sobre el exceso de 1.090
  1.701 – 4.100 UVT                  → 28% sobre exceso de 1.700 + 116 UVT
  4.101 – 8.670 UVT                  → 33% sobre exceso de 4.100 + 788 UVT
  8.671 – 18.970 UVT                 → 35% sobre exceso de 8.670 + 2.296 UVT
  18.971 – 31.000 UVT                → 37% sobre exceso de 18.970 + 5.901 UVT
  > 31.000 UVT                       → 39% sobre exceso de 31.000 + 10.352 UVT

Impuesto total = Impuesto sobre renta + Impuesto sobre dividendos

Retenciones practicadas = Retención empleador + Retención honorarios

Saldo = Impuesto total − Retenciones
  > 0 → A PAGAR
  < 0 → A FAVOR
```

---

## Mapa de renglones — Formulario 210

| Renglón | Nombre oficial DIAN | Corresponde a en nuestra app |
|---|---|---|
| R28 | 1% compras con factura electrónica | No implementado |
| R29 | Patrimonio bruto | Activos: cuentas, CDT, inmuebles, vehículos, muebles |
| R30 | Deudas | Hipotecaria + otras deudas |
| R31 | Patrimonio líquido | R29 − R30 |
| R32 | Ingresos brutos de trabajo laborales | Salario bruto |
| R33 | INCRNGO laboral | Aportes obligatorios + cesantías |
| R35 | Renta exenta AFC/FPV | Campo aportes AFC + FPV |
| R36 | Rentas exentas otras | Intereses cesantías |
| R38 | Deducción intereses hipotecarios | Campo intereses hipotecario |
| R39 | Otras deducciones | Dependientes + medicina prepagada |
| R41 | Rentas exentas + ded. limitadas | Límite conjunto calculado |
| R42 | Renta líquida de trabajo | Renta gravable trabajo |
| R58 | Ingresos brutos de capital | Rendimientos + arrendamientos |
| R74 | Ingresos brutos no laborales | No separado (agrupado en capital) |
| R91 | Renta líquida cédula general | Total renta gravable |
| R97 | Renta líquida gravable | Base para tarifas progresivas |
| R99 | Ingresos pensiones | Campo pensiones |
| R104 | Dividendos 2017+ | Campo dividendos |
| R116 | Impuesto cédula general | calcTax() |
| R121 | Total impuesto sobre rentas | Impuesto calculado |
| R129 | Total impuesto a cargo | Resultado final |
| R131 | Saldo a favor año anterior | No implementado |
| R132 | Retenciones practicadas | Retención empleador + honorarios |
| R134 | Saldo a pagar | balance > 0 |
| R137 | Saldo a favor | balance < 0 |

---

## Diferencias entre la implementación y el proceso real

| Aspecto | Nuestra app | Formulario real / hoja contadora |
|---|---|---|
| Renta exenta 25% (R36) | Límite 2.880 UVT | **Límite 790 UVT** (Ley 2277/2022) |
| Subcédulas cédula general | 1 sola (trabajo + capital) | 4 subcédulas separadas |
| Rentas no laborales | Agrupadas en "capital" | Subcédula independiente R74–R90 |
| Deducción dependientes R139 | No implementada | 72 UVT × hasta 4 = 288 UVT, sin límite 40% |
| 1% factura electrónica (R28) | No implementado | Hasta 240 UVT, va al R92 sin límite |
| Saldo a favor año anterior (R131) | No implementado | Se resta del impuesto final |
| Anticipo renta siguiente año (R133) | No implementado | Se suma al saldo a pagar |
| Límite conjunto rentas exentas | 5.040 UVT | 1.340 UVT total distribuido en subcédulas |

Estos puntos **no son bugs críticos** para el caso del asalariado simple: la diferencia material es el límite de la exenta del 25% (2.880 vs 790 UVT). Para declaraciones complejas o montos altos, los valores en Muisca serán distintos a los que muestra la app.

---

## Guía para ingresar en muisca.dian.gov.co

1. Ingresa a **muisca.dian.gov.co** con tu usuario y contraseña DIAN.
2. Ve a **Servicios → Diligenciar, presentar y pagar → Declaraciones tributarias**.
3. Selecciona **"Formulario 210 — Impuesto sobre la renta personas naturales"** → año gravable 2024.
4. En la sección **Patrimonio**, ingresa los valores de R29, R30 (Muisca calcula R31).
5. En **Cédula General**, elige la subcédula correcta para cada ingreso:
   - Asalariado → subcédula rentas de trabajo (R32)
   - Independiente sin costos → R32 sub no laboral
   - Independiente con costos → R43
   - Rendimientos, arrendamientos → R58
   - Otros ingresos → R74
6. En **INCRNGO**, confirma que el sistema auto-calcula R33.
7. En **Rentas exentas y deducciones**, registra R35, R36, R38, R39. Muisca aplica automáticamente el límite del 40% distribuido en las subcédulas.
8. El formulario calculará automáticamente **R91, R92, R93, R97**.
9. En la **cédula de pensiones**, registra R99 si aplica.
10. En **Liquidación privada**, R132 se llena con retenciones. Muisca calcula R129, R134 y R137.
11. Si hay **saldo a pagar (R134)**, paga con el formulario 490 antes de enviar para evitar intereses de mora.
12. Si hay **saldo a favor (R137)**, presenta la declaración y luego solicita devolución o compensación.

> Guarda el número de radicación y el comprobante de pago como evidencia. Los documentos soporte se conservan 5 años.

---

## Ejemplo real — caso hoja de trabajo contadora

Tomado de la hoja de trabajo de referencia (año gravable 2024):

| Concepto | Valor |
|---|---|
| Patrimonio bruto (R29) | $249.461.000 |
| — Bienes raíces | $214.450.000 |
| — Muebles y enseres | $30.000.000 |
| — Efectivo | $5.011.000 |
| Deudas (R30) | $3.826.036 |
| Patrimonio líquido (R31) | $245.634.964 |
| Ingresos laborales (R32) | $0 |
| Rentas no laborales / otros ingresos (R74) | $15.600.000 |
| 1% compras factura electrónica (R28) | $51.000 |
| Renta líquida cédula general (R91) | $15.600.000 |
| Rentas exentas + ded. R92 | $51.000 |
| Renta líquida gravable (R97) | $15.549.000 |
| Impuesto a cargo (R129) | $0 |
| Saldo a favor año anterior (R131) | $18.000 |
| Retenciones (R132) | $0 |
| **Saldo a favor (R137)** | **$18.000** |

> En este caso la renta gravable ($15.549.000 ≈ 330 UVT) queda por debajo del umbral de 1.090 UVT, por lo que el impuesto es $0. El saldo a favor corresponde al saldo del año anterior no cobrado.

---

## Limitaciones y aviso legal

- Esta herramienta es un **asistente de cálculo educativo**, no reemplaza la asesoría de un contador público.
- Los cálculos se basan en las reglas del **Estatuto Tributario colombiano** vigentes para el año gravable 2024 (UVT $47.065, Decreto 2609 de 2023).
- El límite de la renta exenta del 25% en la app ($2.880 UVT) es mayor al real ($790 UVT, Ley 2277/2022). Para ingresos altos esto sobreestima el beneficio.
- **No cubre**: régimen SIMPLE de tributación, personas jurídicas, IMAS, rentas de pensiones en el exterior, activos en el exterior (formulario reporte activos/pasivos).
- Las rentas de pensiones de jubilación tienen tratamiento especial (hasta 1.000 UVT exentas por mes).
- Para situaciones complejas (independientes con costos, arrendadores, herencias, loterías, ganancias ocasionales) consulta un contador.

---

## Arquitectura del componente

```
DeclaracionRenta.js
├── Constants         UVT, YEAR, STEPS, OBLIGATION_ITEMS, DOCS, EMPTY
├── Helpers           cop(), uvtFmt(), calcTax()
├── useCalc(d)        Custom hook — motor de cálculo (useMemo)
├── CurrencyField     Input COP con formato, casilla, UVT y texto de ayuda
├── StepInicio        Paso 1: obligación + checklist documentos
├── StepIngresos      Paso 2: cédulas trabajo, capital, dividendos
├── StepPatrimonio    Paso 3: activos y deudas
├── StepDeducciones   Paso 4: intereses, dependientes, medicina, AFC/FPV
├── StepResultado     Paso 5: banner saldo, tabla casillas, guía DIAN, desglose
├── SummaryPanel      Panel lateral sticky con impuesto en tiempo real
└── DeclaracionRenta  Componente raíz — estado global, wizard, layout
```

```
DeclaracionRenta.scss — prefijo BEM: .dr-
├── .dr-wizard        Layout principal (sidebar + contenido)
├── .dr-step-nav      Barra de pasos numerados
├── .dr-field         Campo COP con label, casilla, UVT
├── .dr-section       Sección con título
├── .dr-info-box      Caja de información (azul, verde, amarillo)
├── .dr-summary       Panel lateral con totales
├── .dr-doclist       Lista de documentos con check
├── .dr-table         Tabla de casillas del formulario 210
├── .dr-result-banner Banner resultado (verde/rojo)
├── .dr-breakdown     Desglose de cálculo paso a paso
└── .dr-steps-guide   Guía numerada para muisca.dian.gov.co
```

---

## Referencias normativas

- **ET Art. 206 num. 10** — Renta exenta 25% laboral (límite 790 UVT, Ley 2277/2022 art. 2)
- **ET Art. 241** — Tarifas de renta para personas naturales (tabla progresiva)
- **ET Art. 336** — Cédula general, límite conjunto rentas exentas y deducciones
- **ET Art. 337** — Cédula de pensiones
- **ET Art. 242** — Tarifa dividendos (15% sobre exceso de 300 UVT)
- **ET Art. 387** — Deducción por dependientes (10% renta laboral, máx. 32 UVT/mes)
- **Ley 2277 de 2022, art. 2** — Reduce exenta 25% de 2.880 a 790 UVT
- **Decreto 2609 de 2023** — Fija el UVT para 2024 en $47.065
- **Resolución DIAN 000162 / 2023** — Versión oficial Formulario 210 año gravable 2024
- **DUT 1625 de 2016, art. 1.2.1.20.4** — Límite distribuido entre subcédulas (modificado con Decreto 2231 de 2023)
