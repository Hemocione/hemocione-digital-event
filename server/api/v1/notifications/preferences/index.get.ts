import { getUserAuth } from "~/server/services/auth";
import {
  getNotificationPreference,
  createNotificationPreference,
  updateNotificationPreference,
} from "~/server/services/notification";

export default defineEventHandler(async (event) => {
  const user = getUserAuth(event);
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const preference = await getNotificationPreference(user.id);

  if (!preference) {
    // Return default preferences if none exist
    return {
      hemocioneId: user.id,
      channels: {
        push: { enabled: true, token: null },
        whatsapp: { enabled: true, phone: user.phone || null },
        email: { enabled: true, address: user.email || null },
        sms: { enabled: true, phone: user.phone || null },
      },
      eventReminderHours: [24],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return preference;
});
