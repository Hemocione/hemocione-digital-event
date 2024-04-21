import { getCalledQueueParticipantsByQueueId } from "~/server/services/queueParticipants";

export default defineEventHandler(async (event) => {
  const queueId = String(getRouterParam(event, "queueId"));
  return await getCalledQueueParticipantsByQueueId(queueId);
});
