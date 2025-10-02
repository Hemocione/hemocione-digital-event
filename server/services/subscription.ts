import { Subscription } from "../models/subscription";
import type { HemocioneUserAuthTokenData } from "./auth";
import { getEventBySlug, incrementEventScheduleOccupiedSlots } from "./event";
import { getCleanFullName } from "~/utils/getCleanFullName";

export async function getUserSubscriptions(hemocioneId: string) {
  return await Subscription.find({
    hemocioneId,
    deletedAt: null,
  })
    .select({
      eventSlug: 1,
      name: 1,
      email: 1,
      phone: 1,
      document: 1,
      schedule: 1,
    })
    .lean();
}

export function getEventSubscriptions(eventSlug: string) {
  return Subscription.find({
    eventSlug,
    deletedAt: null,
  })
    .select({
      hemocioneId: 1,
      eventSlug: 1,
      name: 1,
      email: 1,
      phone: 1,
      document: 1,
      schedule: 1,
    })
    .lean();
}

export async function getEventSubscriptionUserIds(eventSlug: string) {
  const subs = await Subscription.find({
    eventSlug,
    deletedAt: null,
  })
    .select({ hemocioneId: 1 })
    .lean();
  return subs.map((s) => s.hemocioneId).filter(Boolean) as string[];
}

export type UserSubscriptions = Awaited<
  ReturnType<typeof getUserSubscriptions>
>;

export async function getUserEventSubscription(
  eventSlug: string,
  hemocioneId: string,
) {
  const subscription = await Subscription.findOne({
    eventSlug,
    hemocioneId,
    deletedAt: null,
  });
  return subscription;
}

export async function getUserNextSubscription({
  hemocioneId,
}: {
  hemocioneId: string;
}) {
  const currentStartOfDay = new Date();
  currentStartOfDay.setHours(0, 0, 0, 0);
  const subscription = await Subscription.findOne({
    hemocioneId,
    deletedAt: null,
    "schedule.endAt": { $gte: currentStartOfDay },
  })
    .sort({ "schedule.endAt": 1 })
    .lean();
  if (!subscription) return null;

  const event = await getEventBySlug(subscription.eventSlug);
  if (!event) return null;

  return {
    subscription,
    event,
  };
}

export async function createSubscription(
  eventSlug: string,
  user: HemocioneUserAuthTokenData,
  schedule: {
    _id: string;
    startAt: Date;
    endAt: Date;
    formResponseId?: string;
    status?: "able-to-donate" | "unable-to-donate";
    lastQuestionnairePreScreening?: {
      formResponseId?: string;
      status?: "able-to-donate" | "unable-to-donate";
      answeredAt?: Date;
    };
  },
) {
  const subscription = new Subscription({
    eventSlug,
    hemocioneId: user.id,
    name: getCleanFullName(user.givenName, user.surName),
    email: user.email,
    phone: user.phone,
    document: user.document,
    schedule,
  });

  if (schedule.lastQuestionnairePreScreening) {
    const { formResponseId, status, answeredAt } = schedule.lastQuestionnairePreScreening;
    subscription.lastQuestionnairePreScreening = {
      formResponseId: formResponseId as any,
      status,
      answeredAt,
    } as any;
  } else if (schedule.formResponseId && schedule.status) {
    subscription.lastQuestionnairePreScreening = {
      formResponseId: schedule.formResponseId as any,
      status: schedule.status,
      answeredAt: new Date(),
    };
  }

  await subscription.save();
  await incrementEventScheduleOccupiedSlots(
    eventSlug,
    String(subscription.schedule._id),
    1,
  );

  return subscription.toObject();
}

export async function deleteSubscription(
  eventSlug: string,
  hemocioneId: string,
) {
  const subscription = await Subscription.findOne({
    eventSlug,
    hemocioneId,
    deletedAt: null,
  });
  if (!subscription) return null;
  subscription.deletedAt = new Date();

  // todo: wrap in transaction
  await subscription.save();
  await incrementEventScheduleOccupiedSlots(
    eventSlug,
    String(subscription.schedule._id),
    -1,
  );

  return subscription.toObject();
}

export function getSubscriptionsToSendUpcomingNotifications() {
  const now = new Date();
  
  // Get tomorrow's date range (00:00 to 23:59)
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Start of tomorrow
  
  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999); // End of tomorrow
  
  return Subscription.find({
    deletedAt: null,
    "schedule.startAt": { $gte: tomorrow, $lte: endOfTomorrow },
    notificationsUpcomingSentAt: null,
  })
    .select({
      _id: 1,
      eventSlug: 1,
      hemocioneId: 1,
      name: 1,
      email: 1,
      phone: 1,
      document: 1,
      schedule: 1,
    })
    .lean();
}

export async function markSubscriptionUpcomingNotificationAsSent(subscriptionId: string) {
  return await Subscription.findByIdAndUpdate(
    subscriptionId,
    { notificationsUpcomingSentAt: new Date() },
    { lean: true },
  );
}
