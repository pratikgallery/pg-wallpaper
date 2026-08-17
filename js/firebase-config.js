import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
  getAuth 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { 
  getFirestore 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDZS1OZhhmf5s9xgDzz6V31RSN0E1ifY40",
  authDomain: "pg-wallpaper.firebaseapp.com",
  projectId: "pg-wallpaper",
  storageBucket: "pg-wallpaper.firebasestorage.app",
  messagingSenderId: "832840980151",
  appId: "1:832840980151:web:426396f5f2fe70d79f5f32"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
