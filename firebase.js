// =====================
// IMPORTS
// =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// =====================
// CONFIG
// =====================
const firebaseConfig = {
  apiKey: "AIzaSyDzf12PjZqWKOjmjOFYDndUhj_e_-LKbkg",
  authDomain: "kds-statement-system.firebaseapp.com",
  projectId: "kds-statement-system",
  storageBucket: "kds-statement-system.firebasestorage.app",
  messagingSenderId: "441836680197",
  appId: "1:441836680197:web:551afdcef622c7925d986c"
};
// =====================
// INIT
// =====================
const app = initializeApp(firebaseConfig);

// 🔥 EXPORT BOTH
export const db = getFirestore(app);
export const auth = getAuth(app);