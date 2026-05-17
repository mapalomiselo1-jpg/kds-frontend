// =====================
// SUBJECT STRUCTURE
// =====================
export const CLASS_SUBJECTS = {

  // =====================
  // CORE SUBJECTS (ALL CLASSES)
  // =====================
  COMMON: ["MATH", "ENGLISH", "SCIENCE", "CIVICS", "BIOLOGY"],

  // =====================
  // FORM 1
  // =====================
  "Form 1E": ["GEOGRAPHY", "RELIGIOUS_EDUCATION"],
  "Form 1K": ["BEMBA", "RELIGIOUS_EDUCATION"],
  "Form 1Z": ["FOOD_OR_DESIGN", "RELIGIOUS_EDUCATION"],

  // =====================
  // FORM 2
  // =====================
  "Form 2E": ["HISTORY", "POA"],
  "Form 2K": ["PHYSICAL_EDUCATION", "BEMBA", "LITERATURE"],
  "Form 2Z": ["GEOGRAPHY", "FOOD_OR_DESIGN"],

  // =====================
  // GRADE 10
  // =====================
  "10E": ["HISTORY", "POA", "COMMERCE"],
  "10K": ["PHYSICAL_EDUCATION", "BEMBA", "RELIGIOUS_EDUCATION"],
  "10Z": ["RELIGIOUS_EDUCATION", "GEOGRAPHY", "FOOD_OR_DESIGN"],

  // =====================
  // GRADE 11
  // =====================
  "11E": ["HISTORY", "POA", "COMMERCE"],
  "11K": ["PHYSICAL_EDUCATION", "BEMBA", "RELIGIOUS_EDUCATION", "LITERATURE"],
  "11Z": ["RELIGIOUS_EDUCATION", "GEOGRAPHY", "FOOD_OR_DESIGN"],

  // =====================
  // GRADE 12
  // =====================
  "12E": ["HISTORY", "POA", "COMMERCE"],
  "12K": ["PHYSICAL_EDUCATION", "BEMBA", "RELIGIOUS_EDUCATION"],
  "12Z": ["RELIGIOUS_EDUCATION", "GEOGRAPHY", "FOOD_OR_DESIGN"],
  "12L": ["ADDITIONAL_MATH", "GEOGRAPHY", "CHEMISTRY", "PHYSICS"]
};

// =====================
// EXCLUSIONS (SPECIAL RULES)
// =====================
export const EXCLUDED_SUBJECTS = {
  "12L": ["SCIENCE"]
};

// =====================
// CORE FUNCTION
// =====================
export function getSubjects(className) {

  const baseSubjects = CLASS_SUBJECTS.COMMON || [];
  const classSubjects = CLASS_SUBJECTS[className] || [];
  const excluded = EXCLUDED_SUBJECTS[className] || [];

  const subjects = [...baseSubjects, ...classSubjects];

  return subjects.filter(sub => !excluded.includes(sub));
}