import { Subscription } from "~/server/models/subscription";

type Fact = {
  userId: string;
  eventType: string;
  occurredAt: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
};

export const getReconciliationFactsSince = async (
  since: Date,
): Promise<Fact[]> => {
  const subscriptions = await Subscription.find({
    createdAt: { $gte: since },
    hemocioneId: { $ne: null },
  });

  const facts: Fact[] = [];

  for (const subscription of subscriptions) {
    const occurredAt = subscription.createdAt.toISOString();

    facts.push({
      userId: subscription.hemocioneId as string,
      eventType: "event.attendance_confirmed",
      occurredAt,
      payload: { eventSlug: subscription.eventSlug },
      idempotencyKey: `hemocione-digital-event:event.attendance_confirmed:${subscription._id.toString()}`,
    });

    const screeningStatus = subscription.lastQuestionnairePreScreening?.status;

    if (screeningStatus === "able-to-donate") {
      facts.push({
        userId: subscription.hemocioneId as string,
        eventType: "donation_screening.able_to_donate",
        occurredAt,
        payload: { eventSlug: subscription.eventSlug },
        idempotencyKey: `hemocione-digital-event:donation_screening.able_to_donate:${subscription._id.toString()}`,
      });
    } else if (screeningStatus === "unable-to-donate") {
      facts.push({
        userId: subscription.hemocioneId as string,
        eventType: "donation_screening.unable_to_donate",
        occurredAt,
        payload: { eventSlug: subscription.eventSlug },
        idempotencyKey: `hemocione-digital-event:donation_screening.unable_to_donate:${subscription._id.toString()}`,
      });
    }
  }

  return facts;
};
