// Service worker : rend le cours installable et utilisable hors ligne.
// - À l'installation, tous les fichiers du cours sont mis en cache.
// - Pages HTML : réseau d'abord (contenu à jour si connecté), cache si hors ligne.
// - Autres fichiers (CSS, JS, icônes, polices Google) : cache d'abord, mis à jour en arrière-plan.
// La version est remplacée à chaque déploiement par le workflow GitHub (sha du commit),
// ce qui force le renouvellement du cache chez tous les utilisateurs.
const VERSION = '__BUILD__';
const CACHE = 'cf-geo-cours-' + VERSION;
// La liste des pages vient de config.js : rien à modifier ici quand on ajoute un chapitre.
importScripts('config.js');
const FILES = [
  './', ...self.COURSE.chapters.map(c => c.file),
  'config.js', 'style.css', 'app.js', 'annotations.js', 'edition.js', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png',
];
const FONTS = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap';

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(FILES.map(f => new Request(f, {cache: 'reload'})));
    try{ await c.add(new Request(FONTS, {mode: 'no-cors'})); }catch(err){ /* polices facultatives */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for(const k of await caches.keys()) if(k.startsWith('cf-geo-cours-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = /^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if(!sameOrigin && !isFont) return;

  if(req.mode === 'navigate'){
    e.respondWith((async () => {
      try{
        const res = await fetch(req);
        (await caches.open(CACHE)).put(req, res.clone());
        return res;
      }catch(err){
        const c = await caches.open(CACHE);
        return (await c.match(req, {ignoreSearch: true})) || (await c.match('index.html'));
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req, {ignoreSearch: sameOrigin});
    const net = fetch(req).then(res => { if(res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => null);
    if(hit){ e.waitUntil(net); return hit; }
    return (await net) || new Response('', {status: 504, statusText: 'Hors ligne'});
  })());
});
