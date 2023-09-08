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
    queue: {
      _id: {
        type: Types.ObjectId,
        default: () => new Types.ObjectId(),
        unique: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

type EventSchema = InferSchemaType<typeof EventSchema>;

export const Event = model<EventSchema>("Event", EventSchema);
