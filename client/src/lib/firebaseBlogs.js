import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Config for Blogs Firebase project
const firebaseBlogsConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_BLOGS_API_KEY,
    authDomain: "seo-automation-a90f2.firebaseapp.com",
    databaseURL: "https://seo-automation-a90f2-default-rtdb.firebaseio.com",
    projectId: "seo-automation-a90f2",
    storageBucket: "seo-automation-a90f2.firebasestorage.app",
    messagingSenderId: "792330041476",
    appId: "1:792330041476:web:81bfe252e2b564248faad1",
    measurementId: "G-T2JP0WB4R6"
};

// Initialize with a unique name (avoid conflict with your main Firebase)
const blogsApp = initializeApp(firebaseBlogsConfig, "blogsApp");
export const blogsDb = getDatabase(blogsApp);
