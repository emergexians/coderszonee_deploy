// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";

import { dbConnect } from "@/lib/db";
import User from "@/models/User";

// config: use env vars
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || `no-reply@${process.env.NEXT_PUBLIC_SITE_DOMAIN || "Coderszonee.com"}`;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn("SMTP not fully configured. Emails will fail until SMTP_HOST/USER/PASS are set.");
}

/** Generate 5 uppercase alphanumeric chars */
function make5Alnum(): string {
  const bytes = randomBytes(6);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < bytes.length && out.length < 5; i++) {
    const idx = bytes[i] % chars.length;
    out += chars[idx];
  }
  return out;
}

/** Build URN for role — ensure only STD or INS prefixes so it matches your schema */
function buildURN(role: string): string {
  const year = new Date().getFullYear();
  // Map anything non-student explicitly to INS so schema validation (STD|INS) passes
  const prefix = role === "student" ? "STD" : "INS";
  return `${prefix}/${year}/${make5Alnum()}`;
}

/** Generate unique URN with retries */
async function generateUniqueURN(role: string, attempts = 6): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    const urn = buildURN(role);
    const existing = await User.findOne({ urn }).lean().exec();
    if (!existing) return urn;
  }
  // fallback: append timestamp slice to ensure uniqueness (still using STD/INS)
  const fallbackPrefix = role === "student" ? "STD" : "INS";
  return `${fallbackPrefix}/${new Date().getFullYear()}/${make5Alnum()}${Date.now().toString().slice(-4)}`;
}

/** Send URN email via nodemailer (if SMTP configured) */
async function sendUrnEmail(name: string, email: string, urn: string) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("Skipping sending URN email — SMTP not configured.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const html = `
    <div style="font-family:system-ui, -apple-system, Roboto, 'Segoe UI', 'Helvetica Neue', Arial; color:#111;">
      <p>Hi ${escapeHtml(name)},</p>
      <p>Welcome to ${process.env.NEXT_PUBLIC_SITE_NAME || "our platform"} — your unique registration number (URN) is:</p>
      <h2 style="letter-spacing:0.04em; margin:0.5rem 0; font-family:monospace;">${urn}</h2>
      <p>Keep this safe — you'll need it for identification on the platform.</p>
      <p>Cheers,<br/>${process.env.NEXT_PUBLIC_SITE_NAME || "Team"}</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: `Your registration number (${urn})`,
    html,
  });
}

/** small helper to avoid sending unescaped HTML injection in name */
function escapeHtml(str: string) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    // whitelist expected fields — do not trust incoming body shape
    const name = String(body.name || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const role = String(body.role || "student");

    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
    }

    await dbConnect();

    // basic email uniqueness check
    const existing = await User.findOne({ email }).exec();
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // generate unique URN and ensure no collision
    let urn = await generateUniqueURN(role);

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Build safe payload (explicit fields only) — do NOT pass raw body
    const payload: any = {
      name,
      email,
      password: hashed,
      role,
      urn,
    };

    // Attempt to save with a small retry loop to handle rare duplicate-key race on urn
    let savedUser: any = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const newUser = new User(payload);
        savedUser = await newUser.save();
        break;
      } catch (e: any) {
        // Duplicate key error on urn — regenerate and retry
        if (e?.code === 11000 && e?.keyPattern && e.keyPattern.urn) {
          urn = await generateUniqueURN(role, 8);
          payload.urn = urn;
          continue;
        }
        // Other errors: rethrow
        throw e;
      }
    }

    if (!savedUser) {
      return NextResponse.json({ error: "Could not create user (urn collision)" }, { status: 500 });
    }

    // try to send email (non-blocking)
    try {
      await sendUrnEmail(savedUser.name, savedUser.email, payload.urn);
    } catch (emailErr) {
      console.error("Failed to send URN email:", emailErr);
    }

    // prepare return user object (omit password)
    const userResponse = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      urn: savedUser.urn,
      createdAt: savedUser.createdAt,
    };

    return NextResponse.json({ user: userResponse }, { status: 201 });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
