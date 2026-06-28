import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAiJ2dgvGJZqHHVjQ2y1GFEbhTySNoj5_Q",
  authDomain: "gen-lang-client-0144685312.firebaseapp.com",
  projectId: "gen-lang-client-0144685312",
  storageBucket: "gen-lang-client-0144685312.firebasestorage.app",
  messagingSenderId: "227009644053",
  appId: "1:227009644053:web:abf9c40bf3b88fe9ca701c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, "ai-studio-amoryyjbrental-9dc54884-d12f-405f-ac02-6c32fa401229");

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);
