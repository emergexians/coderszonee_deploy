// app/api/users/count/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    await dbConnect();
    const count = await User.countDocuments();
    return NextResponse.json({ count });
  } catch (err: unknown) {
    console.error("Users count error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch users count";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
