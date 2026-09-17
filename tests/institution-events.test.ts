import { type H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useHemocioneUserAuth, getEventsForInstitution } = vi.hoisted(() => ({
  useHemocioneUserAuth: vi.fn(),
  getEventsForInstitution: vi.fn(),
}));

vi.mock("../server/services/auth", async () => {
  const actual = await vi.importActual<typeof import("../server/services/auth")>(
    "../server/services/auth",
  );
  return { ...actual, useHemocioneUserAuth };
});
vi.mock("../server/services/event", () => ({ getEventsForInstitution }));

type TestEvent = H3Event & { context: { params: Record<string, string> } };

const runtimeConfig = { coletaIntegrationSecret: "coleta-secret" };
const nuxtGlobals = globalThis as typeof globalThis & {
  defineEventHandler: (handler: unknown) => unknown;
  getRouterParam: (event: TestEvent, name: string) => string;
  getQuery: () => Record<string, unknown>;
  createError: (input: { statusCode: number; statusMessage: string }) => Error;
  useRuntimeConfig: () => typeof runtimeConfig;
};
nuxtGlobals.defineEventHandler = (handler) => handler;
nuxtGlobals.getRouterParam = (event, name) => event.context.params[name];
nuxtGlobals.getQuery = () => ({});
nuxtGlobals.createError = (input) => Object.assign(new Error(input.statusMessage), input);
nuxtGlobals.useRuntimeConfig = () => runtimeConfig;

const { default: handler } = await import(
  "../server/api/v1/institutions/[institutionId]/events/index.get"
);

function request(institutionId: string) {
  return {
    headers: new Headers({ authorization: "Bearer token" }),
    context: { params: { institutionId } },
  } as TestEvent;
}

beforeEach(() => {
  useHemocioneUserAuth.mockReset();
  getEventsForInstitution.mockReset();
});

describe("GET /api/v1/institutions/:institutionId/events", () => {
  it("retorna os eventos quando o usuário pertence à instituição", async () => {
    useHemocioneUserAuth.mockReturnValue({
      institutionRoles: [{ institutionId: "institution-A", role: "admin" }],
    });
    getEventsForInstitution.mockResolvedValue({ total: 1, items: [{ slug: "e1" }] });

    const response = await handler(request("institution-A"));

    expect(getEventsForInstitution).toHaveBeenCalledWith("institution-A", {});
    expect(response).toEqual({ total: 1, items: [{ slug: "e1" }] });
  });

  it("403 quando o usuário não pertence à instituição pedida", async () => {
    useHemocioneUserAuth.mockReturnValue({
      institutionRoles: [{ institutionId: "institution-A", role: "admin" }],
    });

    await expect(handler(request("institution-B"))).rejects.toMatchObject({ statusCode: 403 });
    expect(getEventsForInstitution).not.toHaveBeenCalled();
  });
});
