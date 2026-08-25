import { createError } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findOne } = vi.hoisted(() => ({
  findOne: vi.fn(),
}));

vi.mock("../server/models/event", () => ({
  Event: { findOne },
}));

const nuxtGlobals = globalThis as typeof globalThis & {
  createError: typeof createError;
};
nuxtGlobals.createError = createError;

const { setEventDefaultSchedule } = await import("../server/services/event");

let eventNumber = 0;

function createEvent(
  startAt: Date,
  endAt: Date,
  subscription: { enabled?: boolean } = {},
) {
  eventNumber += 1;
  const event = {
    slug: `event-${eventNumber}`,
    startAt,
    endAt,
    subscription: { enabled: false, ...subscription },
    save: vi.fn().mockResolvedValue({
      toObject: () => ({ slug: `event-${eventNumber}` }),
    }),
    set: vi.fn(),
  };
  findOne.mockResolvedValue(event);
  return event;
}

beforeEach(() => {
  findOne.mockReset();
});

describe("setEventDefaultSchedule", () => {
  it("mantém o mesmo comportamento quando não há overrides", async () => {
    const event = createEvent(
      new Date(2026, 0, 1, 10, 0),
      new Date(2026, 0, 1, 13, 0),
    );

    await setEventDefaultSchedule(event.slug, 60, 30);

    const [{ subscription }] = event.set.mock.calls[0];
    expect(subscription.schedules).toHaveLength(3);
    expect(subscription.schedules.map(({ slots }) => slots)).toEqual([
      30, 30, 30,
    ]);
    expect(subscription.schedules[0]).toMatchObject({
      startAt: new Date(2026, 0, 1, 10, 0),
      slots: 30,
    });
  });

  it("aplica o slots do override somente ao intervalo informado em todos os dias", async () => {
    const event = createEvent(
      new Date(2026, 0, 1, 11, 0),
      new Date(2026, 0, 2, 15, 0),
    );

    await setEventDefaultSchedule(event.slug, 60, 30, [
      { startTime: "12:00", endTime: "14:00", slots: 10 },
    ]);

    const [{ subscription }] = event.set.mock.calls[0];
    const schedulesByStart = new Map(
      subscription.schedules.map((schedule) => [
        schedule.startAt.toISOString(),
        schedule.slots,
      ]),
    );

    expect(
      schedulesByStart.get(new Date(2026, 0, 1, 11, 0).toISOString()),
    ).toBe(30);
    expect(
      schedulesByStart.get(new Date(2026, 0, 1, 12, 0).toISOString()),
    ).toBe(10);
    expect(
      schedulesByStart.get(new Date(2026, 0, 1, 13, 0).toISOString()),
    ).toBe(10);
    expect(
      schedulesByStart.get(new Date(2026, 0, 1, 14, 0).toISOString()),
    ).toBe(30);
    expect(
      schedulesByStart.get(new Date(2026, 0, 2, 11, 0).toISOString()),
    ).toBe(30);
    expect(
      schedulesByStart.get(new Date(2026, 0, 2, 12, 0).toISOString()),
    ).toBe(10);
    expect(
      schedulesByStart.get(new Date(2026, 0, 2, 14, 0).toISOString()),
    ).toBe(30);
  });

  it("continua bloqueando a geração quando a subscription já está habilitada", async () => {
    const event = createEvent(
      new Date(2026, 0, 1, 10, 0),
      new Date(2026, 0, 1, 13, 0),
      { enabled: true },
    );

    await expect(
      setEventDefaultSchedule(event.slug, 60, 30, [
        { startTime: "12:00", endTime: "14:00", slots: 10 },
      ]),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(event.set).not.toHaveBeenCalled();
  });
});
