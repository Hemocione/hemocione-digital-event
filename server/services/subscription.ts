import { Subscription } from "../models/subscription";
import type { HemocioneUserAuthTokenData } from "./auth";
import { incrementEventScheduleOccupiedSlots } from "./event";
import { getCleanFullName } from "~/utils/getCleanFullName";

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
