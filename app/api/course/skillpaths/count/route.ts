import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { SkillPath } from "@/models/courses/SkillPath";

export const runtime = "nodejs";

export async function GET() {
  try {
    await dbConnect();
    const count = await SkillPath.countDocuments();
    return NextResponse.json({ count });
  } catch (err: any) {
    console.error("SkillPaths count error:", err);
    return NextResponse.json({ error: "Failed to fetch skill paths count" }, { status: 500 });
  }
}
