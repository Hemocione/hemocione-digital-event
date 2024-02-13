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
}

interface Subscription {
  eventSlug: string;
  hemocioneId: string;
  name: string;
  code: string;
  schedule: {
    _id: unknown;
    startAt: string;
    endAt: string;
  };
}

export const useEventStore = defineStore("event", {
  state: () => ({
    loadedEvents: new Map<string, Event>(),
    loadedSubscriptions: new Map<string, Subscription>(),
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

    async createSubscription(eventSlug: string, scheduleId: string) {
      const subscription = await fetchWithAuth(
        `/api/v1/event/${eventSlug}/subscription`,
        {
          method: "POST",
          body: {
            scheduleId,
            // TODO: Remove this or change (wait for guima anwser)
            startAt: new Date().toISOString(),
            endAt: new Date().toISOString(),
          },
        },
      );

      this.loadedSubscriptions.set(eventSlug, subscription);
    },

    async getSubscription(eventSlug: string): Promise<Subscription | null> {
      if (this.loadedSubscriptions.has(eventSlug)) {
        return this.loadedSubscriptions.get(eventSlug)!;
      }

      const subscription = await fetchWithAuth(
        `/api/v1/event/${eventSlug}/subscription/mine`,
      )?.catch(() => null);

      if (!subscription) {
        return null;
      }

      this.loadedSubscriptions.set(eventSlug, subscription);

      return subscription;
    },

    async cancelSubscription(eventSlug: string) {
      await fetchWithAuth(`/api/v1/event/${eventSlug}/subscription/mine`, {
        method: "DELETE",
      });

      this.loadedSubscriptions.delete(eventSlug);
    },
  },
});
