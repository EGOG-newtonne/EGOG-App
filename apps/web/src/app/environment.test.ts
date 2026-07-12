import { expect, test } from "vitest";

test("web tests run in jsdom", () => {
  expect(document.createElement("main")).toBeInstanceOf(HTMLElement);
});

