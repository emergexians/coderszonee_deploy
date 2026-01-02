// app\api\landing-pages\route.ts

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/db";
import { CourseLandingPage } from "@/models/courses/CourseLandingPage";
import { Course } from "@/models/courses/Course";

/* =====================================================
   Types
===================================================== */
type Offering = {
  text: string;
};

type TechStack = {
  name: string;
  description: string;
  projects: string[];
};

type Audience = {
  title: string;
  description: string;
};

type Tool = {
  image: string;
  alt?: string;
};

interface LandingPagePayload {
  courseId: string;
  title: string;
  subtitle: string;
  offerings: Offering[];
  techStacks: TechStack[];
  audience: Audience[];
  tools: Tool[];
  published: boolean;
}

/* =====================================================
   POST → Create or Update Landing Page (Admin)
===================================================== */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = (await req.json()) as Partial<LandingPagePayload>;

    const {
      courseId,
      title,
      subtitle,
      offerings,
      techStacks,
      audience,
      tools,
      published,
    } = body;

    /* ---------- Basic validation ---------- */
    if (!courseId || !Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: "Invalid or missing courseId" },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!subtitle || typeof subtitle !== "string" || subtitle.trim() === "") {
      return NextResponse.json(
        { error: "Subtitle is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    /* ---------- Verify course exists ---------- */
    const courseExists = await Course.findById(courseId).select("_id").lean();
    if (!courseExists) {
      return NextResponse.json(
        { error: "Course not found. Please create the course first." },
        { status: 404 }
      );
    }

    /* ---------- Normalize data ---------- */
    const normalizeOfferings = (data: unknown): Offering[] => {
      if (!Array.isArray(data)) return [];
      return data
        .filter((item): item is Offering => {
          return (
            typeof item === "object" &&
            item !== null &&
            "text" in item &&
            typeof item.text === "string" &&
            item.text.trim() !== ""
          );
        })
        .map((item) => ({ text: item.text.trim() }));
    };

    const normalizeTechStacks = (data: unknown): TechStack[] => {
      if (!Array.isArray(data)) return [];
      return data
        .filter((item): item is TechStack => {
          return (
            typeof item === "object" &&
            item !== null &&
            "name" in item &&
            typeof item.name === "string" &&
            item.name.trim() !== "" &&
            "description" in item &&
            typeof item.description === "string"
          );
        })
        .map((item) => ({
          name: item.name.trim(),
          description: item.description.trim(),
          projects: Array.isArray(item.projects)
            ? item.projects
                .filter((p): p is string => typeof p === "string")
                .map((p) => p.trim())
                .filter(Boolean)
            : [],
        }));
    };

    const normalizeAudience = (data: unknown): Audience[] => {
      if (!Array.isArray(data)) return [];
      return data
        .filter((item): item is Audience => {
          return (
            typeof item === "object" &&
            item !== null &&
            "title" in item &&
            typeof item.title === "string" &&
            item.title.trim() !== "" &&
            "description" in item &&
            typeof item.description === "string"
          );
        })
        .map((item) => ({
          title: item.title.trim(),
          description: item.description.trim(),
        }));
    };

    const normalizeTools = (data: unknown): Tool[] => {
      if (!Array.isArray(data)) return [];
      return data
        .filter((item): item is Tool => {
          return (
            typeof item === "object" &&
            item !== null &&
            "image" in item &&
            typeof item.image === "string" &&
            item.image.trim() !== ""
          );
        })
        .map((item) => ({
          image: item.image.trim(),
          ...(item.alt && typeof item.alt === "string" ? { alt: item.alt.trim() } : {}),
        }));
    };

    const payload = {
      courseId: new Types.ObjectId(courseId),
      title: title.trim(),
      subtitle: subtitle.trim(),
      offerings: normalizeOfferings(offerings),
      techStacks: normalizeTechStacks(techStacks),
      audience: normalizeAudience(audience),
      tools: normalizeTools(tools),
      published: Boolean(published),
    };

    /* ---------- UPSERT (one page per course) ---------- */
    const landingPage = await CourseLandingPage.findOneAndUpdate(
      { courseId: payload.courseId },
      payload,
      {
        upsert: true, // create if not exists
        new: true, // return updated doc
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: landingPage,
        message: published
          ? "Landing page published successfully"
          : "Landing page saved as draft",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("LANDING PAGE POST ERROR:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to save landing page";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/* =====================================================
   GET → Fetch Landing Page by courseId (Public / Admin)
===================================================== */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId || !Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: "Invalid or missing courseId" },
        { status: 400 },
      );
    }

    const landingPage = await CourseLandingPage.findOne({
      courseId,
    }).lean();

    if (!landingPage) {
      return NextResponse.json(
        { error: "Landing page not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: landingPage,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("LANDING PAGE GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch landing page" },
      { status: 500 },
    );
  }
}
