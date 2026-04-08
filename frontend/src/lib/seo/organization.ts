import footerLogo from "@/assets/logo/logo-2.png";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/seo/site";

const ORGANIZATION_NAME = "Topupio";
const ORGANIZATION_DESCRIPTION =
  "Elevate your gaming experience with the fastest and most reliable top-up service. Secure, instant, and trusted by thousands.";
const SUPPORT_EMAIL = "support@topupio.com";
const SUPPORT_PHONE = "+91 77362 05493";

function readOptionalUrl(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function getOrganizationSchema() {
  const socialLinks = [
    readOptionalUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
    readOptionalUrl(process.env.NEXT_PUBLIC_TELEGRAM_URL),
  ].filter((value): value is string => Boolean(value));

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION_NAME,
    url: getSiteUrl(),
    logo: new URL(footerLogo.src, getSiteUrl()).toString(),
    description: ORGANIZATION_DESCRIPTION,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SUPPORT_EMAIL,
        telephone: SUPPORT_PHONE,
        url: getAbsoluteUrl("/contact"),
        areaServed: "IN",
        availableLanguage: ["en"],
      },
    ],
    sameAs: socialLinks.length > 0 ? socialLinks : undefined,
  };
}
