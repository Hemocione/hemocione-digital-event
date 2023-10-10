import { assertSecretAuth } from "~/server/services/auth";
import { UpdateEventDTO, updateEventBySlug } from "~/server/services/event";

function assertUpdateEventDTO(body: unknown): asserts body is UpdateEventDTO {
  if (typeof body !== "object" || body === null) {
    throw createError({ statusCode: 422, statusMessage: "Invalid body" });
  }

  if ("name" in body && typeof body.name !== "string") {
    throw createError({ statusCode: 422, statusMessage: "Invalid name" });
  }

  if ("startAt" in body && typeof body.startAt !== "string") {
    throw createError({ statusCode: 422, statusMessage: "Invalid startAt" });
  }

  if ("endAt" in body && typeof body.endAt !== "string") {
    throw createError({ statusCode: 422, statusMessage: "Invalid endAt" });
  }

  if ("logo" in body && typeof body.logo !== "string") {
    throw createError({ statusCode: 422, statusMessage: "Invalid logo" });
  }

  if ("queue" in body) {
    if (typeof body.queue !== "object" || body.queue === null) {
      throw createError({ statusCode: 422, statusMessage: "Invalid queue" });
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
  assertUpdateEventDTO(body);

  const eventSlug = String(getRouterParam(event, "eventSlug"));
  const updatedEvent = await updateEventBySlug(eventSlug, body);

  if (!updatedEvent) {
    return;
  }

  return {
    ...updatedEvent,
  };
});
