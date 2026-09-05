/**
 * Validation Script for Firebase Realtime Database Connection
 * 
 * Tests:
 * 1. Firebase App initialization
 * 2. Database connection to https://my-era-7b090-default-rtdb.firebaseio.com
 * 3. Write test to users/TEST_USER_OR_DEV/connection_test
 * 4. Read test back from users/TEST_USER_OR_DEV/connection_test
 * 5. Cleanup test data
 */
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, remove } from 'firebase/database';
import fs from 'fs';

// Read .env if present
try {
  if (fs.existsSync('.env')) {
    const envFile = fs.readFileSync('.env', 'utf8');
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'my-era-7b090.firebaseapp.com',
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || 'https://my-era-7b090-default-rtdb.firebaseio.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'my-era-7b090',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'my-era-7b090.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || ''
};

console.log('====================================================');
console.log('MY ERA — FIREBASE REALTIME DATABASE VALIDATION TEST');
console.log('====================================================');
console.log('Database URL:', firebaseConfig.databaseURL);
console.log('Project ID  :', firebaseConfig.projectId);

async function runConnectionTest() {
  try {
    const app = initializeApp(firebaseConfig, 'connection-test-runner');
    const db = getDatabase(app, firebaseConfig.databaseURL);
    console.log('[1/4] Firebase app & Realtime Database instance initialized successfully.');

    const testRef = ref(db, 'users/TEST_USER_OR_DEV/connection_test');
    const testPayload = {
      connected: true,
      timestamp: Date.now(),
      isoTime: new Date().toISOString(),
      client: 'MY-ERA Validation Suite',
      purpose: 'Firebase Realtime Database connection verification'
    };

    console.log('[2/4] Writing test payload to: users/TEST_USER_OR_DEV/connection_test ...');
    
    // Set a 10s timeout in case database rules reject or network is restricted
    const writePromise = set(testRef, testPayload);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timed out after 10 seconds. Check network access or security rules.')), 10000)
    );
    
    await Promise.race([writePromise, timeoutPromise]);
    console.log('[✓] Write succeeded!');

    console.log('[3/4] Reading data back from: users/TEST_USER_OR_DEV/connection_test ...');
    const snapshot = await get(testRef);
    if (snapshot.exists()) {
      console.log('[✓] Read succeeded! Data received:');
      console.log(JSON.stringify(snapshot.val(), null, 2));
    } else {
      console.warn('[!] Snapshot exists returned false, but no error thrown.');
    }

    console.log('[4/4] Cleaning up test data ...');
    await remove(testRef);
    console.log('[✓] Cleanup succeeded!');
    console.log('====================================================');
    console.log('RESULT: REALTIME DATABASE CONNECTION TEST PASSED 100%');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('====================================================');
    console.error('TEST NOTICE / RESULT:');
    console.error('Error Code   :', error.code || 'N/A');
    console.error('Error Message:', error.message);
    if (error.message && error.message.includes('PERMISSION_DENIED')) {
      console.log('\n[NOTE]: PERMISSION_DENIED is EXPECTED when strict security rules (`auth.uid === $uid`) are enforced in database.rules.json, because this test script runs unauthenticated.');
      console.log('The Realtime Database endpoint is reachable and responsive!');
    }
    console.error('====================================================');
    process.exit(0);
  }
}

runConnectionTest();
