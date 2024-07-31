import type { InferSchemaType } from "mongoose";
import { Schema, Types, model } from "mongoose";

const reviewStatuses = ["pending", "approved", "rejected"] as const;
type ReviewStatus = typeof reviewStatuses[number];

const reviewNegativeFeedbacks = ["no-show-whatsapp", "no-show-event", "bad-offline-communication", "bad-online-communication", "bad-attitude", "bad-appearance"] as const;
type ReviewNegativeFeedback = typeof reviewNegativeFeedbacks[number];

const reviewPositiveFeedbacks = ["proactivity", "good-offline-communication", "good-online-communication", "engagement", "ponctuality"] as const;
type ReviewPositiveFeedback = typeof reviewPositiveFeedbacks[number];

const ExternalVolunteerSchema = new Schema(
    {
        eventSlug: {
            type: String,
            required: true,
        },
        hemocioneId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        document: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        groupUrl: {
            type: {
                clickCount: {
                    type: Number,
                    required: true,
                    default: 0,
                },
                lastClickedAt: {
                    type: Date,
                    required: false,
                    default: null,
                },
            },
            required: false,
        },
        certificateUrl: {
            type: String,
            required: false,
        },
        review: {
            type: {
                status: {
                    type: String,
                    enum: reviewStatuses,
                    required: true,
                    default: "pending",
                },
                rating: {
                    type: Number,
                    min: 1,
                    max: 5,
                    required: false,
                },
                negativeFeedback: {
                    type: String,
                    enum: reviewNegativeFeedbacks,
                    required: false,
                },
                negativeFeedbackComment: {
                    type: String,
                    required: false,
                },
                positiveFeedback: {
                    type: String,
                    enum: reviewPositiveFeedbacks,
                    required: false,
                },
                positiveFeedbackComment: {
                    type: String,
                    required: false,
                },
                reviewedAt: {
                    type: Date,
                    required: false,
                },
                reviewedBy: {
                    hemocioneId: {
                        type: String,
                        required: false,
                    },
                    name: {
                        type: String,
                        required: false,
                    },
                    email: {
                        type: String,
                        required: false,
                    },
                },
                numberOfHours: {
                    type: Number,
                    required: false,
                },
            },
            required: false,
        },
    },
    {
        timestamps: true,
    },
);

ExternalVolunteerSchema.index(
    { hemocioneId: 1, eventSlug: 1 },
    { unique: true, partialFilterExpression: { deletedAt: null } },
);

export type ExternalVolunteerSchema = InferSchemaType<typeof ExternalVolunteerSchema>;

export const ExternalVolunteer = model<ExternalVolunteerSchema>(
    "ExternalVolunteer",
    ExternalVolunteerSchema,
);
