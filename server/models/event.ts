import type { InferSchemaType } from "mongoose";
import { Schema, Types, model } from "mongoose";

const EventSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
      default: null,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    logo: {
      type: String,
      required: false,
      default: null,
    },
    banner: {
      type: String,
      required: false,
      default: null,
    },
    queue: {
      _id: {
        type: Types.ObjectId,
        default: () => new Types.ObjectId(),
        unique: true,
      },
      participantsMax: {
        type: Number,
        required: false,
        default: null,
      },
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    startAt: {
      type: Date,
      required: false,
      default: null,
    },
    endAt: {
      type: Date,
      required: false,
      default: null,
    },
    description: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type EventSchema = InferSchemaType<typeof EventSchema>;

export const Event = model<EventSchema>("Event", EventSchema);
