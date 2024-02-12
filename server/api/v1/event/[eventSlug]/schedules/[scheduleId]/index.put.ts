import { assertSecretAuth } from "~/server/services/auth";
import { updateEventScheduleSlots } from "~/server/services/event";

export default defineEventHandler(async (event) => {
  assertSecretAuth(event);
  const body = await readBody(event);
  const { slots } = body;
  if (!slots) {
    throw createError({ statusCode: 422, statusMessage: "Invalid body" });
  }
  const slotsAsNumber = Number(slots);

  const eventSlug = String(getRouterParam(event, "eventSlug"));
  const scheduleId = String(getRouterParam(event, "scheduleId"));
  const updatedEvent = await updateEventScheduleSlots(eventSlug, scheduleId, slotsAsNumber);

  if (!updatedEvent) {
    return;
  }

  return {
    ...updatedEvent,
  };
});
