import { z } from "zod";
import { assertSecretAuth } from "~/server/services/auth";
import { updateEventExternalVolunteerReviewData } from "~/server/services/externalVolunteer";
import {
  reviewNegativeFeedbacks,
  reviewPositiveFeedbacks,
  reviewStatuses,
} from "~/server/models/externalVolunteer";

const bodySchema = z.object({
  status: z.enum(reviewStatuses),
  rating: z.number(),
  negativeFeedback: z.array(z.enum(reviewNegativeFeedbacks)).optional(),
  positiveFeedback: z.array(z.enum(reviewPositiveFeedbacks)).optional(),
  feedbackComment: z.string().optional(),
  reviewedBy: z.object({
    hemocioneId: z.string().optional(),
    name: z.string(),
    email: z.string(),
  }),
  numberOfHours: z.number(),
});

export type externalVolunteerReviewDTO = z.infer<typeof bodySchema>;

export default defineEventHandler(async (event) => {
  assertSecretAuth(event);
  const { data } = await readValidatedBody(event, bodySchema.safeParse);
  if (!data) {
    throw createError({ statusCode: 422, statusMessage: "Invalid body" });
  }
  const externalVolunteerId = String(getRouterParam(event, "id"));

  const updatedExternalVolunteer = await updateEventExternalVolunteerReviewData(
    externalVolunteerId,
    data,
  );

  if (!updatedExternalVolunteer) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }

  return {
    ...updatedExternalVolunteer,
  };
});
