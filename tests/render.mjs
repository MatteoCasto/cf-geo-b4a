// Test de rendu (facultatif) : ouvre chaque page dans Edge ou Chrome sans fenêtre
// et signale toute erreur JavaScript, en lecture puis en diaporama (#diapo-1).
// Lancer depuis la racine :  node tests/render.mjs
// Les diapos trop longues (encore trop hautes une fois réduites) sont listées pour information :
// à couper par --- ou à alléger avec :::plus (voir PRINCIPE-MULTI-ROLES.md).
// Si aucun navigateur n'est trouvé, le test est simplement ignoré.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const DIR = path.join(ROOT, 'cours');
const CANDIDATES = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const browser = CANDIDATES.find(p => fs.existsSync(p));
if (!browser) { console.log('– aucun navigateur trouvé : test de rendu ignoré'); process.exit(0); }

// bruit sans rapport avec nos pages (manifeste bloqué en file://, extensions du navigateur)
const IGNORE = /manifest|chrome-extension:|ProtocolLaunch|favicon/i;
const pages = fs.readdirSync(DIR).filter(f => f.endsWith('.html')).sort();
const errors = [], long = [];
for (const f of pages) {
  for (const mode of ['', '#diapo-1']) {
    const url = pathToFileURL(path.join(DIR, f)).href + mode;
    const r = spawnSync(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--enable-logging=stderr', '--v=0',
      '--window-size=1280,720', '--virtual-time-budget=3000', '--dump-dom', url], { encoding: 'utf8', timeout: 60000 });
    const tag = mode ? `${f} (diaporama)` : f;
    const log = (r.stderr || '').split('\n').filter(l => /CONSOLE/.test(l) && !IGNORE.test(l));
    log.forEach(l => errors.push(`${tag}: ${l.replace(/^.*?CONSOLE[^\]]*\]\s*/, '')}`));
    if (!r.stdout || !/<main/.test(r.stdout)) { errors.push(`${tag}: page non rendue`); continue; }
    if (mode) {
      const over = ((r.stdout.match(/<html[^>]*data-overflow="([^"]*)"/) || [])[1] || '');
      if (!/<html[^>]*class="[^"]*\bpres\b/.test(r.stdout)) errors.push(`${tag}: le diaporama ne s'ouvre pas`);
      if (over) long.push(`${f} : diapo${over.includes(',') ? 's' : ''} ${over.replace(/,/g, ', ')}`);
    }
  }
}
if (long.length) console.log(`ℹ diapos trop longues (à couper par --- ou alléger avec :::plus)\n  ` + long.join('\n  '));
if (errors.length) { console.error(`✗ ${errors.length} erreur(s) au rendu\n- ` + errors.join('\n- ')); process.exit(1); }
console.log(`✓ rendu de ${pages.length} pages sans erreur JavaScript, en lecture et en diaporama`);
