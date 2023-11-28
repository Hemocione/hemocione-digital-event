import { createQueueParticipant } from "~/server/services/queueParticipants";

interface Body {
  phone: string;
  name: string;
  leadId?: string;
  uuid?: string;
  fbc?: string;
  fbp?: string;
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
  const eventSlug = String(getRouterParam(event, "eventSlug"));
  const body = await readBody(event);
  validateBody(body);

  const queueParticipant = await createQueueParticipant({
    participant: body,
    queueId,
    eventSlug,
  });

  setResponseStatus(event, 201);
  return queueParticipant;
});
