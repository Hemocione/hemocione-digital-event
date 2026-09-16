import { assertUserBelongsToInstitution, useHemocioneUserAuth } from "~/server/services/auth";
import { getEventsForInstitution } from "~/server/services/event";

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);
  const institutionId = String(getRouterParam(event, "institutionId"));
  assertUserBelongsToInstitution(user, institutionId);

  const query = getQuery(event);
  const page = query.page ? Number(query.page) : undefined;
  const limit = query.limit ? Number(query.limit) : undefined;

  return getEventsForInstitution(institutionId, {
    ...(page ? { page } : {}),
    ...(limit ? { limit } : {}),
  });
});
