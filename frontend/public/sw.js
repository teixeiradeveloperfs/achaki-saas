// Cache only public brand assets; never authenticated pages or API responses.
const CACHE_PREFIX = 'achaki-shell-'
const CACHE_NAME = CACHE_PREFIX + 'v4'
const BRAND_ASSETS = [
  '/icons/favicons/favicon.svg', '/icons/favicons/favicon-32.png', '/brand/marks/brand-mark.svg', '/brand/marks/brand-mark-dark.svg',
  '/brand/logos/logo.svg', '/brand/logos/logo-light.svg', '/brand/logos/logo-dark.svg', '/brand/logos/logo-white.svg', '/brand/logos/logo-black.svg',
  '/icons/pwa/icon-192.png', '/icons/pwa/icon-512.png', '/icons/pwa/icon-maskable-512.png', '/icons/pwa/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(BRAND_ASSETS)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !BRAND_ASSETS.includes(url.pathname)) return
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request)
      return cached || fetch(event.request)
    }),
  )
})
