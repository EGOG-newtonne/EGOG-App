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

export function buildParticipationTypedData(
  verifyingContract: Address,
  message: ParticipationMessage,
) {
  return {
    domain: {
      name: "EGOG Participation",
      version: "1",
      chainId: giwaTestnet.id,
      verifyingContract,
    },
    types: participationTypes,
    primaryType: "Participation" as const,
    message,
  } as const;
}

export function hashParticipationTypedData(
  verifyingContract: Address,
  message: ParticipationMessage,
) {
  return hashTypedData(buildParticipationTypedData(verifyingContract, message));
}
