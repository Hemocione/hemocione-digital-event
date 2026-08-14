import { setEventDefaultSchedule } from "~/server/services/event";
import { assertSecretAuth } from "~/server/services/auth";

export default defineEventHandler(async (event) => {
  assertSecretAuth(event);
  const body = await readBody(event);
  const { timeInterval, slotsPerInterval, overrides } = body;
  const eventSlug = String(getRouterParam(event, "eventSlug"));
  const hemoEvent = await setEventDefaultSchedule(
    eventSlug,
    Number(timeInterval ?? 60),
    Number(slotsPerInterval ?? 30),
    overrides,
  );

  return {
    ...hemoEvent,
  };
});
