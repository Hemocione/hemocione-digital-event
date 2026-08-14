import type { HydratedDocument } from "mongoose";
import type { SubscriptionSchema } from "../models/subscription";
import { postFactToHemocioneId } from "./hemocioneIdFacts";

type SubscriptionDocument = HydratedDocument<SubscriptionSchema>;

export async function pushEventParticipationFacts(
  subscription: SubscriptionDocument,
  userId: string,
) {
  const occurredAt = subscription.createdAt
    ? subscription.createdAt.toISOString()
    : new Date().toISOString();

  await postFactToHemocioneId({
    userId,
    eventType: "event.attendance_confirmed",
    occurredAt,
    payload: { eventSlug: subscription.eventSlug },
    idempotencyKey: `hemocione-digital-event:event.attendance_confirmed:${subscription._id.toString()}`,
  });

  const screeningStatus = subscription.lastQuestionnairePreScreening?.status;

  if (screeningStatus === "able-to-donate") {
    await postFactToHemocioneId({
      userId,
      eventType: "donation_screening.able_to_donate",
      occurredAt,
      payload: { eventSlug: subscription.eventSlug },
      idempotencyKey: `hemocione-digital-event:donation_screening.able_to_donate:${subscription._id.toString()}`,
    });
  } else if (screeningStatus === "unable-to-donate") {
    await postFactToHemocioneId({
      userId,
      eventType: "donation_screening.unable_to_donate",
      occurredAt,
      payload: { eventSlug: subscription.eventSlug },
      idempotencyKey: `hemocione-digital-event:donation_screening.unable_to_donate:${subscription._id.toString()}`,
    });
  }
}
