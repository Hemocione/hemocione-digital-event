import dayjs from "dayjs";

export function isEventAlreadyStarted(startAt: string) {
  const startAtDate = new Date(startAt);
  const now = new Date();

  return (
    dayjs(now).isAfter(startAtDate) || dayjs(now).isSame(startAtDate, "day")
  );
}
