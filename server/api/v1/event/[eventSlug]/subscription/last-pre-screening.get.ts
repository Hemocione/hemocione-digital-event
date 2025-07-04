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

  const lastPreScreeningStr = localStorage.getItem(`lastPreScreening_${eventSlug}`);
  let lastQuestionnairePreScreening = undefined;
  if (lastPreScreeningStr) {
    try {
      const lastPreScreening = JSON.parse(lastPreScreeningStr);
      if (lastPreScreening.answeredAt) {
        const answeredAt = new Date(lastPreScreening.answeredAt);
        const now = new Date();
        const diffMonths = (now.getTime() - answeredAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (diffMonths <= 1) {
          lastQuestionnairePreScreening = lastPreScreening;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return lastQuestionnairePreScreening || lastCancelled.lastQuestionnairePreScreening;
});
