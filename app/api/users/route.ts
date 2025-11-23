// app/api/users/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    // select("+password") if you want it; default is hidden
    const items = await User.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(items, { status: 200 });
  } catch (err: unknown) {
    console.error("GET /api/users error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch users";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
