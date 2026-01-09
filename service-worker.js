const CACHE_NAME = 'eligner-tracker-v3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
  // Звуковой файл кэшируем при первой загрузке
];

// Получаем базовый путь для GitHub Pages
const getBasePath = () => {
  const path = self.location.pathname;
  if (path.includes('/eligner-tracker/')) {
    return '/eligner-tracker/';
  }
  return '/';
};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        const basePath = getBasePath();
        const urls = urlsToCache.map(url => 
          url.startsWith('./') ? basePath + url.substring(2) : url
        );
        
        // Добавляем внешние ресурсы
        urls.push('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        urls.push('https://cdn.jsdelivr.net/npm/chart.js/dist/chart.umd.js');
        
        return cache.addAll(urls);
      })
  );
});

self.addEventListener('fetch', event => {
  const basePath = getBasePath();
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        // Для внешних ресурсов
        if (event.request.url.includes('cdnjs.cloudflare.com') || 
            event.request.url.includes('cdn.jsdelivr.net')) {
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            });
        }
        
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});