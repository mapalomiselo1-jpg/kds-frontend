import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

let students = [];
let results = {};
let filteredList = [];

let studentsLoaded = false;
let resultsLoaded = false;

let studentsUnsub = null; // will hold unsubscribe function for students query

// ---------------------
// Helper: sort by name (case-insensitive, locale-aware)
// ---------------------
function sortByName(list) {
  if (!Array.isArray(list)) return [];
  return list.slice().sort((a, b) => {
    const nameA = (a?.name || "").trim();
    const nameB = (b?.name || "").trim();
    return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
  });
}

// ---------------------
// Spinner helpers
// ---------------------
function showSpinner() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.remove("hidden");
}

function hideSpinner() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.add("hidden");
}

function hideSpinnerIfReady() {
  // keep spinner logic simple: hide when both loaded
  if (studentsLoaded && resultsLoaded) {
    hideSpinner();
  }
}

// ---------------------
// SUBSCRIBE TO STUDENTS FOR A GIVEN CLASS
// - only called when grade + class are selected
// - unsubscribes previous listener if present
// ---------------------
function subscribeStudentsForClass(className) {
  // unsubscribe previous listener if any
  if (typeof studentsUnsub === "function") {
    try { studentsUnsub(); } catch (e) { /* ignore */ }
    studentsUnsub = null;
  }

  if (!className) {
    students = [];
    filteredList = [];
    studentsLoaded = false;
    renderTable([]);
    hideSpinner();
    return;
  }

  // show spinner only for class-specific load
  showSpinner();
  studentsLoaded = false;
  students = [];
  filteredList = [];

  const q = query(collection(db, "students"), where("class", "==", className));

  studentsUnsub = onSnapshot(q, snap => {
    students = [];
    snap.forEach(d => {
      students.push({ id: d.id, ...d.data() });
    });

    // Sort students alphabetically by name
    students = sortByName(students);

    // For this UI we treat students as the filtered list (class-specific)
    filteredList = students.slice();

    studentsLoaded = true;

    renderTable(filteredList);

    hideSpinnerIfReady();
  }, err => {
    console.error("Students snapshot error:", err);
    studentsLoaded = true;
    hideSpinnerIfReady();
  });
}

// ---------------------
// SUBSCRIBE TO RESULTS (global)
// - results are small and used to show PASS/FAIL; keep a single listener
// - do NOT show spinner here; spinner is controlled by class subscription
// ---------------------
function subscribeResults() {
  resultsLoaded = false;

  onSnapshot(collection(db, "results"), resSnap => {
    results = {};
    resSnap.forEach(d => {
      results[d.id] = d.data();
    });

    resultsLoaded = true;

    // re-render current view (only if students for a class are loaded)
    const list = filteredList.length ? filteredList : [];
    renderTable(list);

    hideSpinnerIfReady();
  }, err => {
    console.error("Results snapshot error:", err);
    resultsLoaded = true;
    hideSpinnerIfReady();
  });
}

// ---------------------
// INIT
// ---------------------
function initData() {
  // Subscribe to results immediately (no spinner)
  subscribeResults();

  enableBoardSystem();
}

// ---------------------
// INIT AFTER LOAD
// ---------------------
function enableBoardSystem() {
  const gradeSelect = document.getElementById("gradeSelect");
  if (gradeSelect && gradeSelect.value) {
    buildClassOptions(gradeSelect.value);
  }
}

// ---------------------
// GRADE → CLASS BUILDER
// ---------------------
window.loadClasses = function () {
  const grade = document.getElementById("gradeSelect").value;
  buildClassOptions(grade);
};

function buildClassOptions(grade) {
  const classSelect = document.getElementById("classSelect");
  if (!classSelect) return;

  classSelect.innerHTML = `<option value="">Select Class</option>`;

  if (!grade) return;

  const classLetters = ["E", "K", "Z", "L"];
  classLetters.forEach(letter => {
    const cls = grade + letter;
    classSelect.innerHTML += `<option value="${cls}">${cls}</option>`;
  });
}

