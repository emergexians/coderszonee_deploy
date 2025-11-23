// app/api/course/careerpaths/[id]/route.ts
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { CareerPath } from "@/models/courses/CareerPath";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PartialPayload = z.object({
  name: z.string().min(2).optional(),
  img: z.string().url().or(z.string().startsWith("/")).optional(),
  duration: z.string().min(1).optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  desc: z.string().min(10).optional(),
  skills: z.array(z.string()).optional(),
  perks: z.array(z.string()).optional(),
  syllabus: z
    .array(
      z.object({
        title: z.string().min(1),
        items: z.array(z.string()).optional(),
      })
    )
    .optional(),
  rating: z.number().min(0).max(5).optional(),
  students: z.number().min(0).optional(),
});

function invalidId(id: string) {
  return !Types.ObjectId.isValid(id);
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;
    if (invalidId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const doc = await CareerPath.findById(id).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(doc, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    console.error("[careerpaths][GET:ID]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;
    if (invalidId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const raw = await req.json();
    if (typeof raw.skills === "string")
      raw.skills = raw.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
    if (typeof raw.perks === "string")
      raw.perks = raw.perks.split(",").map((s: string) => s.trim()).filter(Boolean);
    if (typeof raw.rating === "string") raw.rating = Number(raw.rating);
    if (typeof raw.students === "string") raw.students = Number(raw.students);

    const parsed = PartialPayload.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await CareerPath.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[careerpaths][PATCH]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;
    if (invalidId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    await CareerPath.findByIdAndDelete(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[careerpaths][DELETE]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
