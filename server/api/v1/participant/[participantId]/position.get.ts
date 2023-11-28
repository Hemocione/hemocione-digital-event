import { getParticipantPosition } from "~/server/services/queueParticipants";

export default defineEventHandler(async (event) => {
  const participantId = String(getRouterParam(event, "participantId"));
  return await getParticipantPosition(participantId);
});
