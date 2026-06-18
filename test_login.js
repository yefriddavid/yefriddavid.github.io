const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// GOTCHAS — read this before touching the script (saves re-discovering all of
// this from scratch in a future session):
//
// 1. Playwright can't install its own Chromium on this Ubuntu version
//    ("Playwright does not support chromium on ubuntu26.04-x64"). Always launch
//    with `channel: 'chrome'` to use the system's Google Chrome instead, and
//    never run `playwright install chromium`. See docs/playwright-setup.md.
//
// 2. The Vite dev server (`npm start`) serves HTTPS with a self-signed cert.
//    Both `args: ['--ignore-certificate-errors']` (on launch) AND
//    `ignoreHTTPSErrors: true` (on the browser context) are required, or every
//    request gets rejected.
//
// 3. The app uses **BrowserRouter**, not HashRouter (CLAUDE.md's "pending:
//    remove HashRouter" note is stale — the migration already happened).
//    Don't navigate to `/#/login`; go straight to `/login`. Also: navigating
//    to `/` does NOT redirect to `/login` — `/` is the public `aboutMe`
//    landing page, reachable by anyone, logged in or not.
//
// 4. The regular login form (`/login`) has a simple math captcha
//    ("8 + 2 = ?") that changes every load. Read it from
//    `.login-page__captcha-challenge`, compute the sum, and fill it into
//    `.login-page__captcha-input` before clicking submit — otherwise the
//    submit silently fails with "Respuesta incorrecta".
//
// 5. Don't use `waitUntil: 'networkidle'` on any page navigation that happens
//    *after* login. Firestore keeps a persistent WebChannel connection open
//    for realtime listeners, so the network never goes idle and the
//    navigation call hangs until Playwright's timeout. Use `'load'` (or
//    `'domcontentloaded'`) and an explicit `waitForTimeout`/`waitForURL`
//    instead.
//
// 6. After a successful regular login, the app redirects to `/selectApp` (an
//    app picker: Finance / Taxi / Domótica / etc.), not into a specific
//    module. Click the app card by its visible text (e.g.
//    `page.click('text=Finance')`) to actually enter a module — there is no
//    direct deep-link that skips this picker on first load.
//
// 7. There are TWO separate login surfaces:
//      - `/login`       — regular tenant login, has the math captcha above.
//      - `/login/super` — super-admin login, no captcha.
//    Both currently accept the same TEST_USERNAME / TEST_PASSWORD account.
//
// 8. NEVER hardcode real credentials in this file — it's tracked in git and
//    this repo's remote (yefriddavid.github.io) is PUBLIC. Credentials must
//    only ever come from `.env.development` / `.env.production` (both
//    gitignored) via TEST_USERNAME / TEST_PASSWORD, loaded below.
// ─────────────────────────────────────────────────────────────────────────────

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

function newBrowserAndPage() {
  return (async () => {
    const browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
      args: ['--ignore-certificate-errors'],
    });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    return { browser, page };
  })();
}

// Regular tenant login at /login — solves the math captcha automatically.
// Resolves with { browser, page } left open and positioned at /selectApp, so
// the caller can keep navigating (e.g. page.click('text=Finance')).
async function loginRegular({ enterApp } = {}) {
  const { browser, page } = await newBrowserAndPage();

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  await page.fill('input[name="username"]', USERNAME);
  await page.fill('input[name="password"]', PASSWORD);

  const challenge = await page.textContent('.login-page__captcha-challenge');
  const [a, b] = challenge.match(/\d+/g).map(Number);
  await page.fill('.login-page__captcha-input', String(a + b));

  await page.click('.login-page__btn');
  await page.waitForURL(/selectApp/, { timeout: 10000 });
  await page.waitForTimeout(1000);

  if (enterApp) {
    await page.click(`text=${enterApp}`);
    await page.waitForTimeout(2000);
  }

  return { browser, page };
}

// Super-admin login at /login/super — no captcha on this surface.
async function loginSuper() {
  const { browser, page } = await newBrowserAndPage();

  const consoleLogs = [];
  page.on('console', (msg) => consoleLogs.push({ type: msg.type(), text: msg.text() }));

  await page.goto(`${BASE_URL}/login/super`, { waitUntil: 'domcontentloaded', timeout: 15000 });

  try {
    await page.waitForSelector('input[type="text"]', { timeout: 8000 });
  } catch (e) {
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
  return { browser, page, consoleLogs };
}

module.exports = { loginRegular, loginSuper, USERNAME, PASSWORD, BASE_URL };

// Run directly with `node test_login.js` to sanity-check regular login works.
if (require.main === module) {
  (async () => {
    console.log(`Testing regular login: ${USERNAME} @ ${BASE_URL}/login`);
    const { browser, page } = await loginRegular();
    const finalUrl = page.url();
    const success = finalUrl.includes('/selectApp');
    console.log(success ? '✓ LOGIN OK — URL:' : '✗ LOGIN FAILED — URL:', finalUrl);
    await page.screenshot({ path: '/tmp/login_result.png' });
    await browser.close();
    process.exit(success ? 0 : 1);
  })();
}
