import { assertSecretAuth } from "~/server/services/auth";
import { enableEventSubscription } from "~/server/services/event";

export default defineEventHandler(async (event) => {
  assertSecretAuth(event);
  const eventSlug = String(getRouterParam(event, "eventSlug"));
  const hemoEvent = await enableEventSubscription(eventSlug);
  return hemoEvent;
});
