import type { InferSchemaType } from "mongoose";
import { Schema, Types, model } from "mongoose";
import { completePhone } from "~/utils/completePhone";

const QueueParticipantSchema = new Schema(
  {
    queueId: Types.ObjectId,
    participant: {
      required: true,
      type: {
        phone: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        leadId: {
          type: String,
          required: false,
        },
        uuid: {
          type: String,
          required: false,
        },
        fbc: {
          type: String,
          required: false,
        },
        fbp: {
          type: String,
          required: false,
        },
        hemocioneId: {
          type: String,
          required: false,
        },
      },
    },
    initialPosition: {
      type: Number,
      required: false,
      default: null,
    },
    calledAt: {
      type: Date,
      required: false,
      default: null,
    },
    notifiedCloseToCallAt: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

QueueParticipantSchema.index({ queueId: -1, calledAt: 1, createdAt: 1 });
QueueParticipantSchema.index(
  { queueId: 1, "participant.phone": 1 },
  { unique: true },
);

QueueParticipantSchema.pre("validate", function (next) {
  this.participant.phone = completePhone(this.participant.phone);
  next();
});

type QueueParticipantSchema = InferSchemaType<typeof QueueParticipantSchema>;

export const QueueParticipant = model<QueueParticipantSchema>(
  "QueueParticipant",
  QueueParticipantSchema,
);
