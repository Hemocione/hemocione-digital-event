import type { Types } from "mongoose";
import { inngest } from "../inngest/client";
import { QueueParticipant } from "../models/queueParticipant";
import { upsertFBDataOnLead } from "./digitalStand";

export async function getParticipantPosition(queueId: string, participantId: string) {
  const queueParticipants = await QueueParticipant.find({
    queueId,
    calledAt: null,
  })
    .select({
      _id: 1,
      participant: 1,
      createdAt: 1,
    })
    .sort({
      createdAt: 1,
    })
    .lean();

  const position = queueParticipants
    .findIndex((queueParticipant) => queueParticipant.participant._id === participantId)

  return { position: position + 1 }
}

export async function getWaitingQueueParticipants(queueId: string) {
  return await QueueParticipant.find({
    queueId,
    calledAt: null,
  })
    .select({
      _id: 1,
      participant: 1,
      createdAt: 1,
    })
    .sort({
      createdAt: 1,
    })
    .lean();
}

export async function getCalledQueueParticipants(queueId: string) {
  return await QueueParticipant.find({
    queueId,
    calledAt: {
      $ne: null,
    },
  })
    .select({
      _id: 1,
      participant: 1,
      calledAt: 1,
      createdAt: 1,
    })
    .sort({
      calledAt: -1,
    })
    .lean();
}

export async function callQueueParticipants(
  participantIds: string[],
  queueId: string,
) {
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
}

interface CreateQueueParticipant {
  participant: {
    phone: string;
    name: string;
    leadId?: string;
    uuid?: string;
    fbc?: string;
    fbp?: string;
  };
  queueId: string;
  eventSlug: string;
}

export async function createQueueParticipant(data: CreateQueueParticipant) {
  const { participant, queueId, eventSlug } = data;

  const newParticipant = await QueueParticipant.create({
    participant,
    queueId,
  });

  try {
    const currentWaitingParticipants =
      await getWaitingQueueParticipants(queueId);
    const newParticipantPosition =
      currentWaitingParticipants.findIndex(
        (p) => String(p._id) === String(newParticipant._id),
      ) + 1;

    newParticipant.initialPosition = newParticipantPosition;
    await newParticipant.save();

    await inngest.send({
      name: "notify/participant.new",
      data: {
        _id: String(newParticipant._id),
        phone: newParticipant.participant.phone,
        name: newParticipant.participant.name,
        position: newParticipantPosition,
      },
    });
    if (participant.leadId && (participant.fbc || participant.fbp)) {
      const payload = {
        ...(participant.fbc ? { fbc: participant.fbc } : {}),
        ...(participant.fbp ? { fbp: participant.fbp } : {}),
      };
      await upsertFBDataOnLead(participant.leadId, eventSlug, payload);
    }
  } catch (error) {
    console.log("Failed to run optional flows on new participant");
    console.error(error);
  }

  return newParticipant;
}

export async function setNotifiedCloseToCall(_id: Types.ObjectId | string) {
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
}

export const MAX_CLOSE_TO_CALL = 3;

export async function getCalledAndCloseToCallParticipants(
  calledParticipantsIds: (Types.ObjectId | string)[],
  queueId: string,
  closeToCallToNotify: number = MAX_CLOSE_TO_CALL,
) {
  const toNotifySize = calledParticipantsIds.length + closeToCallToNotify;

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
}
