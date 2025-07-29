import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrNqTFATauU1A2RrQDmwAflpRHg3Pw4wk",
  authDomain: "tdata-e3dfe.firebaseapp.com",
  databaseURL: "https://tdata-e3dfe-default-rtdb.firebaseio.com",
  projectId: "tdata-e3dfe",
  storageBucket: "tdata-e3dfe.firebasestorage.app",
  messagingSenderId: "808367811018",
  appId: "1:808367811018:web:ed076aedcd45ee2499c733",
  measurementId: "G-5V2F8DH034"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 