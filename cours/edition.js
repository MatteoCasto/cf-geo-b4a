/* =========================================================================
   MODE ÉDITION — maintenir le cours sans outil de développement.
   Aucun contenu de cours ici. Démarre à l'événement « cours:ready » émis par app.js.

   1. Console (imitation de l'invite de commandes) en bas du menu. Le mot de passe
      active le mode édition ; config.js ne contient que son EMPREINTE (SHA-256).
      Commandes : aide · ver · cls · enregistrer · quitter.
   2. En mode édition, tout ce que la lecture cache devient visible : versions figées
      (:::fige), coupures de diapo (---), modes {continu}, composants « écran seulement ».
      Chaque bloc Markdown de la page a un bouton « Modifier ».
   3. L'éditeur (panneau à droite) montre la source Markdown du bloc ; la page se met à
      jour en direct. Boutons pour insérer les blocs de la charte (Théorie +, version
      figée, nouvelle diapo…). Brouillon gardé le temps de la session.
   4. « Enregistrer la page » réécrit le fichier .html : seuls les blocs modifiés changent,
      le reste du fichier est recopié tel quel. Enregistrement direct dans le fichier
      (Edge, Chrome), téléchargement, ou copie + éditeur de GitHub.
   Rien n'est publié tout seul : le fichier enregistré se publie avec git (pull, commit, push).
   Ce n'est pas une protection : le site est public et ce code est lisible par tous.
   ========================================================================= */
