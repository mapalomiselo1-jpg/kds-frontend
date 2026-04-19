import { db } from "./firebase.js";
import { formatResultSMS } from "./smsFormatter.js";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

import { getSubjects } from "./subjects.js";

// =====================
// STATE
// =====================
let students = {};
let classStudents = [];
let currentIndex = 0;
let selectedStudent = null;

// =====================
// UI HELPERS
// =====================
function showSpinner() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.remove("hidden");
}

function hideSpinner() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.add("hidden");
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function sortByName(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.slice().sort((a, b) => {
    const A = (a?.name || "").trim();
    const B = (b?.name || "").trim();
    return A.localeCompare(B, undefined, { sensitivity: "base" });
  });
}

// =====================
// LOAD STUDENTS
// =====================
async function loadAllStudents() {
  showSpinner();
  try {
    const snap = await getDocs(collection(db, "students"));
    students = {};

    snap.forEach(d => {
      students[d.id] = { id: d.id, ...d.data() };
    });

    console.log("Students loaded:", Object.keys(students).length);
  } catch (err) {
    console.error("Error loading students:", err);
  } finally {
    hideSpinner();
  }
}

// =====================
// LOAD SAVED RESULTS
// =====================
async function loadSavedResults(studentId) {
  try {
    const ref = doc(db, "results", studentId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// =====================
// INIT STUDENT
// =====================
async function initSelectedStudent() {
  showSpinner();

  try {
    const raw = sessionStorage.getItem("selectedStudent");

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.student) {
        selectedStudent = parsed.student;
      } else if (parsed?.studentId) {
        selectedStudent = await fetchStudentById(parsed.studentId);
      }
    }

    if (!selectedStudent) {
      const studentId = getQueryParam("student");
      if (studentId) {
        selectedStudent = students[studentId] || await fetchStudentById(studentId);
      }
    }

    if (!selectedStudent) {
      document.getElementById("studentName").textContent = "No student selected";
      document.getElementById("studentMeta").textContent = "";
      hideSpinner();
      return;
    }

    document.getElementById("studentName").textContent = selectedStudent.name;
    document.getElementById("studentMeta").textContent = `Class: ${selectedStudent.class}`;

    await generateSubjects(selectedStudent.class);

  } catch (err) {
    console.error(err);
  } finally {
    hideSpinner();
  }
}

async function fetchStudentById(id) {
  try {
    const ref = doc(db, "students", id);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    return null;
  }
}

// =====================
// SUBJECTS UI
// =====================
async function generateSubjects(className) {
  const container = document.getElementById("subjectsContainer");
  if (!container) return;

  container.innerHTML = "";

  const subjects = getSubjects(className);
  const saved = selectedStudent?.id ? await loadSavedResults(selectedStudent.id) : null;

  subjects.forEach(sub => {
    const value = saved?.subjects?.[sub] ?? "";

    container.innerHTML += `
      <div class="subjectInput">
        <span>${sub}</span>
        <input type="number" id="${sub}" class="markInput" value="${value}" oninput="calculateResults()" />
      </div>
    `;
  });

  calculateResults();
}

// =====================
// CALCULATION
// =====================
window.calculateResults = function () {
  if (!selectedStudent) return;

  const subjects = getSubjects(selectedStudent.class);

  let total = 0;

  subjects.forEach(sub => {
    total += Number(document.getElementById(sub)?.value) || 0;
  });

  const avg = total / subjects.length;
  const status = avg >= 50 ? "PASS" : "FAIL";

  document.getElementById("resultSummary").innerHTML =
    `Average: ${avg.toFixed(1)}%<br>Status: ${status}`;
};

// =====================
// SAVE + SMS SEND
// =====================
window.saveResults = async function () {
  if (!selectedStudent) return alert("No student selected");

  const subjects = getSubjects(selectedStudent.class);

  let resultObj = {};
  let total = 0;

  subjects.forEach(sub => {
    const val = Number(document.getElementById(sub).value) || 0;
    resultObj[sub] = val;
    total += val;
  });

  const avg = total / subjects.length;
  const status = avg >= 50 ? "PASS" : "FAIL";

  const resultData = {
    studentName: selectedStudent.name,
    class: selectedStudent.class,
    subjects: resultObj,
    avg,
    status,
    createdAt: Date.now()
  };

  const log = document.getElementById("log");

  try {
    // 1. SAVE TO FIREBASE
    await setDoc(doc(db, "results", selectedStudent.id), resultData);

    if (log) log.innerHTML = "✔ Saved successfully";

    // 2. SEND SMS ONLY IF PHONE EXISTS
   // =====================
// 2. SEND SMS ONLY IF PHONE EXISTS
// =====================
if (selectedStudent.parent_phone) {

  try {

    const message = formatResultSMS(
      selectedStudent,
      subjects,
      resultObj,
      avg,
      status
    );

    const response = await fetch("https://kds-sms-backend-1.onrender.com/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        phone: selectedStudent.parent_phone,
        message
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    console.log("📨 SMS RESPONSE:", data);

    if (data.error) {
      throw new Error(data.error);
    }

    if (log) log.innerHTML += "<br>📱 SMS Sent Successfully";

  } catch (smsError) {
    console.error("❌ SMS FAILED:", smsError);

    if (log) {
      log.innerHTML += "<br>❌ SMS Failed (check backend/logs)";
    }
  }
}

    // 3. MOVE TO NEXT STUDENT
    nextStudent();

  } catch (err) {
    console.error("SAVE ERROR:", err);
    if (log) log.innerHTML = "❌ Failed";
  }
};

// =====================
// NAVIGATION
// =====================
window.nextStudent = function () {
  if (currentIndex < classStudents.length - 1) {
    currentIndex++;
    showStudent();
  }
};

window.prevStudent = function () {
  if (currentIndex > 0) {
    currentIndex--;
    showStudent();
  }
};

function showStudent() {
  selectedStudent = classStudents[currentIndex];

  document.getElementById("studentName").textContent = selectedStudent.name;
  document.getElementById("studentMeta").textContent =
    `Class: ${selectedStudent.class} | ${currentIndex + 1} / ${classStudents.length}`;

  generateSubjects(selectedStudent.class);
}

// =====================
// CLASS + STUDENT LOADING
// =====================
window.loadStudents = function () {
  const className = document.getElementById("classSelect").value;

  classStudents = sortByName(
    Object.values(students).filter(s => s.class === className)
  );

  currentIndex = 0;

  if (!classStudents.length) {
    document.getElementById("studentName").textContent = "No student found";
    return;
  }

  showStudent();
};

window.loadClasses = function () {
  const grade = document.getElementById("gradeSelect").value;
  const classSelect = document.getElementById("classSelect");

  classSelect.innerHTML = `<option value="">Select Class</option>`;

  if (!grade) return;

  ["E", "K", "Z", "L"].forEach(c => {
    classSelect.innerHTML += `<option value="${grade + c}">${grade + c}</option>`;
  });
};

// =====================
// INPUT CONTROL
// =====================
document.addEventListener("input", function (e) {
  if (!e.target.classList.contains("markInput")) return;

  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 2);
});

// =====================
// BOOTSTRAP
// =====================
await loadAllStudents();
await initSelectedStudent();