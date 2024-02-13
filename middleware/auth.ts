import type { LocationQuery } from "#vue-router";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return;

  if (!evaluateCurrentLogin(from.query)) {
    redirectToID(to.fullPath);
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("token");
  window.history.replaceState({}, document.title, url.toString());
});

export function evaluateCurrentLogin(query?: LocationQuery) {
  const { user, setUser, setToken } = useUserStore();

  if (user) return true;

  const token = getCurrentToken(query);

  if (!token) return false;

  const currentUser = currentUserTokenDecoder(token);

  if (!currentUser) {
    return false;
  }

  setUser(currentUser);
  setToken(token);
  return true;
}

export function getCurrentToken(query?: LocationQuery): string | null {
  const { token } = useUserStore();
  if (token) {
    return token;
  }

  const config = useRuntimeConfig();
  let currentToken: string | null = null;

  currentToken = useCookie(config.public.authCookieKey).value as string;

  // Fallback if no cookie is found
  if (!currentToken && query?.token) {
    currentToken = query.token as string;
  }

  return currentToken;
}

export function redirectToID(fullPath: string) {
  const config = useRuntimeConfig();
  const redirectUrl = `${config.public.siteUrl}${fullPath}`;

  window.location.href = getHemocioneIdUrl(redirectUrl);
}
