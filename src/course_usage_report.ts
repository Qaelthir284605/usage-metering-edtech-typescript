import { classifyLearners, courseDeliverySchema } from "./usage_metering.ts";
import { getUsageTimeseries } from "./infrai_usage_client.ts";

export async function buildEducatorReport(input: unknown, now: Date, apiKey: string) {
  const delivery = courseDeliverySchema.parse(input);
  const usage = await getUsageTimeseries(apiKey);
  return { courseId: delivery.courseId, courseTitle: delivery.courseTitle, learners: classifyLearners(delivery, now), usage };
}

const apiKey = process.env.INFRAI_API_KEY;
if (apiKey) {
  const input = {
    courseId: "algebra-101",
    courseTitle: "Algebra foundations",
    deadline: "2030-06-15T17:00:00.000Z",
    learners: [
      { learnerId: "learner-01", name: "Ari" },
      { learnerId: "learner-02", name: "Mina", completedAt: "2030-06-10T12:00:00.000Z" }
    ]
  };
  buildEducatorReport(input, new Date("2030-06-14T12:00:00.000Z"), apiKey).then((report) => console.log(JSON.stringify(report, null, 2)));
}
