import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD4tnbzv_jLJnZ1oDYe26eA16TRimZ_XOc",
  authDomain: "chatbotk-9fa98.firebaseapp.com",
  databaseURL: "https://chatbotk-9fa98-default-rtdb.firebaseio.com/",
  projectId: "chatbotk-9fa98",
  storageBucket: "chatbotk-9fa98.appspot.com",
  messagingSenderId: "975692008880",
  appId: "1:975692008880:web:b74cf0a339fff1e0c21a75",
  measurementId: "G-CZK8TQYBCD",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database }; 