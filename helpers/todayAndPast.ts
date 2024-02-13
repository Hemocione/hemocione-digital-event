export function isTodayAndPast(date: string) {
  const startAt = new Date(date);
  const today = new Date();

  const isToday = startAt.getDate() === today.getDate() &&
    startAt.getMonth() === today.getMonth() &&
    startAt.getFullYear() === today.getFullYear();

  const hasStarted = startAt.getTime() < today.getTime();

  return (isToday && hasStarted);
}