// app/api/course/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Course } from "@/models/courses/Course";
import { CourseLandingPage } from "@/models/courses/CourseLandingPage";

function parseIntOr(defaultVal: number, v?: string | null) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : defaultVal;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function cleanArray(a: unknown): string[] | undefined {
  if (!a) return undefined;
  if (Array.isArray(a)) {
    return a
      .map((v) => String(v))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof a === "string") {
    return a
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
}

type SyllabusSection = {
  title: string;
  items?: string[];
};

function cleanSyllabus(input: unknown): SyllabusSection[] | undefined {
  if (!input) return undefined;

  let arr: unknown[] | undefined;
  try {
    if (typeof input === "string") {
      arr = JSON.parse(input) as unknown[];
    } else if (Array.isArray(input)) {
      arr = input as unknown[];
    }
  } catch {
    arr = undefined;
  }

  if (!Array.isArray(arr)) return undefined;

  const out: SyllabusSection[] = arr
    .map((sec) => {
      if (!sec || typeof sec !== "object") return null;

      const section = sec as { title?: unknown; items?: unknown };

      const title =
        typeof section.title === "string" ? section.title.trim() : "";
      if (!title) return null;

      let items: string[] | undefined;
      if (Array.isArray(section.items)) {
        items = section.items
          .map((x) => String(x).trim())
          .filter(Boolean);
      }

      return items && items.length > 0 ? { title, items } : { title };
    })
    .filter((v): v is SyllabusSection => v !== null);

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
    const or: Record<string, unknown>[] = [];
    if (q) {
      or.push({ title: { $regex: q, $options: "i" } });
      or.push({ desc: { $regex: q, $options: "i" } });
      // If your schema has "skills: [String]"
      or.push({ skills: { $elemMatch: { $regex: q, $options: "i" } } });
    }

    const finalQuery =
      or.length > 0 ? { $and: [filter, { $or: or }] } : filter;

    const [total, items] = await Promise.all([
      Course.countDocuments(finalQuery),
      Course.find(finalQuery)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean({ virtuals: true }), // ensure href/slug virtuals in response
    ]);

    // Check which courses have published landing pages
    const courseIds = items.map((c: any) => c._id);
    const landingPages = await CourseLandingPage.find({
      courseId: { $in: courseIds },
      published: true,
    })
      .select("courseId")
      .lean();

    const landingPageSet = new Set(
      landingPages.map((lp: any) => String(lp.courseId))
    );

    // Add hasLandingPage flag to each course
    const itemsWithLanding = items.map((c: any) => ({
      ...c,
      hasLandingPage: landingPageSet.has(String(c._id)),
    }));

    return NextResponse.json({ items: itemsWithLanding, total, page, limit });
  } catch (e: unknown) {
    console.error("GET /api/course/courses error:", e);
    const message =
      e instanceof Error ? e.message : "Failed to load courses";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* =========================
   POST /api/course/courses
   Body: title, cover, duration, level, category, subCategory, desc, rating?, students?, perks?, syllabus?
========================= */

type CoursePayload = {
  title: string;
  cover: string;
  duration: string;
  level: string;
  category: string;
  subCategory: string;
  rating?: number;
  students?: number;
  desc?: string;
  perks?: string[];
  syllabus?: SyllabusSection[];
  // skills?: string[]; // uncomment if schema supports
};

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = (await req.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    const payload: CoursePayload = {
      title: String(body.title ?? "").trim(),
      cover: String(body.cover ?? "").trim(),
      duration: String(body.duration ?? "").trim(),
      level: String(body.level ?? "Beginner").trim(),
      category: String(body.category ?? "").trim(),
      subCategory: String(body.subCategory ?? "").trim(),
      rating:
        body.rating === undefined || body.rating === null
          ? undefined
          : Number(body.rating),
      students:
        body.students === undefined || body.students === null
          ? undefined
          : Number(body.students),
      desc:
        typeof body.desc === "string"
          ? (body.desc as string).trim()
          : undefined,
      perks: cleanArray(body.perks),
      syllabus: cleanSyllabus(body.syllabus),
      // skills: cleanArray(body.skills),
    };

    // Required (except rating/students)
    const required: (keyof CoursePayload)[] = [
      "title",
      "cover",
      "duration",
      "level",
      "category",
      "subCategory",
      "desc",
    ];

    for (const k of required) {
      const val = payload[k];
      if (
        val === undefined ||
        val === null ||
        (typeof val === "string" && !val.trim())
      ) {
        return NextResponse.json(
          { error: `Missing required field: ${k}` },
          { status: 400 },
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
  } catch (e: unknown) {
    console.error("POST /api/course/courses error:", e);

    const isDupKey =
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code?: unknown }).code === 11000;

    const message = isDupKey
      ? "A course with a similar unique field already exists."
      : e instanceof Error
      ? e.message
      : "Failed to create course";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
