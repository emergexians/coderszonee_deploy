// app/(public)/admin/course/courses/[courseId]/landing/page.tsx
import { dbConnect } from "@/lib/db";
import { CourseLandingPage } from "@/models/courses/CourseLandingPage";
import LandingPagesAdmin from "@/components/admin/landing-pages/LandingPagesAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ICourseLandingPage {
  _id: any;
  courseId: any;
  title: string;
  subtitle: string;
  offerings?: Array<{ text: string }>;
  techStacks?: Array<{ name: string; description: string; projects: string[] }>;
  audience?: Array<{ title: string; description: string }>;
  tools?: Array<{ image: string; alt?: string }>;
}

export default async function AdminCourseLandingPage({
  params,
}: {
  params: { courseId: string };
}) {
  await dbConnect();

  const landing = await CourseLandingPage.findOne({
    courseId: params.courseId,
  }).lean<ICourseLandingPage>();

  const safeLanding = landing
    ? {
        ...landing,
        _id: String(landing._id),
        courseId: String(landing.courseId),
        offerings: landing.offerings || [],
        techStacks: landing.techStacks || [],
        audience: landing.audience || [],
        tools: landing.tools || [],
      }
    : null;

  return (
    <LandingPagesAdmin
      courseId={params.courseId}
      initialData={safeLanding}
    />
  );
}
