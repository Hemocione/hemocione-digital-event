import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CollectionRequestEventCreated } from "../server/inngest/eventHandlers/collectionRequestEventCreated";

const { createFunction, enableEventSubscription, setEventDefaultSchedule } =
  vi.hoisted(() => ({
    createFunction: vi.fn(),
    enableEventSubscription: vi.fn(),
    setEventDefaultSchedule: vi.fn(),
  }));

vi.mock("../server/inngest/client", () => ({
  inngest: { createFunction },
}));

vi.mock("../server/services/event", () => ({
  enableEventSubscription,
  setEventDefaultSchedule,
}));

createFunction.mockImplementation(
  (_config: unknown, _trigger: unknown, handler: unknown) => handler,
);

const { default: inngestFunction } = await import(
  "../server/inngest/eventHandlers/collectionRequestEventCreated"
);

type FunctionHandlerInput = {
  event: CollectionRequestEventCreated;
  step: {
    run: (name: string, callback: () => Promise<unknown>) => Promise<unknown>;
  };
};
const handler = inngestFunction as unknown as (
  input: FunctionHandlerInput,
) => Promise<unknown>;

beforeEach(() => {
  enableEventSubscription.mockReset();
  setEventDefaultSchedule.mockReset();
});

describe("collection-request/event.created", () => {
  it("gera os horários e habilita a subscription em steps ordenados", async () => {
    const schedule = {
      timeInterval: 60,
      slotsPerInterval: 30,
      overrides: [{ startTime: "12:00", endTime: "14:00", slots: 10 }],
    };
    const stepNames: string[] = [];
    const run = vi.fn((name: string, callback: () => Promise<unknown>) => {
      stepNames.push(name);
      return callback();
    });

    await handler({
      event: {
        data: {
          eventSlug: "evento-de-coleta",
          schedule,
          enableSubscription: true,
        },
      },
      step: { run },
    } as never);

    expect(stepNames).toEqual(["generate-schedules", "enable-subscription"]);
    expect(setEventDefaultSchedule).toHaveBeenCalledWith(
      "evento-de-coleta",
      schedule.timeInterval,
      schedule.slotsPerInterval,
      schedule.overrides,
    );
    expect(enableEventSubscription).toHaveBeenCalledWith("evento-de-coleta");
  });
});
