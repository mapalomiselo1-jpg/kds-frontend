import { students } from "./students.js";
import { getSubjects } from "./subjects.js";

export let resultsData = {};

export function processCSV(input) {

  const lines = input.trim().split("\n");
  let outputText = "RESULTS\n\n";

  resultsData = {};

  for (let i = 1; i < lines.length; i++) {

    const row = lines[i].split(",").map(x => x.trim());

    const className = row[0];
    const id = row[1];
    const marks = row.slice(2);

    const student = students[id];

    if (!student) {
      outputText += `NOT FOUND: ${id}\n----------------\n`;
      continue;
    }

    const subjects = getSubjects(className);

    let total = 0;
    let resultObj = {};

    subjects.forEach((sub, index) => {
      const mark = Number(marks[index] || 0);
      resultObj[sub] = mark;
      total += mark;
    });

    const avg = total / subjects.length;
    const status = avg >= 50 ? "PASS" : "FAIL";

    resultsData[`${id}`] = {
      student,
      className,
      resultObj,
      avg,
      status
    };

    outputText += `${student.name} (${className})\nAVG: ${avg.toFixed(1)}%\n----------------\n`;
  }

  return outputText;
}