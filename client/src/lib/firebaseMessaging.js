import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from 'axios';

// Config from existing firebaseBlogs.js (seo-automation-a90f2)
export const firebaseConfig = {
    apiKey: "AIzaSyDtSwhXr-phrrGDXyPP61j1uVINozhgxNk",
    authDomain: "seo-automation-a90f2.firebaseapp.com",
    projectId: "seo-automation-a90f2",
    storageBucket: "seo-automation-a90f2.firebasestorage.app",
    messagingSenderId: "792330041476",
    appId: "1:792330041476:web:81bfe252e2b564248faad1",
    measurementId: "G-T2JP0WB4R6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to request notification permission
export const requestNotificationPermission = async () => {
    try {
        console.log("Requesting notification permission...");
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            console.log("Notification permission granted.");

            // 1. Ensure Service Worker is Registered
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (!registration) {
                    await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                }
            }

            // 2. WAIT for Service Worker to be Ready (Active & Controlling)
            const readyRegistration = await navigator.serviceWorker.ready;
            console.log('Service Worker is ready and active:', readyRegistration);

            // 3. Get FCM Token
            const token = await getToken(messaging, {
                serviceWorkerRegistration: readyRegistration
            });

            if (token) {
                console.log("FCM Token:", token);
                await saveTokenToBackend(token);
            } else {
                console.log("No registration token available. Request permission to generate one.");
            }
        } else {
            console.log("Unable to get permission to notify.");
        }
    } catch (error) {
        console.error("An error occurred while retrieving token. ", error);
        alert(`Failed to enable notifications: ${error.message}`);
    }
};

// Listen for foreground messages
export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log("Message received. ", payload);
            resolve(payload);
        });
    });

// Helper to save token to your backend db
const saveTokenToBackend = async (token) => {
    try {
        // Platform detection
        const userAgent = navigator.userAgent;
        let platform = "web";
        if (/android/i.test(userAgent)) platform = "android";
        if (/iPad|iPhone|iPod/.test(userAgent)) platform = "ios";

        // Call backend API
        // Assuming API_BASE_URL handles logic or hardcoded
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        await axios.post(`${API_URL}/api/push/tokens/register`, {
            token,
            platform,
            deviceId: `web-${Date.now()}` // Simple unique ID for web users
        });

        console.log("Token sent to server successfully.");
    } catch (error) {
        console.error("Error saving token to server:", error);
    }
};

export { messaging };
