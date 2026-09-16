import { describe, expect, it } from "vitest";
import { Event } from "../server/models/event";

describe("Event model — índice por institutionId", () => {
  it("declara um índice composto começando por institutionId", () => {
    const indexes = Event.schema.indexes();
    const hasInstitutionIndex = indexes.some(
      ([fields]) => Object.keys(fields)[0] === "institutionId",
    );
    expect(hasInstitutionIndex).toBe(true);
  });
});
