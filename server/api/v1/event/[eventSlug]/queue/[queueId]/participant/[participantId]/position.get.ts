import { getParticipantPosition } from "~/server/services/queueParticipants";

export default defineEventHandler(async (event) => {
  const queueId = String(getRouterParam(event, "queueId"));
  const participantId = String(getRouterParam(event, "participantId"));
  return await getParticipantPosition(queueId, participantId);
});

