// app/api/users/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User, { UserDoc } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    // select("+password") if you want it; default is hidden
    const items = await User.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
