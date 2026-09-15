/**
 * Firebase Firestore Configuration for VCET Tech Hub
 * Handles Firestore initialization with graceful error handling and fallbacks.
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let db = null;

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== "undefined" &&
    firebaseConfig.projectId !== "undefined"
  );
}

export function getFirebaseDb() {
  if (db) return db;

  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
    return db;
  } catch (err) {
    // Fail silently without exposing errors or breaking the UI
    console.warn("Firebase initialization skipped or unavailable:", err);
    return null;
  }
}

export { db };
