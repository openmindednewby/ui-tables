import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(HERE, '../../../../../../E2ETests/package.json'));
const { chromium, devices } = require('playwright');

const FIXTURE = pathToFileURL(path.join(HERE, 'fixture.html')).href;
const VARIANTS = ['before', 'A', 'B', 'C', 'D'];
const OPTIONS = ['A', 'B', 'C', 'D'];
const ANCHOR_TOP = 140;
const INVENTORY = ['count', 'rows', 'first', 'prev', 'next', 'last'];
const COMPACT_HIDDEN = ['rows', 'first', 'last'];
const PROFILES = {
  mobile: { device: { ...devices['Galaxy S5'], deviceScaleFactor: 2 }, size: [360, 640], anchored: true },
  desktop: { device: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }, size: [1280, 800], anchored: false },
};

function measure() {
  const lum = (c) => {
    const f = c.map((x) => { const s = x / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
  };
  const parse = (s) => s.match(/[\d.]+/g).map(Number);
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const b = parse(getComputedStyle(e).backgroundColor);
      if (b.length === 3 || b[3] > 0) return b.slice(0, 3);
    }
    return [255, 255, 255];
  };
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const texts = [...document.querySelectorAll('body *')].filter((el) => visible(el)
    && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !['SCRIPT', 'STYLE'].includes(el.tagName));
  const contrast = texts.filter((el) => !el.closest('[disabled]')).map((el) => {
    const cs = getComputedStyle(el);
    const a = lum(parse(cs.color).slice(0, 3)); const b = lum(bgOf(el));
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const px = parseFloat(cs.fontSize);
    const need = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700) ? 3 : 4.5;
    return { t: el.textContent.trim().slice(0, 30), ratio: Math.round(ratio * 100) / 100, need };
  });
  const overflow = texts.filter((el) => {
    const range = document.createRange(); range.selectNodeContents(el);
    const t = range.getBoundingClientRect(); const box = el.getBoundingClientRect(); const par = el.parentElement.getBoundingClientRect();
    return el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== 'inline' || t.right > par.right + 1 || t.left < par.left - 1 || t.right > innerWidth || box.right > innerWidth;
  }).map((el) => el.textContent.trim().slice(0, 30));
  const small = [...document.querySelectorAll('button, input, .side a')].filter(visible).map((el) => {
    const r = el.getBoundingClientRect(); return { t: el.textContent.trim().slice(0, 20) || el.getAttribute('aria-label'), w: r.width, h: r.height };
  }).filter((x) => x.w < 44 || x.h < 44);
  const controls = [...document.querySelectorAll('.filters input, .filters .sel, .filters > button')].filter(visible).map((el) => el.getBoundingClientRect());
  const misaligned = [];
  controls.forEach((a, i) => controls.slice(i + 1).forEach((b) => {
    const overlap = a.top < b.bottom && b.top < a.bottom;
    if (overlap && (Math.abs(a.top - b.top) > 1 || Math.abs(a.height - b.height) > 1)) misaligned.push([a.top, b.top, a.height, b.height]);
  }));
  const items = Object.fromEntries([...document.querySelectorAll('[data-item]')].map((el) => [el.dataset.item, visible(el)]));
  const part = (n) => document.querySelector(`[data-part="${n}"]`).getBoundingClientRect();
  const [f, p, t] = [part('filters'), part('pager'), part('table')];
  return {
    contrastFails: contrast.filter((c) => c.ratio < c.need), minContrast: Math.min(...contrast.map((c) => c.ratio)),
    overflow, small, misaligned, items, hScroll: document.documentElement.scrollWidth > innerWidth,
    gaps: { filtersToPager: Math.round(p.top - f.bottom), pagerToTable: Math.round(t.top - p.bottom), tableToPager: Math.round(p.top - t.bottom) },
    pagerHeight: Math.round(p.height), docHeight: document.documentElement.scrollHeight,
  };
}

const inventoryOk = (vp, items) => (vp === 'mobile'
  ? ['count', 'prev', 'next'].every((k) => items[k]) && COMPACT_HIDDEN.every((k) => !items[k])
  : INVENTORY.every((k) => items[k]));
