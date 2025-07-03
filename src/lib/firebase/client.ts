// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAH4TvptHv5O7t6ttcEbhFlxhHGdibXBLA",
  authDomain: "von-os-juooq.firebaseapp.com",
  projectId: "von-os-juooq",
  storageBucket: "von-os-juooq.firebasestorage.app",
  messagingSenderId: "366247376303",
  appId: "1:366247376303:web:ecd3c107653c668c81eb5a",
  measurementId: "G-16X0Z7NPTJ"
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
        'WARNING: Firebase configuration is missing. Firebase client features will be disabled.'
    );
}

export { auth };
export default firebase_app;
