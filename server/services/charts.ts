import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)
import { getCalledQueueParticipants } from "./queueParticipants";

export type DatasetTypes = "line" | "candlestick"
type CandlestickSet = {
  timestamp: string,
  open: number,
  high: number,
  low: number,
  close: number
}
type LineSet = {
  x: string,
  y: number
}

export async function getDatasets(queuesId: string[], datasets: DatasetTypes[], params: { startedAt: string, endedAt: string, intervalMin: number }) {
  const dataset: Record<any, any> = {}

  const queueParticipantsPromises = queuesId.map((queueId) => getCalledQueueParticipants(queueId));
  const queueParticipants = (await Promise.all(queueParticipantsPromises)).flat();

  const { startedAt, endedAt, intervalMin } = params
  const intervals: string[][] = []
  let endInterval = dayjs(startedAt);
  while (endInterval < dayjs(endedAt)) {
    const startInterval = endInterval
    endInterval = dayjs(endInterval).add(intervalMin, 'm')
    intervals.push([startInterval.toISOString(), endInterval.toISOString()])
  }

  const donationIntervals = intervals.reduce((acc: Record<string, number>, interval) => {
    const [intervalStart, _] = interval
    acc[intervalStart] = 0
    return acc
  }, {})

  const donationsByInterval = queueParticipants.reduce((acc: Record<string, any>, queueParticipant) => {
    const { calledAt } = queueParticipant
    const intervalBetween = intervals.find(interval => {
      const isBetween = dayjs(calledAt).isBetween(interval[0], interval[1])
      if (isBetween) {
        return interval
      }
    })

    if (intervalBetween) {
      const [intervalStart, _] = intervalBetween
      acc[intervalStart] += 1
    }
    return acc
  }, donationIntervals)

  if (datasets.includes('line')) {
    const lineDataset: LineSet[] = Object.entries(donationIntervals).map(([x, y]) => {
      return { x, y }
    })
    dataset['line'] = lineDataset
  }

  if (datasets.includes('candlestick')) {
    const candlestickDataset = [{
      timestamp: startedAt,
      open: 0,
      high: 0,
      low: 0,
      close: 0
    }]

    Object.entries(donationsByInterval).reduce((acc, [timestamp, donationsCount], currentIndex) => {
      const previousCandlestick = acc[currentIndex]

      acc.push({
        timestamp,
        open: previousCandlestick.close,
        high: Math.max(previousCandlestick.close, donationsCount),
        low: Math.min(previousCandlestick.close, donationsCount),
        close: donationsCount,
      })
      return acc
    }, candlestickDataset)
    dataset['candlestick'] = candlestickDataset
  }
  return dataset
}