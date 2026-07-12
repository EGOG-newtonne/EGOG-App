import { NextResponse } from "next/server";
import { z } from "zod";

import { getEmailPreference, updateEmailPreference } from "../../../../server/auth/privy";

const bodySchema = z.object({ emailOptIn: z.boolean() }).strict();

export async function GET(request: Request) {
  try {
    return NextResponse.json(await getEmailPreference(request));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const input = bodySchema.parse(await request.json());
    return NextResponse.json(await updateEmailPreference(request, input.emailOptIn));
  } catch (error) {
    const code = error instanceof Error ? error.message : "PREFERENCE_UPDATE_FAILED";
    return NextResponse.json({ error: code }, { status: code === "USER_NOT_FOUND" ? 404 : 400 });
  }
}