// ---------------------
// LOAD BOARD
// - only subscribe/load students when both grade and class are selected
// ---------------------
window.loadBoard = function () {
  const gradeSelect = document.getElementById("gradeSelect");
  const classSelect = document.getElementById("classSelect");

  const selectedGrade = gradeSelect ? gradeSelect.value : "";
  const selectedClass = classSelect ? classSelect.value : "";

  // require both grade and class to be selected
  if (!selectedGrade || !selectedClass) {
    // clear any existing students view and unsubscribe
    if (typeof studentsUnsub === "function") {
      try { studentsUnsub(); } catch (e) { /* ignore */ }
      studentsUnsub = null;
    }
    students = [];
    filteredList = [];
    studentsLoaded = false;
    resultsLoaded = resultsLoaded || false; // keep results state as-is
    renderTable([]);
    // show a friendly message in the stats area
    const totalEl = document.getElementById("totalStudents");
    if (totalEl) totalEl.textContent = "Select Grade and Class";
    hideSpinner();
    return;
  }

  // subscribe to students for the selected class (class includes grade prefix)
  subscribeStudentsForClass(selectedClass);
};

// ---------------------
// SEARCH
// ---------------------
window.filterTable = function () {
  const value = (document.getElementById("search").value || "").toLowerCase();

  // if no students loaded for a class, nothing to search
  if (!filteredList.length) {
    renderTable([]);
    return;
  }

  const filtered = filteredList.filter(s =>
    (s.name || "").toLowerCase().includes(value) ||
    (s.id || "").toLowerCase().includes(value)
  );

  const sortedFiltered = sortByName(filtered);

  renderTable(sortedFiltered);
};

// ---------------------
// RENDER TABLE
// ---------------------
function renderTable(list) {
  const body = document.getElementById("tableBody");
  if (!body) return;

  let pass = 0;
  let fail = 0;

  body.innerHTML = "";

  // Defensive: ensure the list is sorted before rendering
  const sorted = sortByName(list);

  if (!sorted.length) {
    // show empty state row
    body.innerHTML = `<tr class="emptyRow"><td colspan="4">Select Grade and Class to load students...</td></tr>`;
  } else {
    sorted.forEach(s => {
      const res = results[s.id];
      let status = "NO RESULT";
      let badge = "none";

      if (res) {
        if (res.status === "PASS") {
          status = "PASS";
          badge = "pass";
          pass++;
        } else {
          status = "FAIL";
          badge = "fail";
          fail++;
        }
      }

      const sid = String(s.id || "").replaceAll("'", "\\'");
      const sclass = s.class || "";

      body.innerHTML += `
        <tr onclick="openStudent('${sid}')">
          <td>${s.name || ""}</td>
          <td>${sclass}</td>
          <td><span class="badge ${badge}">${status}</span></td>
          <td>
            <button class="edit" onclick="editStudent(event,'${sid}')">✏</button>
            <button class="delete" onclick="deleteStudent(event,'${sid}')">🗑</button>
          </td>
        </tr>
      `;
    });
  }

  const totalEl = document.getElementById("totalStudents");
  if (totalEl) totalEl.textContent = sorted.length ? "Students: " + sorted.length : "Select Grade and Class";
  document.getElementById("passCount").textContent = "Pass: " + pass;
  document.getElementById("failCount").textContent = "Fail: " + fail;

  // If both collections loaded, hide overlay (defensive)
  if (studentsLoaded && resultsLoaded) {
    hideSpinner();
  }
}

// ---------------------
// OPEN MARKING PAGE (store cache + navigate)
// ---------------------
window.openStudent = function (id) {
  const student = students.find(s => String(s.id) === String(id)) || null;
  const result = results[id] || null;

  try {
    sessionStorage.setItem("selectedStudent", JSON.stringify({ student, result }));
  } catch (err) {
    console.warn("Could not save selected student to sessionStorage:", err);
  }

  window.location.href = `marking.html?student=${encodeURIComponent(id)}`;
};

// ---------------------
// DELETE
// ---------------------
window.deleteStudent = async function (e, id) {
  e.stopPropagation();

  // show spinner only if a class is selected (we're already doing that in subscribe)
  showSpinner();
  try {
    await deleteDoc(doc(db, "students", id));
    // onSnapshot will update UI automatically
  } catch (err) {
    console.error("Delete error:", err);
  } finally {
    hideSpinnerIfReady();
  }
};

// ---------------------
// EDIT (future)
// ---------------------
window.editStudent = function (e, id) {
  e.stopPropagation();
  alert("Edit system coming next upgrade");
};

// ---------------------
// Start listening
// ---------------------
initData();
