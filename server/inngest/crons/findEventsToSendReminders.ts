import { inngest } from "~/server/inngest/client";
import {
  getEventsStartingIn24h,
  getEventsStartingIn2h,
  getEventsStartingIn1h,
} from "~/server/services/event";

export default inngest.createFunction(
  {
    name: "Find Events To Send Reminders",
    id: "find-events-to-send-reminders",
  },
  {
    cron: "0 * * * *", // Every hour at minute 0
  },
  async () => {
    const now = new Date();
    const results = {
      processed: [] as string[],
      errors: [] as string[],
    };

    try {
      // Check for events starting in 24 hours
      const events24h = await getEventsStartingIn24h();
      for (const event of events24h) {
        try {
          await inngest.send({
            name: "notify/event-reminder",
            data: {
              eventId: String(event._id),
              eventSlug: event.slug,
              eventName: event.name,
              eventStartAt: event.startAt,
              eventAddress: event.location
                ? `${event.location.address}, ${event.location.city}, ${event.location.state}`
                : undefined,
              reminderType: "24h-reminder",
            },
          });
          results.processed.push(`24h: ${event.slug}`);
        } catch (error: any) {
          results.errors.push(`24h: ${event.slug} - ${error.message}`);
        }
      }

      // Check for events starting in 2 hours
      const events2h = await getEventsStartingIn2h();
      for (const event of events2h) {
        try {
          await inngest.send({
            name: "notify/event-reminder",
            data: {
              eventId: String(event._id),
              eventSlug: event.slug,
              eventName: event.name,
              eventStartAt: event.startAt,
              eventAddress: event.location
                ? `${event.location.address}, ${event.location.city}, ${event.location.state}`
                : undefined,
              reminderType: "2h-reminder",
            },
          });
          results.processed.push(`2h: ${event.slug}`);
        } catch (error: any) {
          results.errors.push(`2h: ${event.slug} - ${error.message}`);
        }
      }

      // Check for events starting in 1 hour
      const events1h = await getEventsStartingIn1h();
      for (const event of events1h) {
        try {
          await inngest.send({
            name: "notify/event-reminder",
            data: {
              eventId: String(event._id),
              eventSlug: event.slug,
              eventName: event.name,
              eventStartAt: event.startAt,
              eventAddress: event.location
                ? `${event.location.address}, ${event.location.city}, ${event.location.state}`
                : undefined,
              reminderType: "1h-reminder",
            },
          });
          results.processed.push(`1h: ${event.slug}`);
        } catch (error: any) {
          results.errors.push(`1h: ${event.slug} - ${error.message}`);
        }
      }

      return {
        timestamp: now.toISOString(),
        events24hCount: events24h.length,
        events2hCount: events2h.length,
        events1hCount: events1h.length,
        totalProcessed: results.processed.length,
        processed: results.processed,
        errors: results.errors,
      };
    } catch (error: any) {
      return {
        timestamp: now.toISOString(),
        error: error.message,
        processed: results.processed,
        errors: results.errors,
      };
    }
  },
);
