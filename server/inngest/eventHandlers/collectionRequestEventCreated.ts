import { inngest } from "~/server/inngest/client";
import {
  enableEventSubscription,
  setEventDefaultSchedule,
  type CollectionEventSchedule,
} from "~/server/services/event";

export interface CollectionRequestEventCreated {
  data: {
    eventSlug: string;
    schedule: CollectionEventSchedule;
    enableSubscription: boolean;
  };
}

export const eventName = "collection-request/event.created";

export default inngest.createFunction(
  {
    name: "Collection Request Event Created Handler",
    id: "collection-request-event-created-handler",
  },
  { event: eventName },
  async ({ event, step }) => {
    const { eventSlug, schedule, enableSubscription } = event.data;

    await step.run("generate-schedules", async () => {
      await setEventDefaultSchedule(
        eventSlug,
        schedule.timeInterval,
        schedule.slotsPerInterval,
        schedule.overrides,
      );
    });

    if (enableSubscription) {
      await step.run("enable-subscription", async () => {
        await enableEventSubscription(eventSlug);
      });
    }
  },
);
