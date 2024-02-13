import dayjs from "dayjs";

const MINIMUM_HOURS_DISTANCE_TO_START = 1;

export function eventStartedOrCloseTo(startAt: string) {
  const maximumStartAtDate = dayjs(startAt).subtract(
    MINIMUM_HOURS_DISTANCE_TO_START,
    "hour",
  );
  const now = dayjs();

  return now.isAfter(maximumStartAtDate);
}
