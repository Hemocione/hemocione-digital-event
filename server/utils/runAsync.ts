import { waitUntil } from "@vercel/functions";

export function runAsync(promise: Promise<unknown>) {
  waitUntil(promise);
}
