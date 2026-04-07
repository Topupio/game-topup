import type { MetadataRoute } from "next";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/account/",
        "/orders/",
        "/login",
        "/signup",
        "/search",
        "/check-email",
        "/resend-verification",
        "/verify-email/",
      ],
    },
    sitemap: getAbsoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
