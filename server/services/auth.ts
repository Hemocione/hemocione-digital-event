import type { H3Event } from "h3";
import { verifyAndReturnData } from "./jwt";
const config = useRuntimeConfig();

export function assertSecretAuth(event: H3Event) {
  const headers = event.headers;
  const secret = headers.get("x-secret");

  if (secret !== config.secret) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }
}

const BLOODTYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export type BloodType = (typeof BLOODTYPES)[number];

const GENDERS = ["M", "F", "O"] as const;
export type Gender = (typeof GENDERS)[number];

export interface HemocioneUserAuthTokenData {
  id: string;
  givenName: string;
  surName: string;
  bloodType: BloodType;
  email: string;
  phone: string;
  gender: Gender;
}

export function useHemocioneUserAuth(event: H3Event) {
  const headers = event.headers;
  const token = headers.get("Authorization")?.replace("Bearer", "").trim();
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized - Missing Token",
    });
  }

  try {
    const hemocioneUser =
      verifyAndReturnData<HemocioneUserAuthTokenData>(token);
    return hemocioneUser;
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized - Invalid Token",
    });
  }
}