(function(){
"use strict";
document.addEventListener('cours:ready', init);

// SHA-256 (texte UTF-8 → hexadécimal), sans dépendance : fonctionne aussi en file://
function sha256(str){
  const rr = (v, n) => (v >>> n) | (v << (32 - n));
  const frac = x => ((x - Math.floor(x)) * 4294967296) | 0;
  const K = [], H = [];
  for(let c = 2, n = 0; n < 64; c++){
    let prime = true;
    for(let d = 2; d * d <= c; d++) if(c % d === 0){ prime = false; break; }
    if(!prime) continue;
    if(n < 8) H[n] = frac(Math.pow(c, 1 / 2));
    K[n++] = frac(Math.pow(c, 1 / 3));
  }
  const b = [...new TextEncoder().encode(str)], bits = b.length * 8;
  b.push(0x80); while(b.length % 64 !== 56) b.push(0);
  for(let i = 7; i >= 0; i--) b.push(i >= 4 ? 0 : (bits >>> (i * 8)) & 255);
  for(let o = 0; o < b.length; o += 64){
    const w = [];
    for(let i = 0; i < 16; i++) w[i] = (b[o + 4 * i] << 24) | (b[o + 4 * i + 1] << 16) | (b[o + 4 * i + 2] << 8) | b[o + 4 * i + 3];
    for(let i = 16; i < 64; i++){
      const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, bb, c, d, e, f, g, h] = H;
    for(let i = 0; i < 64; i++){
      const t1 = (h + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
      const t2 = ((rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
    }
    [a, bb, c, d, e, f, g, h].forEach((v, i) => H[i] = (H[i] + v) | 0);
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

// Recopie le fichier .html en ne remplaçant que le contenu des blocs Markdown modifiés.
// raw : texte du fichier ; src : sources des blocs telles que la page les a lues ;
// drafts : {numéro du bloc : nouvelle source}. Fonction pure (testée par tests/check.mjs).
function patchPage(raw, src, drafts){
  const re = /(<script type="text\/markdown"[^>]*>)([\s\S]*?)(<\/script>)/g;
  const n = (raw.match(re) || []).length;
  if(n !== src.length) throw new Error(`ce fichier contient ${n} blocs Markdown, la page en affiche ${src.length}. Est-ce le bon fichier ?`);
  const crlf = raw.includes('\r\n');
  let k = -1;
  return raw.replace(re, (m, open, body, close) => {
    k++;
    if(!(k in drafts)) return m;
    if(body.replace(/\r\n?/g, '\n') !== src[k])
      throw new Error(`le bloc ${k + 1} a changé dans le fichier depuis l'ouverture de la page (modifié par quelqu'un d'autre ?). Copiez votre texte, rechargez la page et recommencez.`);
    if(/<\/script/i.test(drafts[k])) throw new Error(`le bloc ${k + 1} contient « </script> », interdit dans une page.`);
    return open + (crlf ? drafts[k].replace(/\r?\n/g, '\r\n') : drafts[k]) + close;
  });
}
window.GEO_EDITION = {sha256, patchPage};

// blocs de la charte, insérés à la place du curseur
const SNIPS = [
  {l: '## Section', t: 'Nouvelle section (= nouvelle diapositive)', s: '\n## Titre de la section\n\nLe texte.\n'},
  {l: '---', t: 'Nouvelle diapositive dans la même section', s: '\n---\n'},
  {l: '{continu}', t: 'Diapo en défilement continu : à mettre au bout d\'un titre ## ou d\'une ligne ---', s: ' {continu}'},
  {l: 'Théorie +', t: 'Complément : lecture et impression, caché en diaporama', s: '\n:::plus Titre du complément\nLe texte du complément.\n:::\n'},
  {l: 'Version figée', t: 'Ce que montre une animation, pour l\'impression', s: '\n:::fige\n**Titre.** Ce que montre l\'animation, en tableau ou en liste.\n:::\n'},
  {l: 'À retenir', t: 'Encadré À retenir', s: '\n:::retenir\nL\'essentiel.\n:::\n'},
  {l: 'Attention', t: 'Encadré Attention', s: '\n:::attention\nLe piège.\n:::\n'},
  {l: 'Au bureau', t: 'Encadré lien avec le métier', s: '\n:::terrain\nLe lien avec le métier.\n:::\n'},
  {l: 'Exercice', t: 'Exercice avec solution', s: '\n:::exo 10 min\nLa consigne.\n\n??? Solution\nLa solution.\n???\n:::\n'},
];

function init(){
const doc = document.querySelector('main.doc'), tools = document.querySelector('.toc-tools');
if(!doc || !tools || !window.GEO) return;
const C = GEO.COURSE, esc = GEO.esc, root = document.documentElement, FILE = GEO.FILE, SRC = GEO.MD_SRC;
const ss = {
  get(k, d){ try{ const v = sessionStorage.getItem('geo.' + k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ if(v === null) sessionStorage.removeItem('geo.' + k); else sessionStorage.setItem('geo.' + k, JSON.stringify(v)); }catch(e){} }
};
const DKEY = 'edition.brouillon.' + FILE;
let drafts = ss.get(DKEY, {}) || {};            // {numéro du bloc : source modifiée}
let handle = null;                               // fichier ouvert (enregistrement direct)
let cur = null, timer = 0;

// ------------------------------------------------------------------ 1. console
const cmd = document.createElement('form');
cmd.className = 'cmd';
cmd.setAttribute('autocomplete', 'off');
cmd.innerHTML = `<div class="cmd-out" aria-live="polite"></div>
  <label class="cmd-line"><span class="cmd-ps">C:\\cours&gt;</span><input type="text" spellcheck="false" autocomplete="off" aria-label="Console (tapez aide)"></label>`;
tools.append(cmd);
const out = cmd.querySelector('.cmd-out'), input = cmd.querySelector('input');
const say = (...lines) => {
  lines.forEach(l => out.insertAdjacentHTML('beforeend', `<div>${esc(l)}</div>`));
  while(out.children.length > 7) out.firstChild.remove();
};
const COMMANDS = {
  aide(){ say('aide         cette liste', 'ver          version du cours', 'cls          efface la console',
    'enregistrer  enregistre la page (mode édition)', 'quitter      quitte le mode édition', '(mot de passe : active le mode édition)'); },
  ver(){ say(`${C.appName} · version ${C.version} (${C.date})`); },
  cls(){ out.innerHTML = ''; },
  enregistrer(){ if(root.classList.contains('edit')) save('fichier'); else say('Le mode édition n\'est pas actif.'); },
  quitter(){ if(root.classList.contains('edit')) setEdit(false); else say('Le mode édition n\'est pas actif.'); },
};
COMMANDS.help = COMMANDS.aide; COMMANDS.exit = COMMANDS.quitter; COMMANDS.save = COMMANDS.enregistrer;
cmd.addEventListener('submit', e => {
  e.preventDefault();
  const v = input.value.trim(); input.value = '';
  if(!v) return;
  if(C.admin && sha256(v) === C.admin){ say('C:\\cours>********'); setEdit(true); return; }
  const c = COMMANDS[v.toLowerCase()];
  if(c){ say('C:\\cours>' + v.toLowerCase()); c(); }
  else say('C:\\cours>********', 'Commande inconnue. Tapez « aide ».');      // jamais d'écho : ce pouvait être un mot de passe
});

// ------------------------------------------------------------------ 2. mode édition
const bar = document.createElement('div');
bar.className = 'ed-bar';
bar.innerHTML = `<b>Mode édition</b><span class="ed-st"></span>
  <span class="ed-act"><button type="button" class="btn sm primary" data-a="save" title="Ctrl+S">Enregistrer la page</button>
  <button type="button" class="btn sm" data-a="github" title="Copie la page, puis ouvre l'éditeur de GitHub">Copier + GitHub</button>
  <a class="btn sm" href="guide.html" target="_blank" rel="noopener">Syntaxe ↗</a>
  <button type="button" class="btn sm" data-a="quit">Quitter</button></span>`;
bar.querySelector('[data-a="save"]').onclick = () => save('fichier');
bar.querySelector('[data-a="github"]').onclick = () => save('github');
bar.querySelector('[data-a="quit"]').onclick = () => setEdit(false);

const panel = document.createElement('aside');
panel.className = 'ed-panel'; panel.hidden = true;
panel.setAttribute('aria-label', 'Éditeur du bloc');
panel.innerHTML = `<div class="ed-hd"><div><b class="ed-k"></b><small>Markdown · la page se met à jour en direct</small></div>
    <button type="button" class="btn sm" data-a="close">Fermer</button></div>
  <div class="ed-tools">${SNIPS.map((s, i) => `<button type="button" data-i="${i}" title="${esc(s.t)}">${esc(s.l)}</button>`).join('')}</div>
  <textarea spellcheck="true" lang="fr" aria-label="Source Markdown du bloc"></textarea>
  <div class="ed-ft"><button type="button" class="btn sm" data-a="revert">Annuler les modifications du bloc</button>
    <span class="small muted">Brouillon gardé jusqu'à la fermeture de l'onglet.</span></div>`;
const ta = panel.querySelector('textarea');
panel.querySelector('[data-a="close"]').onclick = closeEditor;
panel.querySelector('[data-a="revert"]').onclick = () => { if(cur === null) return; ta.value = SRC[cur]; update(); };
panel.querySelectorAll('.ed-tools button').forEach(b => b.onclick = () => {
  ta.focus(); ta.setRangeText(SNIPS[+b.dataset.i].s, ta.selectionStart, ta.selectionEnd, 'end'); update();
});
ta.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 250); });

function setEdit(on){
  if(on){
    if(root.classList.contains('edit')) return;
    ss.set('edition', true);
    root.classList.add('edit');
    document.body.append(bar, panel);
    Object.entries(drafts).forEach(([k, s]) => render(+k, s));
    markBlocks(); status();
    say('Mode édition activé.', 'Cliquez « Modifier » au-dessus d\'un bloc.');
  } else {
    if(Object.keys(drafts).length && !confirm('Des modifications ne sont pas enregistrées. Quitter le mode édition et les abandonner ?')) return;
    ss.set('edition', null); ss.set(DKEY, null);
    location.reload();                            // la page se reconstruit proprement (diapos, annotations)
  }
}
const editable = k => doc.querySelector(`:scope > [data-md="${k}"]`);
function markBlocks(){
  doc.querySelectorAll(':scope > .ed-btn').forEach(b => b.remove());
  SRC.forEach((_, k) => {
    const first = editable(k);
    if(!first) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ed-btn' + (k in drafts ? ' mod' : '');
    b.textContent = `✎ Modifier le bloc ${k + 1}` + (k in drafts ? ' · modifié' : '');
    b.onclick = () => openEditor(k);
    first.before(b);
  });
  doc.querySelectorAll(':scope > [data-md]').forEach(el => el.classList.toggle('ed-on', cur !== null && el.dataset.md == cur));
}
function status(){
  const n = Object.keys(drafts).length;
  bar.querySelector('.ed-st').textContent = n ? `${n} bloc${n > 1 ? 's' : ''} modifié${n > 1 ? 's' : ''}, non enregistré${n > 1 ? 's' : ''}` : 'aucune modification';
  bar.classList.toggle('dirty', n > 0);
}

// ------------------------------------------------------------------ 3. éditeur
function openEditor(k){
  cur = k;
  ta.value = k in drafts ? drafts[k] : SRC[k];
  panel.querySelector('.ed-k').textContent = `Bloc ${k + 1} · ${FILE}`;
  panel.hidden = false; root.classList.add('ed-open');
  markBlocks();
  const first = editable(k); if(first) first.scrollIntoView({block: 'start'});
  ta.focus();
}
function closeEditor(){ update(); cur = null; panel.hidden = true; root.classList.remove('ed-open'); markBlocks(); }
function update(){
  clearTimeout(timer);
  if(cur === null) return;
  const s = ta.value;
  if(s === SRC[cur]) delete drafts[cur]; else drafts[cur] = s;
  ss.set(DKEY, Object.keys(drafts).length ? drafts : null);
  render(cur, s); markBlocks(); status();
}
// remplace les éléments du bloc k par le rendu de la nouvelle source
function render(k, s){
  const old = [...doc.querySelectorAll(`:scope > [data-md="${k}"]`)];
  if(!old.length) return;
  const frag = GEO.markdown(s);
  const els = [...frag.children];
  if(!els.length){ const e = document.createElement('p'); e.className = 'ed-empty muted'; e.textContent = '(bloc vide)'; frag.append(e); els.push(e); }
  els.forEach(el => el.dataset.md = k);
  old[0].before(frag); old.forEach(el => el.remove());
  GEO.groupCards(doc); GEO.numberSections(doc);
}

// ------------------------------------------------------------------ 4. enregistrer
// source brute de la page : le fichier déjà ouvert, sinon le serveur, sinon on le demande
async function rawPage(){
  if(handle) return (await handle.getFile()).text();
  try{ const r = await fetch(location.pathname, {cache: 'no-store'}); if(r.ok) return await r.text(); }catch(e){}
  alert(`Choisissez le fichier ${FILE} dans votre copie du dépôt (dossier cours).`);
  if(window.showOpenFilePicker){
    const [h] = await showOpenFilePicker({types: [{description: 'Page du cours', accept: {'text/html': ['.html']}}]});
    handle = h; return (await h.getFile()).text();
  }
  return new Promise((ok, ko) => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.html';
    i.onchange = () => i.files[0] ? i.files[0].text().then(ok, ko) : ko(new Error('aucun fichier choisi'));
    i.click();
  });
}
const patch = raw => patchPage(raw, SRC, drafts);
async function save(mode){
  update();
  if(!Object.keys(drafts).length){ say('Rien à enregistrer.'); return; }
  let html;
  try{ html = patch(await rawPage()); }
  catch(e){ if(e.name !== 'AbortError') alert('Enregistrement impossible : ' + e.message); return; }
  try{
    if(mode === 'github'){
      await navigator.clipboard.writeText(html);
      window.open(`${C.repo}/edit/${C.branch || 'main'}/cours/${FILE}`, '_blank', 'noopener');
      say('Page copiée.', 'Sur GitHub : tout sélectionner, coller, « Commit changes ».');
      return;                                     // le brouillon reste : il n'est pas encore publié
    }
    if(handle && handle.createWritable){ const w = await handle.createWritable(); await w.write(html); await w.close(); }
    else if(window.showSaveFilePicker){
      const h = await showSaveFilePicker({suggestedName: FILE, types: [{description: 'Page du cours', accept: {'text/html': ['.html']}}]});
      const w = await h.createWritable(); await w.write(html); await w.close(); handle = h;
    } else {
      const a = Object.assign(document.createElement('a'), {href: URL.createObjectURL(new Blob([html], {type: 'text/html'})), download: FILE});
      document.body.append(a); a.click(); a.remove();
    }
  }catch(e){ if(e.name !== 'AbortError') alert('Enregistrement impossible : ' + e.message); return; }
  Object.entries(drafts).forEach(([k, s]) => SRC[k] = s);      // le fichier enregistré devient la référence
  drafts = {}; ss.set(DKEY, null); markBlocks(); status();
  say(`${FILE} enregistré.`, 'Publier : git pull, puis commit et push.');
}
addEventListener('keydown', e => {
  if(root.classList.contains('edit') && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'){ e.preventDefault(); save('fichier'); }
});

if(ss.get('edition', false)) setEdit(true);      // reprise après un rechargement ou un changement de page
}
})();
