import type { InferSchemaType } from "mongoose";
import { Schema, Types, model } from "mongoose";

const EventSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
        default: 140,
      },
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    location: {
      type: {
        address: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
      },
      required: false,
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
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

EventSchema.index({ endAt: -1 });

export type EventSchema = InferSchemaType<typeof EventSchema>;

export const Event = model<EventSchema>("Event", EventSchema);
