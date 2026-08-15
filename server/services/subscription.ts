import { Subscription } from "../models/subscription";
import type { HemocioneUserAuthTokenData } from "./auth";
import { getEventBySlug, incrementEventScheduleOccupiedSlots } from "./event";
import { pushEventParticipationFacts } from "./eventParticipationFacts";
import { runAsync } from "~/server/utils/runAsync";
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

/**
 * Lista paginada das inscricoes de um evento, para uso do backoffice.
 *
 * Separada de `getEventSubscriptions` de proposito: aquela e consumida pelo
 * cron que computa doacoes do evento e precisa do conjunto inteiro, sem
 * paginacao. Mudar a assinatura dela para atender aqui quebraria o cron.
 */
export async function listEventSubscriptions(
  eventSlug: string,
  options: { scheduleId?: string; take: number; skip: number },
) {
  const { scheduleId, take, skip } = options;
  const filter = {
    eventSlug,
    deletedAt: null,
    ...(scheduleId ? { "schedule._id": scheduleId } : {}),
  };

  // A contagem usa o mesmo filtro da pagina: quem opera o evento precisa saber
  // quantas inscricoes existem, nao so quantas vieram nesta pagina.
  const [total, items] = await Promise.all([
    Subscription.countDocuments(filter),
    Subscription.find(filter)
      .select({
        hemocioneId: 1,
        eventSlug: 1,
        name: 1,
        email: 1,
        phone: 1,
        document: 1,
        code: 1,
        schedule: 1,
        createdAt: 1,
      })
      .sort({ "schedule.startAt": 1, createdAt: 1 })
      .skip(skip)
      .limit(take)
      .lean(),
  ]);

  return { total, items };
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
    subscription.lastQuestionnairePreScreening = schedule.lastQuestionnairePreScreening;
  } else if (schedule.formResponseId && schedule.status) {
    subscription.lastQuestionnairePreScreening = {
      formResponseId: schedule.formResponseId,
      status: schedule.status,
      answeredAt: new Date(),
    };
  }

  const eventWithReservedSlot = await incrementEventScheduleOccupiedSlots(
    eventSlug,
    String(subscription.schedule._id),
    1,
  );

  if (!eventWithReservedSlot) {
    throw createError({
      statusCode: 400,
      statusMessage: "No available slots for this schedule",
    });
  }

  try {
    await subscription.save();
  } catch (error) {
    await incrementEventScheduleOccupiedSlots(
      eventSlug,
      String(subscription.schedule._id),
      -1,
    );
    throw error;
  }

  runAsync(pushEventParticipationFacts(subscription, user.id));

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
