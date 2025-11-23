import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { CareerPath } from "@/models/courses/CareerPath";

export const runtime = "nodejs";

export async function GET() {
  try {
    await dbConnect();
    const count = await CareerPath.countDocuments();
    return NextResponse.json({ count });
  } catch (err: any) {
    console.error("CareerPaths count error:", err);
    return NextResponse.json({ error: "Failed to fetch career paths count" }, { status: 500 });
  }
}
