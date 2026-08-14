import { assertColetaIntegrationSecret } from "~/server/services/auth";
import {
  createEventFromCollection,
  type CreateEventFromCollectionDTO,
} from "~/server/services/event";

export default defineEventHandler(async (event) => {
  assertColetaIntegrationSecret(event);
  const body = await readBody(event);

  if (
    typeof body !== "object" ||
    body === null ||
    typeof body.sourceCollectionRequestId !== "string" ||
    body.sourceCollectionRequestId.trim() === ""
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "sourceCollectionRequestId is required",
    });
  }

  const { event: hemoEvent, created } = await createEventFromCollection(
    body as CreateEventFromCollectionDTO,
  );
  setResponseStatus(event, created ? 201 : 200);

  return {
    ...hemoEvent,
  };
});
