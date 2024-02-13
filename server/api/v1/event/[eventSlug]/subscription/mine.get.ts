import { useHemocioneUserAuth } from "~/server/services/auth";
import { getUserEventSubscription } from "~/server/services/subscription";

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);
  const eventSlug = String(getRouterParam(event, "eventSlug"));

  const subscription = await getUserEventSubscription(eventSlug, user.id);
  if (!subscription) {
    throw createError({
      statusCode: 404,
      statusMessage: "Subscription not Found",
    });
  }

  return subscription;
});
