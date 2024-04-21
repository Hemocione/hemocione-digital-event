import { getEventsBySlugs } from "~/server/services/event";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { eventSlugs } = query as {
    eventSlugs: string[];
  };

  const events = await getEventsBySlugs(eventSlugs ?? []);
  return events;
});
