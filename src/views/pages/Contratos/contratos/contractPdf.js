import { jsPDF } from 'jspdf'

// ── Date helpers ──────────────────────────────────────────────────────────────

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

const ORDINALS_ES = [
  '',
  'primero',
  'segundo',
  'tercero',
  'cuarto',
  'quinto',
  'sexto',
  'séptimo',
  'octavo',
  'noveno',
  'décimo',
  'undécimo',
  'duodécimo',
  'décimo tercero',
  'décimo cuarto',
  'décimo quinto',
  'décimo sexto',
  'décimo séptimo',
  'décimo octavo',
  'décimo noveno',
  'vigésimo',
  'vigésimo primero',
  'vigésimo segundo',
  'vigésimo tercero',
  'vigésimo cuarto',
  'vigésimo quinto',
  'vigésimo sexto',
  'vigésimo séptimo',
  'vigésimo octavo',
  'vigésimo noveno',
  'trigésimo',
  'trigésimo primero',
]

function parseDate(str) {
  if (!str) return null
  const d = new Date(str + 'T12:00:00')
  return isNaN(d) ? null : d
}

function ordinalDay(day) {
  return ORDINALS_ES[day] ?? String(day)
}

function monthName(month) {
  return MONTHS_ES[month] ?? ''
}

// ── Number to words (Spanish) ────────────────────────────────────────────────

function numToWords(n) {
  const num = parseInt(n, 10)
  if (isNaN(num) || num < 0) return ''
  if (num === 0) return 'cero'

  const units = [
    '',
    'un',
    'dos',
    'tres',
    'cuatro',
    'cinco',
    'seis',
    'siete',
    'ocho',
    'nueve',
    'diez',
    'once',
    'doce',
    'trece',
    'catorce',
    'quince',
    'dieciséis',
    'diecisiete',
    'dieciocho',
    'diecinueve',
  ]
  const tens = [
    '',
    '',
    'veinte',
    'treinta',
    'cuarenta',
    'cincuenta',
    'sesenta',
    'setenta',
    'ochenta',
    'noventa',
  ]
  const hundreds = [
    '',
    'ciento',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos',
  ]

  if (num === 100) return 'cien'
  if (num === 1000) return 'mil'
  if (num === 1000000) return 'un millón'

  if (num >= 1000000) {
    const m = Math.floor(num / 1000000)
    return (
      (m === 1 ? 'un millón' : numToWords(m) + ' millones') +
      (num % 1000000 ? ' ' + numToWords(num % 1000000) : '')
    )
  }
  if (num >= 1000) {
    const t = Math.floor(num / 1000)
    return (
      (t === 1 ? 'mil' : numToWords(t) + ' mil') + (num % 1000 ? ' ' + numToWords(num % 1000) : '')
    )
  }
  if (num >= 100) {
    return hundreds[Math.floor(num / 100)] + (num % 100 ? ' ' + numToWords(num % 100) : '')
  }
  if (num >= 20) {
    const t = Math.floor(num / 10)
    const u = num % 10
    return tens[t] + (u ? ' y ' + units[u] : '')
  }
  return units[num]
}

function numMonthsToWords(n) {
  const num = parseInt(n, 10)
  if (isNaN(num)) return String(n)
  return numToWords(num)
}

function yearToWords(year) {
  if (!year) return ''
  return numToWords(parseInt(year, 10))
}

function formatCOP(value) {
  const num = parseInt(String(value).replace(/\D/g, ''), 10)
  if (isNaN(num)) return ''
  return '$' + num.toLocaleString('es-CO')
}

// ── HTML template ─────────────────────────────────────────────────────────────

