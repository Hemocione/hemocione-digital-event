import type { InferSchemaType } from "mongoose";
import { Schema, Types, model } from "mongoose";
import { getRandomString } from "~/utils/getRandomString";
import { completePhone } from "~/utils/completePhone";

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
    },
    document: {
      type: String,
      required: false,
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
    lastQuestionnairePreScreening: { 
      type: {
        formResponseId: {
          type: Types.ObjectId,
          ref: "FormResponse",
          required: false,
        },
        status: {
          type: String,
          enum: ["able-to-donate", "unable-to-donate", "ongoing"],
          required: false,
        },
        answeredAt: {
          type: Date, 
          required: false, 
        }
      },
      required: false,
      default: null,
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
SubscriptionSchema.index(
  { hemocioneId: 1, "schedule.endAt": 1 },
  { partialFilterExpression: { deletedAt: null } },
);

SubscriptionSchema.pre("validate", function (next) {
  this.phone = completePhone(this.phone);
  next();
});

// sync indexes
SubscriptionSchema.index(
  { hemocioneId: 1 },
  { partialFilterExpression: { deletedAt: null } },
);

export type SubscriptionSchema = InferSchemaType<typeof SubscriptionSchema>;

export const Subscription = model<SubscriptionSchema>(
  "Subscription",
  SubscriptionSchema,
);
