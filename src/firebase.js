import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCT8F-3QEIB6t8iCsZhAioiCpvs3SLS87Q",
  authDomain: "fakhrimusic-63ad7.firebaseapp.com",
  projectId: "fakhrimusic-63ad7",
  storageBucket: "fakhrimusic-63ad7.firebasestorage.app",
  messagingSenderId: "248189245839",
  appId: "1:248189245839:web:3a4d47e47312e631b613fa",
  measurementId: "G-8EQSE7RPKH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };
