importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyDtSwhXr-phrrGDXyPP61j1uVINozhgxNk",
    authDomain: "seo-automation-a90f2.firebaseapp.com",
    projectId: "seo-automation-a90f2",
    storageBucket: "seo-automation-a90f2.firebasestorage.app",
    messagingSenderId: "792330041476",
    appId: "1:792330041476:web:81bfe252e2b564248faad1"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/logo192.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
