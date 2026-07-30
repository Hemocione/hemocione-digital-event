import { extractCompetitionSlug } from "./competitionSlug";

type SlugType = "event-flow-schedule" | "event-ticket-adhoc";

export function goToCanDonate(
  slugType: SlugType,
  eventSlug: string,
  startAt: string | undefined,
  registerDonationUrl?: string | null,
) {
  if (import.meta.server) return;

  const userStore = useUserStore();
  if (!userStore.token) return;

  const config = useRuntimeConfig();
  const baseUrl = config.public.canDonateIntegrationUrl;

  if (!baseUrl) return;

  const eventDate = startAt ?? "";

  const url = new URL(`${baseUrl}/${slugType}`);
  url.searchParams.set("eventDate", eventDate);
  url.searchParams.set("eventSlug", eventSlug);
  url.searchParams.set("token", userStore.token);
  url.searchParams.set("iframed", String(userStore.iframed));

  // Evento com copa relacionada: o can-donate usa isso para oferecer
  // "Registrar participacao" a quem for reprovado na pre-triagem. Evento sem
  // copa nao manda o param, e o fluxo segue identico ao anterior.
  const competitionSlug = extractCompetitionSlug(registerDonationUrl);
  if (competitionSlug) url.searchParams.set("competitionSlug", competitionSlug);

  return navigateTo(url.toString(), { external: true });
}
