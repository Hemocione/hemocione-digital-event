import { inngest } from "~/server/inngest/client";
import { Subscription } from "~/server/models/subscription";
import {
  getNotificationPreference,
  createEventNotificationRecord,
  sendNotification,
  hasNotificationBeenSent,
  buildNotificationMessage,
} from "~/server/services/notification";
import type { NotificationChannel } from "~/server/models/notificationPreference";
import type { EventNotificationType } from "~/server/models/eventNotification";
import { Types } from "mongoose";
import { getDiscordNotificationService } from "~/server/services/discord";

export interface EventReminderEvent {
  data: {
    eventId: string;
    eventSlug: string;
    eventName: string;
    eventStartAt: string;
    eventAddress?: string;
    reminderType: EventNotificationType;
  };
}

export const eventName = "notify/event-reminder";

export default inngest.createFunction(
  {
    name: "Send Event Reminder Notifications",
    id: "send-event-reminder-notifications",
    concurrency: {
      limit: 10,
    },
  },
  {
    event: eventName,
  },
  async ({ event: inngestEvent }) => {
    const { data } = inngestEvent;
    const {
      eventId,
      eventSlug,
      eventName,
      eventStartAt,
      eventAddress,
      reminderType,
    } = data;

    const eventObjectId = new Types.ObjectId(eventId);
    const startAt = new Date(eventStartAt);
    const discord = getDiscordNotificationService();
    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
      channels: {} as Record<NotificationChannel, number>,
    };

    try {
      // Get all subscriptions for this event
      const subscriptions = await Subscription.find({
        eventSlug,
        deletedAt: null,
      }).lean();

      if (subscriptions.length === 0) {
        return {
          eventSlug,
          reminderType,
          message: "No subscriptions found for this event",
          results,
        };
      }

      // Build the notification message
      const messageContent = buildNotificationMessage(
        reminderType,
        eventName,
        startAt,
        eventAddress,
      );

      // Process each subscription
      for (const subscription of subscriptions) {
        try {
          const hemocioneId = subscription.hemocioneId;

          // Get user's notification preferences
          const preferences = await getNotificationPreference(hemocioneId);

          // Default channels to try if no preferences exist
          const channelsToTry: NotificationChannel[] = ["sms", "whatsapp", "email"];

          for (const channel of channelsToTry) {
            // Check if user has disabled this channel
            if (preferences) {
              const channelPref = preferences.channels[channel];
              if (channelPref && !channelPref.enabled) {
                continue; // Skip disabled channels
              }
            }

            // Check if notification was already sent
            const alreadySent = await hasNotificationBeenSent(
              eventObjectId,
              hemocioneId,
              reminderType,
              channel,
            );

            if (alreadySent) {
              results.skipped++;
              continue;
            }

            // Determine recipient address based on channel
            let recipientAddress: string | null = null;

            switch (channel) {
              case "sms":
              case "whatsapp":
                recipientAddress =
                  preferences?.channels[channel]?.phone || subscription.phone;
                break;
              case "email":
                recipientAddress =
                  preferences?.channels.email?.address || subscription.email;
                break;
              case "push":
                recipientAddress = preferences?.channels.push?.token || null;
                break;
            }

            if (!recipientAddress) {
              continue; // Skip if no recipient address available
            }

            // Create notification record
            const notificationRecord = await createEventNotificationRecord({
              eventId: eventObjectId,
              hemocioneId,
              type: reminderType,
              channel,
              messageContent,
              recipientAddress,
            });

            // Send notification
            const success = await sendNotification(
              notificationRecord._id,
              channel,
              recipientAddress,
              messageContent,
            );

            if (success) {
              results.sent++;
              results.channels[channel] = (results.channels[channel] || 0) + 1;
              
              // Only send through one successful channel per user per reminder type
              break;
            } else {
              results.failed++;
            }
          }
        } catch (error: any) {
          console.error(
            `Error processing subscription for user ${subscription.hemocioneId}:`,
            error,
          );
          results.failed++;
        }
      }

      // Send summary to Discord
      const summaryMessage = `📢 **Lembretes Enviados**
Evento: ${eventName}
Tipo: ${reminderType}
Total de inscrições: ${subscriptions.length}
Enviados: ${results.sent}
Falhas: ${results.failed}
Ignorados: ${results.skipped}
Canais: ${JSON.stringify(results.channels)}
      `;
      await discord.sendMessage(summaryMessage);

      return {
        eventSlug,
        reminderType,
        totalSubscriptions: subscriptions.length,
        results,
      };
    } catch (error: any) {
      await discord.sendErrorNotification(
        error,
        `Failed to process reminders for event ${eventSlug}`,
      );

      throw error;
    }
  },
);
