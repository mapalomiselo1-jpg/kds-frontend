export let sendQueue = [];

// build queue
export function buildQueue(students, resultsCache, className) {

  sendQueue = [];

  for (const student of Object.values(students)) {

    if (student.class !== className) continue;

    const result = resultsCache[student.id];

    if (!result) continue;

    if (!student.parent_phone) continue;

    sendQueue.push({
      student,
      result
    });
  }

  return sendQueue;
}