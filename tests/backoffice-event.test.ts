import { createError, type H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { create, findOne, send } = vi.hoisted(() => ({
  create: vi.fn(),
  findOne: vi.fn(),
  send: vi.fn(),
}));

vi.mock("../server/models/event", () => ({
  Event: { create, findOne },
}));

vi.mock("../server/inngest/client", () => ({
  inngest: { send },
}));

const runtimeConfig = { coletaIntegrationSecret: "coleta-secret" };
type TestEvent = H3Event & {
  body?: unknown;
  statusCode?: number;
};

const nuxtGlobals = globalThis as typeof globalThis & {
  createError: typeof createError;
  defineEventHandler: (handler: unknown) => unknown;
  readBody: (event: TestEvent) => Promise<unknown>;
  setResponseStatus: (event: TestEvent, statusCode: number) => void;
  useRuntimeConfig: () => typeof runtimeConfig;
};
nuxtGlobals.createError = createError;
nuxtGlobals.defineEventHandler = (handler) => handler;
nuxtGlobals.readBody = (event) => Promise.resolve(event.body);
nuxtGlobals.setResponseStatus = (event, statusCode) => {
  event.statusCode = statusCode;
};
nuxtGlobals.useRuntimeConfig = () => runtimeConfig;

const { default: handler } = await import(
  "../server/api/backoffice/v1/event/index.post"
);

const eventBody = {
  name: "Evento de coleta",
  startAt: "2026-08-14T10:00:00.000Z",
  endAt: "2026-08-14T18:00:00.000Z",
  sourceCollectionRequestId: "collection-request-1",
};

function request(body: unknown = eventBody, secret = "coleta-secret") {
  return {
    headers: new Headers({ "x-coleta-integration-secret": secret }),
    body,
  } as TestEvent;
}

beforeEach(() => {
  create.mockReset();
  findOne.mockReset();
  send.mockReset();
});

describe("POST /api/backoffice/v1/event", () => {
  it("cria um evento novo e retorna 201", async () => {
    const createdEvent = {
      _id: "event-id",
      name: eventBody.name,
      sourceCollectionRequestId: eventBody.sourceCollectionRequestId,
    };
    findOne.mockResolvedValue(undefined);
    create.mockResolvedValue({ toObject: () => createdEvent });

    const event = request();
    const response = await handler(event);

    expect(event.statusCode).toBe(201);
    expect(response).toEqual(createdEvent);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0]).toMatchObject({
      sourceCollectionRequestId: eventBody.sourceCollectionRequestId,
    });
    expect(send).not.toHaveBeenCalled();
  });

  it("dispara a orquestração quando recebe um schedule", async () => {
    const schedule = {
      timeInterval: 60,
      slotsPerInterval: 30,
      overrides: [{ startTime: "12:00", endTime: "14:00", slots: 10 }],
    };
    const createdEvent = {
      _id: "event-id",
      name: eventBody.name,
      slug: "evento-de-coleta",
      sourceCollectionRequestId: eventBody.sourceCollectionRequestId,
    };
    findOne.mockResolvedValue(undefined);
    create.mockResolvedValue({ toObject: () => createdEvent });

    await handler(request({ ...eventBody, schedule }));

    expect(send).toHaveBeenCalledWith({
      name: "collection-request/event.created",
      data: {
        eventSlug: createdEvent.slug,
        schedule,
        enableSubscription: true,
      },
    });
    expect(create.mock.calls[0][0]).not.toHaveProperty("schedule");
  });

  it("retorna o mesmo evento com 200 na segunda chamada idempotente", async () => {
    const existingEvent = {
      _id: "event-id",
      name: eventBody.name,
      sourceCollectionRequestId: eventBody.sourceCollectionRequestId,
    };
    findOne.mockResolvedValueOnce(undefined).mockResolvedValue(existingEvent);
    create.mockResolvedValue({ toObject: () => existingEvent });

    const firstRequest = request();
    const firstResponse = await handler(firstRequest);
    const secondRequest = request();
    const secondResponse = await handler(secondRequest);

    expect(firstRequest.statusCode).toBe(201);
    expect(secondRequest.statusCode).toBe(200);
    expect(secondResponse).toEqual(firstResponse);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("rejeita chamada sem o secret correto", async () => {
    await expect(
      handler(request(eventBody, "wrong-secret")),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("rejeita body sem sourceCollectionRequestId com 400", async () => {
    await expect(
      handler(request({ name: eventBody.name })),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
