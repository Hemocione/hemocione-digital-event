/*
BODY: 
{
  "participant": {
    "phone": "+1234567890",
    "name": "John Doe",
    "leadId": "1234567890",
  },
  "queueId": "5f9b2b0b9b0b0b0b0b0b0b0b",
}
*/

import { QueueParticipant } from "~/server/models/queueParticipant";

interface Body {
  participant: {
    phone: string;
    name: string;
    leadId?: string;
  };
}

function validateBody(body: any): asserts body is Body {
  if (
    typeof body !== "object" ||
    typeof body.participant !== "object" ||
    !body.participant.phone ||
    !body.participant.name
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid body",
    });
  }
}
export default defineEventHandler(async (event) => {
  const queueId = getRouterParam(event, "queueId");
  const body = await readBody(event);
  validateBody(body);

  await QueueParticipant.create({
    participant: body.participant,
    queueId,
  });

  setResponseStatus(event, 201);
});
