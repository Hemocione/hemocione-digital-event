import { getDatasets, type DatasetTypes } from "~/server/services/charts";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const queueIds = (query.queueIds as string).split(",");
  const startedAt = new Date(query.startedAt as string).toISOString();
  const endedAt = new Date(query.endedAt as string).toISOString();
  const intervalMin = Number(query.intervalMin);
  const selectedDatasets = (query.datasets as string).split(
    ",",
  ) as DatasetTypes[];

  if (!queueIds) {
    throw new Error("queueIds is required");
  }

  const datasets = await getDatasets(queueIds, selectedDatasets, {
    startedAt,
    endedAt,
    intervalMin,
  });
  return datasets;
});
