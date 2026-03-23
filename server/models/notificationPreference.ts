import type { InferSchemaType } from "mongoose";
import { Schema, model } from "mongoose";

export type NotificationChannel = "push" | "whatsapp" | "email" | "sms";

const NotificationPreferenceSchema = new Schema(
  {
    hemocioneId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    channels: {
      push: {
        enabled: {
          type: Boolean,
          default: true,
        },
        token: {
          type: String,
          default: null,
        },
      },
      whatsapp: {
        enabled: {
          type: Boolean,
          default: true,
        },
        phone: {
          type: String,
          default: null,
        },
      },
      email: {
        enabled: {
          type: Boolean,
          default: true,
        },
        address: {
          type: String,
          default: null,
        },
      },
      sms: {
        enabled: {
          type: Boolean,
          default: true,
        },
        phone: {
          type: String,
          default: null,
        },
      },
    },
    eventReminderHours: {
      type: [Number],
      default: [24], // Default: 24 hours before
    },
  },
  {
    timestamps: true,
  },
);

export type NotificationPreferenceSchema = InferSchemaType<
  typeof NotificationPreferenceSchema
>;

export const NotificationPreference = model<NotificationPreferenceSchema>(
  "NotificationPreference",
  NotificationPreferenceSchema,
);
