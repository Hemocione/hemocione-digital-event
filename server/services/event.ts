import { Event } from "../models/event";

export async function getOrCreateEvent(eventSlug: string) {
  return await Event.findOneAndUpdate(
    {
      slug: eventSlug,
    },
    {
      slug: eventSlug,
    },
    {
      upsert: true,
      lean: true,
      setDefaultsOnInsert: true,
    },
  );
}
