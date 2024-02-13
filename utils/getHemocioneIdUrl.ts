export function getHemocioneIdUrl(redirectUrl: string): string {
  const config = useRuntimeConfig();

  const encodedRedirectUrl = encodeURIComponent(redirectUrl);
  return `${config.public.hemocioneIdUrl}?redirect=${encodedRedirectUrl}`;
}
