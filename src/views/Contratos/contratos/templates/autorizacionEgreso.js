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

export function buildAutorizacionEgresoHtml(p) {
  const contract = p.contract || {}
  const property = p.property || {}
  const tenant   = p.tenant   || {}
  const owner    = p.owner    || {}

  const contractDate = parseDate(contract.date)

  const day   = contractDate ? contractDate.getDate() : '[día]'
  const month = contractDate ? MONTHS_ES[contractDate.getMonth()] : '[mes]'
  const year  = contractDate ? contractDate.getFullYear() : '[año]'

  const city       = contract.city              || '[ciudad]'
  const building   = property.urbanization_name || '[edificio]'
  const apartment  = property.appartment_number || '[apartamento]'
  const propCity   = property.city              || '[ciudad]'
  const propState  = property.state             || '[departamento]'
  const ownerName  = owner.full_name            || '[propietario]'
  const ownerId    = owner.identification?.number || '[C.C]'
  const tenantName = tenant.full_name           || '[autorizado]'
  const tenantId   = tenant.identification?.number || '[C.C]'

  const ownerUpper  = ownerName.toUpperCase()
  const tenantUpper = tenantName.toUpperCase()

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: white;
    font-size: 13px;
    color: #111;
  }
  .main { margin: 60px 65px; max-width: 700px; }

  h1 {
    font-size: 16px;
    font-weight: 900;
    text-transform: uppercase;
    border-bottom: 2px solid #111;
    padding-bottom: 6px;
    margin-bottom: 24px;
    letter-spacing: .5px;
  }
  h2 {
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    margin: 24px 0 10px;
    letter-spacing: .5px;
  }
  p  { line-height: 1.75; margin-bottom: 12px; text-align: justify; }
  ul { margin: 0 0 16px 20px; }
  li { margin-bottom: 6px; line-height: 1.7; }

  .date    { margin-bottom: 28px; font-weight: bold; }
  .auth-body { margin-top: 20px; }

  .authorized-name { font-weight: 900; font-size: 13px; margin-bottom: 2px; }
  .authorized-id   { font-weight: 700; font-size: 13px; margin-bottom: 14px; }

  .closing { margin-top: 40px; margin-bottom: 80px; }

  .signature-line {
    border-top: 1px solid #333;
    width: 240px;
    margin-bottom: 6px;
  }
  .signature-name { font-weight: bold; }
  .signature-id   { font-size: 12px; }
</style>
</head>
<body>
<div class="main">

  <h1>Carta de Autorización de Egreso</h1>

  <p class="date">${city}, ${day} de ${month} de ${year}</p>

  <h2>Datos del Inmueble</h2>
  <ul>
    <li><b>Edificio:</b> ${building}</li>
    <li><b>Apartamento:</b> ${apartment}</li>
    <li><b>Ciudad:</b> ${propCity}, ${propState}</li>
  </ul>

  <h2>Datos del Propietario</h2>
  <ul>
    <li><b>Nombre:</b> ${ownerName}</li>
    <li><b>Cédula de Ciudadanía:</b> ${ownerId}</li>
  </ul>

  <h2>Autorización</h2>

  <div class="auth-body">
    <p>
      Yo, <b>${ownerUpper}</b>, identificado con cédula de ciudadanía número <b>${ownerId}</b>,
      en mi calidad de propietario del apartamento <b>${apartment}</b> del Edificio
      <b>${building}</b>, ubicado en la ciudad de <b>${city}</b>, por medio de la presente
      autorizo de manera expresa a:
    </p>

    <p class="authorized-name">${tenantUpper}</p>
    <p class="authorized-id">Cédula de Ciudadanía: ${tenantId}</p>

    <p>
      Para que pueda realizar el <b>EGRESO</b> (salida) de elementos, bienes muebles, enseres
      u objetos de mi propiedad desde el apartamento antes mencionado.
    </p>

    <p>
      Esta autorización es válida a partir de la fecha de expedición de la presente carta.
    </p>
  </div>

  <p class="closing">Atentamente,</p>

  <div class="signature-line"></div>
  <p class="signature-name">${ownerName}</p>
  <p class="signature-id">C.C. ${ownerId}</p>

</div>
</body>
</html>`
}

export async function generateAutorizacionEgresoPdf(p, filename) {
  const html = buildAutorizacionEgresoHtml(p)
  await generateHtmlToPdf(html, filename)
}
