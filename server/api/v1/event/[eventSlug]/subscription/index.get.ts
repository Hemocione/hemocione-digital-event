import { assertSecretAuth } from "~/server/services/auth";
import { getEventBySlug } from "~/server/services/event";
import { listEventSubscriptions } from "~/server/services/subscription";

const TAKE_PADRAO = 100;
const TAKE_MAXIMO = 500;

function lerInteiro(
  valor: unknown,
  padrao: number,
  minimo: number,
  maximo: number,
) {
  if (valor === undefined || valor === "") return padrao;

  const numero = Number(valor);
  if (!Number.isInteger(numero)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid pagination",
    });
  }

  return Math.min(Math.max(numero, minimo), maximo);
}

/**
 * Lista as inscricoes de um evento.
 *
 * So havia as rotas "mine", do proprio usuario: quem opera um evento
 * presencial nao tinha como conferir quem se inscreveu em cada horario sem
 * consultar o banco na mao.
 */
export default defineEventHandler(async (event) => {
  assertSecretAuth(event);

  const eventSlug = String(getRouterParam(event, "eventSlug"));

  const foundEvent = await getEventBySlug(eventSlug);
  if (!foundEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: "Event not found",
    });
  }

  const query = getQuery(event);

  return await listEventSubscriptions(eventSlug, {
    ...(query.scheduleId ? { scheduleId: String(query.scheduleId) } : {}),
    take: lerInteiro(query.take, TAKE_PADRAO, 1, TAKE_MAXIMO),
    skip: lerInteiro(query.skip, 0, 0, Number.MAX_SAFE_INTEGER),
  });
});
