import type { MetadataRoute } from "next";
import { STORE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/checkout", "/pedido/", "/api/"],
      },
    ],
    sitemap: `${STORE.siteUrl}/sitemap.xml`,
  };
}