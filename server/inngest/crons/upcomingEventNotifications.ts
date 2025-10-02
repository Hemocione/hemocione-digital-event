import { inngest } from "~/server/inngest/client";
import { getSubscriptionsToSendUpcomingNotifications } from "~/server/services/subscription";
import { eventName as sendUpcomingEventName } from "~/server/inngest/eventHandlers/sendUpcomingNotifications";

export default inngest.createFunction(
  {
    name: "Find Events To Send Upcoming Notifications",
    id: "find-events-to-send-upcoming-notifications",
  },
  {
    cron: "0 14 * * *", // every day at 2 PM
  },
  async () => {
    const subscriptions = await getSubscriptionsToSendUpcomingNotifications();
    
    // Group subscriptions by eventSlug to process them efficiently
    const subscriptionsByEvent = subscriptions.reduce((acc, subscription) => {
      if (!acc[subscription.eventSlug]) {
        acc[subscription.eventSlug] = [];
      }
      acc[subscription.eventSlug].push(subscription);
      return acc;
    }, {} as Record<string, typeof subscriptions>);

    // Send one notification per event (the handler will process all subscriptions for that event)
    for (const [eventSlug, eventSubscriptions] of Object.entries(subscriptionsByEvent)) {
      await inngest.send({
        name: sendUpcomingEventName,
        data: {
          slug: eventSlug,
        },
      });
    }
    
    return {
      subscriptionsBeingProcessedCount: subscriptions.length,
      eventsBeingProcessedCount: Object.keys(subscriptionsByEvent).length,
      eventsBeingProcessed: Object.keys(subscriptionsByEvent),
    };
  },
);


