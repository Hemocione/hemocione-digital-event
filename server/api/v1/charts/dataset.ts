import _ from "lodash";
import {
  datasetTypes,
  getDatasets,
  type DatasetType,
} from "~/server/services/charts";

/**
 * Datasets agregados de fila para os graficos operacionais.
 *
 * Os cinco parametros de query sao obrigatorios, mas nenhum era validado: sem
 * `startedAt`/`endedAt`, `new Date(undefined).toISOString()` lancava RangeError;
 * sem `datasets`, `undefined.split(",")` lancava TypeError. Nos dois casos a
 * resposta saia 500. A guarda que existia (`if (!queueIds)`) era codigo morto,
 * porque `_.castArray(undefined)` devolve `[undefined]`, que e truthy.
 */
function lerData(valor: unknown, nome: string): string {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw createError({ statusCode: 400, statusMessage: `Missing ${nome}` });
  }

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${nome}` });
  }

  return data.toISOString();
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const queueIds = _.castArray(query.queueIds)
    .filter((id): id is string => typeof id === "string" && id.trim() !== "")
    .map((id) => id.trim());

  if (queueIds.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Missing queueIds" });
  }

  const startedAt = lerData(query.startedAt, "startedAt");
  const endedAt = lerData(query.endedAt, "endedAt");

  if (new Date(endedAt) <= new Date(startedAt)) {
    throw createError({
      statusCode: 400,
      statusMessage: "endedAt must be after startedAt",
    });
  }

  const intervalMin = Number(query.intervalMin);
  // Intervalo zero ou negativo faria o laco que monta os intervalos em
  // getDatasets nunca avancar.
  if (!Number.isInteger(intervalMin) || intervalMin <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid intervalMin",
    });
  }

  if (typeof query.datasets !== "string" || query.datasets.trim() === "") {
    throw createError({ statusCode: 400, statusMessage: "Missing datasets" });
  }

  const selectedDatasets = query.datasets
    .split(",")
    .map((tipo) => tipo.trim())
    .filter(Boolean);

  const invalido = selectedDatasets.find(
    (tipo) => !datasetTypes.includes(tipo as DatasetType),
  );
  if (invalido || selectedDatasets.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid datasets. Use: ${datasetTypes.join(", ")}`,
    });
  }

  return await getDatasets(queueIds, selectedDatasets as DatasetType[], {
    startedAt,
    endedAt,
    intervalMin,
  });
});
