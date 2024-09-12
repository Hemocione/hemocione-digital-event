import { useHemocioneUserAuth } from "~/server/services/auth";
import { getExternalVolunteer } from "~/server/services/externalVolunteer";

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);
  const eventSlug = String(getRouterParam(event, "eventSlug"));

  const externalVolunteer = await getExternalVolunteer(eventSlug, user.id);
  if (!externalVolunteer) {
    throw createError({
      statusCode: 404,
      statusMessage: "External Volunteer not Found",
    });
  }

  return externalVolunteer;
});
