import{r,j as a}from"./index-BC34lrZ1.js";import{u as A}from"./index.esm-D6k6vAPs.js";import{C as E}from"./index.esm-BXVVR9yR.js";import{S as k,a as M,b as T}from"./index-CSeguQ1r.js";import{g as _}from"./contractPdf-OtE1nkw6.js";import{c as D}from"./cil-x-CfQSVFP2.js";import"./vendor-pdfjs-ghJ8s6PZ.js";import"./vendor-firebase-Dlf6zeGm.js";import"./cil-fullscreen-CN3IB4OV.js";import"./useTranslation-DSxDB9nd.js";import"./jspdf.es.min-DTiF34wb.js";import"./html2canvas.esm-CBrSDip1.js";const i=(e,t=30)=>e!=null&&e.trim()?`<u>${e.trim()}</u>`:`<u>${"&nbsp;".repeat(t)}</u>`,w=(e={})=>`<!DOCTYPE html>
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
    <p>Fecha &nbsp;${i(e.fecha,28)}</p>
    <p>Ciudad &nbsp;${i(e.ciudad,28)}</p>
  </div>

  <p class="gap">Entre los suscritos a saber ${i(e.mandanteNombre,42)} mayor de edad, vecino de ésta ciudad, identificado con <i>Cédula</i> N° ${i(e.mandanteCedula,16)} quien para efectos del presente contrato se denominará <b>EL MANDANTE</b>, y de otro ${i(e.mandatarioNombre,42)} también mayor de edad, vecino de ésta ciudad, identificado con <i>Cédula</i> N° ${i(e.mandatarioCedula,16)}, quién para efectos de este contrato se denominará <b>EL MANDATARIO</b>, hemos acordado suscribir el presente contrato de mandato dando cumplimiento a la resolución 12379 expedida por el Ministerio de Transporte, el 28 de diciembre de 2012 (Art. 5°), que se regirá por las normas civiles y comerciales que regulan la materia en concordancia con el Art. 2149 C.C. según las siguientes cláusulas:</p>

  <div class="indent gap">
    <p>1. &nbsp;<b>PRIMERA. OBJETO DEL CONTRATO</b>: <i>EL MANDATARIO</i> por cuenta y riesgo del <i>MANDANTE</i> queda facultado para solicitar, realizar radicar y retirar el trámite de ${i(e.tramite,36)} del vehículo de placas ${i(e.placa,12)}</p>
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
      <p style="text-align:left;margin-top:4px">${(e.mandanteNombre||"").toUpperCase()}</p>
      <p style="text-align:left">C.C. ${e.mandanteCedula||""}</p>
    </td>
    <td style="width:50%">
      <p><b>EL MANDATARIO</b></p>
      <div style="height:65px"></div>
      <div style="border-top:1px solid #000;width:210px"></div>
      <p style="text-align:left;margin-top:4px">${(e.mandatarioNombre||"").toUpperCase()}</p>
      <p style="text-align:left">C.C. ${e.mandatarioCedula||""}</p>
    </td>
  </tr></table>
</div></body></html>`,O=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],j=()=>{const e=new Date;return`${e.getDate()} de ${O[e.getMonth()]} de ${e.getFullYear()}`},S={id:"carta-mandato",name:"Carta Mandato",description:"Contrato de Mandato para trámites ante el Organismo de Tránsito y Transporte",fields:[{key:"fecha",label:"Fecha",placeholder:"6 de octubre de 2022",autoFill:j},{key:"ciudad",label:"Ciudad",placeholder:"Envigado"},{key:"mandanteNombre",label:"Nombre del Mandante",placeholder:"Andrés Enrique Ramírez Mejía"},{key:"mandanteCedula",label:"Cédula del Mandante",placeholder:"71.377.779"},{key:"mandatarioNombre",label:"Nombre del Mandatario",placeholder:"Yefrin David Ríos Mora"},{key:"mandatarioCedula",label:"Cédula del Mandatario",placeholder:"1036622381"},{key:"tramite",label:"Tipo de trámite",placeholder:"Traspaso"},{key:"placa",label:"Placa del vehículo",placeholder:"KMR-636"}],buildHtml:w},s=(e,t=30)=>e!=null&&e.trim()?`<u>${e.trim()}</u>`:`<u>${"&nbsp;".repeat(t)}</u>`,I=(e={})=>`<!DOCTYPE html>
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
    <p>${s(e.ciudad,20)}, ${s(e.fecha,28)}</p>
  </div>

  <p class="gap">A QUIEN INTERESE</p>

  <p class="gap">Yo, ${s(e.empleadorNombre,42)}, mayor de edad, identificado con <i>Cédula</i> N° ${s(e.empleadorCedula,16)}, en mi calidad de empleador, certifico que el señor(a) ${s(e.empleadoNombre,42)}, identificado con <i>Cédula</i> N° ${s(e.empleadoCedula,16)}, labora bajo mi dependencia desde el día ${s(e.fechaIngreso,20)}, desempeñando el cargo de <b>${s(e.cargo,28)}</b>, conduciendo el vehículo tipo taxi de placas ${s(e.placa,12)}.</p>

  <p class="gap">El (la) señor(a) ${s(e.empleadoNombre,30)} devenga actualmente unos ingresos mensuales de ${s(e.salario,20)}.</p>

  <p class="gap">La presente certificación se expide a solicitud del interesado(a) para los fines que estime convenientes.</p>

  <p style="margin-bottom:60px">Atentamente,</p>

  <p><b>${(e.empleadorNombre||"").toUpperCase()}</b></p>
  <div style="height:55px"></div>
  <div style="border-top:1px solid #000;width:210px"></div>
  <p style="text-align:left;margin-top:4px">${(e.empleadorNombre||"").toUpperCase()}</p>
  <p style="text-align:left">C.C. ${e.empleadorCedula||""}</p>
</div></body></html>`,R=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],z=()=>{const e=new Date;return`${e.getDate()} de ${R[e.getMonth()]} de ${e.getFullYear()}`},F={id:"carta-laboral",name:"Carta Laboral",description:"Certificación laboral para un conductor de taxi vinculado",fields:[{key:"ciudad",label:"Ciudad",placeholder:"Medellín"},{key:"fecha",label:"Fecha",placeholder:"6 de octubre de 2022",autoFill:z},{key:"empleadorNombre",label:"Nombre del Empleador",placeholder:"Romer Rolver Rios Sanchez"},{key:"empleadorCedula",label:"Cédula del Empleador",placeholder:"71699694"},{key:"empleadoNombre",label:"Nombre del Empleado",placeholder:"Andrés Enrique Ramírez Mejía"},{key:"empleadoCedula",label:"Cédula del Empleado",placeholder:"71.377.779"},{key:"cargo",label:"Cargo",placeholder:"Conductor de Taxi"},{key:"fechaIngreso",label:"Fecha de Ingreso",placeholder:"1 de marzo de 2023"},{key:"placa",label:"Placa del vehículo",placeholder:"KMR-636"},{key:"salario",label:"Ingresos mensuales",placeholder:"$ 1.500.000"}],buildHtml:I},L=(e={})=>`<!DOCTYPE html>
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
      <td><span class="lbl">Fecha:</span><span class="val">${e.fecha||""}</span></td>
      <td><span class="lbl">Hora:</span><span class="val">${e.hora||""}</span></td>
      <td><span class="lbl">Ciudad:</span><span class="val">${e.ciudad||""}</span></td>
      <td><span class="lbl">Agencia:</span><span class="val">${e.agencia||""}</span></td>
      <td><span class="lbl">Asesor Servicios Financieros:</span><span class="val">${e.asesor||""}</span></td>
    </tr>
    <tr>
      <td colspan="2"><span class="lbl">Nombre Cliente:</span><span class="val">${e.nombreCliente||""}</span></td>
      <td><span class="lbl">No. Identificación:</span><span class="val">${e.identificacion||""}</span></td>
      <td colspan="2"><span class="lbl">No. Obligación:</span><span class="val">${e.obligacion||""}</span></td>
    </tr>
    <tr><td colspan="5" class="section">INFORMACIÓN DE LA UTILIZACIÓN</td></tr>
    <tr>
      <td><span class="lbl">Monto Utilización:</span><span class="val">${e.montoUtilizacion||""}</span></td>
      <td><span class="lbl">Valor GMF:</span><span class="val">${e.valorGmf||""}</span></td>
      <td><span class="lbl">Costo Utilización:</span><span class="val">${e.costoUtilizacion||""}</span></td>
      <td colspan="2"><span class="lbl">Iva Costo Utilización:</span><span class="val">${e.ivaCostoUtilizacion||""}</span></td>
    </tr>
    <tr>
      <td><span class="lbl">Medio de Pago:</span><span class="val">${e.medioPago||""}</span></td>
      <td><span class="lbl">Código del Dispositivo:</span><span class="val">${e.codigoDispositivo||""}</span></td>
      <td><span class="lbl">Valor a entregar al cliente:</span><span class="val">${e.valorEntregarCliente||""}</span></td>
      <td colspan="2"><span class="lbl">Número de Operación:</span><span class="val">${e.numeroOperacion||""}</span></td>
    </tr>
  </table>
</div></body></html>`,H=()=>{const e=new Date;return`${String(e.getDate()).padStart(2,"0")}/${String(e.getMonth()+1).padStart(2,"0")}/${e.getFullYear()}`},P=()=>{const e=new Date;return`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`},U={id:"comprobante-cupo-rotativo",name:"Comprobante Cupo Rotativo",description:"Comprobante de utilización de cupo rotativo",fields:[{key:"fecha",label:"Fecha",placeholder:"31/10/2025",autoFill:H},{key:"hora",label:"Hora",placeholder:"13:08",autoFill:P},{key:"ciudad",label:"Ciudad",placeholder:"MEDELLIN(ANTIOQUIA)"},{key:"agencia",label:"Agencia",placeholder:"00571 MEDELLIN CC SAN DIEGO"},{key:"asesor",label:"Asesor Servicios Financieros",placeholder:"101717105"},{key:"nombreCliente",label:"Nombre Cliente",placeholder:"RIOS MORA YEFRIN DAVID"},{key:"identificacion",label:"No. Identificación",placeholder:"1036622381"},{key:"obligacion",label:"No. Obligación",placeholder:"0000005710000576"},{key:"montoUtilizacion",label:"Monto Utilización",placeholder:"$ 8,541,000.00"},{key:"valorGmf",label:"Valor GMF",placeholder:"$ 34,164.00"},{key:"costoUtilizacion",label:"Costo Utilización",placeholder:"$ 4,454.00"},{key:"ivaCostoUtilizacion",label:"Iva Costo Utilización",placeholder:"$ 846.00"},{key:"medioPago",label:"Medio de Pago",placeholder:"Efectivo"},{key:"codigoDispositivo",label:"Código del Dispositivo",placeholder:"10.122.10.1"},{key:"valorEntregarCliente",label:"Valor a entregar al cliente",placeholder:"$ 8,501,536.00"},{key:"numeroOperacion",label:"Número de Operación",placeholder:"20253041130006391"}],buildHtml:L},q=[S,F,U],p=1,g=816,h=1140,V=Math.round(g*p),G=Math.min(Math.round(h*p),820),Y=e=>e?a.jsx("span",{style:{fontSize:11,color:"#b91c1c",marginTop:2,display:"block"},children:e.message}):null,B=({html:e})=>{const t=r.useRef(null);return r.useEffect(()=>{var d;const o=t.current;if(!o)return;const n=o.contentDocument||((d=o.contentWindow)==null?void 0:d.document);n&&(n.open(),n.write(e),n.close())},[e]),a.jsx("div",{className:"doc-preview",style:{width:V,height:G},children:a.jsx("iframe",{ref:t,title:"Vista previa",style:{width:g,height:h,border:"none",transform:`scale(${p})`,transformOrigin:"top left",display:"block"}})})},W=({template:e,onBack:t})=>{const[o,n]=r.useState(!1),[d,m]=r.useState(!1),[b,f]=r.useState(()=>e.buildHtml({})),{register:x,handleSubmit:y,watch:N,setValue:C,formState:{errors:v}}=A({defaultValues:{}}),u=N();r.useEffect(()=>{const l=setTimeout(()=>f(e.buildHtml(u)),500);return()=>clearTimeout(l)},[u,e]);const $=async l=>{n(!0);try{await _(e.buildHtml(l),`${e.id}.pdf`)}finally{n(!1)}};return a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:"doc-workspace__preview",children:[a.jsx("p",{className:"doc-workspace__preview-label",children:"Vista previa"}),a.jsx(B,{html:b})]}),a.jsxs("div",{className:"doc-workspace__form",children:[a.jsx("p",{className:"doc-workspace__form-label",children:"Formulario"}),a.jsxs(k,{title:e.name,subtitle:e.description,onCancel:t,onSave:y($),saving:o,saveLabel:"Descargar PDF",cancelLabel:"Volver",children:[a.jsx("button",{type:"button",className:"doc-workspace__preview-toggle",onClick:()=>m(!0),children:"Vista previa"}),e.fields.map(l=>{const c=l.autoFill||(l.placeholder?()=>l.placeholder:null);return a.jsxs(M,{label:l.label,children:[a.jsxs("div",{className:c?"doc-workspace__field-row":void 0,children:[a.jsx("input",{className:T.input,placeholder:l.placeholder||"",...x(l.key)}),c&&a.jsx("button",{type:"button",className:"doc-workspace__autofill-btn",title:"Autocompletar",onClick:()=>C(l.key,c()),children:l.autoFill?"Hoy":"↺"})]}),Y(v[l.key])]},l.key)})]})]}),d&&a.jsxs("div",{className:"doc-preview-modal",children:[a.jsxs("div",{className:"doc-preview-modal__bar",children:[a.jsx("span",{className:"doc-preview-modal__title",children:"Vista previa"}),a.jsx("button",{className:"doc-preview-modal__close",onClick:()=>m(!1),"aria-label":"Cerrar",children:a.jsx(E,{icon:D})})]}),a.jsx("iframe",{srcDoc:b,className:"doc-preview-modal__frame",title:"Vista previa"})]})]})},ne=()=>{const[e,t]=r.useState(null);return a.jsxs("div",{className:`doc-templates${e?" doc-templates--selected":""}`,children:[a.jsxs("div",{className:"doc-templates__list",children:[a.jsx("p",{className:"doc-templates__list-title",children:"Plantillas disponibles"}),q.map(o=>a.jsxs("div",{className:`doc-templates__card${(e==null?void 0:e.id)===o.id?" doc-templates__card--active":""}`,onClick:()=>t(o),children:[a.jsx("div",{className:"doc-templates__card__name",children:o.name}),a.jsx("div",{className:"doc-templates__card__desc",children:o.description})]},o.id))]}),e?a.jsx(W,{template:e,onBack:()=>t(null)},e.id):a.jsx("div",{className:"doc-templates__hint",children:"Selecciona una plantilla para generar el PDF"})]})};export{ne as default};
