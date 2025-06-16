import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { section: string } }) {
  const validSections = ["contact", "objectives", "skills", "jobs", "education"];
  const { section } = params;
  const body = await req.json();

  if (!validSections.includes(section)) {
    return NextResponse.json({ status: "invalid section" }, { status: 400 });
  }

  // Placeholder: update logic would store data in Firestore or similar
  return NextResponse.json({ status: "updated", section, data: body });
}
