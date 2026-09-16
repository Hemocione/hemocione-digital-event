import { createError } from "h3";
import { beforeAll, describe, expect, it } from "vitest";

const runtimeConfig = { coletaIntegrationSecret: "coleta-secret" };
const nuxtGlobals = globalThis as typeof globalThis & {
  createError: typeof createError;
  useRuntimeConfig: () => typeof runtimeConfig;
};
nuxtGlobals.createError = createError;
nuxtGlobals.useRuntimeConfig = () => runtimeConfig;

let assertUserBelongsToInstitution: typeof import("../server/services/auth").assertUserBelongsToInstitution;

beforeAll(async () => {
  ({ assertUserBelongsToInstitution } = await import("../server/services/auth"));
});

describe("assertUserBelongsToInstitution", () => {
  it("não lança quando o usuário tem role na instituição pedida", () => {
    const user = { institutionRoles: [{ institutionId: "institution-A", role: "admin" }] };
    expect(() => assertUserBelongsToInstitution(user, "institution-A")).not.toThrow();
  });

  it("lança 403 quando o usuário não tem role nessa instituição", () => {
    const user = { institutionRoles: [{ institutionId: "institution-A", role: "admin" }] };
    expect(() => assertUserBelongsToInstitution(user, "institution-B")).toThrow(
      expect.objectContaining({ statusCode: 403 }),
    );
  });

  it("lança 403 quando institutionRoles está vazio/ausente", () => {
    expect(() => assertUserBelongsToInstitution({}, "institution-A")).toThrow(
      expect.objectContaining({ statusCode: 403 }),
    );
  });
});
