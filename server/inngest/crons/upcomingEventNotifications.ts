import { inngest } from "~/server/inngest/client";
import { getEventsToSendUpcomingNotifications } from "~/server/services/event";
import { eventName as sendUpcomingEventName } from "~/server/inngest/eventHandlers/sendUpcomingNotifications";

export default inngest.createFunction(
  {
    name: "Find Events To Send Upcoming Notifications",
    id: "find-events-to-send-upcoming-notifications",
  },
  {
    cron: "0 16 * * *", // every day at 1 PM Brazil time (16:00 UTC)
  },
  async () => {
    const events = await getEventsToSendUpcomingNotifications();

    // Send one notification event per event (the handler will process subscriptions individually)
    for (const event of events) {
      await inngest.send({
        name: sendUpcomingEventName,
        data: {
          slug: event.slug,
        },
      });
    }

    return {
      eventsBeingProcessedCount: events.length,
      eventsBeingProcessed: events.map((e) => e.slug),
    };
  },
);
