import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const pageSource = readFileSync(
  resolve(process.cwd(), "apps/web/src/app/projects/[slug]/page.tsx"),
  "utf8",
);

describe("project detail accessibility", () => {
  it("hides the visual timeline marker from assistive technology", () => {
    expect(pageSource).toMatch(
      /<span aria-hidden="true">\{index <= currentStage \? <CheckCircle2/,
    );
  });

  it("uses count-aware participant copy", () => {
    expect(pageSource).toContain(
      '{pluralize(project.cachedMemberCount, "participant")} on GIWA Testnet',
    );
  });
});
