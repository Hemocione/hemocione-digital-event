import { useHemocioneUserAuth } from "~/server/services/auth";
import { getEventBySlug } from "~/server/services/event";
import { deleteExternalVolunteer } from "~/server/services/externalVolunteer";

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);
  const eventSlug = String(getRouterParam(event, "eventSlug"));
  const hemoEvent = await getEventBySlug(eventSlug);

  if (!hemoEvent || !hemoEvent.externalVolunteers?.enabled) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }

  await deleteExternalVolunteer(eventSlug, user.id);
});
