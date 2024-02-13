import { getCurrentToken } from "~/middleware/auth";

type FetchParams = Parameters<typeof $fetch>;

export function fetchWithAuth(url: FetchParams[0], options?: FetchParams[1]) {
  const token = getCurrentToken();

  if (!token) {
    return null;
  }

  return $fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
