// ===========================================
// SERVICE WORKER - PWA SUPPORT
// ===========================================

const CACHE_NAME = 'dashboard-financeiro-v3.0.0';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Recursos para cache offline
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
];

// CDNs para cache
const CDN_URLS = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js',
  'https://unpkg.com/lucide@latest'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache aberto');
        // Não falha se algum recurso não carregar
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {cache: 'reload'})));
      })
      .catch((error) => {
        console.error('[Service Worker] Erro ao cachear:', error);
      })
  );
  
  // Força ativação imediata
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Assume controle imediatamente
  return self.clients.claim();
});

// Estratégia de cache: Network First com fallback para cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora requests não HTTP/HTTPS
  if (!request.url.startsWith('http')) return;
  
  // Ignora chrome extensions
  if (url.protocol === 'chrome-extension:') return;
  
  // Para CDNs: Cache First
  if (CDN_URLS.some(cdn => request.url.includes(cdn))) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Para tudo mais: Network First (prioriza dados frescos)
  event.respondWith(networkFirst(request));
});

// Estratégia: Network First
async function networkFirst(request) {
  try {
    // Tenta buscar da rede primeiro
    const networkResponse = await fetch(request);
    
    // Se sucesso, atualiza cache
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Se falhar, busca do cache
    console.log('[Service Worker] Rede falhou, buscando cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não tem cache, retorna página offline básica
    return new Response(
      '<html><body style="font-family: sans-serif; text-align: center; padding: 50px;"><h1>🔌 Sem Conexão</h1><p>Você está offline. Conecte-se à internet para visualizar o dashboard.</p><button onclick="location.reload()">Tentar Novamente</button></body></html>',
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Estratégia: Cache First (para CDNs)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Erro ao buscar:', request.url, error);
    return new Response('Recurso não disponível offline', { status: 503 });
  }
}

// Listener para mensagens do app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});