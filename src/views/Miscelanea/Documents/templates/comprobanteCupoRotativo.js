const buildHtml = (v = {}) => `<!DOCTYPE html>
<html><head><style>
  body{font-family:Arial,Helvetica,sans-serif;background:#fff;font-size:11px;margin:0}
  .pg{margin:30px 40px}
  h3{text-align:center;font-weight:bold;margin:0 0 10px 0;font-size:13px;letter-spacing:.5px}
  table{border-collapse:collapse;width:100%}
  td{border:1px solid #000;padding:4px 6px;vertical-align:top}
  .section{background:#bbb;text-align:center;font-weight:bold;padding:3px 0;font-size:11px}
  .lbl{font-weight:bold;font-size:10px;display:block;margin-bottom:2px}
  .val{font-size:11px}
</style></head>
<body><div class="pg">
  <h3>COMPROBANTE DE UTILIZACIÓN CUPO ROTATIVO</h3>
  <table>
    <tr><td colspan="5" class="section">INFORMACIÓN GENERAL</td></tr>
    <tr>
      <td><span class="lbl">Fecha:</span><span class="val">${v.fecha || ''}</span></td>
      <td><span class="lbl">Hora:</span><span class="val">${v.hora || ''}</span></td>
      <td><span class="lbl">Ciudad:</span><span class="val">${v.ciudad || ''}</span></td>
      <td><span class="lbl">Agencia:</span><span class="val">${v.agencia || ''}</span></td>
      <td><span class="lbl">Asesor Servicios Financieros:</span><span class="val">${v.asesor || ''}</span></td>
    </tr>
    <tr>
      <td colspan="2"><span class="lbl">Nombre Cliente:</span><span class="val">${v.nombreCliente || ''}</span></td>
      <td><span class="lbl">No. Identificación:</span><span class="val">${v.identificacion || ''}</span></td>
      <td colspan="2"><span class="lbl">No. Obligación:</span><span class="val">${v.obligacion || ''}</span></td>
    </tr>
    <tr><td colspan="5" class="section">INFORMACIÓN DE LA UTILIZACIÓN</td></tr>
    <tr>
      <td><span class="lbl">Monto Utilización:</span><span class="val">${v.montoUtilizacion || ''}</span></td>
      <td><span class="lbl">Valor GMF:</span><span class="val">${v.valorGmf || ''}</span></td>
      <td><span class="lbl">Costo Utilización:</span><span class="val">${v.costoUtilizacion || ''}</span></td>
      <td colspan="2"><span class="lbl">Iva Costo Utilización:</span><span class="val">${v.ivaCostoUtilizacion || ''}</span></td>
    </tr>
    <tr>
      <td><span class="lbl">Medio de Pago:</span><span class="val">${v.medioPago || ''}</span></td>
      <td><span class="lbl">Código del Dispositivo:</span><span class="val">${v.codigoDispositivo || ''}</span></td>
      <td><span class="lbl">Valor a entregar al cliente:</span><span class="val">${v.valorEntregarCliente || ''}</span></td>
      <td colspan="2"><span class="lbl">Número de Operación:</span><span class="val">${v.numeroOperacion || ''}</span></td>
    </tr>
  </table>
</div></body></html>`

const todayDate = () => {
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const nowTime = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const comprobanteCupoRotativo = {
  id: 'comprobante-cupo-rotativo',
  name: 'Comprobante Cupo Rotativo',
  description: 'Comprobante de utilización de cupo rotativo',
  fields: [
    { key: 'fecha', label: 'Fecha', placeholder: '31/10/2025', autoFill: todayDate },
    { key: 'hora', label: 'Hora', placeholder: '13:08', autoFill: nowTime },
    { key: 'ciudad', label: 'Ciudad', placeholder: 'MEDELLIN(ANTIOQUIA)' },
    { key: 'agencia', label: 'Agencia', placeholder: '00571 MEDELLIN CC SAN DIEGO' },
    { key: 'asesor', label: 'Asesor Servicios Financieros', placeholder: '101717105' },
    { key: 'nombreCliente', label: 'Nombre Cliente', placeholder: 'RIOS MORA YEFRIN DAVID' },
    { key: 'identificacion', label: 'No. Identificación', placeholder: '1036622381' },
    { key: 'obligacion', label: 'No. Obligación', placeholder: '0000005710000576' },
    { key: 'montoUtilizacion', label: 'Monto Utilización', placeholder: '$ 8,541,000.00' },
    { key: 'valorGmf', label: 'Valor GMF', placeholder: '$ 34,164.00' },
    { key: 'costoUtilizacion', label: 'Costo Utilización', placeholder: '$ 4,454.00' },
    { key: 'ivaCostoUtilizacion', label: 'Iva Costo Utilización', placeholder: '$ 846.00' },
    { key: 'medioPago', label: 'Medio de Pago', placeholder: 'Efectivo' },
    { key: 'codigoDispositivo', label: 'Código del Dispositivo', placeholder: '10.122.10.1' },
    { key: 'valorEntregarCliente', label: 'Valor a entregar al cliente', placeholder: '$ 8,501,536.00' },
    { key: 'numeroOperacion', label: 'Número de Operación', placeholder: '20253041130006391' },
  ],
  buildHtml,
}
