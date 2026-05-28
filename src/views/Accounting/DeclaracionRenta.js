import React, { useState, useMemo } from 'react'
import './DeclaracionRenta.scss'

// ─── Constants ────────────────────────────────────────────────────────────────

const UVT = 49799 // Valor UVT año gravable 2025 — Decreto 2311 de diciembre 2024
const YEAR = 2025

const STEPS = ['¿Debo declarar?', 'Ingresos', 'Patrimonio', 'Deducciones', 'Resultado']

const OBLIGATION_ITEMS = [
  { id: 'a', text: 'Patrimonio bruto > 4.500 UVT ($224.095.500)' },
  { id: 'b', text: 'Ingresos brutos > 1.400 UVT ($69.718.600)' },
  { id: 'c', text: 'Consumos con tarjeta de crédito > 1.400 UVT ($69.718.600)' },
  { id: 'd', text: 'Total compras y consumos > 1.400 UVT ($69.718.600)' },
  { id: 'e', text: 'Consignaciones bancarias > 1.400 UVT ($69.718.600)' },
  { id: 'f', text: 'Trabajador independiente al que le practicaron retención en la fuente' },
  { id: 'g', text: 'Responsable del régimen común (IVA)' },
  { id: 'h', text: 'Tuviste activos, inversiones o cuentas en el exterior' },
]

const DOCS = [
  { id: 'd1', text: 'Certificado de ingresos y retenciones — Formulario 220', from: 'Tu empleador (RR.HH.)' },
  { id: 'd2', text: 'Extractos bancarios — saldo al 31 de diciembre', from: 'Tu banco' },
  { id: 'd3', text: 'Certificado de rendimientos financieros y retenciones del año', from: 'Banco / entidad financiera' },
  { id: 'd4', text: 'Certificado de aportes a pensión voluntaria y/o AFC', from: 'Fondo de pensiones / banco' },
  { id: 'd5', text: 'Certificado de intereses pagados — crédito hipotecario de vivienda', from: 'Banco hipotecario' },
  { id: 'd6', text: 'Certificado de pagos de medicina prepagada o seguro de salud', from: 'Entidad de salud prepagada' },
  { id: 'd7', text: 'Avalúo catastral de inmuebles (IGAC) o escritura de compra', from: 'Catastro / notaría' },
  { id: 'd8', text: 'Tabla de precios vehículo — Ministerio de Transporte', from: 'mintransporte.gov.co' },
  { id: 'd9', text: 'Certificados de inversiones en fondos o acciones (saldo al 31-dic)', from: 'Comisionista / fondo' },
]

const EMPTY = {
  salarioBruto: 0,
  retencionEmpleador: 0,
  honorarios: 0,
  retencionHonorarios: 0,
  pensiones: 0,
  cesantias: 0,
  rendimientosFinancieros: 0,
  arrendamientos: 0,
  dividendos: 0,
  cuentasBancarias: 0,
  cdtInversiones: 0,
  bienesInmuebles: 0,
  vehiculos: 0,
  otrosActivos: 0,
  deudasHipotecarias: 0,
  otrasDeudas: 0,
  interesesHipotecario: 0,
  dependientes: 0,
  medicinaPrepagada: 0,
  aportesAFC: 0,
  aportesFPV: 0,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cop = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n || 0)

const uvtFmt = (n) => `${((n || 0) / UVT).toFixed(1)} UVT`

const calcTax = (baseUVT) => {
  if (baseUVT <= 0) return 0
  if (baseUVT <= 1090) return 0
  if (baseUVT <= 1700) return (baseUVT - 1090) * 0.19 * UVT
  if (baseUVT <= 4100) return ((baseUVT - 1700) * 0.28 + 116) * UVT
  if (baseUVT <= 8670) return ((baseUVT - 4100) * 0.33 + 788) * UVT
  if (baseUVT <= 18970) return ((baseUVT - 8670) * 0.35 + 2296) * UVT
  if (baseUVT <= 31000) return ((baseUVT - 18970) * 0.37 + 5901) * UVT
  return ((baseUVT - 31000) * 0.39 + 10352) * UVT
}

// ─── Calculation engine ───────────────────────────────────────────────────────

