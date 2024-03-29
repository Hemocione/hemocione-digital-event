import { callQueueParticipants } from "~/server/services/queueParticipants";

interface Body {
  participantIds: string[];
}

function validateBody(body: any): asserts body is Body {
  if (!Array.isArray(body.participantIds)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid body",
    });
  }
}

export default defineEventHandler(async (event) => {
  const queue = getRouterParam(event, "queueId");
  const eventSlug = getRouterParam(event, "eventSlug");
  const body = await readBody(event);
  validateBody(body);

  await callQueueParticipants(
    body.participantIds,
    String(queue),
    String(eventSlug),
  );
});
