export const applyPlaceholders = (template, driver) => {
  const today = new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const map = {
    '[NombreConductor]': driver.name ?? '',
    '[Cedula]': driver.idNumber ?? '',
    '[Telefono]': driver.phone ?? '',
    '[Vehiculo]': driver.defaultVehicle ?? '',
    '[Fecha]': today,
  }
  return Object.entries(map).reduce((text, [key, val]) => text.replaceAll(key, val), template)
}

export const buildDocHtml = (title, content) => `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; background: white; }
  .doc-main { margin: 60px 50px; }
  .doc-title { font-size: 16px; font-weight: bold; margin-bottom: 30px; text-align: center; }
  .doc-content { white-space: pre-wrap; line-height: 1.8; text-align: justify; }
</style>
</head>
<body>
<div class="doc-main">
  <div class="doc-title">${title}</div>
  <div class="doc-content">${content}</div>
</div>
</body>
</html>`
