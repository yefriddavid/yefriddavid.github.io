import{E as P}from"./jspdf.es.min-DTiF34wb.js";import U from"./html2canvas.esm-CBrSDip1.js";const w=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],z=["","primero","segundo","tercero","cuarto","quinto","sexto","séptimo","octavo","noveno","décimo","undécimo","duodécimo","décimo tercero","décimo cuarto","décimo quinto","décimo sexto","décimo séptimo","décimo octavo","décimo noveno","vigésimo","vigésimo primero","vigésimo segundo","vigésimo tercero","vigésimo cuarto","vigésimo quinto","vigésimo sexto","vigésimo séptimo","vigésimo octavo","vigésimo noveno","trigésimo","trigésimo primero"];function S(a){if(!a)return null;const e=new Date(a+"T12:00:00");return isNaN(e)?null:e}function M(a){var e;return(e=z[a])!=null?e:String(a)}function x(a){var e;return(e=w[a])!=null?e:""}function b(a){const e=parseInt(a,10);if(isNaN(e)||e<0)return"";if(e===0)return"cero";const t=["","un","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez","once","doce","trece","catorce","quince","dieciséis","diecisiete","dieciocho","diecinueve"],l=["","","veinte","treinta","cuarenta","cincuenta","sesenta","setenta","ochenta","noventa"],n=["","ciento","doscientos","trescientos","cuatrocientos","quinientos","seiscientos","setecientos","ochocientos","novecientos"];if(e===100)return"cien";if(e===1e3)return"mil";if(e===1e6)return"un millón";if(e>=1e6){const o=Math.floor(e/1e6);return(o===1?"un millón":b(o)+" millones")+(e%1e6?" "+b(e%1e6):"")}if(e>=1e3){const o=Math.floor(e/1e3);return(o===1?"mil":b(o)+" mil")+(e%1e3?" "+b(e%1e3):"")}if(e>=100)return n[Math.floor(e/100)]+(e%100?" "+b(e%100):"");if(e>=20){const o=Math.floor(e/10),_=e%10;return l[o]+(_?" y "+t[_]:"")}return t[e]}function H(a){const e=parseInt(a,10);return isNaN(e)?String(a):b(e)}function j(a){return a?b(parseInt(a,10)):""}function k(a){const e=parseInt(String(a).replace(/\D/g,""),10);return isNaN(e)?"":"$"+e.toLocaleString("es-CO")}function W(a,e=!1){var C,T,$,q;const t=a.tenant||{},l=a.guarantor||{},n=a.owner||{},o=a.property||{},_=a.rental||{},g=a.contract||{},u=a.account||{},E=parseInt(String(_.value||"0").replace(/\D/g,""),10),N=b(E).toUpperCase(),f=k(E),s=S(_.start_date),c=S(g.date),D=s?s.getDate():"",A=s?M(s.getDate()):"",h=s?x(s.getMonth()):"",p=s?s.getFullYear():"",v=s?j(p):"",i=c?c.getDate():"",d=c?M(c.getDate()):"",m=c?x(c.getMonth()):"",r=c?c.getFullYear():"",y=c?j(r):"",R=H(_.duration||"").toUpperCase(),I=(n.full_name||"").toUpperCase(),O=(t.full_name||"").toUpperCase(),L=(l.full_name||"").toUpperCase();return`<!DOCTYPE html>
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

<div class="main">
  <div class="title">
    <center><h3>CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA</h3></center>
  </div>

  <div class="contrctInfo">
    <span><b>DIRECCIÓN DEL INMUEBLE:</b> ${o.full_address||""}</span>
    <span><b>ARRENDADOR:</b> ${I}. CC. ${((C=n.identification)==null?void 0:C.number)||""}</span>
    <span><b>ARRENDATARIO:</b> ${O}. CC. ${((T=t.identification)==null?void 0:T.number)||""}</span>
    <span><b>CANON MENSUAL:</b> ${N} (${f})</span>
    <span><b>DURACIÓN DEL CONTRATO:</b> ${R} (${_.duration||""})</span>
    <span><b>FECHA DE INICIACIÓN DEL CONTRATO:</b>
      ${A?A.charAt(0).toUpperCase()+A.slice(1):""} (${D}) de ${h} del ${v} (${p})
    </span>
  </div>

  <div class="clausules">
    <p class="justify">
      Entre los suscritos a saber: <b>${I}</b>, mayor de edad, domiciliado en la ciudad de
      ${g.city||""}, identificado con cédula de ciudadanía, cuyo número aparece al pie
      de su firma, quien en adelante se denominará <b>EL ARRENDADOR</b> de una parte, y de la otra, el señor
      <b>${O}</b>, mayor de edad, identificado como aparece al pié de su respectiva firma,
      quien se denominará <b>EL ARRENDATARIO</b>, se ha celebrado un contrato de arrendamiento que
      se regirá por las siguientes cláusulas:
    </p>

    <p class="justify">
      <b>PRIMERA:</b> EL ARRENDADOR entrega en arrendamiento al ARRENDATARIO el inmueble ubicado en
      <b>${o.full_address||""}</b>${o.appartment_number?", apartamento No. "+o.appartment_number:""},
      municipio de ${o.city||""}, departamento de ${o.state||""}${o.urbanization_name?", urbanización "+o.urbanization_name:""},
      para ser destinado única y exclusivamente a vivienda urbana del ARRENDATARIO y su familia.
    </p>

    <p class="justify">
      <b>SEGUNDA:</b> El término de arrendamiento será de ${R} (${_.duration||""}) meses contado a partir del día
      ${A} (${D}) del mes de ${h} del año ${v} (${p}).
    </p>

    <p class="justify">
      <b>TERCERA:</b> El precio del arrendamiento es la suma de <b>${N} MONEDA LEGAL COLOMBIANA
      (${f})</b> mensual, suma que deberá ser cancelada dentro de los cinco (5) primeros días de cada
      periodo. Dicha suma se consignará en la cuenta de ${u.type||""} de ${u.bank_name||""} No. ${u.number||""}
      a nombre de <b>${(u.name||n.full_name||"").toUpperCase()}</b> y se enviará comprobante de pago al <b>EL ARRENDADOR</b>.
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

<!--
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
-->
<p>
  <b>NOVENA: PREAVISO Y PRÓRROGA AUTOMÁTICA.</b> Las partes acuerdan que, si
  <b>EL ARRENDATARIO</b> decide no renovar el presente contrato al vencimiento del plazo inicial o de sus prórrogas,
  deberá notificarlo por escrito a <b>EL ARRENDADOR</b> con una antelación no menor a cuarenta y cinco (45) días
  calendario. De no recibirse dicha comunicación en el tiempo y forma pactados, el contrato se entenderá prorrogado
  automáticamente por un periodo igual al inicialmente pactado y bajo las mismas condiciones.
</p>

<p>
  <b>PARÁGRAFO: INCUMPLIMIENTO DEL PREAVISO.</b> En caso de que <b>EL ARRENDATARIO</b> desocupe el inmueble al
  vencimiento del plazo sin haber otorgado el preaviso de cuarenta y cinco (45) días aquí establecido, se obligará
  a pagar a <b>EL ARRENDADOR</b> una suma equivalente a un (1) canon de arrendamiento mensual a título de
  indemnización por falta de preaviso. Asimismo, la entrega anticipada del inmueble antes del vencimiento del
  plazo contractual obligará a <b>EL ARRENDATARIO</b> al pago de los cánones restantes hasta completar el periodo
  vigente, salvo acuerdo en contrario consignado por escrito.
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
      Presente el señor (a) <b>${L}</b>, mayor de edad, identificado con la cédula de ciudadanía
      No. <b>${(($=l.identification)==null?void 0:$.number)||""}</b>, expedida en ${((q=l.identification)==null?void 0:q.city)||""},
      obrando en mi condición de <b>COARRENDATARIO</b> del señor (a) <b>${O}</b> manifiesto
      que acepto en todas sus partes el presente contrato, en especial mi calidad de coarrendatario.
    </p>

    <p class="justify">
      Para constancia se firma este contrato en la ciudad de ${g.city||""} al
      ${d} (${i}) día del mes de
      ${m?m.charAt(0).toUpperCase()+m.slice(1):""}
      del año ${y} (${r}).
    </p>
  </div>

  <br/><br/><br/><br/><br/><br/><br/>

  <div class="sign">
    <p><b>ARRENDADOR:</b></p>
    <pre><div class="info">
_________________________________________
${I}
CC No. ________________________ De ____________________________
</div></pre>
  </div>

  <div class="sign">
    <p><b>ARRENDATARIO:</b></p>
    <pre><div class="info">
_________________________________________
${O}
CC No. ________________________ De ____________________________
</div></pre>
  </div>

  <div class="sign">
    <p><b>COARRENDATARIO:</b></p>
    <pre><div class="info">
_________________________________________
${L}
CC No. ________________________ De ____________________________

</div></pre>
  </div>

</div>
</body>
</html>`}async function V(a,e){var l;const t=document.createElement("div");t.style.cssText="position:fixed;left:-9999px;top:0;width:816px;background:#fff;font-family:Arial,Helvetica,sans-serif;",t.innerHTML=a,document.body.appendChild(t);try{const n=await U(t,{scale:2,useCORS:!0,backgroundColor:"#ffffff",logging:!1}),o=new P({unit:"mm",format:"letter",orientation:"portrait"}),_=o.internal.pageSize.getWidth(),g=o.internal.pageSize.getHeight(),u=10,E=_-u*2,N=g-u*2,f=n.width/E,s=N*f,c=t.querySelectorAll("p, h3, .sign, .title, .contrctInfo"),D=new Set([0,n.height]);c.forEach(i=>{D.add((i.offsetTop+i.offsetHeight)*2)});const A=[...D].sort((i,d)=>i-d),h=(i,d,m)=>{const r=d-i,y=r/f,R=document.createElement("canvas");R.width=n.width,R.height=r,R.getContext("2d").drawImage(n,0,i,n.width,r,0,0,n.width,r),m||o.addPage(),o.addImage(R.toDataURL("image/jpeg",.95),"JPEG",u,u,E,y)};let p=0,v=!0;for(;p<n.height;){const i=p+s;let d;if(i>=n.height)d=n.height;else{const m=A.filter(r=>r>p&&r<=i);m.length>0?d=m[m.length-1]:d=(l=A.find(r=>r>i))!=null?l:n.height}h(p,d,v),v=!1,p=d}o.save(e||"documento.pdf")}finally{document.body.removeChild(t)}}async function F(a,e){var n;const t=W(a,!1),l=e||`Contrato_${(((n=a.tenant)==null?void 0:n.full_name)||"Sin_nombre").replace(/\s+/g,"_")}.pdf`;await V(t,l)}export{F as a,W as b,V as g};
