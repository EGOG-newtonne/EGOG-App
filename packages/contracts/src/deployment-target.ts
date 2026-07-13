export type DeploymentTarget = {
  network: "giwaSepolia" | "hardhatMainnet";
  chainType: "op" | "l1";
  dryRun: boolean;
};

export function resolveDeploymentTarget(
  value: string | undefined,
): DeploymentTarget {
  if (value === undefined || value === "giwaSepolia") {
    return { network: "giwaSepolia", chainType: "op", dryRun: false };
  }

  if (value === "hardhatMainnet") {
    return { network: "hardhatMainnet", chainType: "l1", dryRun: true };
  }

  throw new Error(
    "DEPLOYMENT_NETWORK must be giwaSepolia or hardhatMainnet",
  );
}
