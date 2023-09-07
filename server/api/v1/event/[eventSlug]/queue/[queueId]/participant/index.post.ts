import {
  callLonelyParticipantIfNeeded,
  createQueueParticipant,
} from "~/server/services/queueParticipants";

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
  const queueId = String(getRouterParam(event, "queueId"));
  const body = await readBody(event);
  validateBody(body);

  const queueParticipant = await createQueueParticipant({
    participant: body.participant,
    queueId,
  });

  try {
    await callLonelyParticipantIfNeeded(queueId, queueParticipant._id);
  } catch (error) {
    console.error(error);
  }

  setResponseStatus(event, 201);
});
