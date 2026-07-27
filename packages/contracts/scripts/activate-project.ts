import { network } from "hardhat";

import {
  getAddress,
  keccak256,
  stringToBytes,
  type Address,
  type Hex,
} from "viem";

const CHAIN_ID = 91_342;
const ADMIN_ROLE = `0x${"00".repeat(32)}` as Hex;
const RELAYER_ROLE = keccak256(stringToBytes("RELAYER_ROLE"));

function requireAddress(name: string): Address {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return getAddress(value);
}

const projectSlug = process.env.PROJECT_SLUG;
if (!projectSlug?.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) {
  throw new Error("PROJECT_SLUG must be a lowercase kebab-case slug");
}

const contractAddress = requireAddress("PARTICIPATION_CONTRACT_ADDRESS");
const expectedAdmin = requireAddress("GIWA_ADMIN_ADDRESS");
const relayerAddress = requireAddress("GIWA_RELAYER_ADDRESS");
if (expectedAdmin === relayerAddress) {
  throw new Error("Admin and Relayer addresses must be different");
}

const { viem } = await network.create({
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

const bytecode = await publicClient.getBytecode({ address: contractAddress });
if (!bytecode || bytecode === "0x") {
  throw new Error("Participation contract bytecode was not found");
}

const contract = await viem.getContractAt("ParticipationBadge", contractAddress);
const projectId = keccak256(stringToBytes(projectSlug));
const [adminHasRole, relayerHasRole, relayerHasAdmin, activeBefore, memberCountBefore] =
  await Promise.all([
    contract.read.hasRole([ADMIN_ROLE, expectedAdmin]),
    contract.read.hasRole([RELAYER_ROLE, relayerAddress]),
    contract.read.hasRole([ADMIN_ROLE, relayerAddress]),
    contract.read.projectActive([projectId]),
    contract.read.projectMemberCount([projectId]),
  ]);

if (!adminHasRole) throw new Error("Configured Admin does not hold DEFAULT_ADMIN_ROLE");
if (!relayerHasRole) throw new Error("Configured Relayer does not hold RELAYER_ROLE");
if (relayerHasAdmin) throw new Error("Relayer unexpectedly holds DEFAULT_ADMIN_ROLE");
if (memberCountBefore !== 0n && !activeBefore) {
  throw new Error("Inactive project has a non-zero member counter");
}

let transactionHash: Hex | null = null;
let blockNumber: bigint | null = null;
if (!activeBefore) {
  transactionHash = await contract.write.setProjectActive([projectId, true], {
    account: adminClient.account,
  });
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: transactionHash,
    confirmations: 1,
  });
  if (receipt.status !== "success") {
    throw new Error(`Project activation reverted for ${projectSlug}`);
  }
  blockNumber = receipt.blockNumber;
}

const [activeAfter, memberCountAfter, relayerAdminAfter] = await Promise.all([
  contract.read.projectActive(
    [projectId],
    blockNumber === null ? undefined : { blockNumber },
  ),
  contract.read.projectMemberCount(
    [projectId],
    blockNumber === null ? undefined : { blockNumber },
  ),
  contract.read.hasRole(
    [ADMIN_ROLE, relayerAddress],
    blockNumber === null ? undefined : { blockNumber },
  ),
]);
if (!activeAfter) throw new Error("Project did not become active");
if (memberCountAfter !== memberCountBefore) {
  throw new Error("Project activation unexpectedly changed the member counter");
}
if (relayerAdminAfter) throw new Error("Relayer gained Admin role during activation");

console.log(
  `PROJECT_ACTIVATION_RESULT=${JSON.stringify({
    chainId,
    contractAddress,
    projectSlug,
    projectId,
    activeBefore,
    activeAfter,
    memberCount: memberCountAfter.toString(),
    transactionHash,
    blockNumber: blockNumber?.toString() ?? null,
    adminAddress: expectedAdmin,
    relayerAddress,
  })}`,
);
