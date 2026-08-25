import { type H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { find, useHemocioneUserAuth } = vi.hoisted(() => ({
  find: vi.fn(),
  useHemocioneUserAuth: vi.fn(),
}));

vi.mock("../server/models/event", () => ({
  Event: { find },
}));

vi.mock("../server/services/auth", () => ({
  useHemocioneUserAuth,
}));

type TestEvent = H3Event & {
  query?: Record<string, unknown>;
};

const nuxtGlobals = globalThis as typeof globalThis & {
  defineEventHandler: (handler: unknown) => unknown;
  getQuery: (event: TestEvent) => Record<string, unknown>;
};
nuxtGlobals.defineEventHandler = (handler) => handler;
nuxtGlobals.getQuery = (event) => event.query ?? {};

const { default: handler } = await import("../server/api/v1/event/index.get");

const events = [
  {
    slug: "evento-instituicao-1",
    name: "Evento da instituição 1",
    institutionId: "institution-1",
  },
  {
    slug: "evento-instituicao-2",
    name: "Evento da instituição 2",
    institutionId: "institution-2",
  },
];

function request(query: Record<string, unknown> = {}) {
  return {
    headers: new Headers({ authorization: "Bearer user-token" }),
    query,
  } as TestEvent;
}

function mockEventFind() {
  find.mockImplementation((filter: Record<string, unknown>) => {
    const matchingEvents = events.filter(
      (event) =>
        filter.institutionId === undefined ||
        event.institutionId === filter.institutionId,
    );

    return {
      select: () => ({
        sort: () => ({
          lean: () => Promise.resolve(matchingEvents),
        }),
      }),
    };
  });
}

beforeEach(() => {
  find.mockReset();
  useHemocioneUserAuth.mockReset();
  useHemocioneUserAuth.mockReturnValue({ id: "user-id" });
  mockEventFind();
});

describe("GET /api/v1/event", () => {
  it("retorna todos os eventos sem institutionId", async () => {
    const response = await handler(request());

    expect(response).toEqual(events);
    expect(useHemocioneUserAuth).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        active: true,
        private: { $ne: true },
      }),
    );
    expect(find.mock.calls[0][0]).not.toHaveProperty("institutionId");
  });

  it("filtra por institutionId", async () => {
    const response = await handler(request({ institutionId: "institution-1" }));

    expect(response).toEqual([events[0]]);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ institutionId: "institution-1" }),
    );
  });

  it("retorna uma lista vazia quando institutionId não corresponde", async () => {
    const response = await handler(
      request({ institutionId: "institution-missing" }),
    );

    expect(response).toEqual([]);
  });
});
