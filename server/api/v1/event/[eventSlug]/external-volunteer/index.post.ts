import { useHemocioneUserAuth } from "~/server/services/auth";
import { getEventBySlug } from "~/server/services/event";
import { createExternalVolunteer } from "~/server/services/externalVolunteer";

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);
  const eventSlug = String(getRouterParam(event, "eventSlug"));

  const hemoEvent = await getEventBySlug(eventSlug);

  if (!hemoEvent||!hemoEvent.externalVolunteers?.enabled) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }
  if (hemoEvent.externalVolunteers.occupiedSlots >= hemoEvent.externalVolunteers.slots){
    throw createError({ statusCode: 404, statusMessage: "All slots are occupied" });
  }
  
  const externalVolunteer = await createExternalVolunteer(eventSlug, user);

  return externalVolunteer;
});
