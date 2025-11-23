// app/api/student/profile/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface ProfileBody {
  email?: string;
  fullName?: string;
  phone?: string;
  city?: string;
  branch?: string;
  graduationYear?: string | number;
  portfolio?: string;
  bio?: string;
  gender?: string;
  skills?: unknown;
  avatarDataUrl?: string;
}

type UpdatableProfileFields = {
  email: string;
  fullName: string;
  phone: string;
  city: string;
  branch: string;
  graduationYear: string;
  portfolio: string;
  bio: string;
  gender: string;
  skills: string[];
  role: "student";
  updatedAt: Date;
  avatarDataUrl?: string;
};

// GET current student's profile
export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const emailFromQuery = searchParams.get("email")?.trim() || null;

    let email = emailFromQuery;

    // If no email in query, fall back to logged-in user
    if (!email) {
      const me = await getCurrentUser(req).catch(() => null);
      if (!me?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      email = me.email;
    }

    const user = await User.findOne({ email }).lean().select("-__v -_id");

    return NextResponse.json({ ok: true, data: user ?? null });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Server error";
    console.error("GET /api/student/profile", e);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// POST upsert current student's profile
export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => null);

    if (!raw || typeof raw !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const body = raw as ProfileBody;

    const me = await getCurrentUser(req).catch(() => null);

    const emailFromBody =
      typeof body.email === "string" ? body.email.trim() : "";

    // Prefer session email, fall back to body.email
    const email = me?.email || emailFromBody;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const {
      fullName,
      phone,
      city,
      branch,
      graduationYear,
      portfolio,
      bio,
      gender,
      skills,
      avatarDataUrl,
    } = body;

    const normalizedSkills: string[] = Array.isArray(skills)
      ? skills
          .filter((s): s is string => typeof s === "string")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const updateDoc: UpdatableProfileFields = {
      email,
      fullName: String(fullName ?? "").trim(),
      phone: String(phone ?? "").trim(),
      city: String(city ?? "").trim(),
      branch: String(branch ?? "").trim(),
      graduationYear: String(graduationYear ?? "").trim(),
      portfolio: String(portfolio ?? "").trim(),
      bio: String(bio ?? "").trim(),
      gender: gender ?? "",
      skills: normalizedSkills,
      role: "student",
      updatedAt: new Date(),
    };

    // Only store avatar if it's a proper data URL
    if (
      typeof avatarDataUrl === "string" &&
      avatarDataUrl.startsWith("data:")
    ) {
      updateDoc.avatarDataUrl = avatarDataUrl;
    }

    await dbConnect();

    await User.updateOne(
      { email },
      {
        $set: updateDoc,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Server error";
    console.error("POST /api/student/profile", e);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
