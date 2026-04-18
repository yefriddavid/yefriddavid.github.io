import { generateHtmlToPdf } from '../contractPdf'
import { OWNER_SIGNATURE_DATA_URL } from './ownerSignature'

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

function parseDate(str) {
  if (!str) return null
  const d = new Date(str + 'T12:00:00')
  return isNaN(d) ? null : d
}

export function buildAutorizacionIngresoHtml(p) {
  const contract = p.contract || {}
  const property = p.property || {}
  const tenant = p.tenant || {}
  const owner = p.owner || {}
  const rental = p.rental || {}

  const contractDate = parseDate(contract.date)
  const startDate = parseDate(rental.start_date)

  const day = contractDate ? contractDate.getDate() : '[día]'
  const month = contractDate
    ? MONTHS_ES[contractDate.getMonth()].charAt(0).toUpperCase() +
      MONTHS_ES[contractDate.getMonth()].slice(1)
    : '[mes]'
  const year = contractDate ? contractDate.getFullYear() : '[año]'

  const moveDay1 = startDate ? startDate.getDate() : '[día]'
  const moveDay2 = startDate ? startDate.getDate() + 1 : '[día+1]'
  const moveMonth = startDate ? MONTHS_ES[startDate.getMonth()] : '[mes]'
  const moveYear = startDate ? startDate.getFullYear() : '[año]'

  const city = contract.city || '[ciudad]'
  const building = property.urbanization_name || '[edificio]'
  const address = property.address || property.full_address || '[dirección]'
  const apartment = property.appartment_number || '[apartamento]'
  const ownerName = owner.full_name || '[propietario]'
  const tenantName = tenant.full_name || '[inquilino]'
  const tenantId = tenant.identification?.number || '[C.C]'

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
  .main {
    margin: 70px 65px;
    max-width: 700px;
  }
  p {
    line-height: 1.8;
    margin-bottom: 14px;
    text-align: justify;
  }
  .date     { margin-bottom: 40px; }
  .recipient { margin-bottom: 30px; }
  .recipient p { margin-bottom: 4px; }
  .subject  { margin-bottom: 30px; }
  .body     { margin-bottom: 40px; }
  .closing  { margin-bottom: 70px; }
  .signature-area { margin-top: 20px; }
  .signature-img { height: 80px; display: block; margin-bottom: 4px; }
  .signature-line {
    border-top: 1px solid #333;
    width: 240px;
    margin-bottom: 6px;
  }
  .signature-name { font-weight: bold; font-size: 13px; }
  .signature-role { font-size: 12px; color: #444; }
</style>
</head>
<body>
<div class="main">

  <p class="date">${city}, ${day} de ${month} de ${year}</p>

  <div class="recipient">
    <p><b>Edificio:</b> ${building}</p>
    <p><b>Dirección:</b> ${address}</p>
  </div>

  <p class="subject">
    <b>Asunto:</b> Autorización de Ingreso de Nuevo Inquilino - Apartamento ${apartment}
  </p>

  <div class="body">
    <p>
      Por medio de la presente, yo,
      <b>${ownerName}</b>, propietario/a del apartamento número <b>${apartment}</b>
      en el edificio <b>${building}</b>, autorizo formalmente el ingreso de
      <b>${tenantName}</b>, identificado/a con C.C <b>${tenantId}</b>,
      como nuevo/a inquilino/a de dicho apartamento. La mudanza se realizará
      entre el <b>${moveDay1}</b> y <b>${moveDay2}</b> de ${moveMonth} del ${moveYear}.
    </p>

    <p>
      Agradecería que se tomaran las medidas necesarias para registrar a
      <b>${tenantName}</b> como residente del edificio y se le proporcionen
      los accesos correspondientes.
    </p>

    <p>
      Quedo a su disposición para cualquier consulta o información adicional
      que consideren necesaria.
    </p>
  </div>

  <p class="closing">Atentamente,</p>

  <div class="signature-area">
    <img class="signature-img" src="${OWNER_SIGNATURE_DATA_URL}" alt="firma" />
    <div class="signature-line"></div>
    <p class="signature-name">${ownerName}</p>
    <p class="signature-role">Propietario/a — Apartamento ${apartment}</p>
  </div>

</div>
</body>
</html>`
}

export async function generateAutorizacionIngresoPdf(p, filename) {
  const html = buildAutorizacionIngresoHtml(p)
  await generateHtmlToPdf(html, filename)
}
