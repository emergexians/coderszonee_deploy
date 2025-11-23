// app/(public)/skillpaths/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
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
import SkillPathModel from "@/models/courses/SkillPath";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------- Types ---------- */
interface PageProps {
  params: { slug: string };
}

type SyllabusSection = { title: string; items?: string[] };
type SkillPathDoc = {
  _id: string;
  slug?: string;
  name: string;
  desc?: string;
  img?: string;
  href?: string;
  duration?: string;
  level?: string;
  rating?: number;
  students?: number;
  perks?: string[];
  syllabus?: SyllabusSection[];
  skills?: string[];
};

/* ---------- Helpers ---------- */
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findBySlugOrHref(slug: string) {
  await dbConnect();
  const rx = new RegExp(`/${escapeRegex(slug)}$`, "i");
  return SkillPathModel.findOne({
    $or: [{ slug }, { href: rx }, { href: `/skillpaths/${slug}` }],
  })
    .select(
      "slug name desc img href duration level rating students perks syllabus skills"
    )
    .lean<SkillPathDoc | null>();
}

/* ---------- Metadata ---------- */
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { slug } = params;
  const course = await findBySlugOrHref(slug);

  const title = course
    ? `${course.name} — Coderszonee`
    : "Skill Path — Coderszonee";

  const description =
    course?.desc ||
    (course
      ? `Learn ${course.name} with projects and a structured syllabus.`
      : "Explore a hands-on skill path.");

  return {
    title,
    description,
    alternates: { canonical: `/skillpaths/${slug}` },
    openGraph: {
      title,
      description,
      url: `/skillpaths/${slug}`,
      images: course?.img ? [{ url: course.img, alt: course.name }] : [],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/* ---------- Page ---------- */
export default async function SkillPathDetailPage({ params }: PageProps) {
  const { slug } = params;
  const course = await findBySlugOrHref(slug);
  if (!course) notFound();

  const {
    name,
    desc,
    img,
    duration,
    level,
    rating,
    students,
    perks,
    syllabus,
    skills,
  } = course;

  const detailSlug = course.slug ?? slug;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden rounded-2xl">
          <Image
            src={img || "/assets/thumbnails/ai.png"}
            alt={name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              {name}
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              {desc || "Learn by building — practical, project-based path."}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
              {duration && (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-5 w-5" /> {duration}
                </span>
              )}
              {level && (
                <span className="inline-flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" /> {level}
                </span>
              )}
              {typeof rating === "number" && rating > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  {rating.toFixed(1)}
                </span>
              )}
              {typeof students === "number" && students > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {students.toLocaleString()} learners
                </span>
              )}
            </div>

            {/* Skills */}
            {Array.isArray(skills) && skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((s) => (
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

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href="#syllabus"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700"
            >
              View syllabus
            </a>
            <Link
              href={`/checkout?course=skillpath&slug=${encodeURIComponent(
                detailSlug
              )}`}
              className="inline-flex items-center justify-center rounded-xl border px-5 py-2.5 font-medium hover:bg-gray-50 dark:hover:bg-white/10"
            >
              Enroll now
            </Link>
          </div>
        </div>
      </div>

      {/* Syllabus + Sidebar */}
      <div id="syllabus" className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">Syllabus</h2>

          {Array.isArray(syllabus) && syllabus.length > 0 ? (
            syllabus.map((sec, i) => (
              <div
                key={`${sec.title}-${i}`}
                className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-black/30"
              >
                <h3 className="font-medium">{sec.title}</h3>
                {Array.isArray(sec.items) && sec.items.length > 0 && (
                  <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {sec.items.map((it, idx) => (
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
            <p className="text-sm text-gray-500">
              Syllabus will be published soon.
            </p>
          )}
        </div>

        <aside className="md:col-span-1">
          <div className="md:sticky md:top-24 rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-black/30">
            <h3 className="font-semibold">What you’ll get</h3>

            {Array.isArray(perks) && perks.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {perks.map((p, i) => (
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

            <Link
              href={`/checkout?course=skillpath&slug=${encodeURIComponent(
                detailSlug
              )}`}
              className="mt-4 block w-full rounded-xl bg-blue-600 px-4 py-2.5 text-center font-medium text-white hover:bg-blue-700"
            >
              Enroll now
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
