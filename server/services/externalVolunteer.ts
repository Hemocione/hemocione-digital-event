import { Event } from "../models/event";
import { ExternalVolunteer } from "../models/externalVolunteer";
import type { HemocioneUserAuthTokenData } from "./auth";
import type { externalVolunteerReviewDTO } from "~/server/api/v1/event/[eventSlug]/external-volunteer/[id]/review.put";
import {
  getEventBySlug,
  incrementEventExternalVolunteersOccupiedSlots,
} from "~/server/services/event";
import { getCleanFullName } from "~/utils/getCleanFullName";

// Função para obter um voluntário externo com base no slug do evento e no ID do usuário
export async function getExternalVolunteer(externalVolunteerId: string) {
  const externalVolunteer = await ExternalVolunteer.findOne({
    externalVolunteerId,
    deletedAt: null,
  }).lean();
  return externalVolunteer;
}

// Função para obter todos os voluntários externos de um evento
export async function getAllExternalVolunteers(eventSlug: string) {
  const externalVolunteers = await ExternalVolunteer.find({
    eventSlug,
    deletedAt: null, // Certificando-se de que só retorna os que não foram deletados
  }).lean();

  return externalVolunteers;
}

export async function getUserEventVolunteering(
  eventSlug: string,
  hemocioneId: string,
) {
  const externalVolunteer = await ExternalVolunteer.findOne({
    eventSlug,
    hemocioneId,
    deletedAt: null,
  }).lean();
  return externalVolunteer;
}

export async function createExternalVolunteer(
  eventSlug: string,
  user: HemocioneUserAuthTokenData,
) {
  // Verifica se o voluntário já existe
  const existingVolunteer = await ExternalVolunteer.findOne({
    eventSlug,
    hemocioneId: user.id,
    deletedAt: null,
  });

  if (existingVolunteer) {
    // Se o voluntário já existe, retorne-o ou lance um erro
    throw new Error(
      `Voluntário com hemocioneId "${user.id}" já está registrado para o evento "${eventSlug}".`,
    );
  }

  const externalVolunteer = new ExternalVolunteer({
    eventSlug,
    hemocioneId: user.id,
    name: getCleanFullName(user.givenName, user.surName),
    email: user.email,
    phone: user.phone,
    document: user.document,
  });

  await externalVolunteer.save();
  await incrementEventExternalVolunteersOccupiedSlots(eventSlug, 1);

  return externalVolunteer.toObject();
}

// Função para deletar um voluntário externo com base no slug do evento e no ID do usuário
export async function deleteExternalVolunteer(
  eventSlug: string,
  hemocioneId: string,
) {
  const externalVolunteer = await ExternalVolunteer.findOne({
    eventSlug,
    hemocioneId,
    deletedAt: null,
  });
  if (!externalVolunteer) return;
  externalVolunteer.deletedAt = new Date();

  await externalVolunteer.save();
  await incrementEventExternalVolunteersOccupiedSlots(eventSlug, -1);
}

export interface UpdateExternalVolunteersDTO {
  htmlExplanationText?: string;
  groupUrl: string;
  slots: number;
}

export async function updateEventExternalVolunteersData(
  eventSlug: string,
  data: UpdateExternalVolunteersDTO,
) {
  const event = await getEventBySlug(eventSlug, false, { lean: false });
  if (!event) return null;

  const updatedEvent = await Event.findOneAndUpdate(
    {
      slug: eventSlug,
    },
    {
      $set: {
        "externalVolunteers.slots": data.slots,
        "externalVolunteers.htmlExplanationText": data.htmlExplanationText,
        "externalVolunteers.groupUrl": data.groupUrl,
      },
    },
    { new: true },
  );

  return updatedEvent;
}

export async function updateEventExternalVolunteerReviewData(
  externalVolunteerId: string,
  data: externalVolunteerReviewDTO,
) {
  const event = await getExternalVolunteer(externalVolunteerId);
  if (!event) return null;

  const updatedExternalVolunteer = await ExternalVolunteer.findOneAndUpdate(
    {
      $set: {
        "review.status": data.status,
        "review.rating": data.rating,
        "review.negativeFeedback": data.negativeFeedback,
        "review.positiveFeedback": data.positiveFeedback,
        "review.feedbackComment": data.feedbackComment,
        "review.reviewedBy.hemocioneId": data.reviewedBy.hemocioneId,
        "review.reviewedBy.name": data.reviewedBy.name,
        "review.reviewedBy.email": data.reviewedBy.email,
        "review.numberOfHours": data.numberOfHours,
      },
    },
    { new: true },
  );

  return updatedExternalVolunteer;
}
