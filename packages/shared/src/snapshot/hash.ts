import { keccak256, stringToHex, type Hex } from "viem";

import { canonicalizeSnapshot } from "./canonicalize.js";

export function hashSnapshot(input: unknown): Hex {
  return keccak256(stringToHex(canonicalizeSnapshot(input)));
}
