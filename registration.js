import { db } from "./firebase.js";
import { collection, getDocs, doc, setDoc } 
from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// =====================
// AUTO STREAM
// =====================
window.autoStream = function () {
  const cls = document.getElementById("class").value;
  document.getElementById("stream").value = cls;
};

// =====================
// PHONE VALIDATION (260 + 9 digits)
// =====================
function validateZambianNumber(input) {
  let num = input.replace(/\D/g, ""); // remove spaces/symbols

  // If user enters only 9 digits, auto add 260
  if (num.length === 9) {
    num = "260" + num;
  }

  // Must be exactly 12 digits and start with 260
  if (num.length !== 12 || !num.startsWith("260")) {
    return null;
  }

  return num;
}

// =====================
// GENERATE NEXT ID
// =====================
async function generateStudentId() {
  const snap = await getDocs(collection(db, "students"));

  let max = 0;

  snap.forEach(doc => {
    const num = Number(doc.id);
    if (num > max) max = num;
  });

  const next = max + 1;

  return next.toString().padStart(3, "0");
}

// =====================
// ADD STUDENT
// =====================
window.addStudent = async function () {

  const name = document.getElementById("name").value.trim();
  const grade = document.getElementById("grade").value;
  const cls = document.getElementById("class").value;
  const phone = document.getElementById("phone").value.trim();

  const log = document.getElementById("log");

  // VALIDATION
  if (!name || !grade || !cls || !phone) {
    log.textContent = "❌ Fill all fields";
    return;
  }

  // VALIDATE PHONE
  const cleanPhone = validateZambianNumber(phone);

  if (!cleanPhone) {
    log.textContent = "❌ Phone must be 260 + 9 digits";
    return;
  }

  // generate ID
  const id = await generateStudentId();

  const fullClass = `${grade}${cls}`;

  const studentData = {
    name,
    grade,
    class: fullClass,
    stream: cls,
    parent_phone: cleanPhone,
    createdAt: Date.now()
  };

  try {

    await setDoc(doc(db, "students", id), studentData);

    log.textContent = `✅ Student Saved\nID: ${id}\n${name} (${fullClass})`;

    // CLEAR FORM
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("stream").value = "";

  } catch (err) {
    console.error(err);
    log.textContent = "❌ Failed to save student";
  }
};