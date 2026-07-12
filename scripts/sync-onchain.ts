import { resolve } from "node:path";

async function main() {
  process.loadEnvFile(resolve(process.argv.find((value) => value.startsWith("--env-file="))?.split("=")[1] ?? "apps/web/.env.local"));
  const { syncOnchainParticipations, reconcileSubmittedTransactions } = await import("../apps/web/src/server/sync/onchain.js");
  const { retryFailedParticipationRequests } = await import("../apps/web/src/server/participations/service.js");
  const result = await syncOnchainParticipations();
  const transactions = await reconcileSubmittedTransactions();
  const retries = await retryFailedParticipationRequests();
  console.log(JSON.stringify({ result, transactions, retries }));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "On-chain sync failed");
  process.exitCode = 1;
});
