import type { InferSchemaType } from "mongoose";
import { Schema, Types, model } from "mongoose";

const QueueParticipantSchema = new Schema(
  {
    queueId: Types.ObjectId,
    participant: {
      required: true,
      type: {
        phone: {
          type: String,
          required: true,
          validate: {
            validator: (v: string) => v.length === 14,
            message: "Invalid phone.",
          },
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
  if (
    this.participant.phone.startsWith("+55") &&
    this.participant.phone.length === 14
  )
    return next();

  this.participant.phone = this.participant.phone.replace(/\D/g, "");
  if (this.participant.phone.length === 11)
    this.participant.phone = `+55${this.participant.phone}`;

  next();
});

type QueueParticipantSchema = InferSchemaType<typeof QueueParticipantSchema>;

export const QueueParticipant = model<QueueParticipantSchema>(
  "QueueParticipant",
  QueueParticipantSchema,
);
