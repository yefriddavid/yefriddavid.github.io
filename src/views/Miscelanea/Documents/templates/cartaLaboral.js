const ul = (val, n = 30) =>
  val?.trim() ? `<u>${val.trim()}</u>` : `<u>${'&nbsp;'.repeat(n)}</u>`

const buildHtml = (v = {}) => `<!DOCTYPE html>
<html><head><style>
  body{font-family:Arial,Helvetica,sans-serif;background:#fff;font-size:12px;margin:0}
  .pg{margin:55px 55px 55px 55px}
  h3{text-align:center;font-weight:bold;margin-bottom:30px;font-size:14px;letter-spacing:.5px}
  p{line-height:1.75;text-align:justify;margin:0 0 8px 0}
  .meta p{text-align:left}
  .gap{margin-bottom:18px}
</style></head>
<body><div class="pg">
  <h3>CARTA LABORAL</h3>

  <div class="meta gap">
    <p>${ul(v.ciudad, 20)}, ${ul(v.fecha, 28)}</p>
  </div>

  <p class="gap">A QUIEN INTERESE</p>

  <p class="gap">Yo, ${ul(v.empleadorNombre, 42)}, mayor de edad, identificado con <i>Cédula</i> N° ${ul(v.empleadorCedula, 16)}, en mi calidad de empleador, certifico que el señor(a) ${ul(v.empleadoNombre, 42)}, identificado con <i>Cédula</i> N° ${ul(v.empleadoCedula, 16)}, labora bajo mi dependencia desde el día ${ul(v.fechaIngreso, 20)}, desempeñando el cargo de <b>${ul(v.cargo, 28)}</b>, conduciendo el vehículo tipo taxi de placas ${ul(v.placa, 12)}.</p>

  <p class="gap">El (la) señor(a) ${ul(v.empleadoNombre, 30)} devenga actualmente unos ingresos mensuales de ${ul(v.salario, 20)}.</p>

  <p class="gap">La presente certificación se expide a solicitud del interesado(a) para los fines que estime convenientes.</p>

  <p style="margin-bottom:60px">Atentamente,</p>

  <p><b>${(v.empleadorNombre || '').toUpperCase()}</b></p>
  <div style="height:55px"></div>
  <div style="border-top:1px solid #000;width:210px"></div>
  <p style="text-align:left;margin-top:4px">${(v.empleadorNombre || '').toUpperCase()}</p>
  <p style="text-align:left">C.C. ${v.empleadorCedula || ''}</p>
</div></body></html>`

const MONTHS_ES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

const todayLabel = () => {
  const d = new Date()
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`
}

export const cartaLaboral = {
  id: 'carta-laboral',
  name: 'Carta Laboral',
  description: 'Certificación laboral para un conductor de taxi vinculado',
  fields: [
    { key: 'ciudad', label: 'Ciudad', placeholder: 'Medellín' },
    { key: 'fecha', label: 'Fecha', placeholder: '6 de octubre de 2022', autoFill: todayLabel },
    { key: 'empleadorNombre', label: 'Nombre del Empleador', placeholder: 'Romer Rolver Rios Sanchez' },
    { key: 'empleadorCedula', label: 'Cédula del Empleador', placeholder: '71699694' },
    { key: 'empleadoNombre', label: 'Nombre del Empleado', placeholder: 'Andrés Enrique Ramírez Mejía' },
    { key: 'empleadoCedula', label: 'Cédula del Empleado', placeholder: '71.377.779' },
    { key: 'cargo', label: 'Cargo', placeholder: 'Conductor de Taxi' },
    { key: 'fechaIngreso', label: 'Fecha de Ingreso', placeholder: '1 de marzo de 2023' },
    { key: 'placa', label: 'Placa del vehículo', placeholder: 'KMR-636' },
    { key: 'salario', label: 'Ingresos mensuales', placeholder: '$ 1.500.000' },
  ],
  buildHtml,
}
