import { Types } from "mongoose";
import { z } from "zod";
import { useHemocioneUserAuth } from "~/server/services/auth";
import { getUserEventSubscription } from "~/server/services/subscription";

const querySchema = z.object({
  questionnaireId: z.string().refine((val) => Types.ObjectId.isValid(val)),
  status: z.enum(["able-to-donate", "unable-to-donate"]),
});

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);
  const eventSlug = String(getRouterParam(event, "eventSlug"));

  const query = getQuery(event)

  const subscription = await getUserEventSubscription(eventSlug, user.id);
  if (!subscription) {
    throw createError({
      statusCode: 404,
      statusMessage: "Subscription not Found",
    });
  }

  if (query.questionnaireId && query.status && subscription.lastQuestionnairePreScreening?.formResponseId !== query.questionnaireId) {
    const parsed = querySchema.safeParse(query);

    if (!parsed.success) {
      throw createError({
        statusCode: 422,
        statusMessage: "Invalid request data",
        data: parsed.error.errors,
      });
    }  
   
    subscription.lastQuestionnairePreScreening = {
      formResponseId: new Types.ObjectId(parsed.data.questionnaireId) as unknown as {
        prototype?: Types.ObjectId;
      },    
      status: parsed.data.status,
      answeredAt: new Date(),
    };
    
      await subscription.save();
  }

  return subscription.toObject;
});
