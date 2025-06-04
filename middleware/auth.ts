import type { LocationQuery } from "#vue-router";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return;

  const isLoggedIn = await evaluateCurrentLogin(from.query);
  if (!isLoggedIn) {
    redirectToID(to.fullPath);
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("token");
  window.history.replaceState({}, document.title, url.toString());
});

export async function evaluateCurrentLogin(query?: LocationQuery) {
  const { user, setUser, setToken } = useUserStore();
  const config = useRuntimeConfig();

  if (user) return true;

  // || ""
  const token = getCurrentToken(query);

  if (!token) return false;
  let tokenIsValid = true;

  try {
    await useFetch(`${config.public.hemocioneIdApiUrl}/users/validate-token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onRequestError: (_error) => {
        tokenIsValid = false;
      },
      onResponseError: (_error) => {
        tokenIsValid = false;
      },
    });
  } catch (error) {
    tokenIsValid = false;
  }

  if (!tokenIsValid) {
    setUser(null);
    setToken(null);
    return false;
  }

  const currentUser = currentUserTokenDecoder(token);

  if (!currentUser) {
    return false;
  }

  setUser(currentUser);
  setToken(token);
  return true;
}

export function getCurrentToken(query?: LocationQuery): string | null {
  if (query?.token) {
    return String(query.token);
  }

  const { token } = useUserStore();
  if (token) {
    return token;
  }

  const config = useRuntimeConfig();
  const cookieToken = useCookie(config.public.authCookieKey).value as string;
  return cookieToken;
}

export function redirectToID(fullPath: string) {
  const config = useRuntimeConfig();
  const redirectUrl = `${config.public.siteUrl}${fullPath}`;
  navigateTo(getHemocioneIdUrl(redirectUrl), { external: true });
}
