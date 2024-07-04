import { inngest } from "~/server/inngest/client";
import { getEventsToSendDonations } from "~/server/services/event";

export default inngest.createFunction(
  {
    name: "Find Events To Send Donations",
    id: "find-events-to-send-donations",
  },
  {
    cron: "*/30 * * * *", // every 30 minutes
  },
  async () => {
    const events = await getEventsToSendDonations();
    for (const event of events) {
      await inngest.send({
        name: "sync/compute-event-donations",
        data: {
          _id: String(event._id),
          slug: event.slug,
        },
      });
    }
    return {
      eventsBeingProcessedCount: events.length,
      eventsBeingProcessed: events.map((event) => event.slug)
    }
  },
);
