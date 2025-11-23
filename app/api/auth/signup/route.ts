// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";

import { dbConnect } from "@/lib/db";
import User from "@/models/User";

// ---- Types ----
type SignupRole = "student" | "instructor" | "admin" | string;

interface SignupBody {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: SignupRole;
}

interface NewUserPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: SignupRole;
  urn: string;
}

interface DuplicateKeyError {
  code?: number;
  keyPattern?: { urn?: unknown };
}

interface SavedUserShape {
  _id: string;
  name: string;
  email: string;
  role: string;
  urn: string;
  createdAt?: Date;
  phone?: string;
}

// ---- SMTP config ----
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL =
  process.env.FROM_EMAIL ||
  `no-reply@${process.env.NEXT_PUBLIC_SITE_DOMAIN || "Coderszonee.com"}`;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn(
    "SMTP not fully configured. Emails will fail until SMTP_HOST/USER/PASS are set.",
  );
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
function buildURN(role: SignupRole): string {
  const year = new Date().getFullYear();
  const prefix = role === "student" ? "STD" : "INS";
  return `${prefix}/${year}/${make5Alnum()}`;
}

/** Generate unique URN with retries */
async function generateUniqueURN(
  role: SignupRole,
  attempts = 6,
): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    const urn = buildURN(role);
    const existing = await User.findOne({ urn }).lean().exec();
    if (!existing) return urn;
  }
  const fallbackPrefix = role === "student" ? "STD" : "INS";
  return `${fallbackPrefix}/${new Date().getFullYear()}/${make5Alnum()}${Date.now()
    .toString()
    .slice(-4)}`;
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
      <p>Welcome to ${
        process.env.NEXT_PUBLIC_SITE_NAME || "our platform"
      } — your unique registration number (URN) is:</p>
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

export async function POST(req: NextRequest) {
  try {
    const bodyRaw = await req.json().catch(() => null);
    if (!bodyRaw) {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 },
      );
    }

    const body = bodyRaw as SignupBody;

    // whitelist expected fields — do not trust incoming body shape
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").toLowerCase().trim();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    const role: SignupRole = String(body.role ?? "student");

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: "name, email, phone and password are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // basic email uniqueness check
    const existing = await User.findOne({ email }).exec();
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    // generate unique URN and ensure no collision
    let urn = await generateUniqueURN(role);

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const payload: NewUserPayload = {
      name,
      email,
      phone,
      password: hashed,
      role,
      urn,
    };

    // Attempt to save with a small retry loop to handle rare duplicate-key race on urn
    let savedUser: unknown = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const newUser = new User(payload);
        // mongoose doc type is broader; keep as unknown here
        savedUser = await newUser.save();
        break;
      } catch (e) {
        const err = e as DuplicateKeyError;
        if (
          err.code === 11000 &&
          err.keyPattern &&
          err.keyPattern.urn
        ) {
          urn = await generateUniqueURN(role, 8);
          payload.urn = urn;
          continue;
        }
        throw e;
      }
    }

    if (!savedUser) {
      return NextResponse.json(
        { error: "Could not create user (urn collision)" },
        { status: 500 },
      );
    }

    const u = savedUser as SavedUserShape;

    // try to send email (non-blocking)
    try {
      await sendUrnEmail(u.name, u.email, u.urn);
    } catch (emailErr) {
      console.error("Failed to send URN email:", emailErr);
    }

    // prepare return user object (omit password)
    const userResponse = {
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      urn: u.urn,
      createdAt: u.createdAt,
      phone: u.phone,
    };

    return NextResponse.json({ user: userResponse }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
