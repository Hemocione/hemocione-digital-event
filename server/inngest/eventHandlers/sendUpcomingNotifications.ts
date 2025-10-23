import { inngest } from "~/server/inngest/client";
import { getEventBySlug } from "~/server/services/event";
import { getEventSubscriptions, markMultipleSubscriptionsUpcomingNotificationAsSent } from "~/server/services/subscription";
import { formatBrazilDate, formatBrazilTime } from "~/server/utils/brazilTimezone";

export const eventName = "notifications/send-upcoming" as const;

export interface SendUpcomingNotifications {
  data: {
    slug: string;
  };
}

export default inngest.createFunction(
  { name: "Send Upcoming Event Notifications", id: "send-upcoming-notifications" },
  { event: eventName },
  async ({ event }) => {
    const { slug } = event.data;

    const hemoEvent = await getEventBySlug(slug);
    if (!hemoEvent) return { skipped: true, reason: "Event not found" };
    if (!(hemoEvent.subscription && hemoEvent.subscription.enabled)) {
      return { skipped: true, reason: "Subscriptions disabled" };
    }

    const subscriptions = await getEventSubscriptions(slug);
    if (!subscriptions.length) return { skipped: true, reason: "No subscribers" };
    
    // Filter subscriptions that need notifications (haven't been notified yet)
    const subscriptionsToNotify = subscriptions.filter(sub => 
      !sub.notificationsUpcomingSentAt
    );
    
    if (!subscriptionsToNotify.length) return { skipped: true, reason: "No subscriptions need notifications" };
    
    const userIds = subscriptionsToNotify.map(s => s.hemocioneId).filter(Boolean) as string[];

    const config = useRuntimeConfig();
    const hemocioneIdBaseUrl = config.hemocioneIdBaseUrl;
    const backofficeToken = config.hemocioneIdBackofficeToken;
    const oneSignalTemplateId = config.oneSignalTemplateId;
    const whatsappTemplateName = config.whatsappTemplateName;

    if (!backofficeToken || !hemocioneIdBaseUrl || !oneSignalTemplateId || !whatsappTemplateName) {
      return {
        skipped: true,
        reason: "Missing Hemocione ID credentials/config (token, URL, or template IDs)"
      };
    }

    try {
      // Prepare event data with user-specific subscription times
      const eventData = {
        slug: hemoEvent.slug,
        name: hemoEvent.name,
        startAt: hemoEvent.startAt,
        endAt: hemoEvent.endAt,
        location: hemoEvent.location,
        userSubscriptions: subscriptionsToNotify.map(sub => ({
          userId: sub.hemocioneId,
          scheduledStartAt: sub.schedule.startAt,
          scheduledEndAt: sub.schedule.endAt,
          scheduledDate: formatBrazilDate(sub.schedule.startAt),
          scheduledTime: formatBrazilTime(sub.schedule.startAt)
        }))
      };

      await $fetch(`${hemocioneIdBaseUrl}/notifications/upcoming-event`, {
        method: "POST",
        body: {
          targets: { userIds },
          channels: {
            push: { 
              enabled: true, 
              payload: { 
                message: { 
                  template_id: oneSignalTemplateId, 
                  name: "upcoming_event",
                  custom_data: eventData
                } 
              } 
            },
            zap: { 
              enabled: true, 
              payload: { 
                templateName: whatsappTemplateName, 
                templateComponents: [
                  {
                    type: "body",
                    parameters: subscriptionsToNotify.map(sub => [
                      { type: "text", text: hemoEvent.name },
                      { type: "text", text: formatBrazilDate(sub.schedule.startAt) },
                      { type: "text", text: formatBrazilTime(sub.schedule.startAt) }
                    ])
                  }
                ]
              } 
            }
          }
        },
        headers: {
          Authorization: `Bearer ${backofficeToken}`,
        },
      });
      
      // Mark all subscriptions as notified
      const sentSubscriptionIds = subscriptionsToNotify.map(sub => String(sub._id));
      await markMultipleSubscriptionsUpcomingNotificationAsSent(sentSubscriptionIds);
      
      return { 
        notifiedCount: sentSubscriptionIds.length,
        totalSubscriptions: subscriptionsToNotify.length
      };
      
    } catch (error) {
      console.error("Failed to send notifications:", error);
      throw error;
    }
  }
);



