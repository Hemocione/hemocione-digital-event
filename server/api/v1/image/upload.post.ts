import { assertSecretAuth, useHemocioneUserAuth } from "~/server/services/auth";
import { uploadImage } from "~/server/services/cdn";

export default defineEventHandler(async (event) => {
  const headers = getRequestHeaders(event);
  if (!headers["content-type"]?.includes("multipart/form-data")) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid content-type",
    });
  }

  let user: ReturnType<typeof useHemocioneUserAuth> | undefined = undefined;
  try {
    user = useHemocioneUserAuth(event);
  } catch (e) {
    assertSecretAuth(event);
  }

  const extraPrefix = user ? `users/${user.id}` : "private";
  const url = await uploadImage(event, extraPrefix);
  return {
    url,
  };
});
