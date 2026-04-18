import { generateHtmlToPdf } from '../contractPdf'

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function parseDate(str) {
  if (!str) return null
  const d = new Date(str + 'T12:00:00')
  return isNaN(d) ? null : d
}

function formatCOP(value) {
  const num = parseInt(String(value).replace(/\D/g, ''), 10)
  if (isNaN(num)) return ''
  return '$' + num.toLocaleString('es-CO')
}

function numToWords(n) {
  const num = parseInt(n, 10)
  if (isNaN(num) || num < 0) return ''
  if (num === 0) return 'cero'
  const units = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']
  const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
  const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
    'seiscientos', 'setecientos', 'ochocientos', 'novecientos']
  if (num === 100) return 'cien'
  if (num === 1000) return 'mil'
  if (num >= 1000000) {
    const m = Math.floor(num / 1000000)
    return (m === 1 ? 'un millón' : numToWords(m) + ' millones') + (num % 1000000 ? ' ' + numToWords(num % 1000000) : '')
  }
  if (num >= 1000) {
    const t = Math.floor(num / 1000)
    return (t === 1 ? 'mil' : numToWords(t) + ' mil') + (num % 1000 ? ' ' + numToWords(num % 1000) : '')
  }
  if (num >= 100) return hundreds[Math.floor(num / 100)] + (num % 100 ? ' ' + numToWords(num % 100) : '')
  if (num >= 20) { const t = Math.floor(num / 10); return tens[t] + (num % 10 ? ' y ' + units[num % 10] : '') }
  return units[num]
}

export function buildActaEntregaHtml(p) {
  const contract = p.contract || {}
  const property = p.property || {}
  const rental = p.rental || {}
  const tenant = p.tenant || {}
  const owner = p.owner || {}

  const contractDate = parseDate(contract.date)
  const startDate = parseDate(rental.start_date)

  const day = contractDate ? contractDate.getDate() : ''
  const month = contractDate ? MONTHS_ES[contractDate.getMonth()] : ''
  const year = contractDate ? contractDate.getFullYear() : ''

  const endDay = startDate ? startDate.getDate() : '[día]'
  const endMonthYear = startDate
    ? `${MONTHS_ES[startDate.getMonth()]} de ${startDate.getFullYear() + Math.floor((parseInt(rental.duration || 0)) / 12)}`
    : '[mes/año]'

  const tenantUpper = (tenant.full_name || '').toUpperCase()
  const ownerUpper = (owner.full_name || '').toUpperCase()

  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, Helvetica, sans-serif; background: white; font-size: 13px; color: #111; }
  .main { margin: 60px 50px; }
  h1 { font-size: 22px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 28px; border-bottom: 2px solid #111; padding-bottom: 12px; }
  h2 { font-size: 14px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin: 28px 0 12px; }
  p { line-height: 1.7; margin-bottom: 10px; text-align: justify; }
  ul { margin: 8px 0 8px 18px; }
  li { margin-bottom: 10px; line-height: 1.7; text-align: justify; }
  .note { margin: 6px 0 6px 20px; display: flex; gap: 8px; line-height: 1.6; font-style: italic; }
  .note::before { content: '●'; font-style: normal; }
  .sign { margin-top: 50px; }
  .sign pre { font-family: Arial, Helvetica, sans-serif; line-height: 2.2; }
  .sign-grid { display: flex; gap: 40px; margin-top: 48px; }
  .sign-block { flex: 1; }
</style>
</head>
<body>
<div class="main">
  <h1>Acta de Entrega de Bien Inmueble</h1>

  <p>
    En la ciudad de <b>${contract.city || '[ciudad]'}</b>, a los <b>${day}</b> días del mes de
    <b>${month ? month.charAt(0).toUpperCase() + month.slice(1) : '[mes]'}</b> de ${year},
    se suscribe la presente acta de entrega del inmueble ubicado en:
    <b>${property.full_address || '[dirección]'}</b>.
  </p>

  <h2>1. Declaraciones y Estado del Inmueble</h2>
  <ul>
    <li><b>Estado General:</b> El arrendatario manifiesta recibir el inmueble en <b>buen estado</b> de conservación y funcionamiento.</li>
    <li><b>Pintura:</b> El arrendatario acepta y entiende que el inmueble se entrega recién pintado y, bajo el mismo tenor, se compromete a devolverlo en las mismas condiciones (pintado) al finalizar el contrato.</li>
    <li><b>Entrega de Llaves:</b> Se hace entrega formal de <b>dos (2) juegos de llaves</b> de acceso a la propiedad. El arrendador declara no conservar copias de las llaves. En caso de pérdida, el arrendatario deberá asumir la solución a su propio costo. Así mismo, cualquier daño ocasionado a la chapa o a la puerta será de exclusiva responsabilidad del arrendatario, quien deberá repararlos o reponerlos a su cargo.</li>
  </ul>

  <h2>2. Compromisos Económicos</h2>
  <ul>
    <li><b>Servicios Públicos:</b> El arrendatario entiende y acepta que deberá cancelar el mes siguiente al momento de proceder con la entrega física del inmueble.</li>
  </ul>

  <h2>3. Restitución del Inmueble</h2>
  <ul>
    <li><b>Fecha de Entrega:</b> Se establece que el arrendatario deberá restituir la propiedad el día <b>${endDay} [${endMonthYear}]</b> al finalizar el vínculo contractual, <b>lavada y pintada</b>.</li>
    <li><b>Aceptación:</b> Las partes manifiestan que aceptan los términos del contrato de arrendamiento en tiempo y forma, rigiéndose por lo aquí pactado y lo firmado en el documento principal.</li>
  </ul>

  <div class="sign-grid">
    <div class="sign-block">
      <p><b>ARRENDATARIO:</b></p>
      <pre>
_________________________________________
${tenantUpper}
CC No. ________________________ De ____________________________
</pre>
    </div>
  </div>
</div>
</body>
</html>`
}

export async function generateActaEntregaPdf(payload, filename) {
  const html = buildActaEntregaHtml(payload)
  const name = filename || `ActaEntrega_${(payload.tenant?.full_name || 'Sin_nombre').replace(/\s+/g, '_')}.pdf`
  await generateHtmlToPdf(html, name)
}
