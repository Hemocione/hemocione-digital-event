import { setEventDefaultSchedule } from "~/server/services/event";
import { assertSecretAuth } from "~/server/services/auth";

export default defineEventHandler(async (event) => {
  assertSecretAuth(event);
  const body = await readBody(event);
  const { timeInterval, slotsPerInterval } = body;
  const eventSlug = String(getRouterParam(event, "eventSlug"));
  const hemoEvent = await setEventDefaultSchedule(eventSlug, Number(timeInterval ?? 60), Number(slotsPerInterval ?? 30));


  return {
    ...hemoEvent,
  };
});
