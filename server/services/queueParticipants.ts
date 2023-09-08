import { Types } from "mongoose";
import { inngest } from "../inngest/client";
import { QueueParticipant } from "../models/queueParticipant";

export const callQueueParticipants = async (
  participantIds: string[],
  queueId: string,
) => {
  await QueueParticipant.updateMany(
    {
      _id: {
        $in: participantIds,
      },
    },
    {
      $set: {
        calledAt: new Date(),
      },
    },
  );

  await inngest.send({
    name: "event/participants.called",
    data: {
      participantIds,
      queueId,
    },
  });
};

interface CreateQueueParticipant {
  participant: {
    phone: string;
    name: string;
    leadId?: string;
  };
  queueId: string;
}

export const createQueueParticipant = async (data: CreateQueueParticipant) => {
  const { participant, queueId } = data;

  return await QueueParticipant.create({
    participant,
    queueId,
  });
};

export const setNotifiedCloseToCall = async (_id: Types.ObjectId | String) => {
  await QueueParticipant.updateOne(
    {
      _id,
    },
    {
      $set: {
        notifiedCloseToCallAt: new Date(),
      },
    },
  );
};

export const getCalledAndCloseToCallParticipants = async (
  calledParticipantsIds: (Types.ObjectId | String)[],
  queueId: string,
  closedToCallToNotify: number = 3,
) => {
  const toNotifySize = calledParticipantsIds.length + closedToCallToNotify;

  const participants = await QueueParticipant.find({
    $or: [
      {
        _id: {
          $in: calledParticipantsIds,
        },
      },
      {
        queueId,
        calledAt: null,
      },
    ],
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

  let calledParticipants = participants.filter((p) =>
    calledParticipantsIds.includes(String(p._id)),
  );

  if (calledParticipants.length !== calledParticipantsIds.length) {
    const missingParticipantIds = calledParticipantsIds.filter(
      (id) => !calledParticipants.find((p) => String(p._id) === String(id)),
    );

    if (missingParticipantIds.length > 0) {
      const missingParticipants = await QueueParticipant.find({
        _id: {
          $in: missingParticipantIds,
        },
      })
        .select({
          _id: 1,
          participant: 1,
          notifiedCloseToCallAt: 1,
        })
        .lean();

      calledParticipants = calledParticipants.concat(missingParticipants);
    }
  }

  const closeToCallParticipants = participants.filter(
    (p) =>
      !calledParticipantsIds.includes(String(p._id)) &&
      !p.notifiedCloseToCallAt,
  );

  return {
    calledParticipants,
    closeToCallParticipants,
  };
};
