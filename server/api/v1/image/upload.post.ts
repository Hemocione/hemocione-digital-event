import { assertSecretAuth } from "~/server/services/auth";
import { uploadImage } from "~/server/services/cdn";

export default defineEventHandler(async (event) => {
  assertSecretAuth(event);
  const headers = getRequestHeaders(event);

  if (!headers["content-type"]?.includes("multipart/form-data")) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid content-type",
    });
  }
  const url = await uploadImage(event);
  return {
    url,
  };
});
