import { inngest } from "~/server/inngest/client";
import { QueueParticipant } from "~/server/models/queueParticipant";
import { getCalledAndCloseToCallParticipants } from "~/server/services/queueParticipants";

export type QueueParticipantsCalledEvent = {
  data: {
    participantIds: string[];
    queueId: string;
  };
};

export const eventName = "event/participants.called";

export default inngest.createFunction(
  {
    name: "Participants Called Handler",
  },
  {
    event: eventName,
  },
  async ({ event }) => {
    const { data } = event;
    const { participantIds, queueId } = data;
    const { calledParticipants, closeToCallParticipants } =
      await getCalledAndCloseToCallParticipants(participantIds, queueId);

    const calledParticipantsJobs = calledParticipants.map((p) =>
      inngest.send({
        name: "notify/participant.called",
        data: {
          _id: String(p._id),
          phone: p.participant.phone,
          name: p.participant.name,
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
