import { createError, type H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { callQueueParticipants, getEventBySlug } = vi.hoisted(() => ({
  callQueueParticipants: vi.fn(),
  getEventBySlug: vi.fn(),
}));

vi.mock("../server/services/queueParticipants", () => ({
  callQueueParticipants,
}));

vi.mock("../server/services/event", () => ({ getEventBySlug }));

vi.mock("../server/services/jwt", () => ({
  verifyAndReturnData: vi.fn(),
}));

const runtimeConfig = { secret: "lowcoder-secret" };

type TestEvent = H3Event & {
  body?: unknown;
  params?: Record<string, string>;
};

const nuxtGlobals = globalThis as typeof globalThis & {
  createError: typeof createError;
  defineEventHandler: (handler: unknown) => unknown;
  getRouterParam: (event: TestEvent, name: string) => string | undefined;
  readBody: (event: TestEvent) => Promise<unknown>;
  useRuntimeConfig: () => typeof runtimeConfig;
};
nuxtGlobals.createError = createError;
nuxtGlobals.defineEventHandler = (handler) => handler;
nuxtGlobals.getRouterParam = (event, name) => event.params?.[name];
nuxtGlobals.readBody = (event) => Promise.resolve(event.body);
nuxtGlobals.useRuntimeConfig = () => runtimeConfig;

const { verifyAndReturnData } = await import("../server/services/jwt");
const { default: handler } = await import(
  "../server/api/v1/event/[eventSlug]/queue/[queueId]/participant/call.post"
);

function request(headers: Record<string, string> = {}): TestEvent {
  return {
    headers: new Headers(headers),
    body: { participantIds: ["participant-id"] },
    params: { eventSlug: "event-slug", queueId: "queue-id" },
  } as unknown as TestEvent;
}

beforeEach(() => {
  callQueueParticipants.mockReset();
  getEventBySlug.mockReset();
  getEventBySlug.mockResolvedValue({
    institutionId: "institution-id",
    queue: { _id: "queue-id" },
  });
  vi.mocked(verifyAndReturnData).mockReset();
});

describe("POST /api/v1/event/:eventSlug/queue/:queueId/participant/call", () => {
  it("rejects an unauthenticated call", async () => {
    await expect(handler(request())).rejects.toMatchObject({ statusCode: 401 });
    expect(callQueueParticipants).not.toHaveBeenCalled();
  });

  it("rejects an invalid secret without a user session", async () => {
    await expect(
      handler(request({ "x-secret": "wrong-secret" })),
    ).rejects.toMatchObject({ statusCode: 401 });
    expect(callQueueParticipants).not.toHaveBeenCalled();
  });

  it("accepts the backoffice secret", async () => {
    await expect(
      handler(request({ "x-secret": "lowcoder-secret" })),
    ).resolves.toBeUndefined();

    expect(callQueueParticipants).toHaveBeenCalledWith(
      ["participant-id"],
      "queue-id",
      "event-slug",
    );
  });

  it("accepts an affiliated user session", async () => {
    vi.mocked(verifyAndReturnData).mockReturnValue({
      id: "user-id",
      institutionRoles: [{ institutionId: "institution-id", role: "member" }],
    });

    await expect(
      handler(request({ authorization: "Bearer user-token" })),
    ).resolves.toBeUndefined();

    expect(callQueueParticipants).toHaveBeenCalledWith(
      ["participant-id"],
      "queue-id",
      "event-slug",
    );
  });

  it("accepts an affiliated blood bank user session", async () => {
    getEventBySlug.mockResolvedValue({
      bloodBanksLocationId: "blood-bank-id",
      queue: { _id: "queue-id" },
    });
    vi.mocked(verifyAndReturnData).mockReturnValue({
      id: "user-id",
      bloodBankRoles: [
        { bloodBanksLocationId: "blood-bank-id", role: "staff" },
      ],
    });

    await expect(
      handler(request({ authorization: "Bearer user-token" })),
    ).resolves.toBeUndefined();

    expect(callQueueParticipants).toHaveBeenCalledWith(
      ["participant-id"],
      "queue-id",
      "event-slug",
    );
  });

  it("rejects a user session without event affiliation", async () => {
    vi.mocked(verifyAndReturnData).mockReturnValue({
      id: "user-id",
      institutionRoles: [],
    });

    await expect(
      handler(request({ authorization: "Bearer user-token" })),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(callQueueParticipants).not.toHaveBeenCalled();
  });

  it("rejects an affiliated session when the queue is from another event", async () => {
    vi.mocked(verifyAndReturnData).mockReturnValue({
      id: "user-id",
      institutionRoles: [{ institutionId: "institution-id", role: "member" }],
    });
    getEventBySlug.mockResolvedValue({
      institutionId: "institution-id",
      queue: { _id: "other-queue-id" },
    });

    await expect(
      handler(request({ authorization: "Bearer user-token" })),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(callQueueParticipants).not.toHaveBeenCalled();
  });
});
