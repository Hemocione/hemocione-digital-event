import type { LocationQuery } from "#vue-router";
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
  const { user, setUser, setToken } = useUserStore();
  let currentUser: CurrentUserData | null = null;
  let currentToken: string | null = null;

  if (user) return true;

  currentUser = useCookie(config.public.authCookieKey, {
    decode: currentUserTokenDecoder,
  }).value;

  currentToken = useCookie(config.public.authCookieKey).value as string;

  if (query?.token) {
    currentUser = currentUserTokenDecoder(query.token as string);
    currentToken = query.token as string;
  }

  if (!currentUser) {
    return false;
  }

  setUser(currentUser);
  setToken(currentToken);
  return true;
}
