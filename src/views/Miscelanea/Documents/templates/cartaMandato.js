const ul = (val, n = 30) =>
  val?.trim() ? `<u>${val.trim()}</u>` : `<u>${'&nbsp;'.repeat(n)}</u>`

const buildHtml = (v = {}) => `<!DOCTYPE html>
<html><head><style>
  body{font-family:Arial,Helvetica,sans-serif;background:#fff;font-size:12px;margin:0}
  .pg{margin:55px 55px 55px 55px}
  h3{text-align:center;font-weight:bold;margin-bottom:30px;font-size:14px;letter-spacing:.5px}
  p{line-height:1.75;text-align:justify;margin:0 0 8px 0}
  .meta p{text-align:left}
  .indent{padding-left:22px}
  .gap{margin-bottom:18px}
  table{border-collapse:collapse;width:100%}
  td{vertical-align:top}
</style></head>
<body><div class="pg">
  <h3>CONTRATO DE MANDATO</h3>

  <div class="meta gap">
    <p>Fecha &nbsp;${ul(v.fecha, 28)}</p>
    <p>Ciudad &nbsp;${ul(v.ciudad, 28)}</p>
  </div>

  <p class="gap">Entre los suscritos a saber ${ul(v.mandanteNombre, 42)} mayor de edad, vecino de ésta ciudad, identificado con <i>Cédula</i> N° ${ul(v.mandanteCedula, 16)} quien para efectos del presente contrato se denominará <b>EL MANDANTE</b>, y de otro ${ul(v.mandatarioNombre, 42)} también mayor de edad, vecino de ésta ciudad, identificado con <i>Cédula</i> N° ${ul(v.mandatarioCedula, 16)}, quién para efectos de este contrato se denominará <b>EL MANDATARIO</b>, hemos acordado suscribir el presente contrato de mandato dando cumplimiento a la resolución 12379 expedida por el Ministerio de Transporte, el 28 de diciembre de 2012 (Art. 5°), que se regirá por las normas civiles y comerciales que regulan la materia en concordancia con el Art. 2149 C.C. según las siguientes cláusulas:</p>

  <div class="indent gap">
    <p>1. &nbsp;<b>PRIMERA. OBJETO DEL CONTRATO</b>: <i>EL MANDATARIO</i> por cuenta y riesgo del <i>MANDANTE</i> queda facultado para solicitar, realizar radicar y retirar el trámite de ${ul(v.tramite, 36)} del vehículo de placas ${ul(v.placa, 12)}</p>
  </div>

  <p class="gap">Ante el ORGANISMO DE TRÁNSITO Y TRANSPORTE que corresponda, como consecuencia, <i>EL MANDATARIO</i> queda facultado para realizar todas las gestiones propias de este mandato y en especial para representar, notificar, recibir, impugnar, transigir, desistir, sustituir, reasumir, pedir, conciliar o asumir obligaciones en nombre del <i>MANDANTE</i> y quien queda facultado para delegar el presente del mandato.</p>

  <div class="indent gap">
    <p>2. &nbsp;<b>SEGUNDA. OBLIGACIONES DEL MANDANTE</b>: <i>EL MANDANTE</i> declara que la información contenida en los documentos que se anexan a la solicitud del trámite es veraz y autentica, razón por la cual, se hace responsable ante la autoridad competente de cualquier irregularidad que los mismos pueden contener.</p>
  </div>

  <p style="margin-bottom:60px">Este mandato se entiende conferido por término indefinido y sólo perderá su eficacia cuando sea revocado expresamente o cuando se cumplan los objetivos en el previsto.</p>

  <table><tr>
    <td style="width:50%">
      <p><b>EL MANDANTE</b></p>
      <div style="height:65px"></div>
      <div style="border-top:1px solid #000;width:210px"></div>
      <p style="text-align:left;margin-top:4px">${(v.mandanteNombre || '').toUpperCase()}</p>
      <p style="text-align:left">C.C. ${v.mandanteCedula || ''}</p>
    </td>
    <td style="width:50%">
      <p><b>EL MANDATARIO</b></p>
      <div style="height:65px"></div>
      <div style="border-top:1px solid #000;width:210px"></div>
      <p style="text-align:left;margin-top:4px">${(v.mandatarioNombre || '').toUpperCase()}</p>
      <p style="text-align:left">C.C. ${v.mandatarioCedula || ''}</p>
    </td>
  </tr></table>
</div></body></html>`

export const cartaMandato = {
  id: 'carta-mandato',
  name: 'Carta Mandato',
  description: 'Contrato de Mandato para trámites ante el Organismo de Tránsito y Transporte',
  fields: [
    { key: 'fecha', label: 'Fecha', placeholder: '6 de octubre de 2022' },
    { key: 'ciudad', label: 'Ciudad', placeholder: 'Envigado' },
    { key: 'mandanteNombre', label: 'Nombre del Mandante', placeholder: 'Andrés Enrique Ramírez Mejía' },
    { key: 'mandanteCedula', label: 'Cédula del Mandante', placeholder: '71.377.779' },
    { key: 'mandatarioNombre', label: 'Nombre del Mandatario', placeholder: 'Yefrin David Ríos Mora' },
    { key: 'mandatarioCedula', label: 'Cédula del Mandatario', placeholder: '1036622381' },
    { key: 'tramite', label: 'Tipo de trámite', placeholder: 'Traspaso' },
    { key: 'placa', label: 'Placa del vehículo', placeholder: 'KMR-636' },
  ],
  buildHtml,
}