export function buildContractHtml(p, isPreview = false) {
  const tenant = p.tenant || {}
  const guarantor = p.guarantor || {}
  const owner = p.owner || {}
  const property = p.property || {}
  const rental = p.rental || {}
  const contract = p.contract || {}
  const account = p.account || {}

  const rentalNum = parseInt(String(rental.value || '0').replace(/\D/g, ''), 10)
  const rentalWords = numToWords(rentalNum).toUpperCase()
  const rentalCOP = formatCOP(rentalNum)

  const startDate = parseDate(rental.start_date)
  const contractDate = parseDate(contract.date)

  const startDay = startDate ? startDate.getDate() : ''
  const startDayOrdinal = startDate ? ordinalDay(startDate.getDate()) : ''
  const startMonth = startDate ? monthName(startDate.getMonth()) : ''
  const startYear = startDate ? startDate.getFullYear() : ''
  const startYearWords = startDate ? yearToWords(startYear) : ''

  const contractDay = contractDate ? contractDate.getDate() : ''
  const contractDayOrdinal = contractDate ? ordinalDay(contractDate.getDate()) : ''
  const contractMonth = contractDate ? monthName(contractDate.getMonth()) : ''
  const contractYear = contractDate ? contractDate.getFullYear() : ''
  const contractYearWords = contractDate ? yearToWords(contractYear) : ''

  const durationWords = numMonthsToWords(rental.duration || '').toUpperCase()
  const ownerUpper = (owner.full_name || '').toUpperCase()
  const tenantUpper = (tenant.full_name || '').toUpperCase()
  const guarantorUpper = (guarantor.full_name || '').toUpperCase()

  const watermark = isPreview
    ? `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);
        font-size:120px;font-weight:bold;color:rgba(226,127,127,0.3);z-index:-1;
        white-space:nowrap;pointer-events:none;">DOCUMENTO <br/> NO VÁLIDO <br/>PARA TRAMITES</div>`
    : ''

  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, Helvetica, sans-serif; background: white; font-size: 13px; }
  h3 { color: black; }
  p { line-height: 1.6; }
  .justify { text-align: justify; }
  .main { margin: 60px 50px; }
  .title { margin-bottom: 40px; }
  .contrctInfo span { padding-top: 8px; display: block; }
  .clausules { margin-top: 20px; }
  .clausules p:first-of-type { margin-bottom: 40px; }
  .sign { margin-top: 50px; margin-bottom: 50px; }
  .sign pre { font-family: Arial, Helvetica, sans-serif; }
  .sign .info { padding-top: 30px; }
