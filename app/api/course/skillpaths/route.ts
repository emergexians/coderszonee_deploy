import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { SkillPath } from "@/models/courses/SkillPath";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** slugify identical to your model */
function slugify(input: string) {
  return input
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Make slug unique across collection */
async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base || "item";
  let i = 2;

  // Loop until we find a candidate slug that doesn't exist
  for (;;) {
    const filter = excludeId
      ? { slug: candidate, _id: { $ne: excludeId } }
      : { slug: candidate };

    const exists = await SkillPath.exists(filter);
    if (!exists) return candidate;

    candidate = `${base}-${i++}`;
  }
}

const SyllabusSection = z.object({
  title: z.string().trim().min(1, "Section title is required"),
  items: z.array(z.string().trim().min(1)).optional(),
});

const Payload = z
  .object({
    name: z.string().trim().min(2, "Name is required"),
    img: z.string().trim().min(1, "Image is required"),
    duration: z.string().trim().min(1, "Duration is required"),
    level: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
    desc: z.string().trim().min(10, "Description is too short"),
    skills: z.array(z.string().trim()).default([]),
    perks: z.array(z.string().trim()).default([]),
    syllabus: z.array(SyllabusSection).default([]),
    rating: z.number().min(0).max(5).optional(),
    students: z.number().min(0).optional(),
    // allow optional slug/href in case the schema requires them
    slug: z.string().trim().optional(),
    href: z.string().trim().optional(),
  })
  .strict();

function formatZod(err: z.ZodError) {
  const fe = err.flatten();
  const fieldMsgs = Object.entries(fe.fieldErrors).flatMap(([k, v]) =>
    (v || []).map((m) => `${k}: ${m}`),
  );
  return [...fieldMsgs, ...(fe.formErrors || [])].join("; ") || "Invalid request";
}

export async function GET() {
  try {
    await dbConnect();
    const list = await SkillPath.find()
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });
    return NextResponse.json(list, {
      headers: { "cache-control": "no-store" },
    });
  } catch (err: unknown) {
    console.error("[skillpaths][GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch skill paths" },
      { status: 500 },
    );
  }
}

// loose shape for incoming body that we normalize
type SkillPathInput = {
  skills?: string | string[];
  perks?: string | string[];
  rating?: string | number;
  students?: string | number;
  [key: string]: unknown;
};

export async function POST(req: Request) {
  try {
    await dbConnect();
    const raw = (await req.json()) as Record<string, unknown>;
    const norm: SkillPathInput = { ...raw };

    // Normalize common client shapes (strings -> arrays/numbers)
    if (typeof norm.skills === "string") {
      norm.skills = norm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (typeof norm.perks === "string") {
      norm.perks = norm.perks
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (typeof norm.rating === "string" && norm.rating !== "") {
      norm.rating = Number(norm.rating);
    }
    if (typeof norm.students === "string" && norm.students !== "") {
      norm.students = Number(norm.students);
    }

    // Validate base fields
    const parsed = Payload.safeParse(norm);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZod(parsed.error) },
        { status: 400 },
      );
    }

    // Derive slug & href (satisfies schemas that require them)
    const base = slugify(parsed.data.name);
    if (!base) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 },
      );
    }
    const slug = await ensureUniqueSlug(base);
    const href = `/skillpath/${slug}`;

    // Compose doc with derived fields
    const toCreate = { ...parsed.data, slug, href };

    const created = await SkillPath.create(toCreate);
    const createdFull = await SkillPath.findById(created._id).lean({
      virtuals: true,
    });
    return NextResponse.json(createdFull, { status: 201 });
  } catch (err: unknown) {
    // handle duplicate key error (code 11000)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: unknown }).code === 11000
    ) {
      const dupErr = err as {
        keyPattern?: Record<string, unknown>;
        keyValue?: Record<string, unknown>;
      };
      const keys = Object.keys(dupErr.keyPattern ?? dupErr.keyValue ?? {});
      const keyStr = keys.length ? ` (${keys.join(", ")})` : "";
      return NextResponse.json(
        { error: `Duplicate value${keyStr}. Try a different name.` },
        { status: 409 },
      );
    }

    console.error("[skillpaths][POST]", err);
    const message =
      err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
