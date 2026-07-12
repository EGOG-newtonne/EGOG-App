import { hashTypedData, type Address, type Hex } from "viem";

import { giwaTestnet } from "../chain/giwa.js";

export const participationTypes = {
  Participation: [
    { name: "participant", type: "address" },
    { name: "projectId", type: "bytes32" },
    { name: "snapshotHash", type: "bytes32" },
    { name: "snapshotVersion", type: "uint256" },
    { name: "snapshotURI", type: "string" },
    { name: "memberNumber", type: "uint256" },
    { name: "tokenURI", type: "string" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

export type ParticipationMessage = {
  participant: Address;
  projectId: Hex;
  snapshotHash: Hex;
  snapshotVersion: bigint;
  snapshotURI: string;
  memberNumber: bigint;
  tokenURI: string;
  nonce: bigint;
  deadline: bigint;
};

function participationDomain(verifyingContract: Address) {
  return {
    name: "EGOG Participation",
    version: "1",
    chainId: giwaTestnet.id,
    verifyingContract,
  } as const;
}

export function buildParticipationTypedData(
  verifyingContract: Address,
  message: ParticipationMessage,
) {
  return {
    domain: participationDomain(verifyingContract),
    types: participationTypes,
    primaryType: "Participation" as const,
    message,
  } as const;
}

export function buildSerializableParticipationTypedData(
  verifyingContract: Address,
  message: ParticipationMessage,
) {
  const typedData = buildParticipationTypedData(verifyingContract, message);

  return {
    ...typedData,
    message: {
      ...message,
      snapshotVersion: message.snapshotVersion.toString(),
      memberNumber: message.memberNumber.toString(),
      nonce: message.nonce.toString(),
      deadline: message.deadline.toString(),
    },
  } as const;
}

export function hashParticipationTypedData(
  verifyingContract: Address,
  message: ParticipationMessage,
) {
  return hashTypedData({
    domain: participationDomain(verifyingContract),
    types: participationTypes,
    primaryType: "Participation",
    message,
  });
}