const useCalc = (d) =>
  useMemo(() => {
    const ingTrabajo = d.salarioBruto + d.honorarios + d.pensiones

    // Aportes obligatorios salud + pensión = 8% del salario (INCRNGO)
    const aportesObligatorios = d.salarioBruto * 0.08
    const incrngo = aportesObligatorios + d.cesantias

    const rentaLiqTrabajo = Math.max(0, ingTrabajo - incrngo)

    // Renta exenta 25% laboral — máximo 2.880 UVT
    const rentaExenta25 = Math.min(rentaLiqTrabajo * 0.25, 2880 * UVT)

    // Deducciones con sus límites individuales
    const dedIntereses = Math.min(d.interesesHipotecario, 1200 * UVT)
    const dedDependientes = Math.min(d.dependientes, Math.min(rentaLiqTrabajo * 0.1, 384 * UVT))
    const dedMedicina = Math.min(d.medicinaPrepagada, 192 * UVT)
    const dedAFCFPV = Math.min(d.aportesAFC + d.aportesFPV, Math.min(ingTrabajo * 0.3, 3800 * UVT))
    const totalDed = dedIntereses + dedDependientes + dedMedicina + dedAFCFPV

    // Límite conjunto: rentas exentas + deducciones ≤ 40% de renta líquida y ≤ 5.040 UVT
    const limiteConjunto = Math.min(rentaLiqTrabajo * 0.4, 5040 * UVT)
    const exentasDedEfectivas = Math.min(rentaExenta25 + totalDed, limiteConjunto)
    const limiteCortado = exentasDedEfectivas < rentaExenta25 + totalDed

    const rentaGravTrabajo = Math.max(0, rentaLiqTrabajo - exentasDedEfectivas)

    // Cédula capital
    const ingCapital = d.rendimientosFinancieros + d.arrendamientos
    const rentaGravCapital = Math.max(0, ingCapital)

    // Dividendos: primeras 300 UVT exentas, exceso al 15%
    const divExceso = Math.max(0, d.dividendos - 300 * UVT)
    const impuestoDividendos = divExceso * 0.15

    // Total renta gravable (cédula general)
    const totalRentaGrav = rentaGravTrabajo + rentaGravCapital

    // Impuesto total
    const impuesto = calcTax(totalRentaGrav / UVT) + impuestoDividendos

    // Retenciones
    const retenciones = d.retencionEmpleador + d.retencionHonorarios

    // Resultado
    const balance = impuesto - retenciones

    // Patrimonio
    const patrimonioBruto =
      d.cuentasBancarias + d.cdtInversiones + d.bienesInmuebles + d.vehiculos + d.otrosActivos
    const totalDeudas = d.deudasHipotecarias + d.otrasDeudas
    const patrimonioLiquido = Math.max(0, patrimonioBruto - totalDeudas)

    return {
      ingTrabajo, aportesObligatorios, incrngo,
      rentaLiqTrabajo, rentaExenta25,
      dedIntereses, dedDependientes, dedMedicina, dedAFCFPV, totalDed,
      limiteConjunto, exentasDedEfectivas, limiteCortado,
      rentaGravTrabajo, ingCapital, rentaGravCapital,
      impuestoDividendos, totalRentaGrav,
      impuesto, retenciones, balance,
      patrimonioBruto, totalDeudas, patrimonioLiquido,
    }
  }, [d])

// ─── CurrencyField ────────────────────────────────────────────────────────────

const CurrencyField = ({ label, source, help, casilla, value, onChange }) => {
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState('')

  const display = editing ? raw : value ? new Intl.NumberFormat('es-CO').format(value) : ''

  return (
    <div className="dr-field">
      <div className="dr-field__header">
        <label className="dr-field__label">{label}</label>
        {casilla && <span className="dr-field__casilla">Casilla {casilla}</span>}
      </div>
      {source && <p className="dr-field__source">📋 {source}</p>}
      <div className="dr-field__wrap">
        <span className="dr-field__sym">$</span>
        <input
          className="dr-field__input"
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={display}
          onFocus={() => {
            setEditing(true)
            setRaw(value ? String(value) : '')
          }}
          onChange={(e) => {
            const n = e.target.value.replace(/\D/g, '')
            setRaw(n)
            onChange(Number(n) || 0)
          }}
          onBlur={() => setEditing(false)}
        />
      </div>
      <div className="dr-field__footer">
        {value > 0 && <span className="dr-field__uvt">{uvtFmt(value)}</span>}
        {help && <span className="dr-field__help">ℹ️ {help}</span>}
      </div>
    </div>
  )
}

// ─── Step 1 — Obligación y documentos ────────────────────────────────────────

