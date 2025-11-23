// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Course } from "@/models/courses/Course";
import mongoose from "mongoose";

type Params = { params: { id: string } };

/* =========================
   Helpers
========================= */
function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

function cleanArray(a: any): string[] | undefined {
  if (a == null) return undefined;
  if (Array.isArray(a)) return a.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof a === "string") {
    return a
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
}

function cleanSyllabus(input: any) {
  if (!input) return undefined;
  let arr: any[] | undefined;
  try {
    if (typeof input === "string") arr = JSON.parse(input);
    else if (Array.isArray(input)) arr = input;
  } catch {
    arr = undefined;
  }
  if (!Array.isArray(arr)) return undefined;
  const out = arr
    .map((sec) => {
      if (!sec || typeof sec !== "object") return null;
      const title = typeof sec.title === "string" ? sec.title.trim() : "";
      if (!title) return null;
      let items: string[] | undefined;
      if (Array.isArray(sec.items)) {
        items = sec.items.map((x: any) => String(x).trim()).filter(Boolean);
      }
      return { title, ...(items && { items }) };
    })
    .filter(Boolean);
  return out.length ? out : undefined;
}

function clampRating(n: any) {
  if (n === undefined || n === null) return undefined;
  const num = Number(n);
  if (!Number.isFinite(num)) return undefined;
  return Math.max(0, Math.min(5, num));
}

function safeNonNegInt(n: any) {
  if (n === undefined || n === null) return undefined;
  const num = Number(n);
  if (!Number.isFinite(num) || num < 0) return undefined;
  return Math.floor(num);
}

// If a required field is provided in PATCH, it must not be blank
function assertNotBlankOrUndefined(name: string, v: unknown) {
  if (v === undefined) return; // not being changed
  const s = String(v).trim();
  if (!s) {
    throw new ResponseError(400, `Field "${name}" cannot be empty`);
  }
}

class ResponseError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/* =========================
   GET /api/courses/[id]
========================= */
export async function GET(_req: NextRequest, { params }: Params) {
  await dbConnect();
  const { id } = params;

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    // include virtuals (e.g., href from slug)
    const doc = await Course.findById(id).lean({ virtuals: true });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (e: any) {
    console.error("GET /api/course/courses/[id] error:", e);
    return NextResponse.json({ error: e?.message || "Failed to load course" }, { status: 500 });
  }
}

/* =========================
   PATCH /api/courses/[id]
   - Partial update
   - Required fields (if provided) cannot be blank
   - `href` is NOT accepted (derived from slug/title)
========================= */
export async function PATCH(req: NextRequest, { params }: Params) {
  await dbConnect();
  const { id } = params;

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({} as any));

  try {
    const doc = await Course.findById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Validate required fields *if* they are being changed
    assertNotBlankOrUndefined("title", body.title);
    assertNotBlankOrUndefined("cover", body.cover);
    assertNotBlankOrUndefined("duration", body.duration);
    assertNotBlankOrUndefined("level", body.level);
    assertNotBlankOrUndefined("category", body.category);
    assertNotBlankOrUndefined("subCategory", body.subCategory);

    // Only allow known fields; do NOT accept `href` (derived from slug/title)
    if (body.title !== undefined) doc.title = String(body.title).trim();
    if (body.cover !== undefined) doc.cover = String(body.cover).trim();
    if (body.duration !== undefined) doc.duration = String(body.duration).trim();
    if (body.level !== undefined) doc.level = String(body.level).trim();
    if (body.category !== undefined) doc.category = String(body.category).trim();
    if (body.subCategory !== undefined) doc.subCategory = String(body.subCategory).trim();

    // Optional numeric fields
    if (body.rating !== undefined) doc.rating = clampRating(body.rating) as any;
    if (body.students !== undefined) doc.students = safeNonNegInt(body.students) as any;

    // Text field (unset when blank)
    if (body.desc !== undefined) {
      const d = typeof body.desc === "string" ? body.desc.trim() : undefined;
      doc.desc = d || undefined;
    }

    // Arrays / nested
    if (body.perks !== undefined) doc.perks = cleanArray(body.perks);
    if (body.syllabus !== undefined) doc.syllabus = cleanSyllabus(body.syllabus);

    // Save so model hooks (e.g., slug generation from title) run
    const updated = await doc.save();
    // Ensure virtuals in response regardless of schema settings
    return NextResponse.json(updated.toObject({ virtuals: true }));
  } catch (e: any) {
    console.error("PATCH /api/course/courses/[id] error:", e);
    if (e instanceof ResponseError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    // Duplicate key (likely slug/title unique)
    if (e?.code === 11000) {
      return NextResponse.json(
        { error: "A course with a similar title already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: e?.message || "Update failed" }, { status: 500 });
  }
}

/* =========================
   DELETE /api/courses/[id]
========================= */
export async function DELETE(_req: NextRequest, { params }: Params) {
  await dbConnect();
  const { id } = params;

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const deleted = await Course.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    console.error("DELETE /api/course/courses/[id] error:", e);
    return NextResponse.json({ error: e?.message || "Delete failed" }, { status: 500 });
  }
}
