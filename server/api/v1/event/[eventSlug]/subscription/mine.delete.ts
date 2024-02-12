import { useHemocioneUserAuth } from "~/server/services/auth";
import { deleteSubscription } from "~/server/services/subscription";

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);
  const eventSlug = String(getRouterParam(event, "eventSlug")); 

  const subscription = await deleteSubscription(eventSlug, user.id);
  return subscription;
});
