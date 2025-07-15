type SlugType = "event-flow-schedule" | "event-ticket-adhoc";

export function goToCanDonate(
  slugType: SlugType,
  eventSlug: string,
  startAt: string | undefined,
) {
  if (import.meta.server) return;

  const userStore = useUserStore();
  if (!userStore.token) return;

  const config = useRuntimeConfig();
  const baseUrl = config.public.canDonateIntegrationUrl;

  if (!baseUrl) return;

  const eventDate = startAt ?? "";
  const url = `${baseUrl}/${slugType}?eventDate=${encodeURIComponent(eventDate)}&eventSlug=${eventSlug}&token=${userStore.token}&iframed=${userStore.iframed}`;

  return navigateTo(url, { external: true });
}
