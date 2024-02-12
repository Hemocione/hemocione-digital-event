import type { LocationQuery } from "#vue-router";
import { getHemocioneIdUrl } from "~/helpers/hemocioneID";
import type { CurrentUserData } from "~/utils/currentUserTokenDecoder";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return;

  const config = useRuntimeConfig();

  if (!evaluateCurrentLogin(from.query)) {
    const redirectUrl = `${config.public.siteUrl}${to.fullPath}`;

    window.location.href = getHemocioneIdUrl(redirectUrl);
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("token");
  window.history.replaceState({}, document.title, url.toString());
});

function evaluateCurrentLogin(query?: LocationQuery) {
  const config = useRuntimeConfig();
  const { user, setUser } = useUserStore();
  let currentUser: CurrentUserData | null = null;

  if (user) return true;

  currentUser = useCookie(config.public.authCookieKey, {
    decode: currentUserTokenDecoder,
  }).value;

  if (query?.token) {
    currentUser = currentUserTokenDecoder(query.token as string);
  }

  if (!currentUser) {
    return false;
  }

  setUser(currentUser);
  return true;
}
