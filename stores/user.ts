import type { CurrentUserData } from "~/utils/currentUserTokenDecoder";

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

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as CurrentUserData | null,
    token: null as string | null,
    subscriptions: new Map<string, Subscription>(),
    volunteering: new Map<string, Boolean>(),
  }),
  getters: {
    hasSubscriptionInEvent: (state) => (eventSlug: string) =>
      state.subscriptions.has(eventSlug),
    isVolunteerInEvent: (state) => (eventSlug: string) =>
      state.volunteering.get(eventSlug),
  },
  actions: {
    setUser(user: CurrentUserData | null) {
      this.user = user;
      this.subscriptions.clear();
    },
    setToken(token: string | null) {
      this.token = token;
    },
    async createSubscription(eventSlug: string, scheduleId: string) {
      const subscription = await fetchWithAuth(
        `/api/v1/event/${eventSlug}/subscription`,
        {
          method: "POST",
          body: { scheduleId },
        },
      );

      this.subscriptions.set(eventSlug, subscription);
      const eventStore = useEventStore();
      eventStore.incrementSlot(eventSlug, scheduleId);
    },

    async getSubscription(eventSlug: string): Promise<Subscription | null> {
      if (this.subscriptions.has(eventSlug)) {
        return this.subscriptions.get(eventSlug)!;
      }

      const subscription = await fetchWithAuth(
        `/api/v1/event/${eventSlug}/subscription/mine`,
      )?.catch(() => null);

      if (!subscription) {
        return null;
      }

      this.subscriptions.set(eventSlug, subscription);
      return subscription;
    },

    async cancelSubscription(eventSlug: string) {
      await fetchWithAuth(`/api/v1/event/${eventSlug}/subscription/mine`, {
        method: "DELETE",
      });
      const eventStore = useEventStore();
      const mySubscription = this.subscriptions.get(eventSlug);
      if (!mySubscription) {
        return;
      }
      eventStore.incrementSlot(eventSlug, String(mySubscription.schedule._id), -1);
      this.subscriptions.delete(eventSlug);
    },

    async createExternalVolunteer(eventSlug: string) {
      await fetchWithAuth(
        `/api/v1/event/${eventSlug}/external-volunteer`,
        {
          method: "POST",
        },
      );
      this.volunteering.set(eventSlug, true);
    },
    
    async deleteExternalVolunteer(eventSlug: string) {
      await fetchWithAuth(
        `/api/v1/event/${eventSlug}/external-volunteer/mine`,
        {
          method: "DELETE",
        },
      );
      this.volunteering.set(eventSlug, false);
    },

    async userIsVolunteer(eventSlug: string){
      if (!this.user){
        return false; 
      }
      
      if (this.isVolunteerInEvent(eventSlug)){
        return true; 
      };

      try {
        await fetchWithAuth(
          `/api/v1/event/${eventSlug}/external-volunteer/mine`,
          {
            method: "GET",
          },
        )
        this.volunteering.set(eventSlug, true);
        return true; 
      }
      catch(e){
        return false; 
      }

    },
  },
});




