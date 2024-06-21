import { inngest } from "~/server/inngest/client";
import { getEventBySlug, markDonationsAsSent } from "~/server/services/event";
import { getEventSubscriptions } from "~/server/services/subscription";
import { getQueueParticipants } from "~/server/services/queueParticipants";
import type { Donation } from "~/server/services/hemocioneId";
import { sendMessagesInChunks } from "~/server/services/donationQueueService";
const config = useRuntimeConfig();

export interface ComputeEventDonations {
  data: {
    _id: string;
    slug: string;
  };
}

export const eventName = "sync/compute-event-donations";
interface UserDonation {
  user: {
    hemocioneId?: string | null;
    phone?: string | null;
  };
  donation: Donation;
}

export default inngest.createFunction(
  {
    name: "Compute Event Donations",
    id: "compute-event-donations",
    concurrency: 1, // compute one event at a time
  },
  {
    event: eventName,
  },
  async ({ event }) => {
    const { data } = event;
    const { slug } = data;
    const foundEvent = await getEventBySlug(slug);
    if (!foundEvent) {
      return;
    }
    type QueueParticipants = Awaited<ReturnType<typeof getQueueParticipants>>;

    const [eventSubscriptions, queueParticipants] = await Promise.all([
      getEventSubscriptions(slug),
      foundEvent?.queue?._id
        ? getQueueParticipants(String(foundEvent?.queue?._id))
        : new Promise<QueueParticipants>((resolve) => resolve([])),
    ]);

    const queueDonations: UserDonation[] = queueParticipants.map(
      (queueParticipant) => {
        const donationDate = queueParticipant.calledAt
          ? new Date(queueParticipant.calledAt.getTime() + 30 * 60 * 1000)
          : foundEvent.endAt;
        return {
          user: {
            hemocioneId: queueParticipant.participant.hemocioneId,
            phone: queueParticipant.participant.phone,
          },
          donation: {
            donationProviderDonationId: `${slug}|${queueParticipant.participant.hemocioneId || queueParticipant.participant.phone}`,
            label: foundEvent.name,
            needsReview: true,
            donationDate,
            metadata: {},
          },
        };
      },
    );

    const subscriptionDonations: UserDonation[] = eventSubscriptions.map(
      (subscription) => {
        return {
          user: {
            hemocioneId: subscription.hemocioneId,
            phone: subscription.phone,
          },
          donation: {
            donationProviderDonationId: `${subscription.eventSlug}|${subscription.hemocioneId}`,
            label: subscription.name,
            needsReview: true,
            donationDate: subscription.schedule.endAt,
            metadata: {},
          },
        };
      },
    );

    const queueDonationsWithoutSubscriptions: UserDonation[] = [];
    for (const queueDonation of queueDonations) {
      const matchingSubscription = subscriptionDonations.find(
        (subscriptionDonation) =>
          subscriptionDonation.user.hemocioneId ===
            queueDonation.user.hemocioneId ||
          subscriptionDonation.user.phone === queueDonation.user.phone,
      );

      if (!matchingSubscription) {
        queueDonationsWithoutSubscriptions.push(queueDonation); // add to the list of donations without subscriptions
      }
    }

    const donations = subscriptionDonations
      .concat(queueDonationsWithoutSubscriptions)
      .map((userDonation) => ({
        secret: config.hemocioneIdIntegrationSecret,
        user: {
          ...(userDonation.user.hemocioneId
            ? { hemocioneId: userDonation.user.hemocioneId }
            : { phone: userDonation.user.phone }),
        },
        donation: userDonation.donation,
      }));
    await sendMessagesInChunks(donations);
    await markDonationsAsSent(slug);
  },
);
