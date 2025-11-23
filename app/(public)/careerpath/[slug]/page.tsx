// app/(public)/careerpath/[slug]/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Clock,
  GraduationCap,
  Star,
  Users,
  CheckCircle2,
} from "lucide-react";
import { dbConnect } from "@/lib/db";
import { CareerPath } from "@/models/courses/CareerPath";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // always fresh

type PageProps = { params: Promise<{ slug: string }> };

/* ---------- DB Query ---------- */
async function findBySlugOrHref(slug: string) {
  await dbConnect();
  return CareerPath.findOne({
    $or: [{ slug }, { href: { $regex: `/${slug}$`, $options: "i" } }],
  }).lean();
}

/* ---------- Metadata ---------- */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await findBySlugOrHref(slug);

  const title = course ? `${course.name} — Coderszonee` : "Career Path — Coderszonee";
  const description =
    course?.desc ||
    (course
      ? `Learn ${course.name} with projects and structured syllabus.`
      : "Explore career paths with hands-on learning.");

  return {
    title,
    description,
    alternates: { canonical: `/careerpath/${slug}` },
    openGraph: {
      title,
      description,
      url: `/careerpath/${slug}`,
      images: course?.img ? [{ url: course.img, alt: course.name }] : [],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/* ---------- Page ---------- */
export default async function CareerPathDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await findBySlugOrHref(slug);

  if (!course) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative h-64 w-full overflow-hidden rounded-2xl md:h-80">
          <Image
            src={course.img || "/assets/thumbnails/default.png"}
            alt={course.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {course.name}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {course.desc || "Learn by building — practical, project-based path."}
            </p>

            {/* Stats */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              {course.duration && (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-5 w-5" /> {course.duration}
                </span>
              )}
              {course.level && (
                <span className="inline-flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" /> {course.level}
                </span>
              )}
              {typeof course.rating === "number" && course.rating > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" /> {course.rating.toFixed(1)}
                </span>
              )}
              {typeof course.students === "number" && course.students > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Users className="h-5 w-5" /> {course.students.toLocaleString()} learners
                </span>
              )}
            </div>

            {/* Skills */}
            {Array.isArray(course.skills) && course.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {course.skills.map((s: string) => (
                  <span
                    key={s}
                    className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-600/20 dark:text-blue-200 px-2.5 py-1 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-6 flex gap-3">
            <a
              href="#syllabus"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700"
            >
              View syllabus
            </a>
            <a
              href={`/checkout?course=careerpath&slug=${course.slug ?? slug}`}
              className="inline-flex items-center justify-center rounded-xl border px-5 py-2.5 font-medium hover:bg-gray-50 dark:hover:bg-white/10"
            >
              Enroll now
            </a>
          </div>
        </div>
      </div>

      {/* Syllabus + Sidebar */}
      <div id="syllabus" className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Syllabus</h2>

          {Array.isArray(course.syllabus) && course.syllabus.length > 0 ? (
            course.syllabus.map(
              (sec: { title: string; items?: string[] }, i: number) => (
                <div
                  key={`${sec.title}-${i}`}
                  className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-black/30"
                >
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
              )
            )
          ) : (
            <p className="text-sm text-gray-500">
              Syllabus will be published soon.
            </p>
          )}
        </div>

        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="sticky top-24 rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-black/30">
            <h3 className="font-semibold">What you’ll get</h3>

            {Array.isArray(course.perks) && course.perks.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {course.perks.map((p: string, i: number) => (
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

            <a
              href={`/checkout?course=careerpath&slug=${course.slug ?? slug}`}
              className="mt-4 block w-full rounded-xl bg-blue-600 px-4 py-2.5 text-center font-medium text-white hover:bg-blue-700"
            >
              Enroll now
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
