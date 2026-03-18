import { optionalEnv } from "./env";
// Firebase Cloud Messaging Configuration for Trapy

const FIREBASE_CONFIG = {
  apiKey: optionalEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: optionalEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: optionalEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: optionalEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: optionalEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: optionalEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

// VAPID key for web push - set in env: VITE_FIREBASE_VAPID_KEY
const VAPID_KEY = optionalEnv(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);

let messaging: import("firebase/messaging").Messaging | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;

export async function initializeFirebaseMessaging(): Promise<import("firebase/messaging").Messaging | null> {
  if (typeof window === "undefined") return null;
  
  try {
    if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.projectId || !FIREBASE_CONFIG.appId) {
      console.warn("Firebase env vars missing; messaging disabled.");
      return null;
    }
    // Dynamically import Firebase modules
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const { getMessaging, isSupported } = await import("firebase/messaging");
    
    // Check if messaging is supported in this browser
    const supported = await isSupported();
    if (!supported) {
      console.log("Firebase Messaging is not supported in this browser");
      return null;
    }
    
    // Initialize Firebase app if not already initialized
    const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
    
    // Register service worker for FCM if supported
    if ("serviceWorker" in navigator) {
      if (!swRegistration) {
        try {
          swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        } catch (err) {
          console.warn("Failed to register Firebase service worker", err);
        }
      }
    } else {
      console.warn("Service workers not supported; push notifications unavailable");
    }

    // Get messaging instance
    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error("Error initializing Firebase Messaging:", error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      console.warn("Notifications are not supported in this environment");
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }
    
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
}

export async function getFCMToken(): Promise<string | null> {
  try {
    if (!messaging) {
      await initializeFirebaseMessaging();
    }
    
    if (!messaging) {
      console.log("Messaging not initialized");
      return null;
    }
    
    const { getToken } = await import("firebase/messaging");

    if (!swRegistration && "serviceWorker" in navigator) {
      try {
        swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      } catch (err) {
        console.warn("Failed to register Firebase service worker", err);
      }
    }

    // Get registration token
    const token = await getToken(messaging!, {
      vapidKey: VAPID_KEY || undefined,
      serviceWorkerRegistration: swRegistration || undefined,
    });

    if (!VAPID_KEY) {
      console.warn("VAPID key missing: set VITE_FIREBASE_VAPID_KEY to enable web push tokens");
    }
    
    if (token) {
      console.log("FCM Token obtained");
      return token;
    } else {
      console.log("No FCM token available");
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

export async function onForegroundMessage(callback: (payload: unknown) => void): Promise<() => void> {
  try {
    if (!messaging) {
      await initializeFirebaseMessaging();
    }
    
    if (!messaging) {
      return () => {};
    }
    
    const { onMessage } = await import("firebase/messaging");
    
    const unsubscribe = onMessage(messaging as Parameters<typeof onMessage>[0], callback);
    
    return unsubscribe;
  } catch (error) {
    console.error("Error setting up foreground message handler:", error);
    return () => {};
  }
}

export { FIREBASE_CONFIG };