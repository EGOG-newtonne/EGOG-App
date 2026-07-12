import { NextResponse } from "next/server";
import type { Hex } from "viem";
import { z } from "zod";

import { submitParticipationSignature } from "../../../../server/participations/service";

const bodySchema = z.object({
  requestId: z.uuid(),
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const result = await submitParticipationSignature(request, {
      requestId: body.requestId,
      signature: body.signature as Hex,
    });
    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : "PARTICIPATION_SUBMISSION_FAILED";
    return NextResponse.json({ error: code }, { status: 400 });
  }
}
