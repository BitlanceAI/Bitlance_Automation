importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyBiqRvXwRXIvL23Avfu2iCEGrF92UL9v1Y",
    authDomain: "blogtest-34119.firebaseapp.com",
    projectId: "blogtest-34119",
    storageBucket: "blogtest-34119.firebasestorage.app",
    messagingSenderId: "370621229029",
    appId: "1:370621229029:web:eb30e5759019443e9ef10c"
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
