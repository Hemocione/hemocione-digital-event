import { callQueueParticipants } from "~/server/services/queueParticipants";

interface Body {
  participantIds: string[];
}

function validateBody(body: any): asserts body is Body {
  if (typeof body !== "object" || !Array.isArray(body.participantIds)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid body",
    });
  }
}

export default defineEventHandler(async (event) => {
  const queue = getRouterParam(event, "queueId");
  const body = await readBody(event);
  validateBody(body);

  await callQueueParticipants(body.participantIds, String(queue));
});
