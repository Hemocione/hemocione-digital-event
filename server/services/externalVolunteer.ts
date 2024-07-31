import { ExternalVolunteer } from "../models/externalVolunteer";
import type { HemocioneUserAuthTokenData } from "./auth";
import { incrementEventExternalVolunteersOccupiedSlots } from "./event";
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

export async function getUserEventSubscription(
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
  const externalVolunteer = new ExternalVolunteer({
    eventSlug,
    hemocioneId: user.id,
    name: getCleanFullName(user.givenName, user.surName),
    email: user.email,
    phone: user.phone,
    document: user.document,
  });

  // todo: wrap in transaction
  await externalVolunteer.save();
  await incrementEventExternalVolunteersOccupiedSlots(
    eventSlug,
    externalVolunteer._id.toString(),
    1,
  );

  return externalVolunteer.toObject();
}

export async function deleteSubscription(
  eventSlug: string,
  hemocioneId: string,
) {
  const externalVolunteer = await ExternalVolunteer.findOne({
    eventSlug,
    hemocioneId,
    deletedAt: null,
  });
  if (!externalVolunteer) return null;
  externalVolunteer.deletedAt = new Date();

  // todo: wrap in transaction
  await externalVolunteer.save();
  await incrementEventExternalVolunteersOccupiedSlots(
    eventSlug,
    externalVolunteer._id.toString(),
    -1,
  );

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
  if (!externalVolunteer) return null;
  externalVolunteer.deletedAt = new Date();

  // todo: wrap in transaction
  await externalVolunteer.save();
  await incrementEventExternalVolunteersOccupiedSlots(
    eventSlug,
    externalVolunteer._id.toString(),
    -1,
  );

  return externalVolunteer.toObject();
}
