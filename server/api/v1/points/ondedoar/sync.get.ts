import { getPointsOndeDoar } from "~/server/services/event";
import { assertSecretAuth } from "../../../../services/auth";

export default defineEventHandler(async (event) => {
  assertSecretAuth(event);

  const { old } = getQuery(event);
  const shouldGetOldEvents = String(old) === "true";
  const events = await getPointsOndeDoar(shouldGetOldEvents);
  return events;
});
