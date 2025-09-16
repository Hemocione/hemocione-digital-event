import { getPointsOndeDoar } from "~/server/services/event";

export default defineEventHandler(async (event) => {
  const { old } = getQuery(event);
  const shouldGetOldEvents = String(old) === "true";
  const events = await getPointsOndeDoar(shouldGetOldEvents);
  return events;
});
