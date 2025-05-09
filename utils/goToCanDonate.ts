type SlugType = "event-flow-schedule" | "event-ticket-adhoc";

export function goToCanDonate(
  slugType: SlugType,
  eventSlug: string,
  startAt: string | undefined
) {
  const config = useRuntimeConfig();
  const baseUrl = config.public.canDonateIntegrationUrl;

  if (!baseUrl) {
   console.error("Missing canDonateIntegrationUrl in runtime configuration");
   return;
 }

  const eventDate = startAt ?? "";
  const url = `${baseUrl}/${slugType}?date=${encodeURIComponent(eventDate)}&eventSlug=${eventSlug}`;

  navigateTo(url, { external: true });
}