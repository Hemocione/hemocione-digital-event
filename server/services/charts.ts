import dayjs from "dayjs";
import { getCalledQueueParticipants } from "./queueParticipants";

const datasetTypes = ["line", "candlestick"] as const;
export type DatasetType = (typeof datasetTypes)[number];
interface CandlestickSet {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
}
interface LineSet {
  x: string;
  y: number;
}

interface DatasetsResponse {
  line?: LineSet[];
  candlestick?: CandlestickSet[];
}

export async function getDatasets(
  queuesId: string[],
  datasets: DatasetType[],
  params: { startedAt: string; endedAt: string; intervalMin: number },
) {
  const dataset: DatasetsResponse = {};

  const queueParticipants = await getCalledQueueParticipants(queuesId);

  const { startedAt, endedAt, intervalMin } = params;
  const intervals: string[][] = [];
  let endInterval = dayjs(startedAt);
  while (endInterval <= dayjs(endedAt)) {
    const startInterval = endInterval;
    endInterval = dayjs(endInterval).add(intervalMin, "m");
    intervals.push([startInterval.toISOString(), endInterval.toISOString()]);
  }

  const donationIntervals = intervals.reduce(
    (acc: Record<string, number>, interval) => {
      const [intervalStart] = interval;
      acc[intervalStart] = 0;
      return acc;
    },
    {},
  );

  const donationsByInterval = queueParticipants.reduce(
    (acc: Record<string, any>, queueParticipant) => {
      const { calledAt } = queueParticipant as { calledAt: Date };
      const intervalBetween = intervals.find((interval) => {
        const start = Date.parse(interval[0]);
        const end = Date.parse(interval[1]);
        const calledAtDate = new Date(calledAt);

        const isBetween =
          calledAtDate.valueOf() >= start.valueOf() &&
          calledAtDate.valueOf() <= end.valueOf();
        if (isBetween) {
          return interval;
        }
        return null;
      });

      if (intervalBetween) {
        const [intervalStart] = intervalBetween;
        acc[intervalStart] += 1;
      }
      return acc;
    },
    donationIntervals,
  );

  if (datasets.includes("line")) {
    const lineDataset: LineSet[] = Object.entries(donationIntervals).map(
      ([x, y]) => {
        return { x, y };
      },
    );
    dataset.line = lineDataset;
  }

  if (datasets.includes("candlestick")) {
    const candlestickDataset: CandlestickSet[] = [
      {
        timestamp: startedAt,
        open: 0,
        high: 0,
        low: 0,
        close: 0,
      },
    ];

    Object.entries(donationsByInterval).reduce(
      (acc, [timestamp, donationsCount], currentIndex) => {
        const previousCandlestick = acc[currentIndex];

        acc.push({
          timestamp,
          open: previousCandlestick.close,
          high: Math.max(previousCandlestick.close, donationsCount),
          low: Math.min(previousCandlestick.close, donationsCount),
          close: donationsCount,
        });
        return acc;
      },
      candlestickDataset,
    );
    dataset.candlestick = candlestickDataset.slice(1); // remove the first element (0, 0, 0, 0);
  }
  return dataset;
}
