import { QueueParticipant } from "~/server/models/queueParticipant";

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
  const body = await readBody(event);
  validateBody(body);

  await QueueParticipant.updateMany(
    {
      _id: {
        $in: body.participantIds,
      },
    },
    {
      $set: {
        calledAt: new Date(),
      },
    },
  );

  // TODO: SEND JOB TO INNGEST
});
