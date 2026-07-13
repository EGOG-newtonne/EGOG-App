import { decodeEventLog, parseAbiItem, type Hex } from "viem";

const explorerBaseUrl = "https://sepolia-explorer.giwa.io";
const event = parseAbiItem(
  "event ParticipationRecorded(address indexed participant, bytes32 indexed projectId, uint256 indexed tokenId, uint256 memberNumber, bytes32 snapshotHash, uint256 snapshotVersion, string snapshotURI, string tokenURI, uint256 joinedAt)",
);

type ExplorerLog = {
  address: { hash: string };
  data: Hex;
  index: number;
  topics: [Hex, ...Hex[]];
};

async function main() {
  const transactionHash = process.argv[2] as Hex | undefined;

  if (!transactionHash || !/^0x[0-9a-fA-F]{64}$/.test(transactionHash)) {
    throw new Error("Usage: pnpm verify:participation-event <transaction-hash>");
  }

  const [transactionResponse, logsResponse] = await Promise.all([
    fetch(`${explorerBaseUrl}/api/v2/transactions/${transactionHash}`),
    fetch(`${explorerBaseUrl}/api/v2/transactions/${transactionHash}/logs`),
  ]);

  if (!transactionResponse.ok || !logsResponse.ok) {
    throw new Error(
      `GIWA Explorer request failed (${transactionResponse.status}/${logsResponse.status})`,
    );
  }

  const transaction = (await transactionResponse.json()) as {
    block_number: number;
    hash: Hex;
    status: string;
  };
  const logs = (await logsResponse.json()) as { items: ExplorerLog[] };

  const decoded = logs.items.flatMap((log) => {
    try {
      const parsed = decodeEventLog({
        abi: [event],
        data: log.data,
        topics: log.topics,
      });
      if (parsed.eventName !== "ParticipationRecorded") return [];
      return [{ log, args: parsed.args }];
    } catch {
      return [];
    }
  });

  if (decoded.length !== 1) {
    throw new Error(`Expected one ParticipationRecorded event, found ${decoded.length}`);
  }

  const [{ log, args }] = decoded;
  const joinedAt = new Date(Number(args.joinedAt) * 1_000);

  console.log(
    JSON.stringify(
      {
        participantWallet: args.participant,
        projectId: args.projectId,
        tokenId: args.tokenId,
        memberNumber: args.memberNumber,
        snapshotHash: args.snapshotHash,
        snapshotVersion: args.snapshotVersion,
        snapshotUri: args.snapshotURI,
        tokenUri: args.tokenURI,
        joinedAt: joinedAt.toISOString(),
        transactionHash: transaction.hash,
        blockNumber: transaction.block_number,
        logIndex: log.index,
        status: transaction.status,
        contractAddress: log.address.hash,
      },
      (_key, value) => (typeof value === "bigint" ? value.toString() : value),
      2,
    ),
  );
}

void main();
