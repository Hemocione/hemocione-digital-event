import { ExternalVolunteer } from "../models/externalVolunteer";
import type { HemocioneUserAuthTokenData } from "./auth";
import { incrementEventExternalVolunteersOccupiedSlots, incrementEventScheduleOccupiedSlots } from "./event";
import { getCleanFullName } from "~/utils/getCleanFullName";

// Função para obter um voluntário externo com base no slug do evento e no ID do usuário
export async function getExternalVolunteer(eventSlug: string, hemocioneId: string) {
  const externalVolunteer = await ExternalVolunteer.findOne({
    eventSlug,
    hemocioneId,
    deletedAt: null,
  }).lean();
  return externalVolunteer;
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
    throw new Error(`Voluntário com hemocioneId "${user.id}" já está registrado para o evento "${eventSlug}".`);
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

