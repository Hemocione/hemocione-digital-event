import { inngest } from "~/server/inngest/client";
import { getEventsToSendUpcomingNotifications } from "~/server/services/event";
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
    const events = await getEventsToSendUpcomingNotifications();
    for (const event of events) {
      await (inngest.send as any)({
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


