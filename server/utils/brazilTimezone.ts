/**
 * Utility functions for handling Brazil timezone (UTC-3)
 * Brazil does not observe daylight saving time since 2019
 */

/**
 * Get current date/time in Brazil timezone
 */
export function getBrazilNow(): Date {
  const now = new Date();
  // Brazil is UTC-3, so we need to subtract 3 hours from UTC
  const brazilTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brazilTime;
}

/**
 * Get start of tomorrow in Brazil timezone (00:00:00)
 */
export function getBrazilTomorrowStart(): Date {
  const brazilNow = getBrazilNow();
  const tomorrow = new Date(brazilNow);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Convert back to UTC for database storage
  return new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000);
}

/**
 * Get end of tomorrow in Brazil timezone (23:59:59.999)
 */
export function getBrazilTomorrowEnd(): Date {
  const brazilNow = getBrazilNow();
  const tomorrow = new Date(brazilNow);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  // Convert back to UTC for database storage
  return new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000);
}

/**
 * Get start of today in Brazil timezone (00:00:00)
 */
export function getBrazilTodayStart(): Date {
  const brazilNow = getBrazilNow();
  const today = new Date(brazilNow);
  today.setHours(0, 0, 0, 0);

  // Convert back to UTC for database storage
  return new Date(today.getTime() + 3 * 60 * 60 * 1000);
}

/**
 * Format a date to Brazil timezone for display
 */
export function formatBrazilDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

/**
 * Format a time to Brazil timezone for display
 */
export function formatBrazilTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}
