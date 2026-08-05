import { postFactToHemocioneId } from "./hemocioneIdFacts";
import { QueueParticipant } from "~/server/models/queueParticipant";

export async function pushAttendanceConfirmedFacts(
  participantIds: string[],
  queueId: string,
) {
  const calledParticipants = await QueueParticipant.find({
    _id: { $in: participantIds },
  });

  for (const participant of calledParticipants) {
    const hemocioneId = participant.participant.hemocioneId;
    if (!hemocioneId || !participant.calledAt) continue;

    await postFactToHemocioneId({
      userId: hemocioneId,
      eventType: "event.attendance_confirmed",
      occurredAt: participant.calledAt.toISOString(),
      payload: { queueId },
      idempotencyKey: `hemocione-digital-event:event.attendance_confirmed:${participant._id.toString()}`,
    });
  }
}
