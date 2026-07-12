import { expect, test } from "vitest";

test("server tests run in Node", () => {
  expect(Object.hasOwn(globalThis, "document")).toBe(false);
  expect(process.release.name).toBe("node");
});
