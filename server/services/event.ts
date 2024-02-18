import slugify from "slugify";
import { Event } from "../models/event";
import { getTimeBlocks } from "~/utils/getTimeBlocks";
import { getCacheKeyFromParams } from "~/utils/getCacheKeyFromParams";

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
  registerDonationDateLimit?: string;
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
  registerDonationDateLimit?: string
}

export async function incrementEventScheduleOccupiedSlots(
  eventSlug: string,
  scheduleId: string,
  increment: number,
) {
  const event = await Event.findOneAndUpdate(
    {
      slug: eventSlug,
      "subscription.schedules._id": scheduleId,
    },
    {
      $inc: { "subscription.schedules.$.occupiedSlots": increment },
    },
    {
      lean: true,
      new: true,
    },
  );
  removeEventFromCache(eventSlug);
  return event;
}

export async function enableEventSubscription(eventSlug: string) {
  const event = await Event.findOneAndUpdate(
    {
      slug: eventSlug,
    },
    {
      "subscription.enabled": true,
    },
    {
      lean: true,
      new: true,
    },
  );
  removeEventFromCache(eventSlug);
  return event;
}

export async function updateEventScheduleSlots(
  eventSlug: string,
  scheduleId: string,
  slots: number,
) {
  const event = await Event.findOneAndUpdate(
    {
      slug: eventSlug,
      "subscription.schedules._id": scheduleId,
    },
    {
      $set: { "subscription.schedules.$.slots": slots },
    },
    {
      lean: true,
      new: true,
    },
  );
  removeEventFromCache(eventSlug);
  return event;
}

const getEventBySlugPromise = (
  eventSlug: string,
  activeOnly: boolean,
  options: { lean?: boolean },
) => {
  return Event.findOne(
    {
      slug: eventSlug,
      ...(activeOnly ? { active: true } : {}),
    },
    null,
    options,
  );
};

const MAX_CURRENT_EVENTS_CACHE_TTL = 1000 * 60 * 1; // 1 minute
const MAX_SIZE_CURRENT_EVENTS_CACHE = 10; // at most 10 events cached at a time

type EventFromDb = Awaited<ReturnType<typeof getEventBySlugPromise>>;

const currentEventsBySlugCache: {
  [cacheKey: string]: {
    generatedAt: Date;
    data: EventFromDb;
  };
} = {};

const addEventToCache = (event: EventFromDb, key: string) => {
  currentEventsBySlugCache[key] = {
    generatedAt: new Date(),
    data: event,
  };

  const keys = Object.keys(currentEventsBySlugCache);
  if (keys.length > MAX_SIZE_CURRENT_EVENTS_CACHE) {
    const oldestKey = keys.reduce((oldest, key) => {
      return currentEventsBySlugCache[key].generatedAt <
        currentEventsBySlugCache[oldest].generatedAt
        ? key
        : oldest;
    }, keys[0]);
    delete currentEventsBySlugCache[oldestKey];
  }
};

const removeEventFromCache = (eventSlug: string) => {
  const eventCacheKey = Object.keys(currentEventsBySlugCache).find((key) =>
    key.startsWith(`${eventSlug}:`),
  );
  if (eventCacheKey) {
    delete currentEventsBySlugCache[eventCacheKey];
  }
};

export async function getEventBySlug(
  eventSlug: string,
  activeOnly: boolean = true,
  options: {
    lean?: boolean;
  } = {
    lean: true,
  },
) {
  const cacheKey = `${eventSlug}:${getCacheKeyFromParams({
    eventSlug,
    activeOnly,
    options,
  })}`;
  const cached = currentEventsBySlugCache[cacheKey];
  if (
    cached &&
    cached.generatedAt.getTime() + MAX_CURRENT_EVENTS_CACHE_TTL >= Date.now()
  ) {
    return cached.data;
  }

  const event = await getEventBySlugPromise(eventSlug, activeOnly, options);
  if (event) {
    addEventToCache(event, cacheKey);
  }

  return event;
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

export async function setEventDefaultSchedule(
  eventSlug: string,
  timeInterval: number = 60,
  slotsPerInterval: number = 30,
) {
  const event = await getEventBySlug(eventSlug, false, { lean: false });
  if (!event) return null;

  if (event.subscription?.enabled) {
    throw createError({
      statusCode: 400,
      statusMessage: "Subscription is already enabled - do it manually!",
    });
  }

  const timeBlocks = getTimeBlocks(event.startAt, event.endAt, timeInterval);
  const schedules = timeBlocks.map((schedule) => ({
    ...schedule,
    slots: slotsPerInterval,
  }));
  const subscription = { schedules };
  event.set({ subscription });
  const hemoEvent = await event.save();
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
    .sort({ startAt: 1, endAt: 1, _id: 1 })
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
