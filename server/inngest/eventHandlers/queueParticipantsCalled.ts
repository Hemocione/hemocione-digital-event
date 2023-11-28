import { inngest } from "~/server/inngest/client";
import { getCalledAndCloseToCallParticipants } from "~/server/services/queueParticipants";

export interface QueueParticipantsCalledEvent {
  data: {
    participantIds: string[];
    queueId: string;
    eventSlug: string;
  };
}

export const eventName = "event/participants.called";

export default inngest.createFunction(
  {
    name: "Participants Called Handler",
    id: "participants-called-handler",
  },
  {
    event: eventName,
  },
  async ({ event }) => {
    const { data } = event;
    const { participantIds, queueId, eventSlug } = data;
    const { calledParticipants, closeToCallParticipants } =
      await getCalledAndCloseToCallParticipants(participantIds, queueId);

    const calledParticipantsJobs = calledParticipants.map((p) =>
      inngest.send({
        name: "notify/participant.called",
        data: {
          _id: String(p._id),
          phone: p.participant.phone,
          name: p.participant.name,
          leadId: p.participant.leadId,
          uuid: p.participant.uuid,
        },
      }),
    );

    const closeToCallParticipantsJobs = closeToCallParticipants.map((p) =>
      inngest.send({
        name: "notify/participant.closeToCall",
        data: {
          _id: String(p._id),
          phone: p.participant.phone,
          name: p.participant.name,
          queueId,
          eventSlug
        },
      }),
    );

    const jobs = calledParticipantsJobs.concat(closeToCallParticipantsJobs);
    const results = await Promise.allSettled(jobs);
    const failedResults = results.filter((r) => r.status === "rejected");

    if (failedResults.length > 0) {
      throw new Error(
        `Failed to send ${failedResults.length} SMS messages: ${JSON.stringify(
          failedResults,
        )}`,
      );
    }
  },
);
