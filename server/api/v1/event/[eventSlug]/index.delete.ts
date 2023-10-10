import { assertSecretAuth } from "~/server/services/auth";
import { deleteEventBySlug } from "~/server/services/event";

export default defineEventHandler(async (event) => {
  assertSecretAuth(event);

  const eventSlug = String(getRouterParam(event, "eventSlug"));
  await deleteEventBySlug(eventSlug);
});
