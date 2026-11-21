import { z } from "zod";

export const courseDeliverySchema = z.object({
  courseId: z.string().min(1),
  courseTitle: z.string().min(1),
  deadline: z.string().datetime(),
  learners: z.array(z.object({
    learnerId: z.string().min(1),
    name: z.string().min(1),
    completedAt: z.string().datetime().optional()
  })).min(1)
});

export type CourseDelivery = z.infer<typeof courseDeliverySchema>;
export type LearnerStatus = "due" | "overdue" | "completed";

export function learnerStatus(learner: CourseDelivery["learners"][number], deadline: Date, now: Date): LearnerStatus {
  if (learner.completedAt) return "completed";
  return now.getTime() <= deadline.getTime() ? "due" : "overdue";
}

export function classifyLearners(delivery: CourseDelivery, now: Date) {
  const deadline = new Date(delivery.deadline);
  return delivery.learners.map((learner) => ({
    learnerId: learner.learnerId,
    name: learner.name,
    status: learnerStatus(learner, deadline, now)
  }));
}
