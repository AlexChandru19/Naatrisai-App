// Naatrisai service worker: network-first pages (offline fallback), cache-first hashed static assets.
// New versions take over immediately (skipWaiting + clients.claim) so nobody stays on a stale build.
const V = "ns-v4";
const CORE = ["/", "/saved", "/offline", "/briefing", "/manifest.webmanifest", "/icon-192.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return; // publisher images/links stay untouched
  if (u.pathname.startsWith("/api/")) return; // live data always straight from the network
  if (u.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|woff2?)$/.test(u.pathname)) {
    e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); return res; })));
    return;
  }
  if (r.mode === "navigate" || r.headers.get("RSC") || u.searchParams.has("_rsc")) {
    // Network first (news must be fresh), fall back to the last copy, then the offline page.
    e.respondWith(fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); } return res; })
      .catch(() => caches.match(r).then((hit) => hit || (r.mode === "navigate" ? caches.match("/offline") : Response.error()))));
  }
});
