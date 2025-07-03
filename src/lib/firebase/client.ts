
// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


let firebase_app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (firebaseConfig.apiKey) {
    if (getApps().length === 0) {
        firebase_app = initializeApp(firebaseConfig);
    } else {
        firebase_app = getApp();
    }
    auth = getAuth(firebase_app);
} else {
    console.warn(
        '\x1b[33m%s\x1b[0m', // Yellow text
        'WARNING: Firebase client configuration is missing. Firebase client features will be disabled.'
    );
}

export { auth };
export default firebase_app;
