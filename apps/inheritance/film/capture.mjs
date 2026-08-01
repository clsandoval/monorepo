// Deterministic capture of real app screens for the launch film.
// Truth pass: every frame is the running app with seeded real data. No mockups.
import { chromium } from '/home/clsandoval/cs/monorepo/apps/inheritance/frontend/node_modules/playwright-core/index.mjs';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5199';
const OUT = '/tmp/claude-1000/-home-clsandoval-cs-monorepo/ba0262ab-dc9f-47d8-83a3-ddf973495452/scratchpad/shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chromium' });
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
});
const page = await ctx.newPage();
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 160)));

const shot = async (name) => {
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot:', name, '| url:', page.url());
};

// 1. Public landing
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await shot('01-landing');

// 2. Auth
await page.goto(BASE + '/auth', { waitUntil: 'networkidle' });
await shot('02-auth');

// 3. Sign in as the seeded attorney
try {
  await page.fill('input[type="email"]', 'alpha@example.test');
  await page.fill('input[type="password"]', 'test-password-123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3500);
  console.log('after signin url:', page.url());
} catch (e) { console.log('SIGNIN FAILED:', String(e).slice(0, 200)); }
await shot('03-after-signin');

// 4. Case list
await page.goto(BASE + '/cases', { waitUntil: 'networkidle' });
await shot('04-cases');

// 5. The seeded case — find its link
const href = await page.evaluate(() => {
  const a = [...document.querySelectorAll('a[href*="/cases/"]')]
    .map(x => x.getAttribute('href'))
    .filter(h => h && h !== '/cases/new' && h !== '/cases');
  return a[0] || null;
});
console.log('case href:', href);
if (href) {
  await page.goto(BASE + href, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await shot('05-case');

  // Scroll through whatever is rendered, capturing the long view
  for (let i = 1; i <= 4; i++) {
    await page.evaluate(y => window.scrollTo(0, y * 700), i);
    await shot(`06-case-scroll-${i}`);
  }
}

console.log('CONSOLE ERRORS:', errs.length);
errs.slice(0, 8).forEach(e => console.log('  !', e));
await browser.close();
