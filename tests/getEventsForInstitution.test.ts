import { beforeEach, describe, expect, it, vi } from "vitest";

const { find, countDocuments } = vi.hoisted(() => ({
  find: vi.fn(),
  countDocuments: vi.fn(),
}));

vi.mock("../server/models/event", () => ({
  Event: {
    find: (...args: unknown[]) => find(...args),
    countDocuments: (...args: unknown[]) => countDocuments(...args),
  },
}));

const { getEventsForInstitution } = await import("../server/services/event");

function chainable(result: unknown) {
  const chain = {
    sort: vi.fn(() => chain),
    skip: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    lean: vi.fn(() => Promise.resolve(result)),
  };
  return chain;
}

beforeEach(() => {
  find.mockReset();
  countDocuments.mockReset();
});

describe("getEventsForInstitution", () => {
  it("filtra por institutionId sem cortar por endAt (passado e futuro juntos)", async () => {
    find.mockReturnValue(chainable([]));
    countDocuments.mockResolvedValue(0);

    await getEventsForInstitution("institution-1");

    const filterArg = find.mock.calls[0][0];
    expect(filterArg).toEqual({ institutionId: "institution-1", private: { $ne: true } });
    expect(filterArg).not.toHaveProperty("endAt");
  });

  it("ordena por startAt descendente e pagina com skip/limit", async () => {
    const chain = chainable([]);
    find.mockReturnValue(chain);
    countDocuments.mockResolvedValue(0);

    await getEventsForInstitution("institution-1", { page: 2, limit: 10 });

    expect(chain.sort).toHaveBeenCalledWith({ startAt: -1 });
    expect(chain.skip).toHaveBeenCalledWith(10);
    expect(chain.limit).toHaveBeenCalledWith(10);
  });

  it("retorna total e items", async () => {
    find.mockReturnValue(chainable([{ slug: "e1" }]));
    countDocuments.mockResolvedValue(1);

    const result = await getEventsForInstitution("institution-1");

    expect(result).toEqual({ total: 1, items: [{ slug: "e1" }] });
  });
});
