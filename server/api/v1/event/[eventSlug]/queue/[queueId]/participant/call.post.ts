import { callQueueParticipants } from "~/server/services/queueParticipants";
import { useHemocioneUserAuthOrSecret } from "~/server/services/auth";
import { getEventBySlug } from "~/server/services/event";

interface Body {
  participantIds: string[];
}

function validateBody(body: any): asserts body is Body {
  if (!Array.isArray(body.participantIds)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid body",
    });
  }
}

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuthOrSecret(event);
  const queue = getRouterParam(event, "queueId");
  const eventSlug = getRouterParam(event, "eventSlug");

  if (user) {
    const hemoEvent = await getEventBySlug(String(eventSlug));
    if (!hemoEvent) {
      throw createError({ statusCode: 404, statusMessage: "Event not found" });
    }
    if (String(hemoEvent.queue?._id) !== String(queue)) {
      throw createError({
        statusCode: 403,
        statusMessage: "User cannot call participants for this queue",
      });
    }

    const hasInstitutionAccess = user.institutionRoles.some(
      ({ institutionId }) => institutionId === hemoEvent.institutionId,
    );
    const hasBloodBankAccess = user.bloodBankRoles.some(
      ({ bloodBanksLocationId }) =>
        bloodBanksLocationId === hemoEvent.bloodBanksLocationId,
    );

    if (!hasInstitutionAccess && !hasBloodBankAccess) {
      throw createError({
        statusCode: 403,
        statusMessage: "User cannot call participants for this event",
      });
    }
  }

  const body = await readBody(event);
  validateBody(body);

  await callQueueParticipants(
    body.participantIds,
    String(queue),
    String(eventSlug),
  );
});
