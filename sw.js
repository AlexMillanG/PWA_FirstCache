const CACHE_NAME = 'pwa-cache-v1';
const DYNAMIC_CACHE = 'pwa-dynamic-v1';

// Recursos del App Shell
const ASSETS_APP_SHELL = [
  '/PWA_FirstCache/',
  '/PWA_FirstCache/index.html',
  '/PWA_FirstCache/calendario.html',
  '/PWA_FirstCache/formulario.html',
  '/PWA_FirstCache/main.js',
  '/PWA_FirstCache/manifest.json',
  '/PWA_FirstCache/styles.css',
  '/PWA_FirstCache/images/icons/192.png',
  '/PWA_FirstCache/images/icons/512.png'
];

// Recursos externos de bibliotecas (FullCalendar, Select2, jQuery)
const EXTERNAL_RESOURCES = [
  // FullCalendar
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css',
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js',

  // Select2
  'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css',
  'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js',

  // jQuery
  'https://code.jquery.com/jquery-3.7.1.min.js'
];

// Evento de instalación - cachear recursos del App Shell y recursos externos
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker...');

  event.waitUntil(
    Promise.all([
      // Cachear App Shell
      caches.open(CACHE_NAME).then(cache => {
        console.log('[SW] Cacheando App Shell');
        return cache.addAll(ASSETS_APP_SHELL);
      }),
      // Cachear recursos externos
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('[SW] Cacheando recursos externos (FullCalendar, Select2, jQuery)');
        return cache.addAll(EXTERNAL_RESOURCES);
      })
    ])
    .then(() => {
      console.log('[SW] Todos los recursos cacheados exitosamente');
      return self.skipWaiting(); // Activa el SW inmediatamente
    })
    .catch(err => {
      console.error('[SW] Error al cachear recursos:', err);
    })
  );
});

// Evento de activación - limpiar cachés antiguas
self.addEventListener('activate', event => {
  console.log('[SW] Activando Service Worker...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker activado');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  console.log('[SW] Fetch:', url.pathname);

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] Recurso encontrado en caché:', url.href);
          return cachedResponse;
        }

        console.log('[SW] Recurso no encontrado en caché, buscando en red:', url.href);

        return fetch(request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
              return networkResponse;
            }

            const cacheName = isExternalResource(url) ? DYNAMIC_CACHE : CACHE_NAME;

            const responseToCache = networkResponse.clone();

            caches.open(cacheName).then(cache => {
              console.log('[SW] Cacheando nuevo recurso:', url.href);
              cache.put(request, responseToCache);
            });

            return networkResponse;
          })
          .catch(error => {
            console.error('[SW] Error al obtener recurso de la red:', url.href, error);
          });
      })
  );
});

// Función auxiliar para identificar recursos externos
function isExternalResource(url) {
  const externalDomains = [
    'cdn.jsdelivr.net',
    'code.jquery.com',
    'cdnjs.cloudflare.com'
  ];

  return externalDomains.some(domain => url.hostname.includes(domain));
}
