import { Event } from "~/server/models/event";

export default defineEventHandler(async (event) => {
  const eventSlug = getRouterParam(event, "eventSlug");
  if (!eventSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid event slug",
    });
  }

  const hemoEvent = await Event.findOneAndUpdate(
    {
      slug: eventSlug,
    },
    {
      slug: eventSlug,
    },
    {
      upsert: true,
      lean: true,
    },
  );

  return {
    ...hemoEvent,
  };
});
