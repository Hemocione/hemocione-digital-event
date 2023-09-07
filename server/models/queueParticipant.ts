import { Schema, model, InferSchemaType, Types } from "mongoose";

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
QueueParticipantSchema.pre("save", function (next) {
  this.participant.phone = this.participant.phone.replace(/\D/g, "");
  // include +55 at start if no international code is present
  if (this.participant.phone.length === 11) {
    this.participant.phone = `+55${this.participant.phone}`;
  }

  if (this.participant.phone.length !== 13) {
    throw new Error("Invalid phone number");
  }

  next();
});

type QueueParticipantSchema = InferSchemaType<typeof QueueParticipantSchema>;

export const QueueParticipant = model<QueueParticipantSchema>(
  "QueueParticipant",
  QueueParticipantSchema,
);
