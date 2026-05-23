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
  "Form 1E": ["PHYSICS", "CHEMISTRY", "FOOD_OR_DESIGN", "ICT"],
  "Form 1K": ["COMMERCE", "ACCOUNTS", "ICT"],
  "Form 1Z": ["PHYSICAL_EDUCATION", "GEOGRAPHY", "ICT"],

  // =====================
  // FORM 2
  // =====================
  "Form 2E": ["PHYSICS", "CHEMISTRY", "FOOD_OR_DESIGN", "ICT"],
  "Form 2K": ["COMMERCE", "ACCOUNTS", "ICT"],
  "Form 2Z": ["PHYSICAL_EDUCATION", "GEOGRAPHY", "ICT"],

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

  // Grade 12L does not do Science
  "12L": ["SCIENCE"],

  // ALL FORM CLASSES do not do Science
  "Form 1E": ["SCIENCE", "BIOLOGY"],
  "Form 1K": ["SCIENCE"],
  "Form 1Z": ["SCIENCE"],

  "Form 2E": ["SCIENCE", "BIOLOGY"],
  "Form 2K": ["SCIENCE"],
  "Form 2Z": ["SCIENCE"]
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