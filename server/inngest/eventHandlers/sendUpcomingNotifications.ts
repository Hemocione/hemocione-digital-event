import { inngest } from "~/server/inngest/client";
import { getEventBySlug } from "~/server/services/event";
import {
  getEventSubscriptions,
  markSubscriptionUpcomingNotificationAsSent,
} from "~/server/services/subscription";
import {
  formatBrazilDate,
  formatBrazilTime,
} from "~/server/utils/brazilTimezone";

export const eventName = "notifications/send-upcoming" as const;

export interface SendUpcomingNotifications {
  data: {
    slug: string;
  };
}

export default inngest.createFunction(
  {
    name: "Send Upcoming Event Notifications",
    id: "send-upcoming-notifications",
  },
  { event: eventName },
  async ({ event }) => {
    const { slug } = event.data;

    const hemoEvent = await getEventBySlug(slug);
    if (!hemoEvent) return { skipped: true, reason: "Event not found" };
    if (!(hemoEvent.subscription && hemoEvent.subscription.enabled)) {
      return { skipped: true, reason: "Subscriptions disabled" };
    }

    const subscriptions = await getEventSubscriptions(slug);
    if (!subscriptions.length)
      return { skipped: true, reason: "No subscribers" };

    // Filter subscriptions that need notifications (haven't been notified yet)
    const subscriptionsToNotify = subscriptions.filter(
      (sub) => !sub.notificationsUpcomingSentAt,
    );

    if (!subscriptionsToNotify.length)
      return { skipped: true, reason: "No subscriptions need notifications" };

    const config = useRuntimeConfig();
    const hemocioneIdBaseUrl = config.hemocioneIdBaseUrl;
    const backofficeToken = config.hemocioneIdBackofficeToken;
    const oneSignalTemplateId = config.oneSignalTemplateId;
    const whatsappTemplateName = config.whatsappTemplateName;

    if (
      !backofficeToken ||
      !hemocioneIdBaseUrl ||
      !oneSignalTemplateId ||
      !whatsappTemplateName
    ) {
      return {
        skipped: true,
        reason:
          "Missing Hemocione ID credentials/config (token, URL, or template IDs)",
      };
    }

    let notifiedCount = 0;
    const errors: { subscriptionId: string; error: string }[] = [];

    // Send one notification per user so each gets their own WhatsApp template parameters
    for (const sub of subscriptionsToNotify) {
      if (!sub.hemocioneId) continue;

      const scheduledDate = formatBrazilDate(sub.schedule.startAt);
      const scheduledTime = formatBrazilTime(sub.schedule.startAt);

      try {
        await $fetch(`${hemocioneIdBaseUrl}/notifications/upcoming-event`, {
          method: "POST",
          body: {
            targets: { userIds: [sub.hemocioneId] },
            channels: {
              push: {
                enabled: true,
                payload: {
                  message: {
                    template_id: oneSignalTemplateId,
                    name: "upcoming_event",
                    custom_data: {
                      slug: hemoEvent.slug,
                      name: hemoEvent.name,
                      scheduledDate,
                      scheduledTime,
                    },
                  },
                },
              },
              zap: {
                enabled: true,
                payload: {
                  templateName: whatsappTemplateName,
                  templateComponents: [
                    {
                      type: "body",
                      parameters: [
                        { type: "text", text: hemoEvent.name },
                        { type: "text", text: scheduledDate },
                        { type: "text", text: scheduledTime },
                      ],
                    },
                  ],
                },
              },
            },
          },
          headers: {
            Authorization: `Bearer ${backofficeToken}`,
          },
        });

        // Only mark as sent when the API call succeeded
        await markSubscriptionUpcomingNotificationAsSent(String(sub._id));
        notifiedCount++;
      } catch (error) {
        console.error(
          `Failed to send notification for subscription ${sub._id}:`,
          error,
        );
        errors.push({
          subscriptionId: String(sub._id),
          error: String(error),
        });
      }
    }

    return {
      notifiedCount,
      totalToNotify: subscriptionsToNotify.length,
      errorCount: errors.length,
      errors,
    };
  },
);
