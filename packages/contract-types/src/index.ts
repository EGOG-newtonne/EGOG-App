import { parseAbi, type Address } from "viem";

export const contractTypesPackageName = "@egog/contract-types";

export const participationBadgeAbi = parseAbi([
  "error AccessControlUnauthorizedAccount(address account, bytes32 neededRole)",
  "error AlreadyParticipated(bytes32 projectId, address participant)",
  "error InvalidSigner(address recovered, address expected)",
  "error NonceAlreadyUsed(address participant, uint256 nonce)",
  "error ProjectInactive(bytes32 projectId)",
  "error SignatureExpired(uint256 deadline)",
  "error UnexpectedMemberNumber(uint256 expected, uint256 provided)",
  "event ParticipationRecorded(address indexed participant, bytes32 indexed projectId, uint256 indexed tokenId, uint256 memberNumber, bytes32 snapshotHash, uint256 snapshotVersion, string snapshotURI, string tokenURI, uint256 joinedAt)",
  "function hasParticipated(bytes32 projectId, address participant) view returns (bool)",
  "function joinBySig(address participant, bytes32 projectId, bytes32 snapshotHash, uint256 snapshotVersion, string snapshotURI, uint256 memberNumber, string tokenURI, uint256 nonce, uint256 deadline, bytes signature)",
  "function locked(uint256 tokenId) view returns (bool)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function participations(uint256 tokenId) view returns (bytes32 projectId, uint256 memberNumber, bytes32 snapshotHash, uint256 snapshotVersion, string snapshotURI, uint256 joinedAt)",
  "function projectActive(bytes32 projectId) view returns (bool)",
  "function projectMemberCount(bytes32 projectId) view returns (uint256)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "function tokenURI(uint256 tokenId) view returns (string)",
]);

export const participationBadgeAddresses = {
  development: "0x4f0D8b9A1624177cF21373Ab184d053443489FD5",
  demo: "0xE97Cf932E2b8C87bEBAb27b8EcA8EFEc71F29E46",
} as const satisfies Record<"development" | "demo", Address>;
