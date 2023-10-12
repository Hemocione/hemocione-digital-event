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
