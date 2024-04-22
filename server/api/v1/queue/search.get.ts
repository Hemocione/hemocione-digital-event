import { getQueueParticipationsByIds } from "~/server/services/queueParticipants";

export default defineEventHandler(async (event) => {
  const { queueParticipationIds } = getQuery(event) as {
    queueParticipationIds: string[];
  };

  const queueParticipation = await getQueueParticipationsByIds(queueParticipationIds ?? []);
  return queueParticipation
});
