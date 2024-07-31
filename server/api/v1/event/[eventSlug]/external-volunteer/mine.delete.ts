import { useHemocioneUserAuth } from "~/server/services/auth";
import { deleteExternalVolunteer } from "~/server/services/externalVolunteer";

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);
  const eventSlug = String(getRouterParam(event, "eventSlug"));

  const externalVolunteer = await deleteExternalVolunteer(eventSlug, user.id);
  return externalVolunteer;
});
