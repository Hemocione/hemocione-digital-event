import { getOrCreateEvent } from "~/server/services/event";

export default defineEventHandler(async (event) => {
  const eventSlug = String(getRouterParam(event, "eventSlug"));
  const hemoEvent = await getOrCreateEvent(eventSlug);

  return {
    ...hemoEvent,
  };
});
