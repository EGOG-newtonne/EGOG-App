import type { MetadataRoute } from "next";

const baseUrl = "https://egog.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/projects/vietnam-brick",
    "/projects/jeju-erw",
    "/rwa-pools/vietnam-brick",
    "/rwa-pools/jeju-erw",
    "/rwa-pools/solar-mobility",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/projects/") ? 0.8 : 0.6,
    url: `${baseUrl}${route}`,
  }));
}
