// app/checkout/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, GraduationCap, Star, Users } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { SkillPath } from "@/models/courses/SkillPath";
import { CareerPath } from "@/models/courses/CareerPath";
import { Course } from "@/models/courses/Course";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CourseType = "skillpath" | "careerpath" | "course";
type SP = { course?: string; slug?: string };

type CourseDocLean = {
  _id?: unknown;
  name?: string;
  title?: string;
  desc?: string;
  duration?: string;
  level?: string;
  rating?: number;
  students?: number;
  skills?: string[] | null | undefined;
  img?: string;
  cover?: string;
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeType(raw: string | null | undefined): CourseType {
  const s = (raw ?? "").toLowerCase().trim();
  if (s === "skillpath" || s === "careerpath" || s === "course") return s;
  return "course";
}

export default async function CheckoutPage({
  searchParams,
}: {
  // Next 15 passes this as a Promise
  searchParams: Promise<SP>;
}) {
  // ✅ Avoid `use()`: just await the promise
  const sp = await searchParams;
  const courseType = normalizeType(sp.course);
  const slug = (sp.slug ?? "").trim();
  if (!slug) notFound();

  await dbConnect();

  const where = {
    $or: [
      { slug },
      { href: { $regex: `/${escapeRegExp(slug)}$`, $options: "i" } },
    ],
  };

  let courseDoc: CourseDocLean | null = null;

  if (courseType === "careerpath") {
    courseDoc = await CareerPath.findOne(where).lean<CourseDocLean>();
  } else if (courseType === "skillpath") {
    courseDoc = await SkillPath.findOne(where).lean<CourseDocLean>();
  } else {
    courseDoc = await Course.findOne(where).lean<CourseDocLean>();
  }

  if (!courseDoc) notFound();

  // Pricing (customize as needed)
  const price =
    courseType === "careerpath"
      ? 6999
      : courseType === "course"
      ? 2999
      : 4999;
  const currency = "INR";

  // Normalize fields
  const name = courseDoc.name || courseDoc.title || "Course";
  const desc = courseDoc.desc || "";
  const duration = courseDoc.duration;
  const level = courseDoc.level;
  const rating = courseDoc.rating;
  const students = courseDoc.students;
  const skills: string[] = Array.isArray(courseDoc.skills)
    ? courseDoc.skills
    : [];
  const img =
    courseDoc.img || courseDoc.cover || "/assets/thumbnails/ai.png";

  const visibleSkills = skills.slice(0, 10);
  const remaining = Math.max(skills.length - visibleSkills.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Summary */}
        <div className="md:col-span-2 rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black/30">
          <div className="flex gap-4">
            <div className="relative h-28 w-44 overflow-hidden rounded-lg flex-shrink-0">
              <Image
                src={img}
                alt={name}
                fill
                className="object-cover"
                sizes="176px"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-600/20 dark:text-blue-200">
                  {courseType === "careerpath"
                    ? "Career Path"
                    : courseType === "skillpath"
                    ? "Skill Path"
                    : "Course"}
                </span>
              </div>

              <h2 className="mt-1 font-semibold text-lg truncate">{name}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {desc}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                {duration && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {duration}
                  </span>
                )}
                {level && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" /> {level}
                  </span>
                )}
                {typeof rating === "number" && rating > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />{" "}
                    {rating.toFixed(1)}
                  </span>
                )}
                {typeof students === "number" && students > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-4 w-4" />{" "}
                    {students.toLocaleString()}
                  </span>
                )}
              </div>

              {visibleSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {visibleSkills.map((sk) => (
                    <span
                      key={sk}
                      className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full dark:bg-blue-600/20 dark:text-blue-200"
                    >
                      {sk}
                    </span>
                  ))}
                  {remaining > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{remaining} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment */}
        <aside className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black/30">
          <h3 className="font-semibold mb-3">Enroll</h3>

          <div className="mb-3 text-sm text-gray-700 dark:text-gray-200">
            <div className="flex items-baseline justify-between">
              <span>Price</span>
              <span className="font-semibold">
                {currency} {price.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Pass the selected type AS-IS */}
          <CheckoutForm
            courseType={courseType}
            slug={slug}
            price={price}
            currency={currency}
          />

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            (Demo checkout) This records your enrollment. Replace with your
            payment gateway later.
          </p>
        </aside>
      </div>
    </div>
  );
}
