import { assertSecretAuth } from "~/server/services/auth";
import { createEvent } from "~/server/services/event";
import type { CreateEventDTO } from "~/server/services/event";

function assertCreateEventDTO(body: any): asserts body is CreateEventDTO {
  if (typeof body !== "object" || body === null) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid body",
    });
  }

  if (typeof body.name !== "string") {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid name",
    });
  }

  if (typeof body.startAt !== "string") {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid startAt",
    });
  }

  if (typeof body.endAt !== "string") {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid endAt",
    });
  }

  if ("logo" in body && typeof body.logo !== "string") {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid logo",
    });
  }

  if ("banner" in body && typeof body.banner !== "string") {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid banner",
    });
  }

  if ("queue" in body) {
    if (typeof body.queue !== "object" || body.queue === null) {
      throw createError({
        statusCode: 422,
        statusMessage: "Invalid queue",
      });
    }

    if (
      "participantsMax" in body.queue &&
      typeof body.queue.participantsMax !== "number"
    ) {
      throw createError({
        statusCode: 422,
        statusMessage: "Invalid queue.participantsMax",
      });
    }
  }
}

export default defineEventHandler(async (event) => {
  assertSecretAuth(event);
  const body = await readBody(event);
  assertCreateEventDTO(body);
  const createdEvent = await createEvent(body);

  return {
    ...createdEvent,
  };
});
