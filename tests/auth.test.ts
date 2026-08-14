import { createError, type H3Event } from "h3";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../server/services/jwt", () => ({
  verifyAndReturnData: vi.fn(),
}));

const runtimeConfig = {};
const nuxtGlobals = globalThis as typeof globalThis & {
  createError: typeof createError;
  useRuntimeConfig: () => typeof runtimeConfig;
};
nuxtGlobals.createError = createError;
nuxtGlobals.useRuntimeConfig = () => runtimeConfig;

let useHemocioneUserAuth: typeof import("../server/services/auth").useHemocioneUserAuth;
let verifyAndReturnData: typeof import("../server/services/jwt").verifyAndReturnData;

beforeAll(async () => {
  ({ useHemocioneUserAuth } = await import("../server/services/auth"));
  ({ verifyAndReturnData } = await import("../server/services/jwt"));
});

function eventWithHeaders(headers: Record<string, string>): H3Event {
  return { headers: new Headers(headers) } as H3Event;
}

describe("useHemocioneUserAuth", () => {
  it("preserva as roles de blood bank e instituição do JWT", () => {
    const payload = {
      id: "user-id",
      givenName: "Maria",
      surName: "Silva",
      bloodType: "O+" as const,
      email: "maria@example.com",
      phone: "5511999999999",
      document: "12345678900",
      gender: "F" as const,
      bloodBankRoles: [{ bloodBanksLocationId: "location-id", role: "admin" }],
      institutionRoles: [{ institutionId: "institution-id", role: "member" }],
    };
    vi.mocked(verifyAndReturnData).mockReturnValue(payload);

    const user = useHemocioneUserAuth(
      eventWithHeaders({ authorization: "Bearer mocked-token" }),
    );

    expect(user.bloodBankRoles).toEqual(payload.bloodBankRoles);
    expect(user.institutionRoles).toEqual(payload.institutionRoles);
  });

  it("usa arrays vazios para JWTs sem os campos de roles", () => {
    const payload = {
      id: "user-id",
      givenName: "Maria",
      surName: "Silva",
      bloodType: "O+" as const,
      email: "maria@example.com",
      phone: "5511999999999",
      document: "12345678900",
      gender: "F" as const,
    };
    vi.mocked(verifyAndReturnData).mockReturnValue(payload);

    const user = useHemocioneUserAuth(
      eventWithHeaders({ authorization: "Bearer mocked-token" }),
    );

    expect(user.bloodBankRoles).toEqual([]);
    expect(user.institutionRoles).toEqual([]);
  });
});
