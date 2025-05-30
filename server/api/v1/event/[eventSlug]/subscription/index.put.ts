import { defineEventHandler, readBody, createError } from "h3";
import { Subscription } from "~/server/models/subscription";
import { Types } from "mongoose";
import z from "zod";

const bodySchema = z.object({
  questionnaireId: z.string().refine((val) => Types.ObjectId.isValid(val)),
  status: z.enum(["able-to-donate", "unable-to-donate"]),
});

export default defineEventHandler(async (event) => {
  console.log("📨 Método recebido:", event.method);
  const { eventSlug } = event.context.params as { eventSlug: string };
  const body = await readBody(event);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid request data",
      data: parsed.error.errors,
    });
  }

  const user = event.context.auth?.user;
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const subscription = await Subscription.findOne({
    hemocioneId: user.id,
    eventSlug,
  });

  if (!subscription) {
    throw createError({
      statusCode: 404,
      statusMessage: "Subscription not found",
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

  console.log("🍪 Cookie recebido:", getCookie(event, "hemocioneId"));

  return {
    success: true,
    subscription: {
      id: subscription._id,
      lastQuestionnairePreScreening: subscription.lastQuestionnairePreScreening,
    },
  };
});
