import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDWZw43x-zNyvjX2JhJHaNscNcx6oDqbF8",
  authDomain: "studynex-app.firebaseapp.com",
  projectId: "studynex-app",
  storageBucket: "studynex-app.firebasestorage.app",
  messagingSenderId: "687518373435",
  appId: "1:687518373435:web:e635aa6664e4393a616e1e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);
export { onAuthStateChanged };
