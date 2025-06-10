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
  lastQuestionnairePreScreening?: {
    formResponseId?: string;
    status?: "able-to-donate" | "unable-to-donate";
    answeredAt?: string; 
  } | null;
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
    loggedIn: (state) => Boolean(state.user),
  },
  actions: {
    setUser(user: CurrentUserData | null) {
      const { $clientPosthog } = useNuxtApp();
      this.user = user;
      this.subscriptions.clear();

      if (!user) {
        $clientPosthog.reset(); // Clear user data if user is not logged in anymore
      } else {
        $clientPosthog.identify(user.id, {
          email: user.email,
          name: getCleanFullName(user.givenName, user.surName),
        });
      }
    },
    setToken(token: string | null) {
      this.token = token;
    },
    async createSubscription(
      eventSlug: string,
      scheduleId: string,
      formResponseId?: string,
      status?: "able-to-donate" | "unable-to-donate"
    ) {
      const subscription = await fetchWithAuth(
        `/api/v1/event/${eventSlug}/subscription`,
        {
          method: "POST",
          body: {
            scheduleId,
            formResponseId,
            status,
          },
        },
      );
    
      this.subscriptions.set(eventSlug, subscription);
    
      const eventStore = useEventStore();
      eventStore.incrementSlot(eventSlug, scheduleId);
    },
    
    async getSubscription(
      eventSlug: string,
      options?: { formResponseId?: string; status?: "able-to-donate" | "unable-to-donate" }
    ): Promise<Subscription | null> {
      if (this.subscriptions.has(eventSlug)) {
        return this.subscriptions.get(eventSlug)!;
      }
    
      try {
        const subscription = await fetchWithAuth(
          `/api/v1/event/${eventSlug}/subscription/mine`,
          { query: options }
        );
    
        if (!subscription) return null;
    
        this.subscriptions.set(eventSlug, subscription);
        return subscription;
      } catch (err: any) {
        if (err?.data?.statusCode === 404) {
          return null;
        }
    
        console.error("Erro ao buscar subscription:", err);
        throw err;
      }
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
      eventStore.incrementSlot(
        eventSlug,
        String(mySubscription.schedule._id),
        -1,
      );
      this.subscriptions.delete(eventSlug);
    },

    // async updateSubscriptionPreScreening(
    //   eventSlug: string,
    //   formResponseId: string,
    //   status: "able-to-donate" | "unable-to-donate"
    // ) {
    //   console.log("📩 updateSubscriptionPreScreening chamada com:", {
    //     eventSlug,
    //     formResponseId,
    //     status,
    //   });
    
    //   try {
    //     const updated = await fetchWithAuth(
    //       `/api/v1/event/${eventSlug}/subscription`,
    //       {
    //         method: "PUT",
    //         body: {
    //           formResponseId,
    //           status,
    //         },
    //       }
    //     );
    
    //     if (updated?.subscription) {
    //       this.subscriptions.set(eventSlug, updated.subscription);
    //       console.log("🧠 Subscription atualizada localmente:", updated.subscription);
    //     } else {
    //       console.warn("⚠️ Resposta do backend sem subscription");
    //     }
    
    //     return updated;
    //   } catch (err) {
    //     console.error("❌ Erro ao atualizar pré-triagem:", err);
    //     return null;
    //   }
    // },       

    async createExternalVolunteer(eventSlug: string) {
      await fetchWithAuth(`/api/v1/event/${eventSlug}/external-volunteer`, {
        method: "POST",
      });
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

    async userIsVolunteer(eventSlug: string) {
      if (!this.user) {
        return false;
      }

      if (this.isVolunteerInEvent(eventSlug)) {
        return true;
      }

      try {
        await fetchWithAuth(
          `/api/v1/event/${eventSlug}/external-volunteer/mine`,
          {
            method: "GET",
          },
        );
        this.volunteering.set(eventSlug, true);
        return true;
      } catch (e) {
        return false;
      }
    },
  },
});
