import { assertHemocioneIdIntegrationSecret } from "~/server/services/auth";
import { getReconciliationFactsSince } from "~/server/services/factsReconciliationService";

export default defineEventHandler(async (event) => {
  assertHemocioneIdIntegrationSecret(event);

  const since = String(getQuery(event).since ?? new Date(0).toISOString());
  const facts = await getReconciliationFactsSince(new Date(since));

  return { facts };
});
