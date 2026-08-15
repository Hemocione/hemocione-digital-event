import { createError, type H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateEventBySlug } = vi.hoisted(() => ({
  updateEventBySlug: vi.fn(),
}));

vi.mock("../server/services/event", () => ({
  updateEventBySlug,
}));

const runtimeConfig = {
  secret: "lowcoder-secret",
  coletaIntegrationSecret: "coleta-secret",
};

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

const { default: handler } = await import(
  "../server/api/v1/event/[eventSlug]/index.put"
);

function request(headers: Record<string, string>) {
  return {
    headers: new Headers(headers),
    body: { banner: "https://example.com/banner.png" },
    params: { eventSlug: "event-slug" },
  } as TestEvent;
}

beforeEach(() => {
  updateEventBySlug.mockReset();
  updateEventBySlug.mockResolvedValue({ slug: "event-slug" });
});

describe("PUT /api/v1/event/:eventSlug authentication", () => {
  it("continua aceitando o secret global do Lowcoder", async () => {
    await expect(
      handler(request({ "x-secret": "lowcoder-secret" })),
    ).resolves.toEqual({ slug: "event-slug" });
  });

  it("aceita o secret dedicado do hemocione-coleta", async () => {
    await expect(
      handler(request({ "x-coleta-integration-secret": "coleta-secret" })),
    ).resolves.toEqual({ slug: "event-slug" });
  });

  it.each([
    ["secret incorreto", { "x-secret": "wrong-secret" }],
    [
      "secret do coleta incorreto",
      { "x-coleta-integration-secret": "wrong-secret" },
    ],
    ["nenhum header", {}],
  ])("rejeita quando há %s", async (_case, headers) => {
    await expect(handler(request(headers))).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
