// Deterministic seek-based renderer. Frame N is a pure function of N:
// seek(N/FPS) fully specifies the DOM, then we screenshot. Re-running produces
// byte-identical frames, which is what Law 3 actually asks for.
import { chromium } from '/home/clsandoval/cs/monorepo/apps/inheritance/frontend/node_modules/playwright-core/index.mjs';
import { mkdirSync, rmSync } from 'node:fs';

const DIR = '/tmp/claude-1000/-home-clsandoval-cs-monorepo/ba0262ab-dc9f-47d8-83a3-ddf973495452/scratchpad/film';
const FRAMES = DIR + '/frames';
const FPS = 30;

rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });

const browser = await chromium.launch({ channel: 'chromium', args: ['--force-device-scale-factor=1'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errs = [];
page.on('pageerror', e => errs.push(String(e).slice(0, 200)));

await page.goto('file://' + DIR + '/film.html', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

const dur = await page.evaluate(() => window.__duration);
const total = Math.round(dur * FPS);
console.log(`duration ${dur}s → ${total} frames @ ${FPS}fps`);

for (let i = 0; i < total; i++) {
  await page.evaluate(t => window.__seek(t), i / FPS);
  await page.screenshot({
    path: `${FRAMES}/f${String(i).padStart(5, '0')}.png`,
    animations: 'disabled',
  });
  if (i % 60 === 0) console.log('  frame', i, '/', total);
}

console.log('page errors:', errs.length);
errs.slice(0, 5).forEach(e => console.log('  !', e));
await browser.close();
console.log('done');
