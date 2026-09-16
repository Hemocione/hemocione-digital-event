import { assertUserBelongsToInstitution, useHemocioneUserAuth } from "~/server/services/auth";
import { getEventBySlug } from "~/server/services/event";
import { listEventSubscriptions } from "~/server/services/subscription";

const PAGE_SIZE = 500; // mesmo teto ja aplicado por listEventSubscriptions

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);
  const institutionId = String(getRouterParam(event, "institutionId"));
  assertUserBelongsToInstitution(user, institutionId);

  const eventSlug = String(getRouterParam(event, "eventSlug"));
  const foundEvent = await getEventBySlug(eventSlug);
  if (!foundEvent) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }
  if (foundEvent.institutionId !== institutionId) {
    throw createError({
      statusCode: 403,
      statusMessage: "This event does not belong to the given institution",
    });
  }

  const items: Awaited<ReturnType<typeof listEventSubscriptions>>["items"] = [];
  let total = 0;
  let skip = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await listEventSubscriptions(eventSlug, { take: PAGE_SIZE, skip });
    total = page.total;
    items.push(...page.items);
    skip += PAGE_SIZE;
    if (items.length >= total || page.items.length === 0) break;
  }

  return { total, items };
});
