/* =========================================================================
   ANNOTATIONS PERSONNELLES — chacun (élève, formateur) peut annoter n'importe
   quel bloc de n'importe quelle page. Aucun contenu de cours ici.

   - Stockage automatique dans ce navigateur (localStorage, clé geo.annotations).
   - Export / import d'un fichier JSON simple : sauvegarde, changement de poste,
     partage (le formateur distribue ses annotations à la classe).
   - Une annotation est rattachée à un bloc par une « ancre » calculée depuis son
     contenu stable (id, titre, légende, texte). Si le bloc change trop, elle n'est
     pas perdue : elle s'affiche en bas de page, « Annotations non rattachées ».
   Démarre à l'événement « cours:ready » émis par app.js.
   ========================================================================= */
(function(){
"use strict";
document.addEventListener('cours:ready', init);

function init(){
const doc = document.querySelector('.doc');
if(!doc || !window.GEO) return;
const S = GEO.store, esc = GEO.esc, root = document.documentElement, PAGE = GEO.FILE;
const FORMAT = 'cf-geo-annotations', OLD_FORMATS = ['cf-geo-remarques'], VERSION = 1;
const TYPES = {note: 'Note', q: 'Question', cor: 'À corriger', idee: 'Idée'};
const fixType = t => TYPES[t] ? t : 'note';            // anciens fichiers : « rem » → « note »

let items = S.get('annotations', null);
if(items === null){ items = (S.get('notes', []) || []).map(n => ({...n, type: fixType(n.type)})); S.set('annotations', items); }
let author = S.get('annotations.author', S.get('notes.author', ''));
root.classList.toggle('annot', !!S.get('annotations.mode', false));

// ------------------------------------------------------------------ ancres
const NESTED = '.box, .card, .quiz .q, .plan li';
const norm = s => (s || '').replace(/\s+/g, ' ').trim();
const hash = s => { let h = 5381; for(let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
function label(el){
  if(el.id) return '#' + el.id;
  if(el.matches('p, h1, h2, h3, h4, .plan li')) return norm(el.textContent);
  const head = el.querySelector('h1, h2, h3, h4, .lab, figcaption, .cap, .cb-file, th, summary');
  const p = el.querySelector('p, li');
  return norm([head && head.textContent, p && p.textContent].filter(Boolean).join(' · ')) || el.className || el.tagName;
}
const meta = new Map();                     // élément → {key, sec, excerpt}
{
  const list = [...doc.children].filter(el => !el.matches('script, style, .pager, .colophon, .annots, .annots-orph, hr.slide-break'));
  doc.querySelectorAll(NESTED).forEach(el => { if(el.parentElement !== doc) list.push(el); });
  list.sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  let sec = '', seen = {};
  list.forEach(el => {
    if(el.parentElement === doc && el.tagName === 'H2'){ const sn = el.querySelector('.sn'); sec = sn ? sn.textContent : ''; }
    const lab = String(label(el)).replace(/^\d+\.\d+\s*/, '');      // sans le numéro de section (il peut changer)
    let key = hash(el.tagName + '|' + lab.slice(0, 200));
    seen[key] = (seen[key] || 0) + 1;
    if(seen[key] > 1) key += '-' + seen[key];
    const excerpt = norm(el.matches('header') ? (el.querySelector('h1') || el).textContent : lab.replace(/^#/, '')).slice(0, 90);
    meta.set(el, {key, sec, excerpt});
  });
}
const byKey = new Map([...meta].map(([el, m]) => [m.key, el]));

// ------------------------------------------------------------------ affichage
const fmtDate = iso => { try{ return new Date(iso).toLocaleString('fr-CH', {dateStyle: 'short', timeStyle: 'short'}); }catch(e){ return iso; } };
function container(el){
  const key = meta.get(el).key;
  let c = doc.querySelector(`.annots[data-for="${key}"]`);
  if(c) return c;
  c = document.createElement('div');
  c.className = 'annots'; c.dataset.for = key;
  if(el.parentElement === doc) el.after(c); else el.appendChild(c);
  return c;
}
function itemHTML(n){
  return `<div class="annot t-${esc(fixType(n.type))}" id="annot-${esc(n.id)}">
    <div class="annot-hd"><b>${esc(TYPES[fixType(n.type)])}</b><span>${esc(n.author || 'anonyme')}</span><span>${esc(fmtDate(n.updated || n.created))}</span>
      <span class="act"><button type="button" data-a="edit">modifier</button><button type="button" data-a="del">supprimer</button></span></div>
    <p class="annot-tx">${esc(n.text)}</p></div>`;
}
function render(){
  doc.querySelectorAll('.annots, .annots-orph').forEach(e => e.remove());
  const orphans = [];
  items.filter(n => n.page === PAGE).sort((a, b) => (a.created || '').localeCompare(b.created || '')).forEach(n => {
    const el = byKey.get(n.anchor);
    if(el) container(el).insertAdjacentHTML('beforeend', itemHTML(n)); else orphans.push(n);
  });
  if(orphans.length){
    const s = document.createElement('section');
    s.className = 'annots-orph';
    s.innerHTML = `<h3>Annotations non rattachées</h3><p class="small muted">Le passage auquel elles se rapportaient a changé. Elles sont conservées ici (et dans l'export).</p>` +
      orphans.map(n => `<p class="small muted" style="margin:.8rem 0 .2rem">Sur : « ${esc(n.excerpt || '?')} »</p><div class="annots">${itemHTML(n)}</div>`).join('');
    const pager = doc.querySelector('.pager');
    pager ? pager.before(s) : doc.appendChild(s);
  }
  refreshCount();
}

// ------------------------------------------------------------------ édition
function openEditor(el, n){
  doc.querySelectorAll('.annot-form').forEach(f => f.remove());
  const node = n && doc.querySelector('#annot-' + CSS.escape(n.id));
  const c = node ? node.parentElement : container(el);
  const f = document.createElement('form');
  f.className = 'annot-form';
  f.innerHTML = `
    <textarea name="text" required placeholder="Votre annotation…" aria-label="Texte de l'annotation">${n ? esc(n.text) : ''}</textarea>
    <div class="row">
      <select name="type" aria-label="Type">${Object.entries(TYPES).map(([k, t]) => `<option value="${k}"${n && fixType(n.type) === k ? ' selected' : ''}>${t}</option>`).join('')}</select>
      <input name="author" type="text" placeholder="Votre nom" aria-label="Auteur" value="${esc(n ? n.author : author)}" style="flex:1;min-width:8em">
      <button class="btn sm primary" type="submit">Enregistrer</button>
      <button class="btn sm" type="button" data-a="cancel">Annuler</button>
    </div>
    <p class="small muted" style="margin:0">Enregistrée dans ce navigateur. Pensez à exporter vos annotations (menu « Annotations »).</p>`;
  if(node) node.after(f); else c.appendChild(f);
  const ta = f.querySelector('textarea'); ta.focus();
  ta.addEventListener('keydown', e => { if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)) f.requestSubmit(); if(e.key === 'Escape') f.querySelector('[data-a="cancel"]').click(); });
  f.querySelector('[data-a="cancel"]').onclick = () => { f.remove(); if(!c.children.length) c.remove(); };
  f.onsubmit = e => {
    e.preventDefault();
    const text = ta.value.trim(); if(!text) return;
    author = f.author.value.trim(); S.set('annotations.author', author);
    const now = new Date().toISOString();
    if(n) Object.assign(n, {text, type: f.type.value, author, updated: now});
    else { const m = meta.get(el); items.push({id: 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), page: PAGE, anchor: m.key, section: m.sec, excerpt: m.excerpt, type: f.type.value, text, author, created: now, updated: now}); }
    save(); render();
  };
}
doc.addEventListener('click', e => {
  const b = e.target.closest('.annot .act button'); if(!b) return;
  const n = items.find(x => 'annot-' + x.id === b.closest('.annot').id); if(!n) return;
  if(b.dataset.a === 'del'){ if(confirm('Supprimer cette annotation ?')){ items = items.filter(x => x !== n); save(); render(); } }
  else openEditor(null, n);
});

// ------------------------------------------------------------------ bouton « + » (mode annotation)
const add = document.createElement('button');
add.type = 'button'; add.className = 'annot-add'; add.textContent = '+';
add.title = 'Annoter ce bloc'; add.setAttribute('aria-label', add.title);
add.style.display = 'none';
document.body.appendChild(add);
let current = null, hoverTimer = null;
function target(node){
  for(let n = node; n && n !== doc; n = n.parentElement){
    if(n.classList && (n.classList.contains('annots') || n.classList.contains('annots-orph'))) return null;
    if(meta.has(n)) return n;
  }
  return null;
}
function setCurrent(el){
  if(current === el) return;
  if(current) current.classList.remove('annot-target');
  current = el;
  if(!el){ add.style.display = 'none'; return; }
  el.classList.add('annot-target');
  const r = el.getBoundingClientRect();
  add.style.display = '';
  add.style.top = (r.top + scrollY - 2) + 'px';
  add.style.left = Math.max(2, r.left + scrollX - 18) + 'px';      // chevauche le bord gauche du bloc
}
// On ne cache jamais le bouton en passant sur une marge, et on ne change de bloc
// qu'après un court arrêt, pour pouvoir traverser un bloc voisin en allant vers « + ».
doc.addEventListener('mouseover', e => {
  if(!root.classList.contains('annot')) return;
  const t = target(e.target);
  clearTimeout(hoverTimer);
  if(!t || t === current) return;
  if(!current) setCurrent(t); else hoverTimer = setTimeout(() => setCurrent(t), 160);
});
add.addEventListener('mouseenter', () => clearTimeout(hoverTimer));
doc.addEventListener('click', e => { if(root.classList.contains('annot') && !e.target.closest('button, a, input, select, textarea, label')) setCurrent(target(e.target)); });
add.onclick = () => { if(current) openEditor(current); };
addEventListener('resize', () => { const c = current; current = null; setCurrent(c); });

function setMode(on){
  root.classList.toggle('annot', on); S.set('annotations.mode', on);
  if(!on) setCurrent(null);
  paintTools();
}
addEventListener('keydown', e => {
  if(e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if(e.key === 'n' || e.key === 'N') setMode(!root.classList.contains('annot'));
});

// ------------------------------------------------------------------ export / import
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
function exportJSON(){
  const data = {format: FORMAT, version: VERSION, course: GEO.COURSE.appName, exported: new Date().toISOString(), author, count: items.length, annotations: items};
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'}));
  a.download = `annotations-${new Date().toISOString().slice(0, 10)}${author ? '-' + slug(author) : ''}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function importJSON(text){
  let data;
  try{ data = JSON.parse(text); }catch(e){ return "Fichier illisible : ce n'est pas du JSON."; }
  const list = Array.isArray(data) ? data : data && (data.annotations || data.notes);
  if(!Array.isArray(list) || (data.format && data.format !== FORMAT && !OLD_FORMATS.includes(data.format))) return "Ce fichier n'est pas un export d'annotations.";
  let added = 0, updated = 0, skipped = 0;
  list.forEach(n => {
    if(!n || typeof n.id !== 'string' || typeof n.page !== 'string' || typeof n.anchor !== 'string' || typeof n.text !== 'string'){ skipped++; return; }
    const clean = {id: n.id, page: n.page, anchor: n.anchor, section: String(n.section || ''), excerpt: String(n.excerpt || ''),
      type: fixType(n.type), text: n.text, author: String(n.author || ''), created: String(n.created || ''), updated: String(n.updated || n.created || '')};
    const i = items.findIndex(x => x.id === clean.id);
    if(i < 0){ items.push(clean); added++; }
    else if(clean.updated > (items[i].updated || '')){ items[i] = clean; updated++; }
  });
  save(); render();
  return `${added} ajoutée(s), ${updated} mise(s) à jour` + (skipped ? `, ${skipped} ignorée(s)` : '') + '.';
}

// ------------------------------------------------------------------ panneau et menu
const panel = document.createElement('dialog');
panel.className = 'annots-panel';
panel.innerHTML = `
  <div class="np-hd"><b>Mes annotations</b><button class="btn sm" type="button" data-a="close">Fermer</button></div>
  <div class="row">
    <label class="check"><input type="checkbox" data-a="mode"> Mode annotation <kbd>N</kbd></label>
    <input type="text" data-a="author" placeholder="Votre nom" aria-label="Votre nom" style="flex:1;min-width:8em">
  </div>
  <div class="row">
    <button class="btn sm primary" type="button" data-a="export">Exporter (.json)</button>
    <label class="btn sm">Importer…<input type="file" accept=".json,application/json" data-a="import" hidden></label>
    <button class="btn sm" type="button" data-a="clear">Tout effacer</button>
  </div>
  <p class="small" data-a="msg" role="status"></p>
  <div class="np-list"></div>
  <p class="small muted">Les annotations restent dans ce navigateur uniquement (rien n'est envoyé). Exportez régulièrement ; l'import fusionne avec l'existant (la version la plus récente de chaque annotation gagne).</p>`;
document.body.appendChild(panel);
const q = s => panel.querySelector(`[data-a="${s}"]`);
function list(){
  const pages = GEO.CHAPTERS.map(c => c.file), groups = {};
  items.forEach(n => (groups[n.page] = groups[n.page] || []).push(n));
  const keys = Object.keys(groups).sort((a, b) => (pages.indexOf(a) + 1 || 99) - (pages.indexOf(b) + 1 || 99));
  panel.querySelector('.np-list').innerHTML = keys.length ? keys.map(p => {
    const ch = GEO.CHAPTERS.find(c => c.file === p);
    return `<h4>${esc(ch ? (ch.num ? ch.num + '. ' : '') + ch.title : p)}</h4><ul>${groups[p].map(n =>
      `<li><a href="${esc(p)}#annot-${esc(n.id)}"><span class="chip">${esc(TYPES[fixType(n.type)])}</span> ${esc(n.text.slice(0, 80))}${n.text.length > 80 ? '…' : ''}</a>
       <small class="muted">${esc(n.section ? '§ ' + n.section + ' · ' : '')}${esc(n.author || 'anonyme')}</small></li>`).join('')}</ul>`;
  }).join('') : "<p class=\"muted\">Aucune annotation pour l'instant. Activez le mode annotation, survolez un bloc et cliquez sur « + ».</p>";
}
q('close').onclick = () => panel.close();
q('mode').onchange = e => setMode(e.target.checked);
q('author').oninput = e => { author = e.target.value.trim(); S.set('annotations.author', author); };
q('export').onclick = exportJSON;
q('import').onchange = e => {
  const file = e.target.files[0]; if(!file) return;
  file.text().then(t => { q('msg').textContent = importJSON(t); list(); e.target.value = ''; });
};
q('clear').onclick = () => {
  if(!items.length || !confirm(`Effacer les ${items.length} annotation(s) de ce navigateur ? Exportez d'abord si besoin.`)) return;
  items = []; save(); render(); list();
};
panel.addEventListener('click', e => { if(e.target === panel || e.target.closest('.np-list a')) panel.close(); });

const tools = document.querySelector('.toc-tools');
if(tools){
  tools.insertAdjacentHTML('afterbegin', `<button class="tool" type="button" id="tAnnots">Annotations <span class="st"></span></button>
    <button class="tool" type="button" id="tAnnot">Mode annotation <span class="st"></span></button>`);
  const keys = tools.querySelector('.toc-keys'); if(keys) keys.textContent += ' · N annoter';
  tools.querySelector('#tAnnots').onclick = () => { q('author').value = author; q('msg').textContent = ''; list(); paintTools(); panel.showModal(); };
  tools.querySelector('#tAnnot').onclick = () => setMode(!root.classList.contains('annot'));
}
function refreshCount(){
  const t = document.querySelector('#tAnnots .st');
  if(t){ const here = items.filter(n => n.page === PAGE).length; t.textContent = items.length ? `${here} ici · ${items.length}` : '0'; }
}
function paintTools(){
  const on = root.classList.contains('annot'), b = document.querySelector('#tAnnot');
  if(b){ b.setAttribute('aria-pressed', on); b.querySelector('.st').textContent = on ? 'oui' : 'non'; }
  q('mode').checked = on;
}
function save(){ S.set('annotations', items); refreshCount(); }

render(); paintTools();
if(location.hash.startsWith('#annot-')){
  const t = document.getElementById(location.hash.slice(1));
  if(t){ t.scrollIntoView({block: 'center'}); t.classList.add('flash'); }
}
}
})();
