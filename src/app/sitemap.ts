import type { MetadataRoute } from "next";
import { STORE } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${STORE.siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${STORE.siteUrl}/cardapio`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    {
      url: `${STORE.siteUrl}/delivery-junqueiropolis`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}