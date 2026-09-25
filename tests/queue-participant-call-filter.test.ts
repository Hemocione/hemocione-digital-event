import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateMany } = vi.hoisted(() => ({ updateMany: vi.fn() }));

vi.mock("../server/models/queueParticipant", () => ({
  QueueParticipant: { updateMany },
}));

vi.mock("../server/inngest/client", () => ({ inngest: {} }));
vi.mock("../server/services/digitalStand", () => ({
  upsertFBDataOnLead: vi.fn(),
}));

const { callQueueParticipants } = await import(
  "../server/services/queueParticipants"
);

beforeEach(() => {
  updateMany.mockReset();
  updateMany.mockResolvedValue({ modifiedCount: 1 });
});

describe("callQueueParticipants", () => {
  it("updates only uncalled participants in the requested queue", async () => {
    await callQueueParticipants(["participant-id"], "queue-id", "event-slug");

    expect(updateMany).toHaveBeenCalledWith(
      {
        _id: { $in: ["participant-id"] },
        queueId: "queue-id",
        calledAt: null,
      },
      { $set: { calledAt: expect.any(Date) } },
    );
  });
});
