import type { Address } from "~/helpers/formatter";

interface Event {
  slug: string;
  name: string;
  banner?: string | null;
  description?: string | null;
  logo?: string | null;
  startAt?: string;
  endAt: string;
  location?: Address | null;
  registerDonationUrl?: string | null;
  registerDonationDateLimit?: string | null;
  subscription?: {
    enabled: boolean;
    schedules: {
      _id: unknown;
      slots: number;
      occupiedSlots: number;
      startAt: string;
      endAt: string;
    }[];
  } | null;
  private?: boolean;
  externalVolunteers?: {
    enabled: boolean;
    groupUrl: string;
    slots: number;
    occupiedSlots: number;
    htmlExplanationText?: string;
  }

}

export const useEventStore = defineStore("event", {
  state: () => ({
    loadedEvents: new Map<string, Event>(),
  }),
  actions: {
    async getEvent(slug: string): Promise<Event> {
      if (this.loadedEvents.has(slug)) {
        return this.loadedEvents.get(slug)!;
      }

      const { data: event } = await useFetch(`/api/v1/event/${slug}`);

      if (!event.value) {
        throw new Error("Event not found");
      }

      this.loadedEvents.set(slug, event.value);

      return event.value;
    },
    incrementSlot(
      eventSlug: string,
      scheduleId: string,
      increment: number = 1,
    ) {
      const event = this.loadedEvents.get(eventSlug);
      if (!event) {
        return;
      }

      const schedule = event.subscription?.schedules.find(
        (s) => s._id === scheduleId,
      );

      if (!schedule) {
        return;
      }

      schedule.occupiedSlots += increment;
    },
  },
});



export const hasAvailableSlots = (event: Event): boolean => {
  if (event.subscription?.enabled) {
    return event.subscription.schedules.some(schedule => 
      schedule.slots > schedule.occupiedSlots
    );
  }
  return false;
};