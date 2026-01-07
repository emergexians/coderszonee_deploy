// app/api/student/me/route.ts
import { NextResponse } from "next/server";

import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import type { UserDoc } from "@/models/User";

// Extend UserDoc with a legacy emailVerified field if it existed before
type UserDocWithLegacy = UserDoc & {
  emailVerified?: boolean;
};

export async function GET() {
  try {
    // current user from server helper (returns { id, name, email, urn? } | null)
    const current = await getCurrentUser(); // ✅ no argument

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If getCurrentUser already includes urn/name, return immediately
    if (current.urn !== undefined) {
      return NextResponse.json(
        {
          name: current.name ?? null,
          urn: current.urn ?? null,
          email: current.email ?? null,
        },
        { status: 200 }
      );
    }

    // Otherwise fetch minimal fields from DB using findById (NOT find)
    await dbConnect();

    // Use findById (single doc) and .lean<UserDocWithLegacy | null>()
    const user = await User.findById(current.id, {
      name: 1,
      urn: 1,
      meta: 1,
      email: 1,
      // legacy field (if present in old data)
      emailVerified: 1,
    })
      .lean<UserDocWithLegacy | null>()
      .exec();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const emailVerified = Boolean(
      user.meta?.emailVerification?.verified ?? user.emailVerified
    );

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
