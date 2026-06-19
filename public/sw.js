// Service worker — caching strategy tuned to NEVER serve a stale page.
//
// The previous version used cache-first for every GET (including HTML), so once
// a page was cached the browser kept showing the old build forever, even after
// a refresh or a new deploy. That also risked serving a stale logged-in/out
// page (wrong auth state). This version:
//   - HTML navigations  -> network-first (always the latest build; cache only
//                          used as an offline fallback)
//   - hashed build files -> cache-first (safe: /_next/static names are immutable)
//   - images/fonts/icons -> cache-first with background refresh
//   - everything else (API/auth/_next/data) -> network-only (never cached)
//
// Bump CACHE_VERSION on any strategy change so the activate step purges old caches.
const CACHE_VERSION = "v3";
const CACHE_NAME = `quiz-platform-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [OFFLINE_URL, "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|otf)$/.test(url.pathname) ||
    url.pathname === "/manifest.webmanifest"
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle same-origin GETs; let the browser do everything else.
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 1) HTML navigations: always go to the network so the newest deploy shows.
  //    Fall back to the offline page only when truly offline.
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // 2) Immutable/static assets: serve from cache, refresh in the background.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // 3) Everything else (API, auth, /_next/data, etc.): network-only, never cached.
});
