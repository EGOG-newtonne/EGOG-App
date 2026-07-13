import { network } from "hardhat";
import { readFile } from "node:fs/promises";

import {
  getAddress,
  keccak256,
  stringToBytes,
  type Abi,
  type Address,
  type Hex,
} from "viem";

import { resolveDeploymentTarget } from "../src/deployment-target.js";

const CHAIN_ID = 91_342;
const PROJECT_SLUG = "vietnam-brick";

async function waitForContractCode(
  publicClient: Awaited<ReturnType<typeof viem.getPublicClient>>,
  address: Address,
) {
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const bytecode = await publicClient.getBytecode({ address });
    if (bytecode !== undefined && bytecode !== "0x") return;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error("Contract bytecode was not readable after deployment receipt");
}

function requireAddress(name: string): Address {
  const value = process.env[name];
  if (value === undefined || value.length === 0) {
    throw new Error(`${name} is required`);
  }

  return getAddress(value);
}

const deploymentEnvironment = process.env.DEPLOYMENT_ENV;
if (deploymentEnvironment !== "development" && deploymentEnvironment !== "demo") {
  throw new Error("DEPLOYMENT_ENV must be development or demo");
}

const expectedAdmin = requireAddress("GIWA_ADMIN_ADDRESS");
const relayerAddress = requireAddress("GIWA_RELAYER_ADDRESS");
const existingContractAddress = process.env.PARTICIPATION_CONTRACT_ADDRESS;

const deploymentTarget = resolveDeploymentTarget(
  process.env.DEPLOYMENT_NETWORK,
);

const { viem } = deploymentTarget.dryRun
  ? await network.create("hardhatMainnet")
  : await network.create({
      network: "giwaSepolia",
      chainType: "op",
    });
const publicClient = await viem.getPublicClient();
const [adminClient] = await viem.getWalletClients();

const chainId = await publicClient.getChainId();
if (chainId !== CHAIN_ID) {
  throw new Error(`Expected GIWA Sepolia chain ${CHAIN_ID}, received ${chainId}`);
}
if (getAddress(adminClient.account.address) !== expectedAdmin) {
  throw new Error("Configured private key does not match GIWA_ADMIN_ADDRESS");
}

let contractAddress: Address;
let deploymentTransactionHash: Hex | null = null;
let deploymentBlockNumber: bigint | null = null;

if (existingContractAddress !== undefined && existingContractAddress.length > 0) {
  contractAddress = getAddress(existingContractAddress);
  const knownDeploymentHash = process.env.DEPLOYMENT_TRANSACTION_HASH as
    | Hex
    | undefined;
  if (knownDeploymentHash !== undefined) {
    const receipt = await publicClient.getTransactionReceipt({
      hash: knownDeploymentHash,
    });
    if (
      receipt.status !== "success" ||
      receipt.contractAddress === null ||
      getAddress(receipt.contractAddress) !== contractAddress
    ) {
      throw new Error("Existing deployment receipt does not match contract address");
    }
    deploymentTransactionHash = knownDeploymentHash;
    deploymentBlockNumber = receipt.blockNumber;
  }
} else {
  const artifact = JSON.parse(
    await readFile(
      new URL(
        "../artifacts/contracts/ParticipationBadge.sol/ParticipationBadge.json",
        import.meta.url,
      ),
      "utf8",
    ),
  ) as { abi: Abi; bytecode: Hex };
  deploymentTransactionHash = await adminClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [expectedAdmin, relayerAddress],
  });
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: deploymentTransactionHash,
    confirmations: 1,
  });
  if (receipt.status !== "success" || receipt.contractAddress === null) {
    throw new Error("ParticipationBadge deployment reverted");
  }
  contractAddress = getAddress(receipt.contractAddress);
  deploymentBlockNumber = receipt.blockNumber;
}

await waitForContractCode(publicClient, contractAddress);
const contract = await viem.getContractAt("ParticipationBadge", contractAddress);
const projectId = keccak256(stringToBytes(PROJECT_SLUG));
let activationHash: Hex | null = null;
let activationBlockNumber: bigint | null = null;
if (!(await contract.read.projectActive([projectId]))) {
  activationHash = await contract.write.setProjectActive([projectId, true], {
    account: adminClient.account,
  });
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: activationHash,
    confirmations: 1,
  });
  if (receipt.status !== "success") {
    throw new Error("Vietnam Brick project activation reverted");
  }
  activationBlockNumber = receipt.blockNumber;
} else if (process.env.ACTIVATION_TRANSACTION_HASH !== undefined) {
  activationHash = process.env.ACTIVATION_TRANSACTION_HASH as Hex;
  const receipt = await publicClient.getTransactionReceipt({ hash: activationHash });
  if (receipt.status !== "success" || getAddress(receipt.to ?? "0x0") !== contractAddress) {
    throw new Error("Existing activation receipt does not match contract address");
  }
  activationBlockNumber = receipt.blockNumber;
}

const relayerRole = keccak256(stringToBytes("RELAYER_ROLE"));
let verification = {
  hasBytecode: false,
  hasAdminRole: false,
  hasRelayerRole: false,
  projectActive: false,
};
for (let attempt = 0; attempt < 15; attempt += 1) {
  const [bytecode, hasAdminRole, hasRelayerRole, projectActive] =
    await Promise.all([
      publicClient.getBytecode({ address: contractAddress }),
      contract.read.hasRole([`0x${"00".repeat(32)}`, expectedAdmin]),
      contract.read.hasRole([relayerRole, relayerAddress]),
      contract.read.projectActive([projectId]),
    ]);
  verification = {
    hasBytecode: bytecode !== undefined && bytecode !== "0x",
    hasAdminRole,
    hasRelayerRole,
    projectActive,
  };
  if (Object.values(verification).every(Boolean)) break;
  await new Promise((resolve) => setTimeout(resolve, 1_000));
}

if (!Object.values(verification).every(Boolean)) {
  throw new Error(
    `Post-deployment contract verification failed: ${JSON.stringify(verification)}`,
  );
}

console.log(
  `DEPLOYMENT_RESULT=${JSON.stringify({
    environment: deploymentEnvironment,
    network: deploymentTarget.network,
    dryRun: deploymentTarget.dryRun,
    chainId,
    contractAddress,
    deploymentTransactionHash,
    deploymentBlockNumber: deploymentBlockNumber?.toString() ?? null,
    projectId,
    activationTransactionHash: activationHash,
    activationBlockNumber: activationBlockNumber?.toString() ?? null,
    adminAddress: expectedAdmin,
    relayerAddress,
  })}`,
);
