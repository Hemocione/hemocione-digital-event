import type { UserQueueParticipations } from "./queueParticipants";
import type { UserSubscriptions } from "./subscription";
import { getEventsForSync } from "./event";

export interface Donation {
  donationProviderDonationId: string;
  label: string;
  needsReview: Boolean; // indicates if the donation needs to be reviewed by Hemocione
  donationDate: Date;
  metadata?: Record<string, any> | null; // additional metadata for the donation. Needs to be a JSON object
}

export async function getUserDonations(data: {
  subscriptions: UserSubscriptions;
  queueParticipations: UserQueueParticipations;
  user: {
    hemocioneId: string;
    phone: string;
    email: string;
    document: string;
  };
}): Promise<Donation[]> {
  const { subscriptions, queueParticipations, user } = data;
  const queueIds = queueParticipations.map((queueParticipation) =>
    String(queueParticipation.queueId),
  );
  const subscriptionEventSlugs = subscriptions.map((sub) => sub.eventSlug);
  const events = await getEventsForSync({
    queueIds,
    eventSlugs: subscriptionEventSlugs,
  });
  // TODO: add metadata for each
  return events.map(
    (event) =>
      ({
        donationProviderDonationId: `${event.slug}|${user.hemocioneId}`,
        label: event.name,
        needsReview: true, // all donations needReview by default for events
        donationDate: event.endAt,
      }) as const,
  );
}
