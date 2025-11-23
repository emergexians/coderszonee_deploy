// app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

import { dbConnect } from "@/lib/db";
import User from "@/models/User";

/** Hash the token the same way signup/resend did */
function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

type VerifyResult =
  | { ok: false; status: number; body: { error: string } }
  | { ok: true; status: number; user: typeof User extends { prototype: infer U } ? U : unknown };

/** core verify logic used by GET and POST */
async function verifyTokenAndActivate(rawToken: string): Promise<VerifyResult> {
  const tokenHash = hashToken(rawToken);

  // find a user with a matching token hash and non-expired expiry
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  }).exec();

  if (!user) {
    return {
      ok: false,
      status: 400,
      body: { error: "Invalid or expired token" },
    };
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = "";
  user.emailVerificationExpires = null;
  await user.save();

  return { ok: true, user, status: 200 };
}

/** GET handler — used when user clicks email link like /api/auth/verify?token=... */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    await dbConnect();

    const result = await verifyTokenAndActivate(token);
    if (!result.ok) {
      return NextResponse.json(result.body, { status: result.status });
    }

    // Redirect to front-end verified page (or return JSON)
    const redirectUrl =
      process.env.NEXT_PUBLIC_AFTER_VERIFY_URL ||
      "/auth/signin?verified=1";
    return NextResponse.redirect(redirectUrl);
  } catch (err: unknown) {
    console.error("Verify route error (GET):", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** POST handler — accept JSON { token } for API clients */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const token = body?.token as string | undefined;
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    await dbConnect();

    const result = await verifyTokenAndActivate(token);
    if (!result.ok) {
      return NextResponse.json(result.body, { status: result.status });
    }

    // Return JSON success for API clients
    return NextResponse.json(
      { ok: true, message: "Email verified" },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Verify route error (POST):", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
