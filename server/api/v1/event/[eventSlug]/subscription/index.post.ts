import { useHemocioneUserAuth } from "~/server/services/auth";
import { createSubscription } from "~/server/services/subscription";

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);
  const eventSlug = String(getRouterParam(event, "eventSlug"));
  const body = await readBody(event);
  const { scheduleId, startAt, endAt } = body;
  if (!scheduleId || !startAt || !endAt) {
    throw createError({ statusCode: 422, statusMessage: "Invalid body" });
  }

  const subscription = await createSubscription(eventSlug, user, { _id: scheduleId, startAt, endAt });
  return subscription;
});
