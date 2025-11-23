import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Course } from "@/models/courses/Course";

export const runtime = "nodejs";

export async function GET() {
  try {
    await dbConnect();
    const count = await Course.countDocuments();
    return NextResponse.json({ count });
  } catch (err: any) {
    console.error("Courses count error:", err);
    return NextResponse.json({ error: "Failed to fetch courses count" }, { status: 500 });
  }
}
