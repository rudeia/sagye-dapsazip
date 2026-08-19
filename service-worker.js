const CACHE_NAME = "sagye-fieldwork-v1";
const CACHE_PREFIX = "sagye-fieldwork-";
const OFFLINE_HOME = "./index.html";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./pwa-install.css",
  "./pwa-install.js",
  "./icons/app-icon-192.png",
  "./icons/app-icon-512.png",
  "./icons/app-icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-48.png",
  "./sinan/index.html",
  "./sinan/styles.css",
  "./sinan/data.js",
  "./sinan/app.js",
  "./jeju/index.html",
  "./jeju/styles.css",
  "./jeju/data.js",
  "./jeju/app.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function cacheResponse(request, response) {
  if (!response || !response.ok) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    await cacheResponse(request, response);
    return response;
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    return caches.match(OFFLINE_HOME, { ignoreSearch: true });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  const update = fetch(request)
    .then(async (response) => {
      await cacheResponse(request, response);
      return response;
    })
    .catch(() => null);
  const response = cached || await update;
  return response || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
