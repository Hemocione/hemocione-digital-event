import { useHemocioneUserAuth } from "~/server/services/auth";
import { getUserNextSubscription } from "~/server/services/subscription";

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);
  return await getUserNextSubscription({ hemocioneId: user.id });
});
