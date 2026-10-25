import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private or transactional areas: nothing here belongs in search results.
        disallow: ["/admin", "/dashboard", "/api", "/auth", "/login", "/pending", "/reset-password", "/forgot-password", "/join/complete"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
