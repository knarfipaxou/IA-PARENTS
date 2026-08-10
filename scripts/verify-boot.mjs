#!/usr/bin/env node
/**
 * Vérification locale du boot (sans Expo Go) :
 * 1) tsc  2) jest  3) export iOS/web  4) smoke web Playwright
 */
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, existsSync, rmSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const BUILD_INFO = join(ROOT, 'constants/buildInfo.ts');
const PORT = Number(process.env.VERIFY_PORT || 19006);
const ART = '/tmp/cursor/artifacts/boot-verify';
const ART_PUB = '/opt/cursor/artifacts/boot-verify';

function log(step, msg) {
  console.log(`\n── ${step} ──\n${msg}`);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, CI: '1', ...opts.env },
    maxBuffer: 20 * 1024 * 1024,
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed (${r.status})`);
  return r;
}

function readBuildId() {
  const src = readFileSync(BUILD_INFO, 'utf8');
  const m = src.match(/BUILD_ID\s*=\s*'([^']+)'/);
  return m?.[1] || 'unknown';
}

async function waitForHttp(url, ms = 120000) {
  const start = Date.now();
  let lastErr = '';
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
      lastErr = `status ${res.status}`;
    } catch (e) {
      lastErr = e.message;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timeout waiting for ${url}: ${lastErr}`);
}

async function smokeWeb(buildId) {
  mkdirSync(ART, { recursive: true });
  mkdirSync(ART_PUB, { recursive: true });
  spawnSync('bash', ['-lc', `(pkill -f "expo start --web --port ${PORT}" || true)`]);
  await new Promise((r) => setTimeout(r, 500));

  let bootLog = '';
  const child = spawn('npx', ['expo', 'start', '--web', '--port', String(PORT)], {
    cwd: ROOT,
    env: { ...process.env, CI: '1', BROWSER: 'none', EXPO_NO_TELEMETRY: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (d) => { bootLog += d.toString(); });
  child.stderr.on('data', (d) => { bootLog += d.toString(); });

  try {
    await waitForHttp(`http://127.0.0.1:${PORT}`);
    // Premier bundle web souvent après le 200 HTML
    const readyStart = Date.now();
    while (Date.now() - readyStart < 90000) {
      if (/Web Bundled|Logs will appear/i.test(bootLog)) break;
      await new Promise((r) => setTimeout(r, 300));
    }
    await new Promise((r) => setTimeout(r, 1500));

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') pageErrors.push(msg.text());
    });

    let bodyText = '';
    let lastNavErr = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await page.goto(`http://127.0.0.1:${PORT}`, {
          waitUntil: 'domcontentloaded',
          timeout: 120000,
        });
        // Attendre contenu utile
        await page.waitForFunction(() => {
          const t = document.body?.innerText || '';
          return t.includes('BOOT OK')
            || t.includes('ROOT OK')
            || t.includes('Une photo du cahier')
            || t.includes('Choisir un enfant')
            || t.includes('Erreur au démarrage');
        }, { timeout: 90000 });
        bodyText = await page.innerText('body');
        lastNavErr = null;
        break;
      } catch (e) {
        lastNavErr = e;
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    if (lastNavErr && !bodyText) throw lastNavErr;

    const shot = join(ART, 'boot.png');
    await page.screenshot({ path: shot, fullPage: true });
    copyFileSync(shot, join(ART_PUB, 'boot.png'));

    const bad = [
      'Erreur au démarrage',
      "Cannot read property 'default' of undefined",
      'Cannot read properties of undefined',
      'Application has not been registered',
    ];
    const hit = bad.find((b) => bodyText.includes(b) || pageErrors.some((e) => e.includes(b)));
    const goodHints = ['ROOT OK', 'BOOT OK', 'Une photo du cahier', 'Choisir un enfant', 'CRÉER MA FAMILLE', buildId];
    const hasGood = goodHints.some((g) => bodyText.includes(g));

    const report = {
      buildId,
      hasGood,
      hit: hit || null,
      bodySnippet: bodyText.slice(0, 800),
      pageErrors: pageErrors.filter((e) => !/favicon|net::ERR_CONNECTION_REFUSED/.test(e)).slice(0, 20),
      screenshot: shot,
    };
    console.log(JSON.stringify(report, null, 2));
    await browser.close();

    if (hit) throw new Error(`Smoke web: erreur détectée (${hit})`);
    if (!hasGood) throw new Error('Smoke web: aucun écran attendu (ROOT/BOOT/welcome)');
    const fatal = report.pageErrors.filter((e) => /TypeError|ReferenceError|Cannot read/.test(e));
    if (fatal.length) throw new Error(`Smoke web: erreurs console JS\n${fatal.join('\n')}`);
  } finally {
    child.kill('SIGTERM');
    spawnSync('bash', ['-lc', `(pkill -f "expo start --web --port ${PORT}" || true)`]);
  }
}

async function main() {
  if (!process.env.SKIP_PW_INSTALL) {
    run('npx', ['playwright', 'install', 'chromium']);
  }

  const buildId = readBuildId();
  log('BUILD', buildId);

  log('1/4', 'TypeScript');
  run('npx', ['tsc', '--noEmit']);

  log('2/4', 'Jest');
  run('npm', ['test', '--', '--passWithNoTests']);

  log('3/4', 'Expo export iOS + web');
  const out = `/tmp/expo-verify-${Date.now()}`;
  if (existsSync(out)) rmSync(out, { recursive: true, force: true });
  run('npx', ['expo', 'export', '--platform', 'ios', '--platform', 'web', '--output-dir', out]);

  log('4/4', 'Smoke web Playwright');
  // Libérer le port si un debug précédent tourne
  spawnSync('bash', ['-lc', `(pkill -f "expo start --web --port ${PORT}" || true)`]);
  await new Promise((r) => setTimeout(r, 800));
  await smokeWeb(buildId);

  log('OK', `Boot vérifié localement pour ${buildId}`);
}

main().catch((e) => {
  console.error('\nVERIFY FAILED:', e.message);
  process.exit(1);
});
