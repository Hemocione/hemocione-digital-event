import { createError } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findOneAndUpdate,
  pushEventParticipationFacts,
  runAsync,
  Subscription,
} = vi.hoisted(() => ({
  findOneAndUpdate: vi.fn(),
  pushEventParticipationFacts: vi.fn(),
  runAsync: vi.fn(),
  Subscription: vi.fn(),
}));

vi.mock("../server/models/event", () => ({
  Event: { findOneAndUpdate },
}));

vi.mock("../server/models/subscription", () => ({
  Subscription,
}));

vi.mock("../server/services/eventParticipationFacts", () => ({
  pushEventParticipationFacts,
}));

vi.mock("../server/utils/runAsync", () => ({
  runAsync,
}));

const { createSubscription } = await import("../server/services/subscription");

const nuxtGlobals = globalThis as typeof globalThis & {
  createError: typeof createError;
};
nuxtGlobals.createError = createError;

const user = {
  id: "user-id",
  givenName: "Maria",
  surName: "Silva",
  bloodType: "O+" as const,
  email: "maria@example.com",
  phone: "5511999999999",
  document: "12345678900",
  gender: "F" as const,
};

const schedule = {
  _id: "schedule-id",
  startAt: new Date("2026-08-15T10:00:00.000Z"),
  endAt: new Date("2026-08-15T11:00:00.000Z"),
};

let occupiedSlots = 0;
let savedSubscriptions: Record<string, unknown>[];

beforeEach(() => {
  occupiedSlots = 0;
  savedSubscriptions = [];
  findOneAndUpdate.mockReset();
  pushEventParticipationFacts.mockReset();
  runAsync.mockReset();
  Subscription.mockReset();

  Subscription.mockImplementation((data: Record<string, unknown>) => {
    const subscription = {
      ...data,
      _id: { toString: () => `subscription-${savedSubscriptions.length + 1}` },
      createdAt: new Date(),
      save: vi.fn().mockImplementation(() => {
        savedSubscriptions.push(subscription);
        return Promise.resolve();
      }),
      toObject: vi.fn(() => subscription),
    };
    return subscription;
  });

  findOneAndUpdate.mockImplementation(
    async (query: Record<string, unknown>, update: Record<string, unknown>) => {
      await Promise.resolve();

      // This models MongoDB's conditional atomic update: only a query with an
      // availability condition can reserve the last slot.
      if ("$expr" in query && occupiedSlots >= 1) {
        return null;
      }

      const increment = (update.$inc as Record<string, number>)[
        "subscription.schedules.$.occupiedSlots"
      ];
      occupiedSlots += increment;
      return { slug: "event-slug" };
    },
  );
});

describe("createSubscription", () => {
  it("não cria duas subscriptions para a última vaga em chamadas concorrentes", async () => {
    const results = await Promise.allSettled([
      createSubscription("event-slug", user, schedule),
      createSubscription("event-slug", user, schedule),
    ]);

    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(
      1,
    );
    const rejectedResults = results.filter(
      ({ status }) => status === "rejected",
    );
    expect(rejectedResults).toHaveLength(1);
    expect(rejectedResults[0]).toMatchObject({
      reason: { statusCode: 400 },
    });
    expect(occupiedSlots).toBe(1);
    expect(savedSubscriptions).toHaveLength(1);
  });

  it("devolve a vaga quando salvar a subscription falha", async () => {
    const saveError = new Error("subscription save failed");
    Subscription.mockImplementationOnce((data: Record<string, unknown>) => ({
      ...data,
      _id: { toString: () => "subscription-1" },
      createdAt: new Date(),
      save: vi.fn().mockRejectedValue(saveError),
      toObject: vi.fn(),
    }));

    await expect(createSubscription("event-slug", user, schedule)).rejects.toBe(
      saveError,
    );

    expect(occupiedSlots).toBe(0);
    expect(findOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(findOneAndUpdate.mock.calls[1][1]).toEqual({
      $inc: { "subscription.schedules.$.occupiedSlots": -1 },
    });
  });
});
