// Tests statiques du support de cours (Node 18+, aucune dépendance).
// Lancer depuis la racine du dépôt :  node tests/check.mjs
// Vérifie : config.js, présence des pages, JavaScript inline compilable,
// encadrés ::: connus et fermés, blocs ??? fermés, liens internes valides,
// et l'absence de mentions internes (nombre de périodes).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const DIR = path.join(ROOT, 'cours');
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

// ---- config.js
const cfgSrc = fs.readFileSync(path.join(DIR, 'config.js'), 'utf8');
const ctx = {};
vm.runInNewContext(cfgSrc + '\nthis.COURSE = COURSE;', ctx);
const C = ctx.COURSE;
if (!C || !Array.isArray(C.chapters)) throw new Error('config.js : COURSE.chapters introuvable');

const files = new Set(fs.readdirSync(DIR).filter(f => f.endsWith('.html')));
const nums = new Set();
for (const ch of C.chapters) {
  if (!files.has(ch.file)) fail('config.js', `page manquante ${ch.file}`);
  if (ch.num) { if (nums.has(ch.num)) fail('config.js', `numéro en double ${ch.num}`); nums.add(ch.num); }
  for (const k of ['title']) if (!ch[k]) fail('config.js', `${ch.file} : champ ${k} manquant`);
  if (ch.duration) fail('config.js', `${ch.file} : champ duration (durée de chapitre = donnée interne, à ne pas publier)`);
  if (/chapitres? \d/.test(ch.prereq || '')) fail('config.js', `${ch.file} : prérequis numéroté, citer le titre`);
}
// numérotation continue des chapitres numérotés
const numbered = C.chapters.filter(c => /^\d+$/.test(c.num || '')).map(c => +c.num);
numbered.forEach((n, i) => { if (n !== i + 1) fail('config.js', `numérotation non continue : ${n} en position ${i + 1}`); });

// ---- pages
const BOXES = new Set(['retenir', 'attention', 'terrain', 'exo', 'info', 'carte', 'plus', 'fige']);
const META = /\b\d+\s*(p[ée]riodes?)\b|\b\d+\s*x\s*45\s*min|Durée proposée/i;

for (const f of [...files].sort()) {
  const html = fs.readFileSync(path.join(DIR, f), 'utf8');

  // JavaScript inline (hors markdown / code)
  const re = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1] || '';
    const type = (attrs.match(/type="([^"]+)"/) || [])[1];
    if (/src=/.test(attrs) || (type && !/^(module|text\/javascript)$/.test(type))) continue;
    try { new vm.Script(m[2], { filename: f }); }
    catch (e) { fail(f, `JavaScript invalide : ${e.message}`); }
  }

  // Markdown : encadrés et solutions
  const mdRe = /<script type="text\/markdown"[^>]*>([\s\S]*?)<\/script>/g;
  while ((m = mdRe.exec(html))) {
    const lines = m[1].split('\n');
    let open = 0, sol = 0, fence = false;
    lines.forEach((ln, i) => {
      const t = ln.trim();
      if (t.startsWith('```')) { fence = !fence; return; }
      if (fence) return;
      if (t === ':::') { open--; if (open < 0) { fail(f, `::: fermant en trop (« ${lines[i - 1]?.trim()} »)`); open = 0; } return; }
      const b = t.match(/^:::(\w+)/);
      if (b) { if (!BOXES.has(b[1])) fail(f, `encadré inconnu :::${b[1]}`); open++; return; }
      if (/^-{3,}$/.test(t) && open) fail(f, `coupure de diapo --- dans un encadré (sans effet) : la placer entre deux blocs`);
      if (t.startsWith('???')) sol = t === '???' ? sol - 1 : sol + 1;
      if (/^>\s/.test(t)) fail(f, `citation « > » non gérée par le moteur Markdown`);
    });
    if (open) fail(f, `${open} encadré(s) ::: non fermé(s)`);
    if (fence) fail(f, 'bloc de code ``` non fermé');
    if (sol) fail(f, 'bloc ??? non fermé');
  }

  // liens internes vers des pages
  const linkRe = /(?:href="|\]\()([a-z0-9-]+\.html)(?:#[^")]*)?[")]/g;
  while ((m = linkRe.exec(html))) if (!files.has(m[1])) fail(f, `lien vers une page inexistante : ${m[1]}`);

  // numéros de figures : « Fig. N.x » avec N = numéro du chapitre (outil : node tests/renumber-figures.mjs)
  const chNum = (C.chapters.find(c => c.file === f) || {}).num;
  if (/^\d+$/.test(chNum || '')) for (const mm of html.matchAll(/Fig\. (\d+)\.\d+/g)) if (mm[1] !== chNum) fail(f, `${mm[0]} dans le chapitre ${chNum} (lancer node tests/renumber-figures.mjs)`);

  // renvois numérotés « chapitre 4 » : ils cassent à chaque renumérotation, on cite le titre
  if (!['guide.html', 'index.html'].includes(f)) {
    for (const mm of html.matchAll(/chapitres? \d+/g)) fail(f, `renvoi numéroté « ${mm[0]} » : citer le titre du chapitre`);
  }

  // données internes à ne pas publier
  if (f !== 'guide.html' && META.test(html)) fail(f, 'mention d\'un nombre de périodes (donnée interne)');
}

// liens « ch » des questions du quiz
const quiz = fs.readFileSync(path.join(DIR, 'quiz.html'), 'utf8');
for (const mm of quiz.matchAll(/"ch"\s*:\s*"([^"]+)"/g)) if (!files.has(mm[1])) fail('quiz.html', `question liée à une page inexistante : ${mm[1]}`);

if (errors.length) {
  console.error(`✗ ${errors.length} problème(s)\n- ` + errors.join('\n- '));
  process.exit(1);
}
console.log(`✓ ${files.size} pages, ${C.chapters.length} entrées de menu : aucun problème.`);
