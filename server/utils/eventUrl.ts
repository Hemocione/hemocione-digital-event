export function getEventUrl(slug: string): string {
  const config = useRuntimeConfig();
  return `${config.public.siteUrl}/event/${slug}`;
}

export function withEventUrl<T extends { slug: string }>(
  event: T,
): T & { url: string } {
  return { ...event, url: getEventUrl(event.slug) };
}

export function withEventUrls<T extends { slug: string }>(
  events: T[],
): Array<T & { url: string }> {
  return events.map(withEventUrl);
}
