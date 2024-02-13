import type { CurrentUserData } from "~/utils/currentUserTokenDecoder";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as CurrentUserData | null,
    token: null as string | null,
  }),
  actions: {
    setUser(user: CurrentUserData) {
      this.user = user;
    },
    setToken(token: string) {
      this.token = token;
    },
  },
});
