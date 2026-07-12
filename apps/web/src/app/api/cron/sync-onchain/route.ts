import { NextResponse } from "next/server";

import { serverEnvironment } from "../../../../env/env.server";
import { retryFailedParticipationRequests } from "../../../../server/participations/service";
import { reconcileSubmittedTransactions, syncOnchainParticipations } from "../../../../server/sync/onchain";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${serverEnvironment.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sync = await syncOnchainParticipations();
  const transactions = await reconcileSubmittedTransactions();
  const retries = await retryFailedParticipationRequests();
  return NextResponse.json({ sync, transactions, retries });
}
