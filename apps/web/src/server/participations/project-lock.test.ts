import { describe, expect, it } from "vitest";

import { projectAdvisoryLockId } from "./project-lock";

describe("projectAdvisoryLockId", () => {
  it("is deterministic per project and distinct across projects", () => {
    const vietnam = projectAdvisoryLockId("vietnam-brick-001");
    expect(vietnam).toBe(projectAdvisoryLockId("vietnam-brick-001"));
    expect(vietnam).not.toBe(projectAdvisoryLockId("solar-mobility-001"));
    expect(typeof vietnam).toBe("bigint");
  });
});
