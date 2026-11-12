/* =========================================================================
   MOTEUR COMMUN DU COURS — ne contient aucun contenu de cours.
   Chargé dans le <head> de chaque page, après config.js.

   1. <head> : feuilles de style, polices, icônes, manifeste, annotations.js
   2. Outils (window.GEO) : stockage, formatage, blocs de code colorés
   3. Markdown : le texte des pages, écrit dans <script type="text/markdown">
   4. Mise en page : menu, en-tête de chapitre (depuis config.js), objectifs,
      numérotation des sections, pager, plan de l'accueil, quiz
   5. Thème, mode projection, raccourcis clavier
   6. Application installable / hors ligne (PWA)
   Une fois la page construite, l'événement « cours:ready » est émis.
   ========================================================================= */
(function(){
"use strict";
const C = window.COURSE;
const root = document.documentElement;

// ---------------------------------------------------------------- 1. <head>
const FONTS = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap';
document.write(`
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="style.css">
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#14202a">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="icon" href="icons/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<script src="annotations.js"><\/script>`);

// ---------------------------------------------------------------- 2. outils
const store = {
  get(k, d){ try{ const v = localStorage.getItem('geo.' + k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('geo.' + k, JSON.stringify(v)); }catch(e){} }
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function dedent(s){
  s = s.replace(/^\n+/, '').replace(/\s+$/, '');
  const ind = Math.min(...s.split('\n').filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  return s.split('\n').map(l => l.slice(isFinite(ind) ? ind : 0)).join('\n');
}
function fmtCH(v, dec = 3){                          // 2'600'000.000
  if(!isFinite(v)) return '–';
  const [i, d] = Math.abs(v).toFixed(dec).split('.');
  return (v < 0 ? '−' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, "'") + (d ? '.' + d : '');
}
const FILE = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
const CHAPTERS = C.chapters;
let IDX = CHAPTERS.findIndex(c => c.file === FILE); if(IDX < 0) IDX = 0;
const CH = CHAPTERS[IDX];
// pages du menu (une page « hidden: true » existe mais n'est accessible que par son adresse)
const NAV = CHAPTERS.filter(c => !c.hidden), NIDX = NAV.indexOf(CH);

// coloration syntaxique (volontairement simple)
function tokenizer(re, kinds){
  return src => {
    let out = '', last = 0, m; re.lastIndex = 0;
    while((m = re.exec(src))){
      out += esc(src.slice(last, m.index)); last = re.lastIndex;
      const g = kinds.findIndex((_, i) => m[i+1] !== undefined), k = kinds[g];
      out += typeof k === 'function' ? k(m[g+1]) : `<span class="${k}">${esc(m[g+1])}</span>`;
    }
    return out + esc(src.slice(last));
  };
}
const SQL_KW = new Set('SELECT FROM WHERE AND OR NOT AS ON JOIN LEFT INNER GROUP BY ORDER HAVING LIMIT CREATE TABLE INDEX USING INSERT INTO VALUES UPDATE SET DELETE WITH DISTINCT COUNT IS NULL IN BETWEEN CASE WHEN THEN ELSE END GIST'.split(' '));
const PY_KW = new Set('import from as def return if elif else for in while with True False None and or not lambda print class'.split(' '));
const word = (set, up) => w => set.has(up ? w.toUpperCase() : w) ? `<span class="k">${w}</span>` : /^ST_/.test(w) ? `<span class="t">${w}</span>` : w;
const HL = {
  sql:  tokenizer(/(--.*$)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/gm, ['c','s','nb', word(SQL_KW, true)]),
  py:   tokenizer(/(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/gm, ['c','s','nb', word(PY_KW)]),
  json: tokenizer(/("(?:[^"\\]|\\.)*")(?=\s*:)|("(?:[^"\\]|\\.)*")|(-?\b\d+(?:\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g, ['t','s','nb','k']),
  md:   src => src.split('\n').map(l => /^\s*(#{1,4} |:::|\?\?\?|\$\$|\|)/.test(l) ? `<span class="k">${esc(l)}</span>` : esc(l).replace(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g, '<span class="t">$1</span>')).join('\n'),
  sh:   src => src.split('\n').map(l => /^\s*#/.test(l) ? `<span class="c">${esc(l)}</span>` : esc(l).replace(/(^|\s)(--?[\w-]+)/g, '$1<span class="k">$2</span>').replace(/^(\s*)(java|ili2c|ilivalidator|ili2gpkg|ili2pg|ogr2ogr|gdalinfo|gdalwarp|pdal|python|psql|qgis_process|git)\b/, '$1<span class="t">$2</span>')).join('\n'),
  html: src => { const re = /(<!--[\s\S]*?-->|<\?[\s\S]*?\?>)|<(\/?)([\w.:-]+)([^>]*?)(\/?)>/g; let out = '', last = 0, m;
    while((m = re.exec(src))){ out += esc(src.slice(last, m.index)); last = re.lastIndex;
      if(m[1]){ out += `<span class="c">${esc(m[0])}</span>`; continue; }
      out += `<span class="t">&lt;${m[2]}${m[3]}</span>${esc(m[4]).replace(/([\w.:-]+)=(&quot;.*?&quot;)/g, '<span class="nb">$1</span>=<span class="s">$2</span>')}<span class="t">${m[5]}&gt;</span>`; }
    return out + esc(src.slice(last)); },
  // INTERLIS 1 et 2 (modèles .ili)
  ili: (() => {
    const KW = new Set(('INTERLIS MODEL TOPIC CLASS STRUCTURE ASSOCIATION END EXTENDS ABSTRACT EXTENDED FINAL MANDATORY OPTIONAL TEXT MTEXT ' +
      'DOMAIN UNIT IMPORTS AT VERSION TABLE IDENT NO TRANSFER FORMAT FREE FIX CODE BLANK UNDEFINED CONTINUE DEFAULT TID ANY ' +
      'COORD COORD2 COORD3 POLYLINE SURFACE AREA WITH STRAIGHTS ARCS VERTEX WITHOUT OVERLAPS DATE DIM1 DIM2 UNIQUE CONSTRAINT ' +
      'BAG LIST OF REFERENCE TO BOOLEAN ROTATION NUMERIC VIEW BASKET OID IN NOT AND OR DEFINED ORDERED FUNCTION EXTERNAL ' +
      'DEPENDS ON URI NAME LINE DIRECTED FROM ALL OBJECT OBJECTS SET TRANSLATION MULTISURFACE MULTIAREA MULTIPOLYLINE MULTICOORD').split(' '));
    return tokenizer(/(!!.*$|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)|(-<#>|-<>|--|->|\.\.|#[A-Za-z_]\w*)/gm,
      ['c', 's', 'nb', w => KW.has(w) ? `<span class="k">${w}</span>` : w, 'u']);
  })(),
  // fichier de transfert INTERLIS 1 (.itf)
  itf: src => src.split('\n').map(line => {
    const m = line.match(/^(SCNT|MTID|MODL|TOPI|TABL|OBJE|STPT|LIPT|ARCP|ELIN|ETAB|ETOP|EMOD|ENDE|CONT|PERI|\/\/\/\/)(.*)$/);
    if(!m) return `<span class="c">${esc(line)}</span>`;
    return `<span class="k">${esc(m[1])}</span>` + esc(m[2]).replace(/(^|\s)(@)(?=\s|$)/g, '$1<span class="u">@</span>').replace(/(^|\s)(-?\d+(?:\.\d+)?)(?=\s|$)/g, '$1<span class="nb">$2</span>');
  }).join('\n'),
};
HL.geojson = HL.json; HL.xml = HL.xtf = HL.html; HL.ili1 = HL.ili;
const hl = (src, lang) => (HL[lang] || esc)(src);

function copyText(btn, text){
  const done = () => { btn.textContent = 'Copié'; setTimeout(() => btn.textContent = 'Copier', 1400); };
  const fallback = () => { const r = document.createRange(); r.selectNodeContents(btn.closest('.codeblock').querySelector('pre'));
    const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Sélectionné'; };
  try{ navigator.clipboard.writeText(text).then(done, fallback); }catch(e){ fallback(); }
}
function makeCodeBlock(src, lang, fileName){
  const fig = document.createElement('figure');
  fig.className = 'codeblock';
  fig.innerHTML = `<div class="cb-bar"><span class="cb-file">${esc(fileName || lang || 'texte')}</span><button class="cb-copy" type="button">Copier</button></div><pre><code></code></pre>`;
  const code = fig.querySelector('code');
  fig.setCode = s => { src = s; code.innerHTML = hl(s, lang); };
  fig.setCode(src);
  fig.querySelector('.cb-copy').onclick = e => copyText(e.currentTarget, src);
  return fig;
}

// Mots reliés entre blocs de code : survoler un mot le surligne dans tous les blocs du même groupe.
// <script type="text/x-code" data-lang="ili" data-links="Arbre,Espece" data-group="m1">
function linkify(el, words, group){
  const re = new RegExp('\\b(' + words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'g');
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n => {
    const t = n.nodeValue; re.lastIndex = 0;
    if(!re.test(t)) return;
    re.lastIndex = 0;
    const frag = document.createDocumentFragment(); let last = 0, m;
    while((m = re.exec(t))){
      frag.append(t.slice(last, m.index));
      const s = document.createElement('span');
      s.className = 'lnk'; s.dataset.w = m[1]; s.dataset.g = group; s.textContent = m[1];
      frag.append(s); last = re.lastIndex;
    }
    frag.append(t.slice(last));
    n.replaceWith(frag);
  });
}
const setLink = (t, on) => document.querySelectorAll(`.lnk[data-g="${t.dataset.g}"][data-w="${t.dataset.w}"]`).forEach(x => x.classList.toggle('on', on));
document.addEventListener('mouseover', e => { const t = e.target.closest && e.target.closest('.lnk'); if(t) setLink(t, true); });
document.addEventListener('mouseout',  e => { const t = e.target.closest && e.target.closest('.lnk'); if(t) setLink(t, false); });

// ---------------------------------------------------------------- 3. Markdown
/* Syntaxe (détaillée dans guide.html) :
   ## Section (numérotée automatiquement)   ### Sous-section
   paragraphes · **gras** · *italique* · `code` · [lien](page.html) · ++Ctrl++ (touche)
   - liste / 1. liste numérotée · | tableau | · $$ formule $$ · ![légende](image.png)
   ```sql fichier.sql … ```               bloc de code coloré avec bouton Copier
   :::retenir / :::attention / :::terrain / :::exo [précision]  …  :::
   :::info Titre libre … :::               encadré avec titre au choix
   :::carte Titre … :::                    carte (aide-mémoire), regroupées en grille
   ??? Solution … ???                      bloc dépliable (dans un exercice)
   Une ligne qui commence par < est du HTML, recopié tel quel. */
function frenchSpaces(s){ return s.replace(/ ([:;?!»])/g, '&nbsp;$1').replace(/« /g, '«&nbsp;'); }
function inline(s){
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
       .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>')
       .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
       .replace(/\+\+(.+?)\+\+/g, '<kbd>$1</kbd>');
  return frenchSpaces(s).replace(/\u0000(\d+)\u0000/g, (_, k) => `<code>${esc(codes[k])}</code>`);
}
function markdown(src){
  const lines = dedent(src).split('\n'), codes = [];
  let i = 0;
  const START = /^\s*(#{2,4}\s|```|:::|\?\?\?|\$\$|\||[-*]\s|\d+\.\s|!\[|<)/;
  function box(type, title, body){
    if(type === 'carte') return `<div class="card">${title ? `<h3>${inline(title)}</h3>` : ''}${body}</div>`;
    const lab = type === 'info' ? (title || 'Info') : (C.labels[type] || type) + (title ? ' · ' + title : '');
    return `<div class="box ${esc(type)}"><span class="lab">${inline(lab)}</span>${body}</div>`;
  }
  function parse(end){
    let out = '';
    while(i < lines.length){
      const l = lines[i], t = l.trim(); let m;
      if(end && end.test(t)){ i++; return out; }
      if(!t){ i++; continue; }
      if((m = t.match(/^(#{2,4})\s+(.*)$/))){ const n = m[1].length; out += `<h${n}>${inline(m[2])}</h${n}>`; i++; continue; }
      if((m = t.match(/^```(\w*)\s*(.*)$/))){
        i++; const buf = [];
        while(i < lines.length && !/^\s*```\s*$/.test(lines[i])) buf.push(lines[i++]);
        i++; codes.push({src: dedent(buf.join('\n')), lang: m[1] || 'txt', file: m[2]});
        out += `<div class="md-code" data-k="${codes.length - 1}"></div>`; continue;
      }
      if((m = t.match(/^:::\s*(\w+)\s*(.*)$/))){ i++; out += box(m[1], m[2], parse(/^:::\s*$/)); continue; }
      if((m = t.match(/^\?\?\?\s+(.+)$/))){ i++; out += `<details><summary>${inline(m[1])}</summary>${parse(/^\?\?\?\s*$/)}</details>`; continue; }
      if(/^\$\$.+\$\$$/.test(t)){ out += `<div class="formula">${t.slice(2, -2).trim()}</div>`; i++; continue; }
      if((m = t.match(/^!\[(.*?)\]\((.+?)\)$/))){ out += `<figure class="fig"><img src="${esc(m[2])}" alt="${esc(m[1])}"><figcaption>${inline(m[1])}</figcaption></figure>`; i++; continue; }
      if(t.startsWith('|')){
        const rows = []; while(i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++].trim());
        const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        const head = rows[1] && /^\|?[\s:|-]+$/.test(rows[1]) && rows[1].includes('-');
        const body = rows.slice(head ? 2 : 0);
        out += `<div class="tbl"><table>${head ? `<thead><tr>${cells(rows[0]).map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead>` : ''}<tbody>${body.map(r => `<tr>${cells(r).map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
        continue;
      }
      if(/^([-*]|\d+\.)\s+/.test(t)){
        const tag = /^\d/.test(t) ? 'ol' : 'ul', items = [];
        while(i < lines.length){
          const x = lines[i], mm = x.trim().match(/^(?:[-*]|\d+\.)\s+(.*)$/);
          if(mm && !/^\s{4,}/.test(x)){ items.push(mm[1]); i++; }
          else if(x.trim() && /^\s{2,}/.test(x) && items.length && !(end && end.test(x.trim()))){ items[items.length - 1] += ' ' + x.trim(); i++; }
          else break;
        }
        out += `<${tag}>${items.map(it => `<li>${inline(it)}</li>`).join('')}</${tag}>`; continue;
      }
      if(t.startsWith('<')){
        const buf = []; while(i < lines.length && lines[i].trim() && !(end && end.test(lines[i].trim()))) buf.push(lines[i++]);
        out += buf.join('\n'); continue;
      }
      const buf = [];
      while(i < lines.length && lines[i].trim() && !(end && end.test(lines[i].trim())) && (!buf.length || !START.test(lines[i]))) buf.push(lines[i++].trim());
      out += `<p>${inline(buf.join(' '))}</p>`;
    }
    return out;
  }
  const html = parse(null);
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  tpl.content.querySelectorAll('.md-code').forEach(d => { const c = codes[+d.dataset.k]; d.replaceWith(makeCodeBlock(c.src, c.lang, c.file)); });
  return tpl.content;
}

window.GEO = {store, esc, dedent, fmtCH, hl, makeCodeBlock, linkify, markdown, inline, CHAPTERS, COURSE: C, FILE};

// ---------------------------------------------------------------- 5a. thème (avant affichage)
const THEMES = ['système', 'clair', 'sombre'];
let theme = store.get('theme', 'système');
function applyTheme(t){ if(t === 'clair') root.dataset.theme = 'light'; else if(t === 'sombre') root.dataset.theme = 'dark'; else delete root.dataset.theme; }
applyTheme(theme);
root.classList.toggle('proj', !!store.get('proj', false));
// largeur du menu choisie par l'utilisateur (poignée, voir buildTocResize)
const TOC_MIN = 200, TOC_MAX = 480;
function setTocW(w){ if(w) root.style.setProperty('--toc-w', Math.round(Math.min(TOC_MAX, Math.max(TOC_MIN, w))) + 'px'); else root.style.removeProperty('--toc-w'); }
setTocW(store.get('tocw', null));

// ---------------------------------------------------------------- 4. mise en page
const label = c => (c.num ? c.num + '. ' : '') + c.title;
const isNumbered = c => /^\d+$/.test(c.num || '');

function buildHeader(doc){
  if(!CH.num) return;
  const total = CHAPTERS.filter(isNumbered).length;
  const annex = !isNumbered(CH);
  const kicker = (annex ? 'Annexe ' + CH.num : 'Chapitre ' + CH.num) + (CH.duration ? ' · ' + CH.duration : '');
  const cells = [
    [annex ? 'Annexe' : 'Chapitre', annex ? CH.num : `${CH.num} / ${total}`],
    ['Durée', CH.duration], ['Prérequis', CH.prereq], ['Activité', CH.activity],
    ...Object.entries(CH.info || {}),                // cases libres : info: {'Fichiers': '.ili, .itf'}
  ].filter(c => c[1]);
  const q = CH.question;
  const h = document.createElement('header');
  h.className = 'chap';
  h.innerHTML = `<div><div class="kicker">${esc(kicker)}</div><h1>${esc(CH.title)}</h1>${CH.lead ? `<p class="lead">${inline(esc(CH.lead))}</p>` : ''}</div>
    <div class="cartouche">${cells.map((c, k) => {
      const lastCell = k === cells.length - 1, cls = [lastCell && cells.length % 2 ? 'full' : '', lastCell && !q ? 'last' : ''].filter(Boolean).join(' ');
      return `<div${cls ? ` class="${cls}"` : ''}><i>${c[0]}</i><b>${esc(c[1])}</b></div>`; }).join('')}${q ? `<div class="full last"><i>Question clé</i><b>${esc(q)}</b></div>` : ''}</div>`;
  doc.prepend(h);
  // CH.goals (objectifs) reste dans config.js comme référence pour les auteurs : il n'est plus affiché.
  document.title = CH.title + ' · ' + C.title;
}

function buildPlan(doc){
  doc.querySelectorAll('[data-plan]').forEach(el => {
    const list = CHAPTERS.filter(c => isNumbered(c));
    el.outerHTML = `<ol class="plan">${list.map(c => `<li><a href="${c.file}"><span class="n">${c.num}</span><b>${esc(c.title)}</b>${c.summary ? `<p>${esc(c.summary)}</p>` : ''}<div class="meta">${[c.duration, ...(c.tags || [])].filter(Boolean).map(t => `<span>${esc(t)}</span>`).join('')}</div></a></li>`).join('')}</ol>`;
  });
}

// Quiz : <script type="application/json" data-quiz>[{q, o:[…], a:index, w:"explication", ch:"page.html", code:["ili", "…"]}]</script>
// (code est facultatif : un extrait affiché sous la question)
function buildQuiz(doc){
  doc.querySelectorAll('script[data-quiz]').forEach(s => {
    let Q; try{ Q = JSON.parse(s.textContent); }catch(e){ s.outerHTML = '<p class="chip err">Quiz : JSON invalide</p>'; return; }
    const key = 'quiz.' + FILE, L = 'ABCDEF';
    const box = document.createElement('div');
    box.innerHTML = `<div class="qbar"><div class="dots">${Q.map(() => '<span></span>').join('')}</div>
      <div class="row"><span class="mono small qscore"></span><button class="btn sm qreset" type="button">Recommencer</button></div></div>
      <ol class="quiz">${Q.map((q, i) => `<li class="q" data-i="${i}"><h3>${inline(esc(q.q))}</h3>
        <div class="opts" role="group" aria-label="Réponses à la question ${i + 1}">${q.o.map((o, k) => `<button type="button" data-k="${k}"><span class="l">${L[k]}</span><span>${inline(esc(o))}</span></button>`).join('')}</div>
        <p class="why"></p></li>`).join('')}</ol>
      <div class="res" hidden><div class="big"></div><p class="rtxt"></p><ul class="rlist"></ul></div>`;
    box.querySelectorAll('.quiz .q').forEach(li => { const c = Q[+li.dataset.i].code;
      if(c) li.querySelector('h3').after(makeCodeBlock(c[1], c[0], c[2] || 'extrait.' + c[0])); });
    s.replaceWith(...box.childNodes);
    let ans = store.get(key, {});
    const $ = sel => doc.querySelector(sel);
    function paint(){
      let ok = 0, n = 0;
      doc.querySelectorAll('.quiz .q').forEach(li => {
        const i = +li.dataset.i, q = Q[i], a = ans[i], done = a !== undefined;
        li.querySelectorAll('.opts button').forEach(b => {
          const k = +b.dataset.k; b.disabled = done;
          b.classList.toggle('right', done && k === q.a);
          b.classList.toggle('wrong', done && k === a && a !== q.a);
          b.classList.toggle('dim', done && k !== q.a && k !== a);
        });
        const ch = CHAPTERS.find(c => c.file === q.ch);
        li.querySelector('.why').innerHTML = done ? `<strong>${a === q.a ? 'Juste.' : 'Faux.'}</strong> ${inline(esc(q.w || ''))}${ch ? ` <a href="${ch.file}">Revoir : ${esc(label(ch))}</a>` : ''}` : '';
        if(done){ n++; if(a === q.a) ok++; }
        $('.dots').children[i].className = done ? (a === q.a ? 'ok' : 'ko') : '';
      });
      $('.qscore').textContent = `${ok} / ${Q.length}` + (n < Q.length ? ` · ${Q.length - n} restante${Q.length - n > 1 ? 's' : ''}` : '');
      const res = $('.res'); res.hidden = n < Q.length;
      if(n === Q.length){
        res.querySelector('.big').textContent = `${ok} / ${Q.length}`;
        res.querySelector('.rtxt').textContent = ok === Q.length ? 'Parfait.' : ok >= Math.ceil(Q.length * .8) ? 'Objectif atteint. Revoyez le(s) point(s) ci-dessous.' : 'Pas encore. Revoyez les chapitres ci-dessous, puis recommencez.';
        const bad = [...new Set(Q.filter((q, i) => ans[i] !== q.a).map(q => q.ch))].map(f => CHAPTERS.find(c => c.file === f)).filter(Boolean);
        res.querySelector('.rlist').innerHTML = bad.map(c => `<li><a href="${c.file}">${esc(label(c))}</a></li>`).join('');
      }
    }
    doc.querySelectorAll('.quiz .opts button').forEach(b => b.onclick = () => { ans[b.closest('.q').dataset.i] = +b.dataset.k; store.set(key, ans); paint(); });
    $('.qreset').onclick = () => { ans = {}; store.set(key, ans); paint(); scrollTo({top: 0, behavior: 'smooth'}); };
    paint();
  });
}

const LOGO = `<svg class="brand-mark" viewBox="0 0 34 34" aria-hidden="true"><path d="M17 3L31 17L17 31L3 17Z" class="fillsheet strokeink" stroke-width="2"/><path d="M17 9V25M9 17H25" class="strokeink" stroke-width="1.3"/><circle cx="17" cy="17" r="3.8" class="fillaccent"/></svg>`;
function buildToc(){
  const toc = document.createElement('aside');
  toc.className = 'toc'; toc.id = 'toc';
  toc.innerHTML = `
    <a class="brand" href="index.html">${LOGO}<span><b>${esc(C.title)} <span class="ver" title="Version du cours (${esc(C.date)})">v${esc(C.version)}</span></b><small>${esc(C.subtitle)}</small></span></a>
    <button class="btn sm toc-toggle" type="button" aria-expanded="false">Menu</button>
    <nav aria-label="Chapitres"><ol>${NAV.map(c => `<li><a href="${c.file}"${c === CH ? ' aria-current="page"' : ''}>
      <span class="n">${c.num || '·'}</span><span>${esc(c.title)}</span></a></li>`).join('')}</ol></nav>
    <div class="toc-tools">
      <button class="tool" type="button" id="tTheme">Thème <span class="st"></span></button>
      <button class="tool" type="button" id="tProj">Mode projection <span class="st"></span></button>
      <button class="tool" type="button" id="tApp" hidden>Installer l'appli <span class="st">hors ligne</span></button>
      <div class="toc-keys">← → chapitre · P projection</div>
      <div class="toc-keys" id="tOff"></div>
    </div>`;
  const q = s => toc.querySelector(s);
  const paint = () => {
    q('#tTheme .st').textContent = theme;
    q('#tProj').setAttribute('aria-pressed', root.classList.contains('proj'));
    q('#tProj .st').textContent = root.classList.contains('proj') ? 'oui' : 'non';
  };
  q('#tTheme').onclick = () => { theme = THEMES[(THEMES.indexOf(theme) + 1) % 3]; applyTheme(theme); store.set('theme', theme); paint(); };
  q('#tProj').onclick = () => { store.set('proj', root.classList.toggle('proj')); paint(); };
  q('.toc-toggle').onclick = e => { const o = toc.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
  addEventListener('geo:proj', paint);
  paint();
  return toc;
}

// poignée verticale au bord droit du menu : glisser pour élargir / rétrécir, double-clic pour revenir
// à la largeur par défaut ; au clavier, flèches gauche/droite (Origine = défaut). Écrans larges seulement.
function buildTocResize(){
  const h = document.createElement('div');
  h.className = 'toc-resize';
  Object.assign(h, {tabIndex: 0, title: 'Glisser pour régler la largeur du menu (double-clic : largeur par défaut)'});
  h.setAttribute('role', 'separator'); h.setAttribute('aria-orientation', 'vertical');
  h.setAttribute('aria-label', 'Largeur du menu'); h.setAttribute('aria-valuemin', TOC_MIN); h.setAttribute('aria-valuemax', TOC_MAX);
  const cur = () => document.getElementById('toc').getBoundingClientRect().width;
  const sync = () => h.setAttribute('aria-valuenow', Math.round(cur()));
  const save = () => { store.set('tocw', root.style.getPropertyValue('--toc-w') ? parseInt(root.style.getPropertyValue('--toc-w')) : null); sync(); };
  h.addEventListener('pointerdown', e => {
    if(e.button !== 0) return;
    e.preventDefault(); h.setPointerCapture(e.pointerId);
    h.classList.add('drag'); root.classList.add('toc-dragging');
    const move = ev => setTocW(ev.clientX);
    const up = () => { h.classList.remove('drag'); root.classList.remove('toc-dragging'); h.removeEventListener('pointermove', move); save(); };
    h.addEventListener('pointermove', move);
    h.addEventListener('pointerup', up, {once: true}); h.addEventListener('pointercancel', up, {once: true});
  });
  h.addEventListener('dblclick', () => { setTocW(null); save(); });
  h.addEventListener('keydown', e => {
    const step = e.shiftKey ? 48 : 16;
    if(e.key === 'ArrowLeft') setTocW(cur() - step);
    else if(e.key === 'ArrowRight') setTocW(cur() + step);
    else if(e.key === 'Home') setTocW(null);
    else return;
    e.preventDefault(); e.stopPropagation(); save();
  });
  requestAnimationFrame(sync);
  return h;
}

function buildPager(doc){
  const p = NIDX > 0 && NAV[NIDX - 1], n = NIDX >= 0 && NAV[NIDX + 1];
  const nav = document.createElement('nav');
  nav.className = 'pager'; nav.setAttribute('aria-label', 'Chapitre précédent et suivant');
  nav.innerHTML = (p ? `<a class="prev" href="${p.file}"><small>← Précédent</small><b>${esc(label(p))}</b></a>` : '') +
                  (n ? `<a class="next" href="${n.file}"><small>Suivant →</small><b>${esc(label(n))}</b></a>` : '');
  const col = document.createElement('p');
  col.className = 'colophon';
  col.textContent = `${C.colophon} · version ${C.version} (${C.date})`;
  doc.append(nav, col);
}

document.addEventListener('DOMContentLoaded', () => {
  const doc = document.querySelector('main.doc') || document.body.appendChild(Object.assign(document.createElement('main'), {className: 'doc'}));
  // ossature : <div class="site"><aside class="toc"/><main class="doc"/></div>
  const site = document.createElement('div');
  site.className = 'site';
  doc.before(site);
  site.append(buildToc(), buildTocResize(), doc);
  // définitions SVG partagées (effet crayon, flèches)
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    <filter id="crayon" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="fillink"/></marker>
    <marker id="arr-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="fillaccent"/></marker>
    <marker id="tri" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="13" markerHeight="13" orient="auto"><path d="M1 1L11 6L1 11z" class="fillsheet strokeink" stroke-width="1.2"/></marker>
    <marker id="dia" viewBox="0 0 14 10" refX="1" refY="5" markerWidth="15" markerHeight="11" orient="auto"><path d="M1 5L7 1L13 5L7 9z" class="fillsheet strokeink" stroke-width="1.2"/></marker></defs></svg>`);

  // contenu Markdown
  doc.querySelectorAll('script[type="text/markdown"]').forEach(s => {
    if(s.dataset.demo !== undefined){              // démo du guide : rendu + source
      const d = document.createElement('div');
      d.className = 'demo';
      d.innerHTML = `<div class="demo-hd"><b>${esc(s.dataset.demo)}</b><span>Markdown</span></div><div class="demo-body"></div>`;
      d.querySelector('.demo-body').append(markdown(s.textContent));
      d.append(makeCodeBlock(dedent(s.textContent), 'md', 'à écrire dans la page'));
      s.replaceWith(d);
    } else s.replaceWith(markdown(s.textContent));
  });
  // blocs de code écrits en HTML : <script type="text/x-code" data-lang="sql" data-file="x.sql">
  doc.querySelectorAll('script[type="text/x-code"]').forEach(s => {
    const fig = makeCodeBlock(dedent(s.textContent), s.dataset.lang, s.dataset.file);
    if(s.id) fig.id = s.id;
    if(s.className) fig.classList.add(...s.className.split(/\s+/));
    if(s.dataset.links) linkify(fig.querySelector('code'), s.dataset.links.split(','), s.dataset.group || 'g');
    s.replaceWith(fig);
  });
  // cartes consécutives → grille
  doc.querySelectorAll('.card').forEach(c => {
    if(c.parentElement.classList.contains('cards')) return;
    const grid = document.createElement('div'); grid.className = 'cards';
    c.before(grid);
    let n = c; while(n && n.classList && n.classList.contains('card')){ const next = n.nextElementSibling; grid.append(n); n = next; }
  });
  buildHeader(doc);
  buildPlan(doc);
  buildQuiz(doc);
  // numérotation des sections : 3.1, 3.2…
  let k = 0;
  doc.querySelectorAll(':scope > h2').forEach(h => { k++; h.insertAdjacentHTML('afterbegin', `<span class="sn">${CH.num || '0'}.${k}</span>`); });
  buildPager(doc);
  document.dispatchEvent(new Event('cours:ready'));
});

// ---------------------------------------------------------------- 5b. clavier
addEventListener('keydown', e => {
  if(e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
  if(e.key === 'ArrowRight' && NIDX >= 0 && NAV[NIDX + 1]) location.href = NAV[NIDX + 1].file;
  else if(e.key === 'ArrowLeft' && NIDX > 0) location.href = NAV[NIDX - 1].file;
  else if(e.key === 'p' || e.key === 'P'){ store.set('proj', root.classList.toggle('proj')); dispatchEvent(new Event('geo:proj')); }
});

// ---------------------------------------------------------------- 6. PWA
// Ne fonctionne que servi en http(s) (GitHub Pages) ; ouvert en file://, le cours marche déjà sans réseau.
let installEvt = null;
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
document.addEventListener('cours:ready', () => {
  const appBtn = document.getElementById('tApp'), off = document.getElementById('tOff');
  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
    navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready)
      .then(() => { off.textContent = standalone ? '✓ appli installée · hors ligne prêt' : '✓ disponible hors ligne'; }).catch(() => {});
    if(installEvt) appBtn.hidden = false;
    if(!standalone && /iP(hone|ad|od)/.test(navigator.userAgent)) appBtn.hidden = false;
  }
  appBtn.onclick = async () => {
    if(installEvt){ installEvt.prompt(); await installEvt.userChoice; installEvt = null; appBtn.hidden = true; }
    else alert("Sur iPhone / iPad : bouton Partager, puis « Sur l'écran d'accueil ».\nSur ordinateur (Edge, Chrome) : icône d'installation dans la barre d'adresse.");
  };
});
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; const b = document.getElementById('tApp'); if(b) b.hidden = false; });
addEventListener('appinstalled', () => { installEvt = null; const b = document.getElementById('tApp'); if(b) b.hidden = true; });
})();
