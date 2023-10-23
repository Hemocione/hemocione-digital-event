import { Event } from "../models/event";

export interface CreateEventDTO {
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  queue?: {
    participantsMax?: number;
  };
  startAt?: string | Date;
  endAt?: string | Date;
  description?: string;
}

export interface UpdateEventDTO {
  name?: string;
  startAt?: string | Date;
  endAt?: string | Date;
  logo?: string;
  banner?: string;
  queue?: {
    participantsMax?: number;
  };
  active?: boolean;
  description?: string;
}

export async function getEventBySlug(
  eventSlug: string,
  activeOnly: boolean = true,
  options: {
    lean?: boolean;
  } = {
    lean: true,
  },
) {
  return await Event.findOne(
    {
      slug: eventSlug,
      ...(activeOnly ? { active: true } : {}),
    },
    null,
    options,
  );
}

export async function deleteEventBySlug(eventSlug: string) {
  return await Event.findOneAndUpdate(
    {
      slug: eventSlug,
    },
    {
      active: false,
    },
    {
      lean: true,
    },
  );
}

export async function updateEventBySlug(
  eventSlug: string,
  data: UpdateEventDTO,
) {
  const event = await getEventBySlug(eventSlug, false, { lean: true });
  if (!event) return null;

  event.set(data);
  return (await event.save()).toObject();
}

export async function createEvent(data: CreateEventDTO) {
  return (await Event.create(data)).toObject();
}

const getEventsFromDBPromise = (filter: Record<string, unknown>) => {
  return Event.find({
    active: true,
    ...filter,
  })
    .select({
      _id: 1,
      name: 1,
      slug: 1,
      logo: 1,
      banner: 1,
      startAt: 1,
      endAt: 1,
      location: 1,
    })
    .sort({ endAt: -1, _id: -1 })
    .lean();
};

// for now, caching in memory is enough to avoid unnecessary database queries
type EventsFromDb = Awaited<ReturnType<typeof getEventsFromDBPromise>>;
const getEventsCache = new Map<
  boolean,
  {
    generatedAt: Date;
    data: EventsFromDb;
  }
>();
const EVENTS_CACHE_TTL = 1000 * 60 * 60; // 60 minutes

export async function getEvents(oldEvents: boolean = false) {
  const cached = getEventsCache.get(oldEvents);
  if (cached && cached.generatedAt.getTime() + EVENTS_CACHE_TTL >= Date.now()) {
    return cached.data;
  }

  const filter = oldEvents
    ? { endAt: { $lte: new Date() } }
    : { endAt: { $gte: new Date() } };

  const events = await getEventsFromDBPromise(filter);

  // update cache
  getEventsCache.set(oldEvents, {
    generatedAt: new Date(),
    data: events,
  });
  return events;
}
