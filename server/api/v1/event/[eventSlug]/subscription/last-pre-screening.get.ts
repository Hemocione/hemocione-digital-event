import { useHemocioneUserAuth } from "~/server/services/auth";
import { Subscription } from "~/server/models/subscription";
import { getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);
  const eventSlug = String(getRouterParam(event, "eventSlug"));

  const lastCancelled = await Subscription.findOne({
    eventSlug,
    hemocioneId: user.id,
    deletedAt: { $ne: null }, 
    "lastQuestionnairePreScreening.formResponseId": { $exists: true },
  })
    .sort({ updatedAt: -1 }) 
    .select("lastQuestionnairePreScreening") 
    .lean();

  if (!lastCancelled?.lastQuestionnairePreScreening) {
    throw createError({
      statusCode: 404,
      statusMessage: "Nenhuma pré-triagem anterior encontrada",
    });
  }

  return lastCancelled.lastQuestionnairePreScreening;
});
