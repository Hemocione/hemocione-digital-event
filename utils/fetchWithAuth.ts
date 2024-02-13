type FetchParams = Parameters<typeof $fetch>;

export function fetchWithAuth(url: FetchParams[0], options: FetchParams[1]) {
  const { token } = useUserStore();

  if (!token) {
    throw new Error("Token not found");
  }

  return $fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
