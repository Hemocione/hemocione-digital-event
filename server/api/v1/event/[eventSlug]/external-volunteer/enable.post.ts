import { assertSecretAuth } from "~/server/services/auth";
import { enableEventExternalVolunteers } from "~/server/services/event";

export default defineEventHandler(async (event) => {
  assertSecretAuth(event);
  const eventSlug = String(getRouterParam(event, "eventSlug"));
  const hemoEvent = await enableEventExternalVolunteers(eventSlug);
  return hemoEvent;
});
