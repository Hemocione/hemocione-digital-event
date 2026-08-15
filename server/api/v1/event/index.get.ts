import { useHemocioneUserAuth } from "~/server/services/auth";
import { getEvents } from "~/server/services/event";

export default defineEventHandler(async (event) => {
  useHemocioneUserAuth(event);

  const query = getQuery(event);
  const { old } = query;
  const shouldGetOldEvents = String(old) === "true";
  const institutionId = query.institutionId
    ? String(query.institutionId)
    : undefined;
  const events = await getEvents(shouldGetOldEvents, institutionId);
  return events;
});
