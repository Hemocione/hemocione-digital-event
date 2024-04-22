import _ from "lodash";
import { getDatasets, type DatasetType } from "~/server/services/charts";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const queueIds = _.castArray(query.queueIds);
  const startedAt = new Date(query.startedAt as string).toISOString();
  const endedAt = new Date(query.endedAt as string).toISOString();
  const intervalMin = Number(query.intervalMin);
  const selectedDatasets = (query.datasets as string).split(
    ",",
  ) as DatasetType[];

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
