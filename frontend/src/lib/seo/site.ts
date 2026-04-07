const DEFAULT_DEV_SITE_URL = "http://localhost:3000";

function normalizeUrl(value?: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  return withProtocol.replace(/\/$/, "");
}

export function getSiteUrl(): string {
  const explicitSiteUrl =
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeUrl(process.env.SITE_URL);

  if (explicitSiteUrl) return explicitSiteUrl;

  const vercelUrl =
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeUrl(process.env.VERCEL_URL);

  if (vercelUrl) return vercelUrl;

  return DEFAULT_DEV_SITE_URL;
}

export function getAbsoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString();
}
