// app/api/student/profile/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User"; // or "@/models/Profile" if that's the filename
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
  } catch (e: any) {
    console.error("GET /api/student/profile", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// POST upsert current student's profile
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const me = await getCurrentUser(req).catch(() => null);

    const emailFromBody =
      typeof (body as any).email === "string"
        ? (body as any).email.trim()
        : "";

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
    } = body as Record<string, any>;

    const updateDoc: Record<string, any> = {
      email,
      fullName: String(fullName || "").trim(),
      phone: String(phone || "").trim(),
      city: String(city || "").trim(),
      branch: String(branch || "").trim(),
      graduationYear: String(graduationYear || "").trim(),
      portfolio: String(portfolio || "").trim(),
      bio: String(bio || "").trim(),
      gender: gender || "",
      skills: Array.isArray(skills)
        ? skills
            .filter((s) => typeof s === "string")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      role: "student",
      updatedAt: new Date(),
    };

    // Only store avatar if it's a proper data URL
    if (typeof avatarDataUrl === "string" && avatarDataUrl.startsWith("data:")) {
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
  } catch (e: any) {
    console.error("POST /api/student/profile", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
