export function formatResultSMS(student, subjects, marks, avg, status) {

  const map = {
    MATH: "M-",
  ENGLISH: "E-",
  SCIENCE: "S-",
  CIVICS: "C-",
  BIOLOGY: "B-",

  HISTORY: "H-",
  GEOGRAPHY: "G-",
  PHYSICS: "P-",
  CHEMISTRY: "CH-",

  POA: "POA-",
  COMMERCE: "COM-",

  BEMBA: "BE-",
  RELIGIOUS_EDUCATION: "RE-",

  ADDITIONAL_MATH: "ADD-",

  // ✔ Missing subjects added
  FOOD_OR_DESIGN: "F/D-",
  LITERATURE: "LIT-",
  PHYSICAL_EDUCATION: "PE-"
  };

  const subjectLine = subjects.map(sub => {
    const code = map[sub] || sub.slice(0, 2);
    const mark = marks[sub] ?? 0;
    return `${code}${mark}`;
  }).join(" ");

  return `${student.name} ${student.class}
${subjectLine}
A:${avg.toFixed(0)}% ${status}`;
}