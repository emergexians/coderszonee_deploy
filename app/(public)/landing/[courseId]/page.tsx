// app\(public)\landing\[courseId]\page.tsx
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { CourseLandingPage } from "@/models/courses/CourseLandingPage";
import { Course } from "@/models/courses/Course";
import LandingClient from "./LandingClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================
   Route params
========================= */
interface PageProps {
  params: {
    courseId: string;
  };
}

/* =========================
   Lean (plain object) type
   THIS is what fixes the red lines
========================= */
type LandingPageLean = {
  _id: unknown;
  courseId: unknown;
  title: string;
  subtitle: string;
  offerings?: {
    text: string;
  }[];
  techStacks?: {
    name: string;
    description: string;
    projects: string[];
  }[];
  audience?: {
    title: string;
    description: string;
  }[];
  tools?: {
    image: string;
    alt?: string;
  }[];
  published: boolean;
};

/* =========================
   Page
========================= */
export default async function LandingPage({ params }: PageProps) {
  await dbConnect();

  const landing = await CourseLandingPage.findOne({
    courseId: params.courseId,
    published: true,
  })
    .lean<LandingPageLean | null>()
    .exec();

  if (!landing) notFound();

  // Also fetch the course to get the slug for "View More Details" button
  const course = await Course.findById(params.courseId)
    .select("slug title")
    .lean();

  if (!course) notFound();

  /**
   * Convert ObjectId → string
   * Ensure Client Component gets only plain JSON
   */
  const safeLanding = {
    ...landing,
    _id: String(landing._id),
    courseId: String(landing.courseId),
  };

  return <LandingClient data={safeLanding} courseSlug={course.slug || ""} />;
}
