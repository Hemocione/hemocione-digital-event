import { inngest } from "~/server/inngest/client";
import { assertColetaIntegrationSecret } from "~/server/services/auth";
import {
  type CollectionEventSchedule,
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

  const { schedule, ...eventData } = body as CreateEventFromCollectionDTO & {
    schedule?: CollectionEventSchedule;
  };
  const { event: hemoEvent, created } =
    await createEventFromCollection(eventData);
  setResponseStatus(event, created ? 201 : 200);

  if (schedule) {
    await inngest.send({
      name: "collection-request/event.created",
      data: {
        eventSlug: hemoEvent.slug,
        schedule,
        enableSubscription: true,
      },
    });
  }

  return {
    ...hemoEvent,
  };
});
