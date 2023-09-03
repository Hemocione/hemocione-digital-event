import { Schema, model, InferSchemaType, Types } from "mongoose";

const QueueParticipantSchema = new Schema(
  {
    queueId: Types.ObjectId,
    participant: {
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
    },
    calledAt: {
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

type QueueParticipantSchema = InferSchemaType<typeof QueueParticipantSchema>;

export const QueueParticipant = model<QueueParticipantSchema>(
  "QueueParticipant",
  QueueParticipantSchema,
);
