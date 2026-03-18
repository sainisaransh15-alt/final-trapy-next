// Firebase Messaging Service Worker for Trapy
// This handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase configuration - fetched at runtime to avoid hard-coding secrets in the bundle.
// Provide a /firebase-config.json in /public with the Firebase client config.
let messaging = null;

async function ensureFirebase() {
  if (messaging) return messaging;

  try {
    const response = await fetch('/firebase-config.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load firebase-config.json');
    const firebaseConfig = await response.json();

    if (!firebaseConfig?.apiKey) {
      console.warn('[firebase-messaging-sw] Firebase config missing apiKey; push notifications disabled.');
      return null;
    }

    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
    return messaging;
  } catch (error) {
    console.warn('[firebase-messaging-sw] Unable to initialize Firebase Messaging:', error);
    return null;
  }
}

ensureFirebase().then((messagingInstance) => {
  if (!messagingInstance) return;

  // Handle background messages
  messagingInstance.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Trapy Notification';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: payload.data?.type || 'trapy-notification',
      data: payload.data,
      actions: [
        {
          action: 'view',
          title: 'View Details',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200],
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'view' action - open the app
  const urlToOpen = event.notification.data?.link || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window/tab open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push event directly (fallback)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);

  if (event.data) {
    try {
      const payload = event.data.json();
      
      if (!payload.notification) {
        // FCM already handles notifications with the 'notification' key
        // This is for data-only messages
        const title = payload.data?.title || 'Trapy';
        const options = {
          body: payload.data?.body || payload.data?.message || 'New notification',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: payload.data,
        };

        event.waitUntil(
          self.registration.showNotification(title, options)
        );
      }
    } catch (error) {
      console.error('[firebase-messaging-sw.js] Error parsing push data:', error);
    }
  }
});

console.log('[firebase-messaging-sw.js] Service worker registered');