const seen = (vp, items) => [...INVENTORY.filter((k) => items[k]), ...(vp === 'mobile' ? ['compact'] : [])];

const browser = await chromium.launch();
for (const [vp, profile] of Object.entries(PROFILES)) {
  const context = await browser.newContext(profile.device);
  const page = await context.newPage();
  const results = {};
  for (const v of VARIANTS) {
    await page.goto(`${FIXTURE}?v=${v}`, { waitUntil: 'load', timeout: 30000 });
    await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))]));
    results[v] = await page.evaluate(measure);
    await page.screenshot({ path: path.join(HERE, `${vp}-${v}-full.png`), fullPage: true });
    if (profile.anchored) {
      await page.evaluate((top) => { const b = document.querySelector('[data-part="filters"]').getBoundingClientRect().bottom + scrollY; scrollTo(0, Math.max(0, b - top)); }, ANCHOR_TOP);
    }
    await page.screenshot({ path: path.join(HERE, `${vp}-${v}.png`) });
    console.log(vp, v, JSON.stringify(results[v].gaps), 'pagerH', results[v].pagerHeight, 'doc', results[v].docHeight, 'minC', results[v].minContrast);
  }
  await context.close();
  const all = VARIANTS.map((v) => results[v]);
  const verdict = (ok) => (ok ? 'pass' : 'fail');
  const pair = { route: 'fixture.html (contacts screen)', state: 'page 2 of 2, 25 rows per page, no selection, no filter', fixture: '6 sample contacts of 31', viewport: `${profile.size[0]}x${profile.size[1]}`, scrollAnchor: profile.anchored ? `filters bottom edge at y=${ANCHOR_TOP}` : 'page top', crop: 'viewport' };
  const id = (o) => `contacts-${vp}-${o}`;
  const out = {
    viewport: profile.size.join('x'),
    method: 'Static fixture carrying ui-tables styles.ts values; Playwright device descriptor; not the react-native-web build',
    checks: {
      contrast: verdict(all.every((r) => r.contrastFails.length === 0)),
      cvd: 'n/a -- spacing and placement only; no option adds or changes a colour meaning',
      textFit: verdict(all.every((r) => r.overflow.length === 0 && !r.hScroll)),
      tapSize: verdict(all.every((r) => r.small.length === 0)),
      formAlignment: verdict(all.every((r) => r.misaligned.length === 0)),
      smallSize: 'n/a -- no logo, mark or icon in this change',
    },
    pairMethod: 'same-steps',
    inventoryScope: vp === 'mobile' ? 'rows, First and Last hidden by the unchanged compact layout (item 7)' : 'all six controls rendered; compact layout unchanged below 640px',
    options: Object.fromEntries(OPTIONS.map((o) => [id(o), {
      inventory: inventoryOk(vp, results[o].items) ? '7/7' : 'lost',
      items: { before: seen(vp, results.before.items), after: seen(vp, results[o].items) },
      gaps: results[o].gaps, minContrast: results[o].minContrast,
    }])),
    beforeGaps: results.before.gaps,
    frames: OPTIONS.flatMap((o) => ['before', 'after'].map((side) => ({
      option: id(o), shot: 'contacts', side, build: side === 'before' ? 'current' : `option-${o}`, pair,
      visibleItems: { before: seen(vp, results.before.items), after: seen(vp, results[o].items) },
    }))),
    failures: Object.fromEntries(VARIANTS.map((v) => [v, { contrast: results[v].contrastFails, overflow: results[v].overflow, small: results[v].small, misaligned: results[v].misaligned, hScroll: results[v].hScroll }])),
  };
  fs.writeFileSync(path.join(HERE, `checks-${vp}.json`), JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(HERE, `heights-${vp}.json`), JSON.stringify(Object.fromEntries(VARIANTS.map((v) => [v, results[v].docHeight]))));
  console.log(vp, JSON.stringify(out.checks), 'inventory', Object.values(out.options).map((x) => x.inventory).join(','), JSON.stringify(out.failures).slice(0, 700));
}
await browser.close();
