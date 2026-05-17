export const CLASS_SUBJECTS = {
  COMMON: ["MATH", "ENGLISH", "SCIENCE", "CIVICS", "BIOLOGY"],

  // =====================
  // FORM LEVEL (NEW LAYER)
  // =====================
  "FORM_COMMON": ["MATH", "ENGLISH", "SCIENCE", "CIVICS"],

  "Form 1E": ["GEOGRAPHY", "RELIGIOUS_EDUCATION"],
  "Form 1K": ["BEMBA", "RELIGIOUS_EDUCATION"],
  "Form 1Z": ["FOOD_OR_DESIGN", "RELIGIOUS_EDUCATION"],

  "Form 2E": ["HISTORY", "POA"],
  "Form 2K": ["PHYSICAL_EDUCATION", "BEMBA", "LITERATURE"],
  "Form 2Z": ["GEOGRAPHY", "FOOD_OR_DESIGN"],

  // =====================
  // GRADE 10–12 SYSTEM
  // =====================
  "10E": ["HISTORY", "POA", "COMMERCE"],
  "10K": ["PHYSICAL_EDUCATION", "BEMBA", "RELIGIOUS_EDUCATION"],
  "10Z": ["RELIGIOUS_EDUCATION", "GEOGRAPHY", "FOOD_OR_DESIGN"],

  "11E": ["HISTORY", "POA", "COMMERCE"],
  "11K": ["PHYSICAL_EDUCATION", "BEMBA", "RELIGIOUS_EDUCATION", "LITERATURE"],
  "11Z": ["RELIGIOUS_EDUCATION", "GEOGRAPHY", "FOOD_OR_DESIGN"],

  "12E": ["HISTORY", "POA", "COMMERCE"],
  "12K": ["PHYSICAL_EDUCATION", "BEMBA", "RELIGIOUS_EDUCATION"],
  "12Z": ["RELIGIOUS_EDUCATION", "GEOGRAPHY", "FOOD_OR_DESIGN"],
  "12L": ["ADDITIONAL_MATH", "GEOGRAPHY", "CHEMISTRY", "PHYSICS"]
};

// =====================
// RULES (clean + scalable control layer)
// =====================
export const EXCLUDED_SUBJECTS = {
  "12L": ["SCIENCE"]
};

// =====================
// CORE FUNCTION (SMART VERSION)
// =====================
export function getSubjects(className) {

  const baseSubjects = CLASS_SUBJECTS.COMMON || [];
  const excluded = EXCLUDED_SUBJECTS[className] || [];

  let classSubjects = CLASS_SUBJECTS[className] || [];

  // FORM LOGIC: if it's Form class, optionally include FORM_COMMON
  if (className.startsWith("Form")) {
    const formCommon = CLASS_SUBJECTS.FORM_COMMON || [];
    classSubjects = [...formCommon, ...classSubjects];
  }

  // Merge everything
  let subjects = [...baseSubjects, ...classSubjects];

  // Apply exclusions
  subjects = subjects.filter(sub => !excluded.includes(sub));

  return subjects;
}