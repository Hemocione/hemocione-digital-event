import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
type JwtData<T> = JwtPayload & T;

const config = useRuntimeConfig();
export function verifyAndReturnData<T>(token: string): JwtData<T> {
  const data = jwt.verify(token, config.hemocioneIdJwtSecretKey);
  return data as JwtData<T>;
}
