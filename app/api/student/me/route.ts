// app/api/student/me/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import type { UserDoc } from "@/models/User";

export async function GET(_req: NextRequest) {
  try {
    // current user from server helper (returns { id, name, email, urn? } | null)
    const current = await getCurrentUser(null);
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If getCurrentUser already includes urn/name, return immediately
    if (current.urn !== undefined) {
      return NextResponse.json(
        { name: current.name ?? null, urn: current.urn ?? null, email: current.email ?? null },
        { status: 200 }
      );
    }

    // Otherwise fetch minimal fields from DB using findById (NOT find)
    await dbConnect();

    // NOTE: use findById (single doc) and .lean<UserDoc | null>() so TypeScript knows
    const user = await User.findById(current.id, { name: 1, urn: 1, meta: 1, email: 1 })
      .lean<UserDoc | null>()
      .exec();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const emailVerified = Boolean(user?.meta?.emailVerification?.verified || (user as any).emailVerified);

    return NextResponse.json(
      {
        name: user.name ?? null,
        urn: user.urn ?? null,
        meta: user.meta ?? null,
        email: user.email ?? null,
        emailVerified,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/student/me error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
