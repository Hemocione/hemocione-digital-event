import { assertSecretAuth } from "~/server/services/auth";
import { updateEventExternalVolunteersData } from "~/server/services/externalVolunteer";
import z from "zod";

const bodySchema = z.object({
  groupUrl: z.string(),
  slots: z.number(),
  htmlExplanationText: z.string().optional(),
});

type externalVolunteerSetUpDTO = z.infer<typeof bodySchema>;

export default defineEventHandler(async (event) => {
  assertSecretAuth(event);
  const { data } = await readValidatedBody(event, bodySchema.safeParse);
  if (!data) {
    throw createError({ statusCode: 422, statusMessage: "Invalid body" });
  }
  const eventSlug = String(getRouterParam(event, "eventSlug"));

  //fazer funcao minha que atualiza só essa parte dentro de externalVolunteer dentro do evento
  const updatedEvent = await updateEventExternalVolunteersData(eventSlug, data);

  if (!updatedEvent) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }

  return {
    ...updatedEvent,
  };
});
