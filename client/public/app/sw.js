/**
 * Service worker mínimo — existe para tornar o site instalável
 * ("Adicionar à tela de início") e para dar uma resposta decente
 * quando a pessoa abre o app sem internet.
 *
 * Estratégia: rede primeiro, cache como rede de segurança. Nada de
 * cache agressivo, para que uma publicação nova apareça na hora.
 */
const CACHE = "wania-v2";
const CASCA = ["/", "/app/icone-192.png", "/app/icone-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(CASCA)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (req.url.includes("/api/")) return;

  event.respondWith(
    fetch(req)
      .then(resp => {
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match("/")))
  );
});
