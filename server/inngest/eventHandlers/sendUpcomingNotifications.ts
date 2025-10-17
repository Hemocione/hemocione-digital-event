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
  async ({ event, step }) => {
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

    // Process notifications in batches to avoid overloading the system
    const BATCH_SIZE = 200; // Process up to 200 users at a time
    const sentSubscriptionIds: string[] = [];
    
    for (let i = 0; i < subscriptionsToNotify.length; i += BATCH_SIZE) {
      const batch = subscriptionsToNotify.slice(i, i + BATCH_SIZE);
      const batchUserIds = batch.map(s => s.hemocioneId).filter(Boolean) as string[];
      
      await step.run(`send-notifications-batch-${Math.floor(i / BATCH_SIZE) + 1}`, async () => {
        try {
          // Prepare event data with user-specific subscription times for this batch
          const eventData = {
            slug: hemoEvent.slug,
            name: hemoEvent.name,
            startAt: hemoEvent.startAt,
            endAt: hemoEvent.endAt,
            location: hemoEvent.location,
            userSubscriptions: batch.map(sub => ({
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
              targets: { userIds: batchUserIds },
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
                        parameters: batch.map(sub => [
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
          
          // If successful, add all subscription IDs from this batch
          sentSubscriptionIds.push(...batch.map(sub => String(sub._id)));
          
        } catch (error) {
          // If batch fails, don't add any IDs - they can be retried later
          console.error(`Failed to send notifications for batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
          throw error; // Re-throw to mark the step as failed
        }
      });
    }

    // Mark only successfully sent subscriptions as notified
    if (sentSubscriptionIds.length > 0) {
      await markMultipleSubscriptionsUpcomingNotificationAsSent(sentSubscriptionIds);
    }
    
    return { 
      notifiedCount: sentSubscriptionIds.length,
      totalSubscriptions: subscriptionsToNotify.length,
      failedCount: subscriptionsToNotify.length - sentSubscriptionIds.length,
      batchesProcessed: Math.ceil(subscriptionsToNotify.length / BATCH_SIZE)
    };
  }
);



