/**
 * Extrai o slug da copa do registerDonationUrl do evento.
 *
 * Repassamos apenas o SLUG para o can-donate, nunca a URL inteira: o
 * can-donate remonta a URL a partir da propria config. Trafegar URL arbitraria
 * entre servicos abriria caminho para redirect nao confiavel.
 */
export function extractCompetitionSlug(
  registerDonationUrl?: string | null,
): string | undefined {
  if (!registerDonationUrl) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(registerDonationUrl);
  } catch {
    return undefined;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  const index = segments.indexOf("competition");
  if (index === -1) return undefined;

  return segments[index + 1] || undefined;
}
