import { generateHtmlToPdf } from '../contractPdf'

const ITEMS = [
  'Tomacorriente doble',
  'Switch sencillo',
  'Tomacorriente con switch',
  'Contador de luz',
  'Contador de gas',
  'Contador de agua',
  'Campana extractora de cocina',
  'Hornillas de estufa',
  'Inodoro',
  'Ducha',
  'Cabina de baño',
  'Vidrios',
  'Lavamanos',
  'Pisos',
  'Paredes',
  'Lavadero',
  'Clóset',
  'Puertas',
  'Chapa de seguridad',
  'Puntos de luz',
  'Alacena de cocina',
  'Cajonera de baño',
  'Pintura',
  'Grifería',
  'Toallero',
  'Aro toallero',
  'Rejas de seguridad',
  'Papel de colgadura',
  'Manijas de clóset',
  'Manijas de cocina',
  'Pollo de cocina',
  'Escurridor de platos',
  'Switch de tres vías',
]

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str + 'T12:00:00')
  if (isNaN(d)) return str
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function buildInventarioHtml(p) {
  const contract = p.contract || {}
  const property = p.property || {}
  const tenant = p.tenant || {}
  const owner = p.owner || {}

  const rows = ITEMS.map(
    (item) => `
    <tr>
      <td class="desc">${item}</td>
      <td class="center"></td>
      <td class="center"></td>
      <td class="center"></td>
      <td class="center"></td>
      <td class="center"></td>
      <td class="center"></td>
      <td></td>
    </tr>`,
  ).join('')

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; background: white; }
  .main { padding: 40px 36px; }
  h1 { font-size: 18px; font-weight: 900; text-align: center; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .info-table td { border: 1px solid #333; padding: 4px 8px; }
  .info-table td.lbl { font-weight: 700; width: 140px; white-space: nowrap; }
  table.inv { width: 100%; border-collapse: collapse; margin-top: 8px; }
  table.inv th, table.inv td { border: 1px solid #333; padding: 4px 6px; }
  table.inv th { font-weight: 900; text-align: center; font-size: 10px; text-transform: uppercase; background: #fff; }
  table.inv td.desc { text-align: left; }
  table.inv td.center { text-align: center; }
  .th-estado { text-align: center; }
  tr:nth-child(odd) td { background: #fafafa; }
</style>
</head>
<body>
<div class="main">
  <h1>Inventario del Inmueble</h1>

  <table class="info-table">
    <tr><td class="lbl">Fecha:</td><td>${formatDate(contract.date)}</td></tr>
    <tr><td class="lbl">Arrendatario:</td><td>${tenant.full_name || ''}</td></tr>
    <tr><td class="lbl">Dirección:</td><td>${property.full_address || ''}</td></tr>
  </table>

  <table class="inv">
    <thead>
      <tr>
        <th rowspan="2" style="width:28%">Descripción</th>
        <th rowspan="2" style="width:8%">Cant.</th>
        <th rowspan="2" style="width:16%">Tipo Material</th>
        <th colspan="3" class="th-estado">Estado</th>
        <th rowspan="2" style="width:12%">Valor Comercial</th>
        <th rowspan="2">Observaciones</th>
      </tr>
      <tr>
        <th style="width:5%">B</th>
        <th style="width:5%">R</th>
        <th style="width:5%">M</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</div>
</body>
</html>`
}

export async function generateInventarioPdf(payload, filename) {
  const html = buildInventarioHtml(payload)
  const name = filename || `Inventario_${(payload.tenant?.full_name || 'Sin_nombre').replace(/\s+/g, '_')}.pdf`
  await generateHtmlToPdf(html, name)
}
