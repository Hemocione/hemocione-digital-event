export type HemarcioContext = {
  product: "eventos";
  page: string;
  eventSlug?: string;
};

// share/* sao paginas de imagem OG; /captation/* continua com a bolha (doador)
const STAFF_PATH =
  /^\/event\/[^/]+\/(backoffice|volunteer|bloodbag|share)(\/|$)|^\/chart(\/|$)/;
const SLUG = /^[a-z0-9-]{1,120}$/;

export const isHemarcioEnabled = (enabled: string | boolean | undefined) =>
  enabled === true || enabled === "true";

export const shouldShowHemarcioBubble = (input: {
  enabled: string | boolean | undefined;
  iframed: boolean;
  path: string;
}): boolean => {
  if (!isHemarcioEnabled(input.enabled)) return false;
  if (input.iframed) return false;
  return !STAFF_PATH.test(input.path);
};

export const hemarcioContextFor = (
  path: string,
  params: Record<string, unknown>,
): HemarcioContext => {
  const slug = params.eventSlug;
  if (typeof slug === "string" && SLUG.test(slug)) {
    return { product: "eventos", page: path, eventSlug: slug };
  }
  return { product: "eventos", page: path };
};
