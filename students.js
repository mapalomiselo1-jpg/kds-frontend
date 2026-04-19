import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { db } from "./firebase.js";

export let students = {};
export let studentsLoaded = false;

export async function loadStudents() {

  const snap = await getDocs(collection(db, "students"));

  students = {};

  snap.forEach(doc => {
    students[doc.id] = doc.data();
  });

  studentsLoaded = true;

  console.log("Students loaded");
}