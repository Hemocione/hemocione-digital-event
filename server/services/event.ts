import { Event } from "../models/event";

export const getOrCreateEvent = async (eventSlug: string) => {
  return await Event.findOneAndUpdate(
    {
      slug: eventSlug,
    },
    {
      slug: eventSlug,
    },
    {
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
};
