import { describe, expect, it } from "vitest";

import * as shared from "../index.js";

describe("pluralize", () => {
  it.each([
    [0, "early participant", "0 early participants"],
    [1, "early participant", "1 early participant"],
    [2, "early participant", "2 early participants"],
  ])("formats %i with the natural participant label", (count, singular, expected) => {
    expect(shared).toHaveProperty("pluralize");

    const pluralize = (shared as typeof shared & {
      pluralize: (value: number, word: string) => string;
    }).pluralize;

    expect(pluralize(count, singular)).toBe(expected);
  });
});
