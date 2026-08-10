import type { InferSchemaType } from "mongoose";
import { Schema, Types, model } from "mongoose";
import type { NotificationChannel } from "./notificationPreference";

const EventNotificationSchema = new Schema(
  {
    eventId: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },
    hemocioneId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["24h-reminder", "2h-reminder", "1h-reminder", "custom"],
      required: true,
    },
    channel: {
      type: String,
      enum: ["push", "whatsapp", "email", "sms"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "bounced"],
      default: "pending",
    },
    sentAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    messageContent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicate notifications
EventNotificationSchema.index(
  { eventId: 1, hemocioneId: 1, type: 1, channel: 1 },
  { unique: true },
);

export type EventNotificationSchema = InferSchemaType<
  typeof EventNotificationSchema
>;

export type EventNotificationType =
  | "24h-reminder"
  | "2h-reminder"
  | "1h-reminder"
  | "custom";

export const EventNotification = model<EventNotificationSchema>(
  "EventNotification",
  EventNotificationSchema,
);
