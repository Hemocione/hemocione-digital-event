import { type H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useHemocioneUserAuth, getEventBySlug, listEventSubscriptions } = vi.hoisted(() => ({
  useHemocioneUserAuth: vi.fn(),
  getEventBySlug: vi.fn(),
  listEventSubscriptions: vi.fn(),
}));

vi.mock("../server/services/auth", async () => {
  const actual = await vi.importActual<typeof import("../server/services/auth")>(
    "../server/services/auth",
  );
  return { ...actual, useHemocioneUserAuth };
});
vi.mock("../server/services/event", () => ({ getEventBySlug }));
vi.mock("../server/services/subscription", () => ({ listEventSubscriptions }));

type TestEvent = H3Event & { context: { params: Record<string, string> } };

const runtimeConfig = { coletaIntegrationSecret: "coleta-secret" };
const nuxtGlobals = globalThis as typeof globalThis & {
  defineEventHandler: (handler: unknown) => unknown;
  getRouterParam: (event: TestEvent, name: string) => string;
  createError: (input: { statusCode: number; statusMessage: string }) => Error;
  useRuntimeConfig: () => typeof runtimeConfig;
};
nuxtGlobals.defineEventHandler = (handler) => handler;
nuxtGlobals.getRouterParam = (event, name) => event.context.params[name];
nuxtGlobals.createError = (input) => Object.assign(new Error(input.statusMessage), input);
nuxtGlobals.useRuntimeConfig = () => runtimeConfig;

const { default: handler } = await import(
  "../server/api/v1/institutions/[institutionId]/events/[eventSlug]/subscribers.get"
);

function request(institutionId: string, eventSlug: string) {
  return {
    headers: new Headers({ authorization: "Bearer token" }),
    context: { params: { institutionId, eventSlug } },
  } as TestEvent;
}

beforeEach(() => {
  useHemocioneUserAuth.mockReset();
  getEventBySlug.mockReset();
  listEventSubscriptions.mockReset();
});

describe("GET /api/v1/institutions/:institutionId/events/:eventSlug/subscribers", () => {
  it("403 quando o usuário não pertence à instituição do evento", async () => {
    useHemocioneUserAuth.mockReturnValue({
      institutionRoles: [{ institutionId: "institution-A", role: "admin" }],
    });

    await expect(handler(request("institution-B", "evento-1"))).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(getEventBySlug).not.toHaveBeenCalled();
  });

  it("404 quando o evento não existe", async () => {
    useHemocioneUserAuth.mockReturnValue({
      institutionRoles: [{ institutionId: "institution-A", role: "admin" }],
    });
    getEventBySlug.mockResolvedValue(null);

    await expect(handler(request("institution-A", "evento-1"))).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("403 quando o evento existe mas pertence a outra instituição", async () => {
    useHemocioneUserAuth.mockReturnValue({
      institutionRoles: [{ institutionId: "institution-A", role: "admin" }],
    });
    getEventBySlug.mockResolvedValue({ slug: "evento-1", institutionId: "institution-B" });

    await expect(handler(request("institution-A", "evento-1"))).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(listEventSubscriptions).not.toHaveBeenCalled();
  });

  it("junta todas as páginas de listEventSubscriptions numa resposta só", async () => {
    useHemocioneUserAuth.mockReturnValue({
      institutionRoles: [{ institutionId: "institution-A", role: "admin" }],
    });
    getEventBySlug.mockResolvedValue({ slug: "evento-1", institutionId: "institution-A" });
    listEventSubscriptions
      .mockResolvedValueOnce({ total: 3, items: [{ name: "a" }, { name: "b" }] })
      .mockResolvedValueOnce({ total: 3, items: [{ name: "c" }] });

    const response = await handler(request("institution-A", "evento-1"));

    expect(listEventSubscriptions).toHaveBeenCalledTimes(2);
    expect(response).toEqual({
      total: 3,
      items: [{ name: "a" }, { name: "b" }, { name: "c" }],
    });
  });
});
