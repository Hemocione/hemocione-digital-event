import { assertSecretAuth } from "~/server/services/auth";
import { getNotificationsByEventAndUser } from "~/server/services/notification";
import { Types } from "mongoose";

export default defineEventHandler(async (event) => {
  // Only allow authenticated service calls
  assertSecretAuth(event);

  const eventId = getRouterParam(event, "eventId");
  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Event ID is required",
    });
  }

  const query = getQuery(event);
  const hemocioneId = query.hemocioneId as string | undefined;

  try {
    const objectId = new Types.ObjectId(eventId);
    const notifications = await getNotificationsByEventAndUser(
      objectId,
      hemocioneId || "",
    );

    return {
      eventId,
      hemocioneId: hemocioneId || null,
      notifications,
      count: notifications.length,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid Event ID: ${error.message}`,
    });
  }
});
