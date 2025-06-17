import { useHemocioneUserAuth } from "~/server/services/auth";
import { getEventBySlug } from "~/server/services/event";
import { createSubscription } from "~/server/services/subscription";

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);
  const eventSlug = String(getRouterParam(event, "eventSlug"));
  const body = await readBody(event);
  const { scheduleId, formResponseId, status } = body;

  if (!scheduleId) {
    throw createError({ statusCode: 422, statusMessage: "Invalid body" });
  }

  const hemoEvent = await getEventBySlug(eventSlug);

  if (!hemoEvent) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }

  if (!hemoEvent.subscription?.enabled) {
    throw createError({
      statusCode: 400,
      statusMessage: "Subscription is not enabled",
    });
  }

  const schedule = hemoEvent.subscription.schedules.find(
    (s) => String(s._id) === scheduleId,
  );

  if (!schedule) {
    throw createError({ statusCode: 404, statusMessage: "Schedule not found" });
  }

  const hasAvailableSlots = schedule.slots > schedule.occupiedSlots;

  if (!hasAvailableSlots) {
    throw createError({
      statusCode: 400,
      statusMessage: "No available slots for this schedule",
    });
  }

  const subscription = await createSubscription(eventSlug, user, {
    _id: scheduleId,
    startAt: schedule.startAt,
    endAt: schedule.endAt,
    formResponseId,
    status,
  });  
  return subscription;
});
