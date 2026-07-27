import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

function read(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("persistent application shell", () => {
  it("renders AppHeader only from the root layout", () => {
    expect(read("./layout.tsx")).toContain("<AppHeader />");

    for (const route of [
      "./page.tsx",
      "./projects/[slug]/page.tsx",
      "./participate/[slug]/page.tsx",
      "./me/page.tsx",
    ]) {
      expect(read(route)).not.toContain("<AppHeader");
      expect(read(route)).not.toContain('components/app-header');
    }
  });

  it("provides the nearest loading boundary for every primary route", () => {
    for (const loadingRoute of [
      "./loading.tsx",
      "./projects/[slug]/loading.tsx",
      "./participate/[slug]/loading.tsx",
      "./me/loading.tsx",
      "./privacy/loading.tsx",
      "./terms/loading.tsx",
    ]) {
      expect(read(loadingRoute)).toContain("<RouteSkeleton");
    }
  });
});
