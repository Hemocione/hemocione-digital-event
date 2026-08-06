import { QueueParticipant } from "~/server/models/queueParticipant";

type Fact = {
  userId: string;
  eventType: string;
  occurredAt: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
};

export const getReconciliationFactsSince = async (
  since: Date,
): Promise<Fact[]> => {
  const calledParticipants = await QueueParticipant.find({
    calledAt: { $ne: null, $gte: since },
    "participant.hemocioneId": { $ne: null },
  });

  return calledParticipants.map((participant) => ({
    userId: participant.participant.hemocioneId as string,
    eventType: "event.attendance_confirmed",
    occurredAt: (participant.calledAt as Date).toISOString(),
    payload: { queueId: participant.queueId.toString() },
    idempotencyKey: `hemocione-digital-event:event.attendance_confirmed:${participant._id.toString()}`,
  }));
};
