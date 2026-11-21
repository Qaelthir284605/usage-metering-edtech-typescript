import assert from "node:assert/strict";
import { classifyLearners, courseDeliverySchema } from "./usage_metering.ts";

const delivery = courseDeliverySchema.parse({
  courseId: "course-1",
  courseTitle: "Reading lab",
  deadline: "2030-01-10T00:00:00.000Z",
  learners: [
    { learnerId: "a", name: "Ari" },
    { learnerId: "b", name: "Bea" }
  ]
});
const rows = classifyLearners(delivery, new Date("2030-01-09T00:00:00.000Z"));
assert.deepEqual(rows.map((row) => row.status), ["due", "due"]);
assert.equal(rows[0].learnerId, "a");
const overdueRows = classifyLearners(delivery, new Date("2030-01-11T00:00:00.000Z"));
assert.deepEqual(overdueRows.map((row) => row.status), ["overdue", "overdue"]);
console.log("usage metering decision passed");
