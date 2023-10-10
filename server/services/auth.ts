import type { H3Event } from "h3";
const config = useRuntimeConfig();

export function assertSecretAuth(event: H3Event) {
  const headers = event.headers;
  const secret = headers.get("x-secret");

  if (secret !== config.secret) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }
}
