import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Load Firebase config from environment variables (secure - not hardcoded)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that all required config values are present
const requiredConfigs = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const missingConfigs = requiredConfigs.filter(
  (key) => !firebaseConfig[key]
);

if (missingConfigs.length > 0) {
  console.error(
    "❌ Firebase config missing:",
    missingConfigs.join(", "),
    "\nCreate .env.local from .env.example"
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Enable offline persistence for better UX
db.enablePersistence?.().catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Multiple app instances detected, offline persistence disabled");
  } else if (err.code === "unimplemented") {
    console.warn("Browser does not support offline persistence");
  }
});

export default app;
