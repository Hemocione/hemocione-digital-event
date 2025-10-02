import { inngest } from "~/server/inngest/client";
import { getEventBySlug } from "~/server/services/event";
import { getEventSubscriptions, markSubscriptionUpcomingNotificationAsSent } from "~/server/services/subscription";

export const eventName = "notifications/send-upcoming" as const;

export interface SendUpcomingNotifications {
  data: {
    slug: string;
  };
}

export default inngest.createFunction(
  { name: "Send Upcoming Event Notifications", id: "send-upcoming-notifications" },
  { event: eventName },
  async ({ event, step }) => {
    const { slug } = event.data;

    const hemoEvent = await getEventBySlug(slug);
    if (!hemoEvent) return { skipped: true, reason: "Event not found" };
    if (!(hemoEvent.subscription && hemoEvent.subscription.enabled)) {
      return { skipped: true, reason: "Subscriptions disabled" };
    }

    const subscriptions = await getEventSubscriptions(slug);
    if (!subscriptions.length) return { skipped: true, reason: "No subscribers" };
    
    // Filter subscriptions that need notifications (schedule.startAt is tomorrow and not yet notified)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);
    
    const subscriptionsToNotify = subscriptions.filter(sub => 
      sub.schedule.startAt >= tomorrow && 
      sub.schedule.startAt <= endOfTomorrow &&
      !sub.notificationsUpcomingSentAt
    );
    
    if (!subscriptionsToNotify.length) return { skipped: true, reason: "No subscriptions need notifications" };
    
    const userIds = subscriptionsToNotify.map(s => s.hemocioneId).filter(Boolean) as string[];

    const config = useRuntimeConfig();
    const hemocioneIdBaseUrl = config.hemocioneIdBaseUrl;
    const backofficeToken = config.hemocioneIdBackofficeToken;
    const oneSignalTemplateId = config.oneSignalTemplateId;
    const whatsappTemplateName = config.whatsappTemplateName;

    if (!backofficeToken || !hemocioneIdBaseUrl) {
      return { skipped: true, reason: "Missing Hemocione ID credentials/config" };
    }

    await step.run("call-hemocione-id", async () => {
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
          scheduledDate: new Date(sub.schedule.startAt).toLocaleDateString('pt-BR'),
          scheduledTime: new Date(sub.schedule.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
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
                      { type: "text", text: new Date(sub.schedule.startAt).toLocaleDateString('pt-BR') },
                      { type: "text", text: new Date(sub.schedule.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
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
    });

    // Mark each subscription as notified
    await Promise.all(
      subscriptionsToNotify.map(sub => 
        markSubscriptionUpcomingNotificationAsSent(String(sub._id))
      )
    );
    
    return { notifiedCount: userIds.length };
  }
);



