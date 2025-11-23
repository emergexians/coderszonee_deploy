// app/(public)/courses/[slug]/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, GraduationCap, Star, Users, CheckCircle2, Tag } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { Course } from "@/models/courses/Course";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = { params: { slug: string } };

// Dynamic meta for a course detail
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  await dbConnect();
  const course = await Course.findOne({
    $or: [{ slug }, { href: `/courses/${slug}` }, { href: { $regex: `/${slug}$`, $options: "i" } }],
  })
    .select("title desc category subCategory")
    .lean();

  const isCourseArray = Array.isArray(course);
  const title = !isCourseArray && course ? `${course.title} — Coderszonee` : "Course — Coderszonee";
  const description =
    !isCourseArray && course?.desc
      ? course.desc
      : !isCourseArray && course
      ? `Learn ${course.title} with projects and a structured syllabus.`
      : "Explore a hands-on course.";

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = params;
  await dbConnect();

  const course = await Course.findOne({
    $or: [{ slug }, { href: { $regex: `/${slug}$`, $options: "i" } }, { href: `/courses/${slug}` }],
  }).lean({ virtuals: true });

  if (!course) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative h-64 w-full overflow-hidden rounded-2xl md:h-80">
          <Image
            src={(course as any).cover || "/assets/thumbnails/ai.png"}
            alt={(course as any).title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {(course as any).title}
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {(course as any).desc || "Learn by building — practical, project-based course."}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-5 w-5" /> {(course as any).duration}
              </span>
              <span className="inline-flex items-center gap-2">
                <GraduationCap className="h-5 w-5" /> {(course as any).level}
              </span>
              {typeof (course as any).rating === "number" && (course as any).rating > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" /> {(course as any).rating.toFixed(1)}
                </span>
              )}
              {typeof (course as any).students === "number" && (course as any).students > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Users className="h-5 w-5" /> {(course as any).students.toLocaleString()} learners
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {(course as any).category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-600/20 dark:text-blue-200 px-2.5 py-1 text-xs">
                  <Tag className="h-3.5 w-3.5" />
                  {(course as any).category}
                </span>
              )}
              {(course as any).subCategory && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-600/20 dark:text-purple-200 px-2.5 py-1 text-xs">
                  <Tag className="h-3.5 w-3.5" />
                  {(course as any).subCategory}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <a href="#syllabus" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700">
              View syllabus
            </a>
            <a href={`/checkout?course=course&slug=${(course as any).slug ?? slug}`} className="inline-flex items-center justify-center rounded-xl border px-5 py-2.5 font-medium hover:bg-gray-50 dark:hover:bg-white/10">
              Enroll now
            </a>
          </div>
        </div>
      </div>

      {/* Syllabus + Sidebar */}
      <div id="syllabus" className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Syllabus</h2>

          {Array.isArray((course as any).syllabus) && (course as any).syllabus.length > 0 ? (
            (course as any).syllabus.map((sec: any, i: number) => (
              <div key={`${sec.title}-${i}`} className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-black/30">
                <h3 className="font-medium">{sec.title}</h3>
                {Array.isArray(sec.items) && sec.items.length > 0 && (
                  <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {sec.items.map((it: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Syllabus will be published soon.</p>
          )}
        </div>

        <aside className="md:col-span-1">
          <div className="sticky top-24 rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-black/30">
            <h3 className="font-semibold">What you’ll get</h3>

            {Array.isArray((course as any).perks) && (course as any).perks.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {(course as any).perks.map((p: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Structured lessons & projects</li>
                <li>• Quizzes & checkpoints</li>
                <li>• Certificate of completion</li>
                <li>• Community & mentor support</li>
              </ul>
            )}

            <a href={`/checkout?course=course&slug=${(course as any).slug ?? slug}`} className="mt-4 block w-full rounded-xl bg-blue-600 px-4 py-2.5 text-center font-medium text-white hover:bg-blue-700">
              Enroll now
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
