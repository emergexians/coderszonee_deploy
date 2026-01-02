// app/(public)/courses/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import { Course } from "@/models/courses/Course";

import CourseHero from "./CourseHero.client";
import CourseSyllabus from "./CourseSyllabus.client";
import CoursePerks from "./CoursePerks.client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = { params: { slug: string } };

type CourseLean = {
  title?: string;
  desc?: string;
  cover?: string;
  duration?: string;
  level?: string;
  rating?: number;
  students?: number;
  category?: string;
  subCategory?: string;
  slug?: string;
  perks?: string[];
  syllabus?: {
    title?: string;
    items?: string[];
  }[];
};


/* =========================
   SEO Metadata (SERVER)
========================= */
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  await dbConnect();

  const course = await Course.findOne({ slug: params.slug })
    .select("title desc")
    .lean<{ title?: string; desc?: string } | null>();

  if (!course) {
    return {
      title: "Course not found — Coderszonee",
    };
  }

  return {
    title: `${course.title} — Coderszonee`,
    description:
      course.desc ??
      `Learn ${course.title} with a structured, project-based syllabus.`,
  };
}

/* =========================
   Page (SERVER)
========================= */
export default async function CourseDetailPage({ params }: PageProps) {
  await dbConnect();

 const courseDoc = await Course.findOne({ slug: params.slug })
  .lean<CourseLean | null>();


  if (!courseDoc) notFound();

  /**
   * 🔑 CRITICAL FIX:
   * Convert Mongo/Mongoose document into a
   * plain serializable object (DTO)
   */
  const course = {
    title: courseDoc.title ?? "",
    desc: courseDoc.desc ?? "",
    cover: courseDoc.cover ?? "",
    duration: courseDoc.duration ?? "",
    level: courseDoc.level ?? "",
    rating:
      typeof courseDoc.rating === "number" ? courseDoc.rating : undefined,
    students:
      typeof courseDoc.students === "number"
        ? courseDoc.students
        : undefined,
    category: courseDoc.category ?? "",
    subCategory: courseDoc.subCategory ?? "",
    slug: courseDoc.slug ?? params.slug,
    syllabus: Array.isArray(courseDoc.syllabus)
      ? courseDoc.syllabus.map((s: any) => ({
          title: s.title ?? "",
          items: Array.isArray(s.items) ? s.items : [],
        }))
      : [],
    perks: Array.isArray(courseDoc.perks) ? courseDoc.perks : [],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      <CourseHero course={course} />
      <CourseSyllabus syllabus={course.syllabus} />
      <CoursePerks perks={course.perks} />
    </div>
  );
}
