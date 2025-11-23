import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User, { UserDoc } from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    await dbConnect();
    const count = await User.countDocuments();
    return NextResponse.json({ count });
  } catch (err: any) {
    console.error("Users count error:", err);
    return NextResponse.json({ error: "Failed to fetch users count" }, { status: 500 });
  }
}
