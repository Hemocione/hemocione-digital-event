import { createQueueParticipant } from "~/server/services/queueParticipants";

interface Body {
  phone: string;
  name: string;
  leadId?: string;
  uuid?: string;
}

function validateBody(body: any): asserts body is Body {
  if (!body.phone || !body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid body",
    });
  }
}

export default defineEventHandler(async (event) => {
  const queueId = String(getRouterParam(event, "queueId"));
  const body = await readBody(event);
  validateBody(body);

  await createQueueParticipant({
    participant: body,
    queueId,
  });

  setResponseStatus(event, 201);
});
