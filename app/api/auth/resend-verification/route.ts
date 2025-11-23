// app/api/auth/resend-verification/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL =
  process.env.FROM_EMAIL ||
  `no-reply@${process.env.NEXT_PUBLIC_SITE_DOMAIN || "example.com"}`;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "MySite";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP not configured; skipping email send.");
    return;
  }
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({ from: FROM_EMAIL, to, subject, html });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const email = (body.email as string).toLowerCase().trim();

    await dbConnect();

    const user = await User.findOne({ email }).exec();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json(
        { ok: true, message: "Already verified" },
        { status: 200 },
      );
    }

    // Optional: simple rate-limit: don't allow resend if last token still valid for > 10 minutes
    const now = new Date();
    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires > new Date(now.getTime() + 10 * 60 * 1000)
    ) {
      return NextResponse.json(
        {
          error:
            "Verification email already sent recently. Please check inbox.",
        },
        { status: 429 },
      );
    }

    const rawToken = crypto.randomBytes(24).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    user.emailVerificationTokenHash = tokenHash;
    user.emailVerificationExpires = expiry;
    await user.save();

    const verifyUrl = `${SITE_URL}/api/auth/verify?token=${rawToken}`;
    const html = `
      <div style="font-family: system-ui, -apple-system, Roboto, 'Segoe UI', Arial; color:#111;">
        <p>Hi ${user.name || "there"},</p>
        <p>Please verify your email with the link below (valid 24 hours):</p>
        <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 14px;border-radius:8px;text-decoration:none;border:1px solid #ddd">Verify email</a></p>
        <p>If you didn't request this, ignore this message.</p>
        <hr/>
        <p>Your registration number: <strong style="font-family:monospace">${user.urn}</strong></p>
      </div>
    `;

    await sendEmail(email, `Verify your ${SITE_NAME} account`, html);

    return NextResponse.json(
      { ok: true, message: "Verification email sent" },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Resend verification error:", err);
    const message =
      err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
