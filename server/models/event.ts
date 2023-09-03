import { Schema, model, InferSchemaType, Types } from "mongoose";

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
    communityId: {
      type: String,
      required: false,
    },
    queue: {
      _id: {
        type: Types.ObjectId,
        default: () => new Types.ObjectId(),
      },
    },
  },
  {
    timestamps: true,
  },
);

type EventSchema = InferSchemaType<typeof EventSchema>;

export const Event = model<EventSchema>("Event", EventSchema);
