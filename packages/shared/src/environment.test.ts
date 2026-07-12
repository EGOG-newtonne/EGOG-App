import { expect, test } from "vitest";

import { sharedPackageName } from "./index.js";

test("shared tests run in Node and load shared exports", () => {
  expect(Object.hasOwn(globalThis, "document")).toBe(false);
  expect(sharedPackageName).toBe("@eogo/shared");
});
