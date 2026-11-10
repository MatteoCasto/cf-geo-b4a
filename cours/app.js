// Support de cours géomatique (gabarit) : navigation commune, thème, mode projection, notes formateur,
// objectifs cochables, blocs de code colorés (SQL, Python, ligne de commande, JSON, HTML).
// Pour ajouter un chapitre : créer la page (copier un chapitre existant) puis l'ajouter à CHAPTERS.
(function(){
"use strict";

const COURSE = {
  name:  'Géomatique',
  sub:   'CF-geo · gabarit B4a',
  colophon: 'Support de cours géomatique · gabarit de démonstration · version 0.0 (10.11.2026)',
};

const CHAPTERS = [
  {f:'index.html',        n:'',  t:'Accueil'},
  {f:'referentiels.html', n:'1', t:'Systèmes de référence'},
  {f:'gnss.html',         n:'2', t:'Positionnement GNSS'},
  {f:'nivellement.html',  n:'3', t:'Nivellement'},
  {f:'lidar.html',        n:'4', t:'LiDAR et modèles de terrain'},
  {f:'analyse.html',      n:'5', t:'Analyse spatiale'},
  {f:'quiz.html',         n:'6', t:'Quiz final'},
  {f:'aide-memoire.html', n:'A', t:'Aide-mémoire'},
  {f:'composants.html',   n:'B', t:'Boîte à composants'},
];

const store = {
  get(k, d){ try{ const v = localStorage.getItem('geo.'+k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('geo.'+k, JSON.stringify(v)); }catch(e){} }
};

const root = document.documentElement;
const THEMES = ['système','clair','sombre'];
function applyTheme(t){
  if(t === 'clair') root.dataset.theme = 'light';
  else if(t === 'sombre') root.dataset.theme = 'dark';
  else delete root.dataset.theme;
}
let theme = store.get('theme', 'système');
applyTheme(theme);
root.classList.toggle('proj', !!store.get('proj', false));
root.classList.toggle('prof-on', !!store.get('prof', false));

const file = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
let idx = CHAPTERS.findIndex(c => c.f === file);
if(idx < 0) idx = 0;
const visited = new Set(store.get('visited', []));
visited.add(CHAPTERS[idx].f);
store.set('visited', [...visited]);

// ---- définitions SVG partagées : effet crayon, flèches ----
document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <filter id="crayon" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="fillink"/></marker>
  <marker id="arr-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="fillaccent"/></marker>
</defs></svg>`);

// ---- table des chapitres ----
const LOGO = `<svg class="brand-mark" viewBox="0 0 34 34" aria-hidden="true">
  <path d="M17 3L31 17L17 31L3 17Z" class="fillsheet strokeink" stroke-width="2"/>
  <path d="M17 9V25M9 17H25" class="strokeink" stroke-width="1.3"/>
  <circle cx="17" cy="17" r="3.8" class="fillaccent"/></svg>`;
const toc = document.getElementById('toc');
if(toc){
  toc.innerHTML = `
  <a class="brand" href="index.html">${LOGO}<span><b>${COURSE.name}</b><small>${COURSE.sub}</small></span></a>
  <button class="btn sm toc-toggle" type="button" aria-expanded="false">Chapitres</button>
  <nav aria-label="Chapitres"><ol>${CHAPTERS.map((c,i)=>`<li><a href="${c.f}"${i===idx?' aria-current="page"':''}>
    <span class="n">${c.n || '·'}</span><span>${c.t}</span><span class="v">${visited.has(c.f) && i!==idx ? 'vu' : ''}</span></a></li>`).join('')}</ol></nav>
  <div class="toc-tools">
    <button class="tool" type="button" id="tTheme">Thème <span class="st"></span></button>
    <button class="tool" type="button" id="tProj">Mode projection <span class="st"></span></button>
    <button class="tool" type="button" id="tProf">Notes formateur <span class="st"></span></button>
    <div class="toc-keys">← → chapitre · P projection</div>
  </div>`;
  const q = s => toc.querySelector(s);
  const paint = ()=>{
    q('#tTheme .st').textContent = theme;
    q('#tProj').setAttribute('aria-pressed', root.classList.contains('proj'));
    q('#tProj .st').textContent = root.classList.contains('proj') ? 'oui' : 'non';
    q('#tProf').setAttribute('aria-pressed', root.classList.contains('prof-on'));
    q('#tProf .st').textContent = root.classList.contains('prof-on') ? 'oui' : 'non';
  };
  q('#tTheme').onclick = ()=>{ theme = THEMES[(THEMES.indexOf(theme)+1)%3]; applyTheme(theme); store.set('theme', theme); paint(); };
  q('#tProj').onclick = toggleProj;
  q('#tProf').onclick = ()=>{ store.set('prof', root.classList.toggle('prof-on')); paint(); };
  q('.toc-toggle').onclick = e=>{ const o = toc.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
  window.addEventListener('geo:proj', paint);
  paint();
}
function toggleProj(){ store.set('proj', root.classList.toggle('proj')); window.dispatchEvent(new Event('geo:proj')); }

// ---- pager + colophon ----
const doc = document.querySelector('.doc');
if(doc){
  const p = CHAPTERS[idx-1], n = CHAPTERS[idx+1];
  const pager = document.createElement('nav');
  pager.className = 'pager';
  pager.setAttribute('aria-label', 'Chapitre précédent et suivant');
  pager.innerHTML =
    (p ? `<a class="prev" href="${p.f}"><small>← Précédent</small><b>${p.n ? p.n+'. ' : ''}${p.t}</b></a>` : '') +
    (n ? `<a class="next" href="${n.f}"><small>Suivant →</small><b>${n.n ? n.n+'. ' : ''}${n.t}</b></a>` : '');
  doc.appendChild(pager);
  const col = document.createElement('p');
  col.className = 'colophon';
  col.textContent = COURSE.colophon;
  doc.appendChild(col);
}

addEventListener('keydown', e=>{
  if(e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
  if(e.key === 'ArrowRight' && CHAPTERS[idx+1]) location.href = CHAPTERS[idx+1].f;
  else if(e.key === 'ArrowLeft' && CHAPTERS[idx-1]) location.href = CHAPTERS[idx-1].f;
  else if(e.key === 'p' || e.key === 'P') toggleProj();
});

// ---- objectifs cochables (mémorisés dans ce navigateur) ----
document.querySelectorAll('.goals').forEach(g=>{
  const key = 'goals.' + file;
  const done = new Set(store.get(key, []));
  g.querySelectorAll('input[type=checkbox]').forEach((cb,i)=>{
    cb.checked = done.has(i);
    cb.addEventListener('change', ()=>{ cb.checked ? done.add(i) : done.delete(i); store.set(key, [...done]); });
  });
});

// ---- coloration syntaxique (volontairement simple) ----
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function tokenizer(re, kinds){
  return src => {
    let out = '', last = 0, m;
    re.lastIndex = 0;
    while((m = re.exec(src))){
      out += esc(src.slice(last, m.index)); last = re.lastIndex;
      const g = kinds.findIndex((_,i)=>m[i+1] !== undefined);
      const k = kinds[g];
      out += typeof k === 'function' ? k(m[g+1]) : (k ? `<span class="${k}">${esc(m[g+1])}</span>` : esc(m[g+1]));
    }
    return out + esc(src.slice(last));
  };
}
const SQL_KW = new Set(('SELECT FROM WHERE AND OR NOT AS ON JOIN LEFT INNER GROUP BY ORDER HAVING LIMIT CREATE TABLE INDEX USING '+
  'INSERT INTO VALUES UPDATE SET DELETE WITH DISTINCT COUNT IS NULL IN BETWEEN CASE WHEN THEN ELSE END GIST').split(' '));
const PY_KW = new Set(('import from as def return if elif else for in while with True False None and or not lambda print class').split(' '));
const word = set => w => set.has(w.toUpperCase()) && set === SQL_KW ? `<span class="k">${w}</span>`
                       : set.has(w) ? `<span class="k">${w}</span>` : /^ST_|^gpd|^shapely/.test(w) ? `<span class="t">${w}</span>` : w;
const hlSQL = tokenizer(/(--.*$)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/gm, ['c','s','nb', word(SQL_KW)]);
const hlPY  = tokenizer(/(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/gm, ['c','s','nb', word(PY_KW)]);
const hlJSON = tokenizer(/("(?:[^"\\]|\\.)*")(?=\s*:)|("(?:[^"\\]|\\.)*")|(-?\b\d+(?:\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g, ['t','s','nb','k']);
function hlSH(src){
  return src.split('\n').map(l=>{
    if(/^\s*#/.test(l)) return `<span class="c">${esc(l)}</span>`;
    return esc(l).replace(/(^|\s)(--?[\w-]+)/g, '$1<span class="k">$2</span>')
                 .replace(/^(\s*)(ogr2ogr|gdalinfo|gdalwarp|pdal|python|psql|qgis_process)\b/, '$1<span class="t">$2</span>');
  }).join('\n');
}
function hlXML(src){
  const re = /(<!--[\s\S]*?-->)|<(\/?)([\w.:-]+)([^>]*?)(\/?)>/g;
  let out = '', last = 0, m;
  while((m = re.exec(src))){
    out += esc(src.slice(last, m.index)); last = re.lastIndex;
    if(m[1]){ out += `<span class="c">${esc(m[0])}</span>`; continue; }
    const attrs = esc(m[4]).replace(/([\w.:-]+)=(&quot;.*?&quot;)/g, '<span class="nb">$1</span>=<span class="s">$2</span>');
    out += `<span class="t">&lt;${m[2]}${m[3]}</span>${attrs}<span class="t">${m[5]}&gt;</span>`;
  }
  return out + esc(src.slice(last));
}
const HL = {sql:hlSQL, py:hlPY, json:hlJSON, geojson:hlJSON, sh:hlSH, html:hlXML, xml:hlXML, txt:esc};
const hl = (src, lang) => (HL[lang] || esc)(src);

function dedent(s){
  s = s.replace(/^\n+/, '').replace(/\s+$/, '');
  const ind = Math.min(...s.split('\n').filter(l=>l.trim()).map(l=>l.match(/^ */)[0].length));
  return s.split('\n').map(l=>l.slice(ind)).join('\n');
}

function copyText(btn, text){
  const done = ()=>{ btn.textContent = 'Copié'; setTimeout(()=>btn.textContent = 'Copier', 1400); };
  const fallback = ()=>{
    const pre = btn.closest('.codeblock').querySelector('pre');
    const r = document.createRange(); r.selectNodeContents(pre);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    btn.textContent = 'Sélectionné';
  };
  try{ navigator.clipboard.writeText(text).then(done, fallback); }catch(e){ fallback(); }
}

// <script type="text/x-code" data-lang="sql" data-file="requete.sql">…</script>
function makeCodeBlock(src, lang, fileName){
  const fig = document.createElement('figure');
  fig.className = 'codeblock';
  fig.innerHTML = `<div class="cb-bar"><span class="cb-file">${esc(fileName || lang)}</span><button class="cb-copy" type="button">Copier</button></div><pre><code></code></pre>`;
  const code = fig.querySelector('code');
  fig.setCode = s => { src = s; code.innerHTML = hl(s, lang); };
  fig.setCode(src);
  fig.querySelector('.cb-copy').onclick = e => copyText(e.currentTarget, src);
  return fig;
}
document.querySelectorAll('script[type="text/x-code"]').forEach(s=>{
  const fig = makeCodeBlock(dedent(s.textContent), s.dataset.lang, s.dataset.file);
  if(s.id) fig.id = s.id;
  s.replaceWith(fig);
});

// ---- formatage suisse des nombres : 2'600'000.000 ----
function fmtCH(v, dec = 3){
  if(!isFinite(v)) return '–';
  const [i, d] = Math.abs(v).toFixed(dec).split('.');
  return (v < 0 ? '−' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, "'") + (d ? '.' + d : '');
}

window.GEO = {store, CHAPTERS, hl, esc, dedent, makeCodeBlock, fmtCH};
})();
