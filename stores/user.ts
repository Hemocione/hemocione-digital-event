import type { CurrentUserData } from "~/utils/currentUserTokenDecoder";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as CurrentUserData | null,
  }),
  actions: {
    setUser(user: CurrentUserData) {
      this.user = user;
    },
  },
});
