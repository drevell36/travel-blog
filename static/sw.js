const CACHE_NAME = 'travel-blog-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
	'/',
	'/offline.html',
	'/manifest.json'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(PRECACHE_ASSETS);
		})
	);
	self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name))
			);
		})
	);
	self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
	const { request } = event;

	// Skip non-GET requests
	if (request.method !== 'GET') {
		return;
	}

	// Skip admin routes - always fetch fresh
	if (request.url.includes('/admin')) {
		return;
	}

	// Skip API routes
	if (request.url.includes('/api/')) {
		return;
	}

	event.respondWith(
		fetch(request)
			.then((response) => {
				// Clone the response before caching
				const responseToCache = response.clone();

				// Cache successful responses
				if (response.status === 200) {
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, responseToCache);
					});
				}

				return response;
			})
			.catch(async () => {
				// Try to return cached version
				const cachedResponse = await caches.match(request);
				if (cachedResponse) {
					return cachedResponse;
				}

				// If it's a navigation request, show offline page
				if (request.mode === 'navigate') {
					const offlineResponse = await caches.match(OFFLINE_URL);
					if (offlineResponse) {
						return offlineResponse;
					}
				}

				// Return a basic offline response
				return new Response('Offline', {
					status: 503,
					statusText: 'Service Unavailable'
				});
			})
	);
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
	if (event.data) {
		const data = event.data.json();
		const options = {
			body: data.body,
			icon: '/icons/icon-192x192.png',
			badge: '/icons/icon-72x72.png',
			data: { url: data.url }
		};
		event.waitUntil(
			self.registration.showNotification(data.title, options)
		);
	}
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	if (event.notification.data?.url) {
		event.waitUntil(
			clients.openWindow(event.notification.data.url)
		);
	}
});
