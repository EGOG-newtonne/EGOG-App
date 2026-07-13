import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveDeploymentTarget } from "../src/deployment-target.js";

describe("deployment target", () => {
  it("keeps GIWA Sepolia as the default deployment target", () => {
    assert.deepEqual(resolveDeploymentTarget(undefined), {
      network: "giwaSepolia",
      chainType: "op",
      dryRun: false,
    });
  });

  it("allows an explicit isolated Hardhat deployment dry-run", () => {
    assert.deepEqual(resolveDeploymentTarget("hardhatMainnet"), {
      network: "hardhatMainnet",
      chainType: "l1",
      dryRun: true,
    });
  });

  it("rejects unknown deployment targets", () => {
    assert.throws(
      () => resolveDeploymentTarget("production-mainnet"),
      /DEPLOYMENT_NETWORK must be giwaSepolia or hardhatMainnet/,
    );
  });
});
