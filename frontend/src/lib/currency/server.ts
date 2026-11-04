import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import geoip from "geoip-lite";
import { CURRENCY_COOKIE, resolveDisplayCurrency } from "./displayCurrency";
// Nginx overwrites X-Real-IP with the connection address. No remote IP API.
export const getDisplayCurrency = cache(async (): Promise<string> => {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const saved = cookieStore.get(CURRENCY_COOKIE)?.value;
  const ip = requestHeaders.get("x-real-ip")?.trim();
  let country: string | undefined;
  if (ip) {
    try { country = geoip.lookup(ip)?.country; } catch { /* Unknown location: USD. */ }
  }
  return resolveDisplayCurrency(country, saved);
});
