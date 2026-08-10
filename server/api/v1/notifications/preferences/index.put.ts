import { getUserAuth } from "~/server/services/auth";
import {
  getNotificationPreference,
  createNotificationPreference,
  updateNotificationPreference,
} from "~/server/services/notification";

interface UpdatePreferencesBody {
  channels?: {
    push?: { enabled?: boolean; token?: string };
    whatsapp?: { enabled?: boolean; phone?: string };
    email?: { enabled?: boolean; address?: string };
    sms?: { enabled?: boolean; phone?: string };
  };
  eventReminderHours?: number[];
}

function assertUpdatePreferencesBody(body: any): asserts body is UpdatePreferencesBody {
  if (typeof body !== "object" || body === null) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid body",
    });
  }

  if ("channels" in body && typeof body.channels !== "object") {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid channels",
    });
  }

  if (
    "eventReminderHours" in body &&
    (!Array.isArray(body.eventReminderHours) ||
      !body.eventReminderHours.every((h: any) => typeof h === "number"))
  ) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid eventReminderHours",
    });
  }
}

export default defineEventHandler(async (event) => {
  const user = getUserAuth(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const body = await readBody(event);
  assertUpdatePreferencesBody(body);

  const existingPreference = await getNotificationPreference(user.id);

  let result;
  if (existingPreference) {
    result = await updateNotificationPreference(user.id, body);
  } else {
    result = await createNotificationPreference({
      hemocioneId: user.id,
      ...body,
    });
  }

  if (!result) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update preferences",
    });
  }

  return result;
});
