import { getEvents } from "~/server/services/event";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { old } = query;
  const shouldGetOldEvents = String(old) === "true";
  const events = await getEvents(shouldGetOldEvents);
  return events;
});
