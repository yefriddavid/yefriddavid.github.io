# Playwright en Ubuntu 26.04

## Problema

Playwright no puede descargar ni instalar sus propios navegadores en Ubuntu 26.04 porque aún no es una plataforma soportada oficialmente:

```
Error: ERROR: Playwright does not support chromium on ubuntu26.04-x64
```

## Solución: usar el Chrome del sistema

En lugar de que Playwright descargue Chromium, se usa el **Google Chrome instalado en el sistema** mediante la opción `channel: 'chrome'`.

### Requisitos

- Google Chrome instalado (`/usr/bin/google-chrome`)
- `playwright` instalado como dev dependency (sin browsers bundled)

```bash
npm install --save-dev playwright
# NO ejecutar: playwright install chromium  ← esto falla en Ubuntu 26
```

### Código de uso

```js
const { chromium } = require('playwright');

const browser = await chromium.launch({
  channel: 'chrome',        // usa el Chrome del sistema, no el bundled
  headless: true,
  args: ['--ignore-certificate-errors'],  // necesario si el dev server usa HTTPS
});

const page = await browser.newPage({
  ignoreHTTPSErrors: true,  // el dev server de Vite usa certificado auto-firmado
});

await page.goto('https://localhost:3000');
await page.screenshot({ path: 'screenshot.png' });
await browser.close();
```

### Por qué `ignoreHTTPSErrors` y `--ignore-certificate-errors`

El servidor de desarrollo de Vite (`npm start`) corre en **HTTPS** con un certificado auto-firmado. Sin estas opciones Playwright rechaza la conexión. No son necesarias contra un servidor de producción con certificado válido.

## Verificación

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-certificate-errors'] });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });
  await page.goto('https://localhost:3000');
  console.log('title:', await page.title());
  await browser.close();
})();
"
```

Salida esperada: `title: David Rios`
