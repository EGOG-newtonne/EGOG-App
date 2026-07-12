import { NextResponse } from "next/server";

import { listProjects } from "../../../server/projects/queries";

export async function GET() {
  return NextResponse.json(await listProjects());
}
