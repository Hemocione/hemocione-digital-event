import slugify from "slugify";
import { Event } from "../models/event";
import { getTimeBlocks } from "~/utils/getTimeBlocks";

export interface CreateEventDTO {
  name: string;
  logo?: string;
  banner?: string;
  queue?: {
    participantsMax?: number;
  };
  startAt: string | Date;
  endAt: string | Date;
  description?: string;
  location?: {
    address: string;
    city: string;
    state: string;
  };
  registerDonationUrl?: string;
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
  location?: {
    address: string;
    city: string;
    state: string;
  };
  subscription?: {
    enabled?: boolean;
  };
  registerDonationUrl?: string;
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
  const event = await getEventBySlug(eventSlug, false, { lean: false });
  if (!event) return null;

  event.set({ ...data, queue: { ...event.queue, ...data.queue } });
  return (await event.save()).toObject();
}

export async function createEvent(data: CreateEventDTO) {
  const slug = slugify(data.name, {
    lower: true,
    strict: true,
    locale: "pt",
  });

  return (await Event.create({ ...data, slug })).toObject();
}

export async function setEventDefaultSchedule(eventSlug: string, timeInterval: number = 60, slotsPerInterval: number = 30) {
  const event = await getEventBySlug(eventSlug, false, { lean: false });
  if (!event) return null;

  const timeBlocks = getTimeBlocks(event.startAt, event.endAt, timeInterval);
  const schedules = timeBlocks.map((schedule) => ({
    ...schedule,
    slots: slotsPerInterval,
  }));
  const subscription = { schedules }
  event.set({ subscription });
  const hemoEvent = await event.save()
  return hemoEvent.toObject();
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

const allActiveEventsCache:
  | {
      generatedAt: Date;
      data: EventsFromDb;
    }
  | {
      generatedAt: null;
      data: null;
    } = {
  generatedAt: null,
  data: null,
};

const ALL_ACTIVE_EVENTS_CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

export async function getAllActiveEvents() {
  const cached = allActiveEventsCache;
  if (
    cached.generatedAt &&
    cached.generatedAt.getTime() + ALL_ACTIVE_EVENTS_CACHE_TTL >= Date.now()
  ) {
    return cached.data;
  }

  const events = await getEvents(false);
  cached.generatedAt = new Date();
  cached.data = events;
  return events;
}
