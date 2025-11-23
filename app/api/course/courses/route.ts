// app/api/course/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Course } from "@/models/courses/Course"; // <-- named import

function parseIntOr(defaultVal: number, v?: string | null) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : defaultVal;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function cleanArray(a: unknown): string[] | undefined {
  if (!a) return undefined;
  if (Array.isArray(a)) return a.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof a === "string") {
    return a
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
}

function cleanSyllabus(input: unknown) {
  if (!input) return undefined;
  let arr: any[] | undefined;
  try {
    if (typeof input === "string") arr = JSON.parse(input);
    else if (Array.isArray(input)) arr = input as any[];
  } catch {
    arr = undefined;
  }
  if (!Array.isArray(arr)) return undefined;

  const out = arr
    .map((sec) => {
      if (!sec || typeof sec !== "object") return null;
      const title = typeof (sec as any).title === "string" ? (sec as any).title.trim() : "";
      if (!title) return null;
      let items: string[] | undefined;
      if (Array.isArray((sec as any).items)) {
        items = (sec as any).items.map((x: unknown) => String(x).trim()).filter(Boolean);
      }
      return { title, ...(items && { items }) };
    })
    .filter(Boolean) as Array<{ title: string; items?: string[] }>;

  return out.length ? out : undefined;
}

/* =========================
   GET  /api/course/courses
   Query params: q, category, subCategory, level, page, limit
========================= */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.trim() || undefined;
    const subCategory = searchParams.get("subCategory")?.trim() || undefined;
    const level = searchParams.get("level")?.trim() || undefined;
    const q = (searchParams.get("q") || "").trim();

    const page = clamp(parseIntOr(1, searchParams.get("page")), 1, 10_000);
    const limit = clamp(parseIntOr(18, searchParams.get("limit")), 1, 60);

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (level) filter.level = level;

    // Safe search (no $text to avoid missing-index errors)
    const or: any[] = [];
    if (q) {
      or.push({ title: { $regex: q, $options: "i" } });
      or.push({ desc: { $regex: q, $options: "i" } });
      // If your schema has "skills: [String]"
      or.push({ skills: { $elemMatch: { $regex: q, $options: "i" } } });
    }

    const finalQuery = or.length ? { $and: [filter, { $or: or }] } : filter;

    const [total, items] = await Promise.all([
      Course.countDocuments(finalQuery),
      Course.find(finalQuery)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean({ virtuals: true }), // ensure href/slug virtuals in response
    ]);

    return NextResponse.json({ items, total, page, limit });
  } catch (e: any) {
    console.error("GET /api/course/courses error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to load courses" },
      { status: 500 }
    );
  }
}

/* =========================
   POST /api/course/courses
   Body: title, cover, duration, level, category, subCategory, desc, rating?, students?, perks?, syllabus?
========================= */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // NOTE: href/slug are derived in model (virtuals/hooks). Do not accept from client.
    const payload: any = {
      title: String(body.title ?? "").trim(),
      cover: String(body.cover ?? "").trim(),
      duration: String(body.duration ?? "").trim(),
      level: String(body.level ?? "Beginner").trim(),
      category: String(body.category ?? "").trim(),
      subCategory: String(body.subCategory ?? "").trim(),
      // optional
      rating:
        body.rating === undefined || body.rating === null ? undefined : Number(body.rating),
      students:
        body.students === undefined || body.students === null
          ? undefined
          : Number(body.students),
      desc: typeof body.desc === "string" ? (body.desc as string).trim() : undefined,
      perks: cleanArray(body.perks),
      syllabus: cleanSyllabus(body.syllabus),
      // skills: cleanArray(body.skills), // uncomment if schema has "skills"
    };

    // Required (except rating/students)
    const required = [
      "title",
      "cover",
      "duration",
      "level",
      "category",
      "subCategory",
      "desc",
    ] as const;

    for (const k of required) {
      if (!payload[k]) {
        return NextResponse.json(
          { error: `Missing required field: ${k}` },
          { status: 400 }
        );
      }
    }

    // Clamp numeric optionals
    if (typeof payload.rating === "number") {
      if (!Number.isFinite(payload.rating)) payload.rating = undefined;
      else payload.rating = clamp(payload.rating, 0, 5);
    }
    if (typeof payload.students === "number") {
      if (!Number.isFinite(payload.students) || payload.students < 0) {
        payload.students = undefined;
      }
    }

    const doc = await Course.create(payload);
    const json = doc.toObject({ virtuals: true });
    return NextResponse.json(json, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/course/courses error:", e);
    const message =
      e?.code === 11000
        ? "A course with a similar unique field already exists."
        : e?.message || "Failed to create course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
