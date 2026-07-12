import { NextResponse } from "next/server";

import {
  authenticatePrivyRequest,
  upsertAuthenticatedUser,
} from "../../../../server/auth/privy";

export async function POST(request: Request) {
  try {
    const auth = await authenticatePrivyRequest(request);
    const user = await upsertAuthenticatedUser(auth);
    return NextResponse.json({
      id: user.id,
      walletAddress: user.walletAddress,
      email: user.email,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
