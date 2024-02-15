import type { InferSchemaType } from "mongoose";
import { Schema, Types, model } from "mongoose";
import { getRandomString } from "~/utils/getRandomString";

const SubscriptionSchema = new Schema(
  {
    eventSlug: {
      type: String,
      required: true,
    },
    hemocioneId: {
      type: String,
      required: true,
      default: null,
    },
    name: {
      type: String,
      required: true,
      default: null,
    },
    email: {
      type: String,
      required: true,
      default: null,
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => v.length === 14,
        message: "Invalid phone.",
      },
    },
    code: {
      type: String,
      required: true,
      default: () => getRandomString(6),
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    schedule: {
      type: {
        _id: {
          type: Types.ObjectId,
          required: true,
        },
        startAt: {
          type: Date,
          required: true,
        },
        endAt: {
          type: Date,
          required: true,
        },
      },
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

SubscriptionSchema.index(
  { hemocioneId: 1, eventSlug: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
SubscriptionSchema.index({ code: 1, eventSlug: 1 }, { unique: true });

SubscriptionSchema.pre("validate", function (next) {
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

export type SubscriptionSchema = InferSchemaType<typeof SubscriptionSchema>;

export const Subscription = model<SubscriptionSchema>(
  "Subscription",
  SubscriptionSchema,
);
