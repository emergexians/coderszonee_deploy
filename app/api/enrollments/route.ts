// app/api/enrollments/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Enrollment } from "@/models/Enrollment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const rows = await Enrollment.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  if (!body?.userEmail || !body?.courseType || !body?.courseSlug) {
    return NextResponse.json(
      { error: "userEmail, courseType, and courseSlug are required" },
      { status: 400 }
    );
  }

  try {
    const created = await Enrollment.create({
      userEmail: String(body.userEmail).trim().toLowerCase(),
      courseType: body.courseType === "careerpath" ? "careerpath" : "skillpath",
      courseSlug: String(body.courseSlug).trim(),
      status: body.status ?? "pending",
      amount: typeof body.amount === "number" ? body.amount : 0,
      currency: body.currency ?? "INR",
      meta: body.meta ?? {},
    });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: unknown) {
    // Mongo duplicate key error (code 11000)
    const isDuplicateKeyError =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: number }).code === 11000;

    if (isDuplicateKeyError) {
      return NextResponse.json(
        { error: "Already enrolled for this course with this email." },
        { status: 409 }
      );
    }

    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json(
      { error: "Failed to create enrollment", detail: message },
      { status: 500 }
    );
  }
}
