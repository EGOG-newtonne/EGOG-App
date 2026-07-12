import { NextResponse } from "next/server";

import { deletePrivyAndLocalUser } from "../../../server/auth/privy";

export async function DELETE(request: Request) {
  try {
    await deletePrivyAndLocalUser(request);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Account deletion failed" }, { status: 400 });
  }
}
