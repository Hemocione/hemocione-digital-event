import { inngest } from "~/server/inngest/client";
import { getEventBySlug, markUpcomingNotificationsAsSent } from "~/server/services/event";
import { getEventSubscriptions } from "~/server/services/subscription";

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
    
    const userIds = subscriptions.map(s => s.hemocioneId).filter(Boolean) as string[];

    const config = useRuntimeConfig();
    const hemocioneIdBaseUrl = config.hemocioneIdBaseUrl;
    const backofficeToken = config.hemocioneIdBackofficeToken;
    const oneSignalTemplateId = config.oneSignalTemplateId;
    const whatsappTemplateName = config.whatsappTemplateName;

    await step.run("call-hemocione-id", async () => {
      // Prepare event data with user-specific subscription times
      const eventData = {
        slug: hemoEvent.slug,
        name: hemoEvent.name,
        startAt: hemoEvent.startAt,
        endAt: hemoEvent.endAt,
        location: hemoEvent.location,
        userSubscriptions: subscriptions.map(sub => ({
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
          data: eventData,
          channels: {
            push: { 
              enabled: true, 
              payload: { 
                message: { 
                  template_id: oneSignalTemplateId, 
                  name: "upcoming_event",
                  data: eventData
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
                    parameters: subscriptions.map(sub => [
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

    await markUpcomingNotificationsAsSent(slug);
    return { notifiedCount: userIds.length };
  }
);



