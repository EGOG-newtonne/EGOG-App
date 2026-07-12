import { NextResponse } from "next/server";
import { z } from "zod";

import { createParticipationChallenge } from "../../../../server/participations/service";

const bodySchema = z.object({
  projectSlug: z.string().min(1),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  idempotencyKey: z.uuid(),
  requiredConsent: z.literal(true),
  emailOptIn: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const result = await createParticipationChallenge(request, bodySchema.parse(await request.json()));
    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : "PARTICIPATION_CHALLENGE_FAILED";
    const status = code === "PROJECT_MINT_QUEUE_BUSY" ? 409 : code.includes("RATE_LIMIT") ? 429 : 400;
    return NextResponse.json({ error: code }, { status });
  }
}
