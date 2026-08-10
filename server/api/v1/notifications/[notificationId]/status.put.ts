import { assertSecretAuth } from "~/server/services/auth";
import { markNotificationAsSent, markNotificationAsFailed } from "~/server/services/notification";
import { Types } from "mongoose";

interface UpdateNotificationBody {
  status: "sent" | "failed";
  errorMessage?: string;
}

function assertUpdateNotificationBody(body: any): asserts body is UpdateNotificationBody {
  if (typeof body !== "object" || body === null) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid body",
    });
  }

  if (!["sent", "failed"].includes(body.status)) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid status. Must be 'sent' or 'failed'",
    });
  }
}

export default defineEventHandler(async (event) => {
  // Only allow authenticated service calls
  assertSecretAuth(event);

  const notificationId = getRouterParam(event, "notificationId");
  if (!notificationId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Notification ID is required",
    });
  }

  const body = await readBody(event);
  assertUpdateNotificationBody(body);

  const objectId = new Types.ObjectId(notificationId);

  let result;
  if (body.status === "sent") {
    result = await markNotificationAsSent(objectId);
  } else {
    result = await markNotificationAsFailed(objectId, body.errorMessage || "Unknown error");
  }

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: "Notification not found",
    });
  }

  return result;
});
