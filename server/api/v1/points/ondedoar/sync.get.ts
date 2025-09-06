import { getPointsOndeDoar } from "~/server/services/event";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { old } = query;
  const shouldGetOldEvents = String(old) === "true";
  const events = await getPointsOndeDoar(shouldGetOldEvents);
  return events;
});