</style>
</head>
<body>
${watermark}
<div class="main">
  <div class="title">
    <center><h3>CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA</h3></center>
  </div>

  <div class="contrctInfo">
    <span><b>DIRECCIÓN DEL INMUEBLE:</b> ${property.full_address || ''}</span>
    <span><b>ARRENDADOR:</b> ${ownerUpper}. CC. ${owner.identification?.number || ''}</span>
    <span><b>ARRENDATARIO:</b> ${tenantUpper}. CC. ${tenant.identification?.number || ''}</span>
    <span><b>CANON MENSUAL:</b> ${rentalWords} (${rentalCOP})</span>
    <span><b>DURACIÓN DEL CONTRATO:</b> ${durationWords} (${rental.duration || ''})</span>
    <span><b>FECHA DE INICIACIÓN DEL CONTRATO:</b>
      ${startDayOrdinal ? startDayOrdinal.charAt(0).toUpperCase() + startDayOrdinal.slice(1) : ''} (${startDay}) de ${startMonth} del ${startYearWords} (${startYear})
    </span>
  </div>

  <div class="clausules">
    <p class="justify">
      Entre los suscritos a saber: <b>${ownerUpper}</b>, mayor de edad, domiciliado en la ciudad de
      ${contract.city || ''}, identificado con cédula de ciudadanía, cuyo número aparece al pie
      de su firma, quien en adelante se denominará <b>EL ARRENDADOR</b> de una parte, y de la otra, el señor
      <b>${tenantUpper}</b>, mayor de edad, identificado como aparece al pié de su respectiva firma,
      quien se denominará <b>EL ARRENDATARIO</b>, se ha celebrado un contrato de arrendamiento que
      se regirá por las siguientes cláusulas:
    </p>

    <p class="justify">
      <b>PRIMERA:</b> EL ARRENDADOR entrega en arrendamiento al ARRENDATARIO el inmueble ubicado en
      <b>${property.full_address || ''}</b>${property.appartment_number ? ', apartamento No. ' + property.appartment_number : ''},
      municipio de ${property.city || ''}, departamento de ${property.state || ''}${property.urbanization_name ? ', urbanización ' + property.urbanization_name : ''},
      para ser destinado única y exclusivamente a vivienda urbana del ARRENDATARIO y su familia.
    </p>

    <p class="justify">
      <b>SEGUNDA:</b> El término de arrendamiento será de ${durationWords} (${rental.duration || ''}) meses contado a partir del día
      ${startDayOrdinal} (${startDay}) del mes de ${startMonth} del año ${startYearWords} (${startYear}).
    </p>

    <p class="justify">
      <b>TERCERA:</b> El precio del arrendamiento es la suma de <b>${rentalWords} MONEDA LEGAL COLOMBIANA
      (${rentalCOP})</b> mensual, suma que deberá ser cancelada dentro de los cinco (5) primeros días de cada
      periodo. Dicha suma se consignará en la cuenta de ${account.type || ''} de ${account.bank_name || ''} No. ${account.number || ''}
      a nombre de <b>${(account.name || owner.full_name || '').toUpperCase()}</b> y se enviará comprobante de pago al <b>EL ARRENDADOR</b>.
    </p>

    <p class="justify">
      <b>CUARTA:</b> Sin previo permiso escrito de <b>EL ARRENDADOR</b>, no podrá <b>EL ARRENDATARIO</b> subarrendar,
      ni ceder en arriendo, ni cambiar la destinación que hoy se está dando a los inmuebles, bajo la sanción
      de responder por todos los daños y perjuicios. Adicionalmente <b>EL ARRENDADOR</b> podrá dar por terminado
      éste contrato, aún antes del vencimiento, en caso de violación de ésta prohibición.
    </p>

    <p class="justify">
      <b>QUINTA:</b> Es prohibido a <b>EL ARRENDATARIO</b> mantener o guardar o permitir que otro guarde o mantenga
      dentro del inmueble arrendado transitoria o permanentemente, sustancias inflamables, explosivas, o en cualquier
      forma nocivas para la salud y que puedan afectar la seguridad, buena conservación e higiene de los
      inmuebles arrendados o la de los inmuebles colindantes. <b>EL ARRENDADOR</b> no será responsable por robos,
      daños o eventualidades de cualquier naturaleza que puedan sobrevenir en los inmuebles arrendados.
    </p>

    <p class="justify">
      <b>SEXTA:</b> <b>EL ARRENDATARIO</b> declara haber recibido los inmuebles en buen estado de conservación y se
      obliga a devolverlos en el mismo estado, salvo los deterioros naturales producidos por el goce legítimo
      de los inmuebles arrendados. Las reparaciones locativas serán por cuenta de <b>EL ARRENDATARIO</b>.
    </p>

    <p class="justify">
      <b>SEPTIMA:</b> Sin previo permiso escrito de <b>EL ARRENDADOR</b>, no podrá <b>EL ARRENDATARIO</b> efectuar
      mejoras de ninguna naturaleza; y en caso de que las hiciere, éstas quedarán de propiedad del dueño de los
      inmuebles, sin derecho por parte de <b>EL ARRENDATARIO</b> a retirarlas ni a cobrar su valor. En este ni
      en ningún otro caso podrá EL ARRENDATARIO alegar contra <b>EL ARRENDADOR</b> el derecho de retención
      que en algunos casos establece la ley colombiana, pues desde ahora renuncia a ese derecho.
    </p>

    <p class="justify">
      <b>OCTAVA:</b> El servicio de energía eléctrica, gas, agua, tasa de aseo, alcantarillado, teléfono, multas
      por la administración serán pagados por <b>EL ARRENDATARIO</b>. <b>EL ARRENDADOR</b> no se hace responsable
      en ningún caso por la deficiencia en la prestación de tales servicios. Será obligación expresa de
      <b>EL ARRENDATARIO</b> el estricto cumplimiento de todas las disposiciones y reglamentos de las empresas
      de servicios públicos, así como el cumplimiento de las normas vigentes en la copropiedad.
      Las cuotas de administración de la copropiedad corren por cuenta de <b>EL ARRENDADOR</b>.
    </p>

    <p class="justify">
      <b>NOVENA:</b> PREAVISO, PRÓRROGA Y DEVOLUCIÓN DEL DEPÓSITO: Las partes acuerdan que, si <b>EL ARRENDATARIO</b>
      decide no renovar el contrato al vencimiento del plazo inicial o de sus prórrogas, deberá notificarlo por
      escrito a <b>EL ARRENDADOR</b> con una antelación no menor a cuarenta y cinco (45) días calendario. De no
      recibirse dicha comunicación en el tiempo y forma pactados, el contrato se entenderá prorrogado
      automáticamente por un periodo igual al inicialmente pactado.
      <b>En caso de que EL ARRENDATARIO no dé el aviso previo de cuarenta y cinco (45) días establecido en la
      presente cláusula, EL ARRENDADOR quedará facultado para retener el depósito de garantía en su totalidad,
      como compensación por el incumplimiento del preaviso pactado, sin perjuicio de las demás acciones legales
      a que hubiere lugar.</b> La entrega anticipada del inmueble antes del vencimiento del plazo contractual
      obligará a <b>EL ARRENDATARIO</b> al pago de los cánones restantes hasta completar el periodo vigente,
      a menos que se pacte algo distinto por escrito.
    </p>

    <p class="justify">
      <b>DECIMA:</b> La simple demora en el pago de una de las mensualidades del arrendamiento, la demora en el
      cumplimiento o la violación total o parcial de cualquiera de las obligaciones que la ley o este contrato
      imponen a <b>EL ARRENDATARIO</b> dará potestad a <b>EL ARRENDADOR</b> para dar por terminado el contrato
      y pedir la inmediata restitución de los inmuebles.
    </p>

    <p class="justify">
      <b>DECIMA PRIMERA:</b> <b>EL ARRENDATARIO</b> renuncia al derecho a que se le requiera judicial o privadamente
      para ser constituido en mora y dar por terminado el contrato, lo mismo que al derecho a prestar la
      seguridad competente de pago a que alude el artículo 2035 del Código Civil.
    </p>

    <p class="justify">
      <b>DECIMA SEGUNDA:</b> <b>EL ARRENDATARIO</b> acepta desde ahora cualquier traspaso que <b>EL ARRENDADOR</b>
      haga del presente contrato o de las sumas u obligaciones a su favor y a cargo de aquellos por razón del mismo.
    </p>

    <p class="justify">
      <b>DECIMA TERCERA:</b> Está prohibido a <b>EL ARRENDATARIO</b> hacer uso de la cuenta de servicios públicos
      para respaldar cualquier crédito tales como: Somos, GNB, Fundación social EPM o cualquier otra entidad.
    </p>

    <p class="justify">
      Presente el señor (a) <b>${guarantorUpper}</b>, mayor de edad, identificado con la cédula de ciudadanía
      No. <b>${guarantor.identification?.number || ''}</b>, expedida en ${guarantor.identification?.city || ''},
      obrando en mi condición de <b>COARRENDATARIO</b> del señor (a) <b>${tenantUpper}</b> manifiesto
      que acepto en todas sus partes el presente contrato, en especial mi calidad de coarrendatario.
    </p>

    <p class="justify">
      Para constancia se firma este contrato en la ciudad de ${contract.city || ''} al
      ${contractDayOrdinal} (${contractDay}) día del mes de
      ${contractMonth ? contractMonth.charAt(0).toUpperCase() + contractMonth.slice(1) : ''}
      del año ${contractYearWords} (${contractYear}).
    </p>
  </div>

  <br/><br/><br/><br/><br/><br/><br/>

  <div class="sign">
    <p><b>ARRENDADOR:</b></p>
    <pre><div class="info">
