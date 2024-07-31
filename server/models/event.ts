import type { InferSchemaType } from "mongoose";
import { Schema, Types, model } from "mongoose";

const EventSchema = new Schema(
  {
    externalVolunteers: {
      enabled: {
        type: Boolean,
        default: false
      },
      groupUrl: {
        type: String,
        default: null
      },
      slots: {
        type: Number,
        default: 0,
      },
      occupiedSlots: {
        type: Number,
        default: 0,
      },
      htmlExplanationText: {
        type: String,
        default: null,
      },
    },
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
    private: {
      type: Boolean,
      default: false,
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
      disabled: {
        type: Boolean,
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
    registerDonationUrl: {
      type: String,
      required: false,
      default: null,
    },
    registerDonationDateLimit: {
      type: Date,
      required: false,
      default: null,
    },
    subscription: {
      enabled: {
        type: Boolean,
        required: true,
        default: false,
      },
      schedules: {
        type: [
          {
            _id: {
              type: Types.ObjectId,
              default: () => new Types.ObjectId(),
              unique: true,
            },
            startAt: {
              type: Date,
              required: true,
            },
            endAt: {
              type: Date,
              required: true,
            },
            slots: {
              type: Number,
              required: true,
              default: 30,
            },
            occupiedSlots: {
              type: Number,
              required: true,
              default: 0,
            },
          },
        ],
        default: [],
      },
    },
    donationsSentAt: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

EventSchema.index({ active: 1, private: 1, startAt: 1, endAt: 1, _id: 1 });

// Indexes for sync
EventSchema.index(
  { "queue._id": 1 },
  { partialFilterExpression: { active: true, registerDonationUrl: null } },
);
EventSchema.index(
  { slug: 1 },
  { partialFilterExpression: { active: true, registerDonationUrl: null } },
);
EventSchema.index(
  { donationsSentAt: 1, endAt: 1 },
  { partialFilterExpression: { active: true, registerDonationUrl: null } },
);

export type EventSchema = InferSchemaType<typeof EventSchema>;

export const Event = model<EventSchema>("Event", EventSchema);
