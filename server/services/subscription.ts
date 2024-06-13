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
  }).lean();
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
  schedule: { _id: string; startAt: Date; endAt: Date },
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

  // todo: wrap in transaction
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
