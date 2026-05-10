// Dummy service worker to suppress 404 errors in the console and logs.
// This is a minimal implementation that does nothing.

self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Ensure that any open clients are controlled by this service worker immediately.
  event.waitUntil(self.clients.claim());
});

// No fetch listener or caching logic here yet.
