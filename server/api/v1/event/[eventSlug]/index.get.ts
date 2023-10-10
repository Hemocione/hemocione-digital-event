import { getEventBySlug } from "~/server/services/event";

export default defineEventHandler(async (event) => {
  const eventSlug = String(getRouterParam(event, "eventSlug"));
  const hemoEvent = await getEventBySlug(eventSlug);

  if (!hemoEvent) {
    throw createError({ statusCode: 404, statusMessage: "Event not Found" });
  }

  return {
    ...hemoEvent,
  };
});