const StepInicio = ({ docs, setDocs }) => (
  <div className="dr-step-content">
    <div className="dr-info-box dr-info-box--blue">
      <strong>Declaración de Renta {YEAR} — Persona Natural</strong>
      <p>
        Esta herramienta te guía para calcular tu impuesto de renta y saber exactamente qué
        ingresar en el Formulario 210 de la DIAN. Los datos que ingreses son locales — no se
        envían a ningún servidor.
      </p>
    </div>

    <div className="dr-section">
      <h3 className="dr-section__title">¿Estás obligado a declarar?</h3>
      <p className="dr-section__sub">
        Debes declarar si en el año {YEAR} cumpliste <strong>al menos una</strong> de estas
        condiciones:
      </p>
      <div className="dr-checklist">
        {OBLIGATION_ITEMS.map((item) => (
          <div key={item.id} className="dr-checklist__item">
            <span className="dr-checklist__bullet">▸</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
      <div className="dr-info-box dr-info-box--yellow" style={{ marginTop: 12 }}>
        Si eres empleado asalariado y tu único ingreso es el salario, probablemente ya tu empresa
        realizó retenciones. Igual debes declarar si superas los topes o si quieres recuperar
        retenciones en exceso.
      </div>
    </div>

    <div className="dr-section">
      <h3 className="dr-section__title">Documentos que necesitas recopilar</h3>
      <p className="dr-section__sub">
        Marca cada documento cuando lo tengas. No los adjuntas en la DIAN, pero debes conservarlos
        5 años.
      </p>
      <div className="dr-doclist">
        {DOCS.map((doc) => (
          <div
            key={doc.id}
            className={`dr-doclist__item${docs.has(doc.id) ? ' dr-doclist__item--done' : ''}`}
            onClick={() => {
              const next = new Set(docs)
              next.has(doc.id) ? next.delete(doc.id) : next.add(doc.id)
              setDocs(next)
            }}
          >
            <span className="dr-doclist__check">{docs.has(doc.id) ? '✅' : '⬜'}</span>
            <div className="dr-doclist__info">
              <span className="dr-doclist__text">{doc.text}</span>
              <span className="dr-doclist__from">Lo emite: {doc.from}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="dr-doclist__progress">
        {docs.size} de {DOCS.length} documentos listos
      </p>
    </div>
  </div>
)

// ─── Step 2 — Ingresos ────────────────────────────────────────────────────────

const StepIngresos = ({ d, set }) => (
  <div className="dr-step-content">
    <div className="dr-info-box dr-info-box--green">
      Registra todos los ingresos del año {YEAR}. Los valores los encuentras en el{' '}
      <strong>Certificado de ingresos (Formulario 220)</strong> de tu empleador y en los
      certificados de tu banco o fondos.
    </div>

    <div className="dr-section">
      <h3 className="dr-section__title">💼 Cédula de trabajo</h3>
      <p className="dr-section__sub">Salario, honorarios y pensiones</p>

      <CurrencyField
        label="Salario bruto del año (sin descuentos)"
        source="Form 220 de tu empleador — suma de casillas de ingresos laborales del año"
        casilla="40"
        value={d.salarioBruto}
        onChange={(v) => set('salarioBruto', v)}
        help="Total salario antes de cualquier descuento. No incluyas aportes a salud ni pensión."
      />
      <CurrencyField
        label="Retención en la fuente practicada por el empleador"
        source="Form 220 — casilla de retenciones practicadas"
        casilla="78"
        value={d.retencionEmpleador}
        onChange={(v) => set('retencionEmpleador', v)}
        help="Lo que tu empresa descontó mensualmente como anticipo del impuesto de renta."
      />
      <CurrencyField
        label="Honorarios / servicios como independiente"
        source="Suma de facturas o contratos de prestación de servicios del año"
        casilla="40"
        value={d.honorarios}
        onChange={(v) => set('honorarios', v)}
        help="Si eres freelance o tienes contratos de servicios adicionales al empleo."
      />
      <CurrencyField
        label="Retenciones sobre honorarios (practicadas por clientes)"
        source="Certificados de retención entregados por cada cliente"
        casilla="78"
        value={d.retencionHonorarios}
        onChange={(v) => set('retencionHonorarios', v)}
        help="Suma de todas las retenciones que te practicaron tus clientes o contratantes."
      />
      <CurrencyField
        label="Ingresos por pensión de jubilación / invalidez"
        source="Certificado del fondo de pensiones o Colpensiones"
        casilla="40"
        value={d.pensiones}
        onChange={(v) => set('pensiones', v)}
        help="Las primeras 1.000 UVT/mes de pensión están exentas. Ingresa el total recibido."
      />
      <CurrencyField
        label="Cesantías reconocidas directamente por el empleador"
        source="Carta de liquidación o certificado del empleador"
        casilla="41"
        value={d.cesantias}
        onChange={(v) => set('cesantias', v)}
        help="Solo las cesantías pagadas directamente (no las consignadas al fondo). Son ingreso no constitutivo de renta."
      />
    </div>

    <div className="dr-section">
      <h3 className="dr-section__title">🏦 Cédula de capital</h3>
      <p className="dr-section__sub">Inversiones y arrendamientos</p>

      <CurrencyField
        label="Rendimientos financieros (CDT, cuentas de ahorro, fondos)"
        source="Certificado de rendimientos del banco o fondo de inversión"
        casilla="47"
        value={d.rendimientosFinancieros}
        onChange={(v) => set('rendimientosFinancieros', v)}
        help="Intereses y rendimientos generados durante el año en cuentas, CDT y fondos."
      />
      <CurrencyField
        label="Ingresos por arrendamiento (inmuebles o vehículos)"
        source="Contratos de arrendamiento — total recibido en el año"
        casilla="47"
        value={d.arrendamientos}
        onChange={(v) => set('arrendamientos', v)}
        help="Total de cánones de arrendamiento recibidos durante el año."
      />
    </div>

    <div className="dr-section">
      <h3 className="dr-section__title">📈 Dividendos</h3>

      <CurrencyField
        label="Dividendos recibidos (acciones, fondos de capital privado)"
        source="Certificado de dividendos de la sociedad o fondo"
        casilla="56"
        value={d.dividendos}
        onChange={(v) => set('dividendos', v)}
        help={`Las primeras 300 UVT ($${(300 * UVT).toLocaleString('es-CO')}) están exentas. El exceso tributa al 15%.`}
      />
    </div>
  </div>
)

// ─── Step 3 — Patrimonio ──────────────────────────────────────────────────────

const StepPatrimonio = ({ d, set }) => (
  <div className="dr-step-content">
    <div className="dr-info-box dr-info-box--purple">
      Declara el valor de tus bienes y deudas al <strong>31 de diciembre de {YEAR}</strong>. Para
      inmuebles usa el avalúo catastral; para vehículos la tabla del Ministerio de Transporte.
    </div>

    <div className="dr-section">
      <h3 className="dr-section__title">🏘️ Activos — Patrimonio bruto</h3>

      <CurrencyField
        label="Cuentas corrientes y de ahorro"
        source="Extracto bancario al 31 de diciembre — saldo final de cada cuenta"
        casilla="35"
        value={d.cuentasBancarias}
        onChange={(v) => set('cuentasBancarias', v)}
        help="Suma de los saldos de todas tus cuentas bancarias a fin de año."
      />
      <CurrencyField
        label="CDT, fondos de inversión y acciones"
        source="Certificado de inversiones al 31 de diciembre"
        casilla="35"
        value={d.cdtInversiones}
        onChange={(v) => set('cdtInversiones', v)}
        help="Valor de CDT, fondos, títulos y acciones al costo de adquisición (costo fiscal)."
      />
      <CurrencyField
        label="Bienes inmuebles (casas, apartamentos, lotes)"
        source="Paz y salvo predial / avalúo catastral del IGAC"
        casilla="35"
        value={d.bienesInmuebles}
        onChange={(v) => set('bienesInmuebles', v)}
        help="Usa el mayor valor entre el avalúo catastral y el costo fiscal (precio de compra + mejoras)."
      />
      <CurrencyField
        label="Vehículos"
        source="Tabla de precios del Ministerio de Transporte — mintransporte.gov.co"
        casilla="35"
        value={d.vehiculos}
        onChange={(v) => set('vehiculos', v)}
        help="Busca el precio comercial de tu vehículo en la tabla oficial publicada cada año."
      />
      <CurrencyField
        label="Otros activos (joyas, maquinaria, derechos, cartera)"
        source="Costo de adquisición o valor comercial razonable"
        casilla="35"
        value={d.otrosActivos}
        onChange={(v) => set('otrosActivos', v)}
        help="Cualquier otro bien de valor económico. Usa siempre el costo de adquisición."
      />
    </div>

    <div className="dr-section">
      <h3 className="dr-section__title">💳 Pasivos — Deudas</h3>

      <CurrencyField
        label="Crédito hipotecario de vivienda (saldo a capital)"
        source="Extracto del banco al 31 de diciembre — saldo de capital pendiente"
        casilla="36"
        value={d.deudasHipotecarias}
        onChange={(v) => set('deudasHipotecarias', v)}
        help="Solo el capital pendiente, no incluyas los intereses futuros."
      />
      <CurrencyField
        label="Otras deudas (tarjetas, crédito vehículo, préstamos)"
        source="Extractos y estados de cuenta al 31 de diciembre"
        casilla="36"
        value={d.otrasDeudas}
        onChange={(v) => set('otrasDeudas', v)}
        help="Suma de saldos de tarjetas de crédito, créditos de libre inversión, préstamos personales."
      />
    </div>
  </div>
)

// ─── Step 4 — Deducciones ─────────────────────────────────────────────────────

const StepDeducciones = ({ d, set, calc }) => (
  <div className="dr-step-content">
    <div className="dr-info-box dr-info-box--orange">
      Las deducciones reducen tu base gravable. El total de deducciones + rentas exentas{' '}
      <strong>no puede superar el 40%</strong> de tu renta de trabajo ni{' '}
      <strong>5.040 UVT ({cop(5040 * UVT)})</strong> al año.
      {calc.limiteCortado && (
        <span className="dr-badge dr-badge--warn">
          {' '}⚠️ Tu límite del 40%/5.040 UVT está siendo aplicado
        </span>
      )}
    </div>

    <div className="dr-section">
      <h3 className="dr-section__title">🏠 Intereses crédito de vivienda</h3>
      <p className="dr-section__sub">Límite: 1.200 UVT ({cop(1200 * UVT)}) al año</p>
      <CurrencyField
        label="Intereses pagados en crédito hipotecario"
        source="Certificado anual del banco — total intereses pagados (no capital)"
        casilla="43"
        value={d.interesesHipotecario}
        onChange={(v) => set('interesesHipotecario', v)}
        help="Solo los intereses del crédito de TU vivienda propia. No aplica para créditos de inversión."
      />
      {d.interesesHipotecario > 1200 * UVT && (
        <p className="dr-note dr-note--warn">
          ⚠️ Valor ingresado supera el límite. Se aplicará {cop(1200 * UVT)}.
        </p>
      )}
    </div>

    <div className="dr-section">
      <h3 className="dr-section__title">👨‍👩‍👧 Dependientes</h3>
      <p className="dr-section__sub">
        Límite: 10% del ingreso de trabajo o 384 UVT ({cop(384 * UVT)}) al año
      </p>
      <CurrencyField
        label="Valor anual de la deducción por dependientes"
        source="No requiere certificado externo — debes tener registro civil o acta médica"
        casilla="43"
        value={d.dependientes}
        onChange={(v) => set('dependientes', v)}
        help="Aplica si tienes hijos menores de 18 años, hijos hasta 23 si estudian, cónyuge sin ingresos o padres/hermanos con dependencia económica. Puedes deducir hasta 32 UVT/mes."
      />
    </div>

    <div className="dr-section">
      <h3 className="dr-section__title">🏥 Medicina prepagada</h3>
      <p className="dr-section__sub">Límite: 16 UVT/mes = 192 UVT ({cop(192 * UVT)}) al año</p>
      <CurrencyField
        label="Pagos de medicina prepagada o seguro complementario de salud"
        source="Certificado anual de la entidad de medicina prepagada"
        casilla="43"
        value={d.medicinaPrepagada}
        onChange={(v) => set('medicinaPrepagada', v)}
        help="Cuotas de medicina prepagada para ti y tu familia. La entidad debe estar vigilada por la Supersalud."
      />
    </div>

    <div className="dr-section">
      <h3 className="dr-section__title">🏦 Cuentas AFC y Pensión Voluntaria (FPV)</h3>
      <p className="dr-section__sub">
        Límite conjunto: 30% del ingreso laboral o 3.800 UVT ({cop(3800 * UVT)}) al año
      </p>
      <CurrencyField
        label="Aportes a cuenta AFC (Ahorro para el Fomento a la Construcción)"
        source="Certificado de aportes AFC del banco"
        casilla="43"
        value={d.aportesAFC}
        onChange={(v) => set('aportesAFC', v)}
        help="Aportes a cuentas AFC para compra de vivienda. El dinero debe permanecer mínimo 10 años o usarse para comprar vivienda."
      />
      <CurrencyField
        label="Aportes voluntarios a fondo de pensiones (FPV)"
        source="Certificado del fondo de pensiones voluntarias"
        casilla="43"
        value={d.aportesFPV}
        onChange={(v) => set('aportesFPV', v)}
        help="Aportes adicionales al mínimo obligatorio de pensión. Deben permanecer hasta la pensión para mantener el beneficio."
      />
    </div>
  </div>
)

// ─── Summary panel ────────────────────────────────────────────────────────────

const SummaryPanel = ({ c }) => {
  const hasData = c.ingTrabajo > 0 || c.ingCapital > 0

  return (
    <div className="dr-summary">
      <div className="dr-summary__title">Cálculo en tiempo real</div>

      {!hasData ? (
        <p className="dr-summary__empty">Ingresa tus datos para ver el cálculo.</p>
      ) : (
        <>
          <div className="dr-summary__block">
            <div className="dr-summary__row">
              <span>Ingresos trabajo</span>
              <span>{cop(c.ingTrabajo)}</span>
            </div>
            <div className="dr-summary__row dr-summary__row--sub">
              <span>- INCRNGO</span>
              <span>{cop(c.incrngo)}</span>
            </div>
            <div className="dr-summary__row dr-summary__row--sub">
              <span>- Exentas + deducciones</span>
              <span>{cop(c.exentasDedEfectivas)}</span>
            </div>
            <div className="dr-summary__row dr-summary__row--result">
              <span>Gravable trabajo</span>
              <span>{cop(c.rentaGravTrabajo)}</span>
            </div>
          </div>

          {c.ingCapital > 0 && (
            <div className="dr-summary__block">
              <div className="dr-summary__row dr-summary__row--result">
                <span>Gravable capital</span>
                <span>{cop(c.rentaGravCapital)}</span>
              </div>
            </div>
          )}

          <div className="dr-summary__block">
            <div className="dr-summary__row dr-summary__row--highlight">
              <span>Total renta gravable</span>
              <span>{cop(c.totalRentaGrav)}</span>
            </div>
            <div className="dr-summary__row dr-summary__row--sub">
              <span>{uvtFmt(c.totalRentaGrav)}</span>
            </div>
          </div>

          <div className="dr-summary__block">
            <div className="dr-summary__row">
              <span>Impuesto calculado</span>
              <span>{cop(c.impuesto)}</span>
            </div>
            <div className="dr-summary__row dr-summary__row--sub">
              <span>- Retenciones</span>
              <span>{cop(c.retenciones)}</span>
            </div>
          </div>

          <div
            className={`dr-summary__balance${c.balance > 0 ? ' dr-summary__balance--pagar' : c.balance < 0 ? ' dr-summary__balance--favor' : ''}`}
          >
            <div className="dr-summary__balance-label">
              {c.balance > 0 ? 'A PAGAR' : c.balance < 0 ? 'SALDO A FAVOR' : 'EN CERO'}
            </div>
            <div className="dr-summary__balance-amount">{cop(Math.abs(c.balance))}</div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Step 5 — Resultado ───────────────────────────────────────────────────────

const StepResultado = ({ d, c }) => {
  const { balance } = c

  const tableRows = [
    { section: 'PATRIMONIO' },
    { casilla: '35', label: 'Patrimonio bruto', value: c.patrimonioBruto },
    { casilla: '36', label: 'Deudas', value: c.totalDeudas },
    { casilla: '37', label: 'Patrimonio líquido (35 − 36)', value: c.patrimonioLiquido, bold: true },
    { section: 'CÉDULA TRABAJO' },
    { casilla: '40', label: 'Ingresos brutos trabajo', value: c.ingTrabajo },
    { casilla: '41', label: 'Ingresos no constitutivos (INCRNGO)', value: c.incrngo },
    { casilla: '43', label: 'Deducciones (intereses, dependientes, AFC, medicina)', value: c.totalDed },
    { casilla: '44', label: 'Rentas exentas 25% laboral', value: c.rentaExenta25 },
    { casilla: '45', label: 'Renta líquida cédula trabajo', value: c.rentaGravTrabajo, bold: true },
    ...(c.ingCapital > 0
      ? [
          { section: 'CÉDULA CAPITAL' },
          { casilla: '47', label: 'Ingresos brutos capital', value: c.ingCapital },
          { casilla: '50', label: 'Renta líquida cédula capital', value: c.rentaGravCapital, bold: true },
        ]
      : []),
    { section: 'LIQUIDACIÓN' },
    { casilla: '64', label: 'Renta líquida gravable total', value: c.totalRentaGrav, bold: true },
    { casilla: '65', label: 'Impuesto sobre la renta', value: c.impuesto },
    { casilla: '78', label: 'Retenciones en la fuente (a descontar)', value: c.retenciones },
    {
      casilla: balance > 0 ? '81' : '80',
      label: balance > 0 ? 'TOTAL A PAGAR' : 'SALDO A FAVOR',
      value: Math.abs(balance),
      bold: true,
      highlight: true,
    },
  ]

  return (
    <div className="dr-step-content">
      <div
        className={`dr-result-banner${balance > 0 ? ' dr-result-banner--pagar' : balance < 0 ? ' dr-result-banner--favor' : ''}`}
      >
        <div className="dr-result-banner__icon">
          {balance > 0 ? '💳' : balance < 0 ? '✅' : '⚖️'}
        </div>
        <div>
          <div className="dr-result-banner__label">
            {balance > 0 ? 'DEBES PAGAR' : balance < 0 ? 'SALDO A FAVOR' : 'SIN DIFERENCIA'}
          </div>
          <div className="dr-result-banner__amount">{cop(Math.abs(balance))}</div>
          <div className="dr-result-banner__note">
            {balance < 0 &&
              'La DIAN te devolverá este valor o puedes aplicarlo como anticipo del año siguiente.'}
            {balance > 0 &&
              'Paga antes de la fecha límite para evitar sanciones e intereses de mora.'}
            {balance === 0 && 'Las retenciones cubren exactamente el impuesto calculado.'}
          </div>
        </div>
      </div>

      <div className="dr-section">
        <h3 className="dr-section__title">📋 Valores que ingresar en el Formulario 210 (DIAN)</h3>
        <p className="dr-section__sub">
          Usa estos valores exactos en cada casilla del formulario electrónico en{' '}
          <strong>muisca.dian.gov.co</strong>
        </p>
        <div className="dr-table">
          <div className="dr-table__head">
            <span>Casilla</span>
            <span>Campo del formulario</span>
            <span>Valor a ingresar</span>
          </div>
          {tableRows.map((r, i) =>
            r.section ? (
              <div key={i} className="dr-table__section">
                {r.section}
              </div>
            ) : (
              <div
                key={i}
                className={[
                  'dr-table__row',
                  r.bold ? 'dr-table__row--bold' : '',
                  r.highlight ? 'dr-table__row--highlight' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="dr-table__casilla">{r.casilla}</span>
                <span className="dr-table__field">{r.label}</span>
                <span className="dr-table__value">{cop(r.value)}</span>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="dr-section">
        <h3 className="dr-section__title">🖥️ Pasos en la plataforma DIAN</h3>
        <ol className="dr-steps-guide">
          <li>
            Ingresa a <strong>muisca.dian.gov.co</strong> con tu usuario y contraseña (o crea una
            cuenta si es la primera vez).
          </li>
          <li>
            Ve a <strong>Diligenciar declaración → Impuesto de renta → Formulario 210</strong>.
          </li>
          <li>
            Selecciona el año gravable <strong>{YEAR}</strong> y verifica que tu NIT/cédula es
            correcto.
          </li>
          <li>
            Sección <strong>Patrimonio</strong>: ingresa casillas 35 (activos) y 36 (pasivos). La
            37 se calcula automáticamente.
          </li>
          <li>
            Sección <strong>Ingresos cédula trabajo</strong>: casillas 40, 41, 43, 44. La casilla
            45 (renta líquida) se calcula sola.
          </li>
          <li>
            Si tuviste capital: completa la <strong>cédula capital</strong> (casillas 47 a 50).
          </li>
          <li>
            Si recibiste dividendos: completa la <strong>cédula dividendos</strong> (casillas 56 a
            60).
          </li>
          <li>
            En <strong>Liquidación</strong>: verifica casilla 65 (impuesto) e ingresa retenciones
            en casilla 78.
          </li>
          <li>
            Revisa casilla <strong>80</strong> (saldo a favor) o <strong>81</strong> (a pagar).
          </li>
          <li>
            Haz clic en <strong>Firmar y presentar</strong>. Si hay saldo a pagar, el sistema te
            redirige al pago en línea o te genera el recibo para pagar en banco.
          </li>
        </ol>
      </div>

      <div className="dr-section">
        <h3 className="dr-section__title">📊 Desglose completo del cálculo</h3>
        <div className="dr-breakdown">
          {[
            { label: 'Ingresos brutos de trabajo', value: c.ingTrabajo },
            {
              label: '(−) Aportes oblig. salud + pensión (8% del salario)',
              value: c.aportesObligatorios,
              minus: true,
            },
            { label: '(−) Cesantías exentas', value: d.cesantias, minus: true },
            { label: '= Renta líquida de trabajo', value: c.rentaLiqTrabajo, result: true },
            {
              label: `(−) Renta exenta 25% laboral (máx. 2.880 UVT)`,
              value: c.rentaExenta25,
              minus: true,
            },
            { label: '(−) Total deducciones efectivas', value: c.totalDed, minus: true },
            c.limiteCortado && {
              label: `⚠️ Límite 40% aplicado — máximo efectivo`,
              value: c.exentasDedEfectivas,
              warn: true,
            },
            { label: '= Renta gravable trabajo', value: c.rentaGravTrabajo, result: true },
            c.ingCapital > 0 && {
              label: '(+) Renta gravable capital',
              value: c.rentaGravCapital,
            },
            { label: '= Total renta gravable', value: c.totalRentaGrav, highlight: true },
            { label: 'Impuesto calculado (tabla progresiva)', value: c.impuesto },
            { label: '(−) Retenciones en la fuente', value: c.retenciones, minus: true },
            {
              label: balance > 0 ? 'TOTAL A PAGAR' : balance < 0 ? 'SALDO A FAVOR' : 'EN CERO',
              value: Math.abs(balance),
              final: true,
              pagar: balance > 0,
              favor: balance < 0,
            },
          ]
            .filter(Boolean)
            .map((r, i) => (
              <div
                key={i}
                className={[
                  'dr-breakdown__row',
                  r.minus ? 'dr-breakdown__row--minus' : '',
                  r.result ? 'dr-breakdown__row--result' : '',
                  r.warn ? 'dr-breakdown__row--warn' : '',
                  r.highlight ? 'dr-breakdown__row--highlight' : '',
                  r.final ? 'dr-breakdown__row--final' : '',
                  r.pagar ? 'dr-breakdown__row--pagar' : '',
                  r.favor ? 'dr-breakdown__row--favor' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span>{r.label}</span>
                <span>{cop(r.value)}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="dr-section">
        <h3 className="dr-section__title">⚠️ Fechas límite {YEAR + 1}</h3>
        <div className="dr-info-box dr-info-box--yellow">
          La DIAN publica las fechas exactas en su resolución anual de plazos. Como referencia:
          <ul>
            <li>
              Personas naturales <strong>sin saldo a pagar</strong>: agosto de {YEAR + 1}
            </li>
            <li>
              Personas naturales <strong>con saldo a pagar</strong>: julio–agosto de {YEAR + 1}{' '}
              según los últimos dígitos de tu NIT
            </li>
          </ul>
          Verifica las fechas exactas en <strong>dian.gov.co → Servicios → Plazos para declarar</strong>.
        </div>
        <div className="dr-info-box dr-info-box--gray" style={{ marginTop: 10 }}>
          <strong>Aviso legal:</strong> Esta herramienta es una guía educativa. Los cálculos son
          una estimación basada en las reglas generales del Estatuto Tributario. Para situaciones
          complejas (ganancias ocasionales, activos en el exterior, etc.) consulta un contador
          certificado.
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const DeclaracionRenta = () => {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY)
  const [docs, setDocs] = useState(new Set())

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }))
  const calc = useCalc(form)

  const stepContent = [
    <StepInicio key="inicio" docs={docs} setDocs={setDocs} />,
    <StepIngresos key="ingresos" d={form} set={set} />,
    <StepPatrimonio key="patrimonio" d={form} set={set} />,
    <StepDeducciones key="deducciones" d={form} set={set} calc={calc} />,
    <StepResultado key="resultado" d={form} c={calc} />,
  ]

  return (
    <div className="dr-wizard">
      <div className="dr-wizard__header">
        <h2 className="dr-wizard__title">Declaración de Renta {YEAR} — Persona Natural</h2>
        <div className="dr-wizard__stepper">
          {STEPS.map((label, i) => (
            <button
              key={label}
              className={[
                'dr-wizard__step',
                i === step ? 'dr-wizard__step--active' : '',
                i < step ? 'dr-wizard__step--done' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setStep(i)}
            >
              <span className="dr-wizard__step-num">{i < step ? '✓' : i + 1}</span>
              <span className="dr-wizard__step-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dr-wizard__body">
        <div className="dr-wizard__main">
          {stepContent[step]}
          <div className="dr-wizard__nav">
            {step > 0 && (
              <button className="dr-nav-btn dr-nav-btn--back" onClick={() => setStep((s) => s - 1)}>
                ← Anterior
              </button>
            )}
            {step < STEPS.length - 1 && (
              <button className="dr-nav-btn dr-nav-btn--next" onClick={() => setStep((s) => s + 1)}>
                Siguiente →
              </button>
            )}
          </div>
        </div>
        <div className="dr-wizard__aside">
          <SummaryPanel c={calc} />
        </div>
      </div>
    </div>
  )
}

export default DeclaracionRenta
