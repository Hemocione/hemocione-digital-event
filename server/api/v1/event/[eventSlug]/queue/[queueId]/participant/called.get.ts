import { getCalledQueueParticipants } from "~/server/services/queueParticipants";

export default defineEventHandler(async (event) => {
  const queueId = String(getRouterParam(event, "queueId"));
  return await getCalledQueueParticipants(queueId);
});