_________________________________________
${ownerUpper}
CC No. ${owner.identification?.number || ''} De ${owner.identification?.city || ''}
</div></pre>
  </div>

  <div class="sign">
    <p><b>ARRENDATARIO:</b></p>
    <pre><div class="info">
_________________________________________
${tenantUpper}
CC No. ${tenant.identification?.number || ''} De ${tenant.identification?.city || ''}
</div></pre>
  </div>

  <div class="sign">
    <p><b>COARRENDATARIO:</b></p>
    <pre><div class="info">
_________________________________________
${guarantorUpper}
CC No. ${guarantor.identification?.number || ''} De ${guarantor.identification?.city || ''}
</div></pre>
  </div>

</div>
</body>
</html>`
}

// ── PDF generation (jsPDF) ────────────────────────────────────────────────────

export function generateContractPdf(payload, filename) {
  const tenant = payload.tenant || {}
  const guarantor = payload.guarantor || {}
  const owner = payload.owner || {}
  const property = payload.property || {}
  const rental = payload.rental || {}
  const contract = payload.contract || {}
  const account = payload.account || {}

  const rentalNum = parseInt(String(rental.value || '0').replace(/\D/g, ''), 10)
  const rentalWords = numToWords(rentalNum).toUpperCase()
  const rentalCOP = formatCOP(rentalNum)

  const startDate = parseDate(rental.start_date)
  const contractDate = parseDate(contract.date)

  const sd = {
    day: startDate?.getDate() ?? '',
    ordinal: startDate ? ordinalDay(startDate.getDate()) : '',
    month: startDate ? monthName(startDate.getMonth()) : '',
    year: startDate?.getFullYear() ?? '',
    yearWords: startDate ? yearToWords(startDate.getFullYear()) : '',
  }
  const cd = {
    day: contractDate?.getDate() ?? '',
    ordinal: contractDate ? ordinalDay(contractDate.getDate()) : '',
    month: contractDate ? monthName(contractDate.getMonth()) : '',
    year: contractDate?.getFullYear() ?? '',
    yearWords: contractDate ? yearToWords(contractDate.getFullYear()) : '',
  }

  const ownerUpper = (owner.full_name || '').toUpperCase()
  const tenantUpper = (tenant.full_name || '').toUpperCase()
  const guarantorUpper = (guarantor.full_name || '').toUpperCase()
  const durationWords = numMonthsToWords(rental.duration || '').toUpperCase()
  const accountName = (account.name || owner.full_name || '').toUpperCase()

  const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const mL = 22
  const mR = 22
  const mT = 22
  const usableW = pageW - mL - mR
  let y = mT

  const checkPage = (needed = 8) => {
    if (y + needed > pageH - 18) {
      doc.addPage()
      y = mT
    }
  }

  const addLines = (text, fontSize = 10, bold = false, indent = 0, spacing = 5.5) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(text, usableW - indent)
    checkPage(lines.length * spacing + 2)
    doc.text(lines, mL + indent, y, { align: 'justify', maxWidth: usableW - indent })
    y += lines.length * spacing + 1
  }

  const blankLine = (h = 3) => {
    y += h
  }

  // ── Title ──
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize('CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA', usableW)
  doc.text(titleLines, pageW / 2, y, { align: 'center' })
  y += titleLines.length * 7 + 8

  // ── Info block ──
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const infoLines = [
    ['DIRECCIÓN DEL INMUEBLE: ', property.full_address || ''],
    ['ARRENDADOR: ', `${ownerUpper}. CC. ${owner.identification?.number || ''}`],
    ['ARRENDATARIO: ', `${tenantUpper}. CC. ${tenant.identification?.number || ''}`],
    ['CANON MENSUAL: ', `${rentalWords} (${rentalCOP})`],
    ['DURACIÓN DEL CONTRATO: ', `${durationWords} (${rental.duration || ''})`],
    [
      'FECHA DE INICIACIÓN: ',
      `${sd.ordinal ? sd.ordinal.charAt(0).toUpperCase() + sd.ordinal.slice(1) : ''} (${sd.day}) de ${sd.month} del ${sd.yearWords} (${sd.year})`,
    ],
  ]

  infoLines.forEach(([label, value]) => {
    checkPage(8)
    doc.setFont('helvetica', 'bold')
    const labelW = doc.getTextWidth(label)
    doc.text(label, mL, y)
    doc.setFont('helvetica', 'normal')
    const valueLines = doc.splitTextToSize(value, usableW - labelW)
    doc.text(valueLines[0] || '', mL + labelW, y)
    if (valueLines.length > 1) {
      y += 5.5
      doc.text(valueLines.slice(1), mL + labelW, y)
      y += (valueLines.length - 1) * 5.5
    }
    y += 6
  })

  blankLine(4)

  // ── Clauses ──
  const clause = (label, text) => {
    blankLine(2)
    const full = `${label} ${text}`
    addLines(full, 10, false, 0, 5.5)
  }

  addLines(
    `Entre los suscritos a saber: ${ownerUpper}, mayor de edad, domiciliado en la ciudad de ${contract.city || ''}, identificado con cédula de ciudadanía, cuyo número aparece al pie de su firma, quien en adelante se denominará EL ARRENDADOR de una parte, y de la otra, el señor ${tenantUpper}, mayor de edad, identificado como aparece al pié de su respectiva firma, quien se denominará EL ARRENDATARIO, se ha celebrado un contrato de arrendamiento que se regirá por las siguientes cláusulas:`,
    10,
    false,
    0,
    5.5,
  )

  clause(
    'PRIMERA:',
    `EL ARRENDADOR entrega en arrendamiento al ARRENDATARIO el inmueble ubicado en ${property.full_address || ''}${property.appartment_number ? ', apartamento No. ' + property.appartment_number : ''}, municipio de ${property.city || ''}, departamento de ${property.state || ''}${property.urbanization_name ? ', urbanización ' + property.urbanization_name : ''}, para ser destinado única y exclusivamente a vivienda urbana del ARRENDATARIO y su familia.`,
  )

  clause(
    'SEGUNDA:',
    `El término de arrendamiento será de ${durationWords} (${rental.duration || ''}) meses contado a partir del día ${sd.ordinal} (${sd.day}) del mes de ${sd.month} del año ${sd.yearWords} (${sd.year}).`,
  )

  clause(
    'TERCERA:',
    `El precio del arrendamiento es la suma de ${rentalWords} MONEDA LEGAL COLOMBIANA (${rentalCOP}) mensual, suma que deberá ser cancelada dentro de los cinco (5) primeros días de cada periodo. Dicha suma se consignará en la cuenta de ${account.type || ''} de ${account.bank_name || ''} No. ${account.number || ''} a nombre de ${accountName} y se enviará comprobante de pago al EL ARRENDADOR.`,
  )

  clause(
    'CUARTA:',
    'Sin previo permiso escrito de EL ARRENDADOR, no podrá EL ARRENDATARIO subarrendar, ni ceder en arriendo, ni cambiar la destinación que hoy se está dando a los inmuebles, bajo la sanción de responder por todos los daños y perjuicios. Adicionalmente EL ARRENDADOR podrá dar por terminado éste contrato, aún antes del vencimiento, en caso de violación de ésta prohibición.',
  )

  clause(
    'QUINTA:',
    'Es prohibido a EL ARRENDATARIO mantener o guardar o permitir que otro guarde o mantenga dentro del inmueble arrendado transitoria o permanentemente, sustancias inflamables, explosivas, o en cualquier forma nocivas para la salud y que puedan afectar la seguridad, buena conservación e higiene de los inmuebles arrendados o la de los inmuebles colindantes. EL ARRENDADOR no será responsable por robos, daños o eventualidades de cualquier naturaleza que puedan sobrevenir en los inmuebles arrendados.',
  )

  clause(
    'SEXTA:',
    'EL ARRENDATARIO declara haber recibido los inmuebles en buen estado de conservación y se obliga a devolverlos en el mismo estado, salvo los deterioros naturales producidos por el goce legítimo de los inmuebles arrendados. Las reparaciones locativas serán por cuenta de EL ARRENDATARIO.',
  )

  clause(
    'SEPTIMA:',
    'Sin previo permiso escrito de EL ARRENDADOR, no podrá EL ARRENDATARIO efectuar mejoras de ninguna naturaleza; y en caso de que las hiciere, éstas quedarán de propiedad del dueño de los inmuebles, sin derecho por parte de EL ARRENDATARIO a retirarlas ni a cobrar su valor. En este ni en ningún otro caso podrá EL ARRENDATARIO alegar contra EL ARRENDADOR el derecho de retención que en algunos casos establece la ley colombiana, pues desde ahora renuncia a ese derecho.',
  )

  clause(
    'OCTAVA:',
    'El servicio de energía eléctrica, gas, agua, tasa de aseo, alcantarillado, teléfono, multas por la administración serán pagados por EL ARRENDATARIO. EL ARRENDADOR no se hace responsable en ningún caso por la deficiencia en la prestación de tales servicios. Será obligación expresa de EL ARRENDATARIO el estricto cumplimiento de todas las disposiciones y reglamentos de las empresas de servicios públicos, así como el cumplimiento de las normas vigentes en la copropiedad. Las cuotas de administración de la copropiedad corren por cuenta de EL ARRENDADOR.',
  )

  clause(
    'NOVENA:',
    'PREAVISO, PRÓRROGA Y DEVOLUCIÓN DEL DEPÓSITO: Las partes acuerdan que, si EL ARRENDATARIO decide no renovar el contrato al vencimiento del plazo inicial o de sus prórrogas, deberá notificarlo por escrito a EL ARRENDADOR con una antelación no menor a cuarenta y cinco (45) días calendario. De no recibirse dicha comunicación en el tiempo y forma pactados, el contrato se entenderá prorrogado automáticamente por un periodo igual al inicialmente pactado. En caso de que EL ARRENDATARIO no dé el aviso previo de cuarenta y cinco (45) días, EL ARRENDADOR quedará facultado para retener el depósito de garantía en su totalidad, como compensación por el incumplimiento del preaviso pactado. La entrega anticipada del inmueble obligará a EL ARRENDATARIO al pago de los cánones restantes hasta completar el periodo vigente, a menos que se pacte algo distinto por escrito.',
  )

  clause(
    'DECIMA:',
    'La simple demora en el pago de una de las mensualidades del arrendamiento, la demora en el cumplimiento o la violación total o parcial de cualquiera de las obligaciones que la ley o este contrato imponen a EL ARRENDATARIO dará potestad a EL ARRENDADOR para dar por terminado el contrato y pedir la inmediata restitución de los inmuebles.',
  )

  clause(
    'DECIMA PRIMERA:',
    'EL ARRENDATARIO renuncia al derecho a que se le requiera judicial o privadamente para ser constituido en mora y dar por terminado el contrato, lo mismo que al derecho a prestar la seguridad competente de pago a que alude el artículo 2035 del Código Civil.',
  )

  clause(
    'DECIMA SEGUNDA:',
    'EL ARRENDATARIO acepta desde ahora cualquier traspaso que EL ARRENDADOR haga del presente contrato o de las sumas u obligaciones a su favor y a cargo de aquellos por razón del mismo.',
  )

  clause(
    'DECIMA TERCERA:',
    'Está prohibido a EL ARRENDATARIO hacer uso de la cuenta de servicios públicos para respaldar cualquier crédito tales como: Somos, GNB, Fundación social EPM o cualquier otra entidad.',
  )

  blankLine(3)
  addLines(
    `Presente el señor (a) ${guarantorUpper}, mayor de edad, identificado con la cédula de ciudadanía No. ${guarantor.identification?.number || ''}, expedida en ${guarantor.identification?.city || ''}, obrando en mi condición de COARRENDATARIO del señor (a) ${tenantUpper} manifiesto que acepto en todas sus partes el presente contrato, en especial mi calidad de coarrendatario.`,
  )

  blankLine(3)
  addLines(
    `Para constancia se firma este contrato en la ciudad de ${contract.city || ''} al ${cd.ordinal} (${cd.day}) día del mes de ${cd.month ? cd.month.charAt(0).toUpperCase() + cd.month.slice(1) : ''} del año ${cd.yearWords} (${cd.year}).`,
  )

  // ── Signatures ──
  blankLine(20)
  checkPage(50)

  const sigColW = usableW / 3
  const sigStartX = mL

  ;[
    {
      label: 'ARRENDADOR:',
      name: ownerUpper,
      cc: owner.identification?.number || '',
      city: owner.identification?.city || '',
    },
    {
      label: 'ARRENDATARIO:',
      name: tenantUpper,
      cc: tenant.identification?.number || '',
      city: tenant.identification?.city || '',
    },
    {
      label: 'COARRENDATARIO:',
      name: guarantorUpper,
      cc: guarantor.identification?.number || '',
      city: guarantor.identification?.city || '',
    },
  ].forEach((sig, i) => {
    const colX = sigStartX + i * sigColW
    const lineX1 = colX + 2
    const lineX2 = colX + sigColW - 4

    checkPage(40)
    const baseY = y

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(sig.label, colX + sigColW / 2, baseY, { align: 'center' })
    doc.line(lineX1, baseY + 18, lineX2, baseY + 18)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(sig.name, colX + sigColW / 2, baseY + 23, { align: 'center' })
    doc.text(`CC No. ${sig.cc}`, colX + sigColW / 2, baseY + 28, { align: 'center' })
    if (sig.city) doc.text(`De ${sig.city}`, colX + sigColW / 2, baseY + 33, { align: 'center' })
  })

  y += 40

  const name = filename || `Contrato_${(tenant.full_name || 'Sin_nombre').replace(/\s+/g, '_')}.pdf`
  doc.save(name)
}
