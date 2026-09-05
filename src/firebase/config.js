/**
 * Dedicated Firebase Configuration Module for MY ERA
 * 
 * Uses Firebase Web App configuration via environment variables.
 * Initializes Realtime Database with getDatabase().
 * Does NOT use Firebase Admin SDK or expose private service account keys.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Helper to get local override from localStorage if set in-app
function getLocalConfigOverride() {
  try {
    const stored = localStorage.getItem('era_firebase_config');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return {};
}

const localOverride = typeof window !== 'undefined' ? getLocalConfigOverride() : {};

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localOverride.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localOverride.authDomain || 'my-era-7b090.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || localOverride.databaseURL || 'https://my-era-7b090-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localOverride.projectId || 'my-era-7b090',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localOverride.storageBucket || 'my-era-7b090.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localOverride.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localOverride.appId || ''
};

// Initialize or retrieve existing app instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Realtime Database with explicit databaseURL
let dbInstance = null;
try {
  dbInstance = getDatabase(app, firebaseConfig.databaseURL);
} catch (e) {
  console.warn('Firebase Realtime Database init warning:', e.message);
}
export const database = dbInstance;

// Initialize Firebase Auth safely
let authInstance = null;
try {
  if (firebaseConfig.apiKey) {
    authInstance = getAuth(app);
  }
} catch (e) {
  console.warn('Firebase Auth requires valid API Key:', e.message);
}
export const auth = authInstance;

// Helper check
export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.databaseURL);
}
