import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
} = import.meta.env;

const missing = [
  ["VITE_FIREBASE_API_KEY", VITE_FIREBASE_API_KEY],
  ["VITE_FIREBASE_AUTH_DOMAIN", VITE_FIREBASE_AUTH_DOMAIN],
  ["VITE_FIREBASE_PROJECT_ID", VITE_FIREBASE_PROJECT_ID],
  ["VITE_FIREBASE_APP_ID", VITE_FIREBASE_APP_ID],
]
  .filter(([, v]) => !v || v.startsWith("your-"))
  .map(([k]) => k);

if (missing.length) {
  throw new Error(
    `Firebase config incomplete. Set these in .env: ${missing.join(", ")}`
  );
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      apiKey: VITE_FIREBASE_API_KEY,
      authDomain: VITE_FIREBASE_AUTH_DOMAIN,
      projectId: VITE_FIREBASE_PROJECT_ID,
      storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: VITE_FIREBASE_APP_ID,
    });

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
