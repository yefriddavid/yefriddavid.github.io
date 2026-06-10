const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Load env file — prefer .env.production if it exists, fallback to .env.development
function loadEnv() {
  const files = ['.env.production', '.env.development'];
  for (const file of files) {
    const filePath = path.resolve(__dirname, file);
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = val;
    }
    console.log(`Loaded env from ${file}`);
    break;
  }
}

loadEnv();

const USERNAME = process.env.TEST_USERNAME || 'yefriddavid';
const PASSWORD = process.env.TEST_PASSWORD || '';
const BASE_URL = process.env.TEST_URL || 'https://localhost:3000';
const LOGIN_URL = `${BASE_URL}/login/super`;

(async () => {
  console.log(`Testing login: ${USERNAME} @ ${LOGIN_URL}`);

  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--ignore-certificate-errors'] });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));

  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });

  try {
    await page.waitForSelector('input[type="text"]', { timeout: 8000 });
  } catch(e) {
    console.log('Login form did not appear, URL:', page.url());
  }

  const user = await page.$('input[type="text"]');
  const pass = await page.$('input[type="password"]');

  if (user) await user.fill(USERNAME);
  if (pass) await pass.fill(PASSWORD);

  const btn = await page.$('button.login-page__btn');
  if (btn) {
    await btn.click();
    console.log('Submit clicked');
  } else {
    console.log('ERROR: submit button not found');
  }

  await page.waitForTimeout(7000);
  await page.screenshot({ path: '/tmp/login_result.png' });

  const finalUrl = page.url();
  const success = !finalUrl.includes('/login');
  console.log(success ? '✓ LOGIN OK — URL:' : '✗ LOGIN FAILED — URL:', finalUrl);

  if (!success) {
    console.log('Relevant logs:');
    consoleLogs.forEach(l => {
      if (!l.text.includes('color:') && !l.text.includes('vite') && !l.text.includes('React DevTools'))
        console.log(`  [${l.type}] ${l.text.substring(0, 200)}`);
    });
  }

  await browser.close();
  process.exit(success ? 0 : 1);
})();
