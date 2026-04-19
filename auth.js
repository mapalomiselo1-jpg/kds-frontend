// =====================
// IMPORTS
// =====================
import { db } from "./firebase.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// =====================
// INIT
// =====================
const auth = getAuth();

// =====================
// SIGN UP
// =====================
window.signup = async function () {

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const grade = document.getElementById("grade").value;
  const className = document.getElementById("class").value;

  const log = document.getElementById("log");

  // VALIDATION
  if (!name || !email || !password || !grade || !className) {
    log.textContent = "❌ Fill all fields";
    return;
  }

  try {

    // 🔐 CREATE AUTH USER
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    const uid = userCred.user.uid;

    // 💾 SAVE TEACHER PROFILE
    await setDoc(doc(db, "teachers", uid), {
      name,
      email,
      grade,
      class: className,
      createdAt: Date.now()
    });

    log.textContent = "✅ Account created successfully";

    // 🚀 REDIRECT (CHANGE THIS LATER)
    setTimeout(() => {
      window.location.href = "landing.html";
    }, 1000);

  } catch (err) {
  console.error("FULL ERROR:", err);

  log.textContent = `❌ ${err.code} 
${err.message}`;
}

    if (err.code === "auth/email-already-in-use") {
      log.textContent = "❌ Email already in use";
    } else if (err.code === "auth/weak-password") {
      log.textContent = "❌ Password too weak";
    } else {
      log.textContent = "❌ Signup failed";
    }
  };


// =====================
// LOGIN
// =====================
window.login = async function () {

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const log = document.getElementById("log");

  if (!email || !password) {
    log.textContent = "❌ Enter email and password";
    return;
  }

  try {

    await signInWithEmailAndPassword(auth, email, password);

    log.textContent = "✅ Login successful";

    // 🚀 REDIRECT
    setTimeout(() => {
      window.location.href = "landing.html";
    }, 800);

  } catch (err) {
    console.error(err);

    if (err.code === "auth/user-not-found") {
      log.textContent = "❌ User not found";
    } else if (err.code === "auth/wrong-password") {
      log.textContent = "❌ Wrong password";
    } else {
      log.textContent = "❌ Login failed";
    }
  }
};