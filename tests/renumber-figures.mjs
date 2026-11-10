// Outil : renumérote les « Fig. X.Y » de chaque page selon son numéro de chapitre dans config.js.
// Lancer depuis la racine :  node tests/renumber-figures.mjs   (puis node tests/check.mjs)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const DIR = path.join(ROOT, 'cours');
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(DIR, 'config.js'), 'utf8') + '\nthis.COURSE = COURSE;', ctx);
for (const ch of ctx.COURSE.chapters) {
  if (!/^\d+$/.test(ch.num || '')) continue;
  const f = path.join(DIR, ch.file), src = fs.readFileSync(f, 'utf8');
  const out = src.replace(/Fig\. \d+\.(\d+)/g, `Fig. ${ch.num}.$1`);
  if (out !== src) { fs.writeFileSync(f, out); console.log(`${ch.file} → Fig. ${ch.num}.x`); }
}
