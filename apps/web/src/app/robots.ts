import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: ["/api/", "/me", "/participate/"],
      userAgent: "*",
    },
    sitemap: "https://egog.io/sitemap.xml",
  };
}
