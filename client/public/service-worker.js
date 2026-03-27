const SW_VERSION = "noorfit-sw-v2";
const CACHE_PREFIX = "noorfit";
const CACHE_NAMES = {
  static: `${CACHE_PREFIX}-static-${SW_VERSION}`,
  api: `${CACHE_PREFIX}-api-${SW_VERSION}`,
  pages: `${CACHE_PREFIX}-pages-${SW_VERSION}`,
  images: `${CACHE_PREFIX}-images-${SW_VERSION}`,
};

const TTL = {
  static: 1000 * 60 * 60 * 24 * 30,
  api: 1000 * 60 * 5,
  image: 1000 * 60 * 60 * 24 * 14,
};

const LIMITS = {
  images: 80,
};

const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = ["/", "/index.html", OFFLINE_URL, "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAMES.static)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(`${CACHE_PREFIX}-`) && !Object.values(CACHE_NAMES).includes(key))
          .map((key) => caches.delete(key)),
      );

      await self.clients.claim();
      const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
      clients.forEach((client) => {
        client.postMessage({ type: "SW_ACTIVATED", version: SW_VERSION });
      });
    })(),
  );
});

self.addEventListener("message", (event) => {
  const { type } = event.data || {};

  if (type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (type === "GET_SW_VERSION") {
    event.source?.postMessage({ type: "SW_VERSION", version: SW_VERSION });
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (isNavigationRequest(request)) {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isApiRequest(request)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, CACHE_NAMES.images, TTL.image, LIMITS.images));
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.static, TTL.static));
  }
});

function isNavigationRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith("/api/");
}

function isStaticAsset(request) {
  return ["style", "script", "font", "worker"].includes(request.destination);
}

async function cacheFirst(request, cacheName, ttl, maxEntries) {
  const cached = await getCachedResponse(cacheName, request, ttl);
  if (cached) return cached;

  const networkResponse = await fetch(request);
  await cacheResponse(cacheName, request, networkResponse.clone());

  if (typeof maxEntries === "number") {
    await enforceMaxEntries(cacheName, maxEntries);
  }

  return networkResponse;
}

async function staleWhileRevalidate(request) {
  const cached = await getCachedResponse(CACHE_NAMES.api, request, TTL.api);

  const updatePromise = fetch(request)
    .then(async (response) => {
      await cacheResponse(CACHE_NAMES.api, request, response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await updatePromise;
  if (networkResponse) return networkResponse;

  return new Response(JSON.stringify({ message: "Offline" }), {
    status: 503,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    await cacheResponse(CACHE_NAMES.pages, request, response.clone());
    return response;
  } catch {
    const cachedPage = await caches.match(request);
    if (cachedPage) return cachedPage;

    const offlinePage = await caches.match(OFFLINE_URL);
    if (offlinePage) return offlinePage;

    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function getCachedResponse(cacheName, request, ttl) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (!cached) return null;
  if (!ttl || !isResponseExpired(cached, ttl)) {
    return cached;
  }

  await cache.delete(request);
  return null;
}

function isResponseExpired(response, ttl) {
  const cachedAt = response.headers.get("sw-cached-at");
  if (!cachedAt) return false;

  return Date.now() - Number(cachedAt) > ttl;
}

async function cacheResponse(cacheName, request, response) {
  if (!response || (response.status !== 200 && response.status !== 0)) return;

  const cache = await caches.open(cacheName);
  if (response.type === "opaque") {
    await cache.put(request, response);
    return;
  }

  const headers = new Headers(response.headers);
  headers.set("sw-cached-at", Date.now().toString());

  const body = await response.arrayBuffer();
  const stampedResponse = new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  await cache.put(request, stampedResponse);
}

async function enforceMaxEntries(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();

  if (requests.length <= maxEntries) return;

  const datedEntries = await Promise.all(
    requests.map(async (request) => {
      const response = await cache.match(request);
      const cachedAt = Number(response?.headers.get("sw-cached-at") || 0);
      return { request, cachedAt };
    }),
  );

  datedEntries
    .sort((a, b) => a.cachedAt - b.cachedAt)
    .slice(0, requests.length - maxEntries)
    .forEach(({ request }) => {
      cache.delete(request);
    });
}
