import { NextResponse } from "next/server";

import { getProjectBySlug } from "../../../../server/projects/queries";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}
