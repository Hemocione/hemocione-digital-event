// base64 encode the params to use as a cache key
export function getCacheKeyFromParams(params: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(params)).toString("base64");
}