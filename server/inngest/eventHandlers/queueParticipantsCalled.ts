import { inngest } from "~/server/inngest/client";
import { QueueParticipant } from "~/server/models/queueParticipant";

export type QueueParticipantsCalledEvent = {
  data: {
    participantIds: string[];
    queueId: string;
  };
};

export const eventName = "event/participants.called";

const CLOSE_TO_CALL_NUMBER = 3;

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
    const toNotifySize = participantIds.length + CLOSE_TO_CALL_NUMBER;

    const participants = await QueueParticipant.find({
      where: {
        $or: [
          {
            _id: {
              $in: participantIds,
            },
          },
          {
            queueId,
            calledAt: null,
          },
        ],
      },
    })
      .select({
        _id: 1,
        participant: 1,
        notifiedCloseToCallAt: 1,
      })
      .sort({
        createdAt: 1,
      })
      .limit(toNotifySize)
      .lean();

    const calledParticipants = participants.filter((p) =>
      participantIds.includes(String(p._id)),
    );

    const closeToCallParticipants = participants.filter(
      (p) =>
        !participantIds.includes(String(p._id)) && !p.notifiedCloseToCallAt,
    );

    console.log("calledParticipants", calledParticipants);
    console.log("closeToCallParticipants", closeToCallParticipants);
    // TODO: RUN JOBS THAT SEND SMS TO PARTICIPANTS
  },
);
