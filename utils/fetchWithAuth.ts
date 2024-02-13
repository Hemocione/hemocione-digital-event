import { getCurrentToken, redirectToID } from "~/middleware/auth";

type FetchParams = Parameters<typeof $fetch>;

export function fetchWithAuth(url: FetchParams[0], options?: FetchParams[1]) {
  const token = getCurrentToken();
  const route = useRoute();

  if (!token) {
    if (process.browser) {
      redirectToID(route.fullPath);
    }

    return null;
  }

  return $fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
