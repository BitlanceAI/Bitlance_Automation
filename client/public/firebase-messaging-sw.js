importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const urlParams = new URL(location).searchParams;
const apiKey = urlParams.get('apiKey') || "YOUR_FIREBASE_API_KEY"; // Ensure this matches the env var in production

firebase.initializeApp({
    apiKey: apiKey,
    authDomain: "blogtest-34119.firebaseapp.com",
    projectId: "blogtest-34119",
    storageBucket: "blogtest-34119.firebasestorage.app",
    messagingSenderId: "370621229029",
    appId: "1:370621229029:web:eb30e5759019443e9ef10c"
});

const messaging = firebase.messaging();

// Handle background messages (when app/tab is not in focus)
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Received background message:', payload);

    const title = payload.notification?.title || 'New Update';
    const body = payload.notification?.body || 'Check out our latest content!';
    const url = payload.data?.url || '/';

    const notificationOptions = {
        body,
        icon: '/favicon.png',  // Use existing favicon
        badge: '/favicon.png',
        data: { url, ...payload.data },
        requireInteraction: false,
        vibrate: [200, 100, 200]
    };

    self.registration.showNotification(title, notificationOptions);
});

// Handle notification click — open the blog URL
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    client.navigate(url);
                    return;
                }
            }
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
