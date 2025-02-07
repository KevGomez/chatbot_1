import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD4tnbzv_jLJnZ1oDYe26eA16TRimZ_XOc",
  authDomain: "chatbotk-9fa98.firebaseapp.com",
  databaseURL: "https://chatbotk-9fa98-default-rtdb.firebaseio.com/", // ✅ Corrected URL
  projectId: "chatbotk-9fa98",
  storageBucket: "chatbotk-9fa98.appspot.com", // ✅ Fixed incorrect storage URL
  messagingSenderId: "975692008880",
  appId: "1:975692008880:web:b74cf0a339fff1e0c21a75",
  measurementId: "G-CZK8TQYBCD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // ✅ Use Realtime Database
const auth = getAuth(app);

export { app, database, auth };
