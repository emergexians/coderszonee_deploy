// app/checkout/success/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { color } from "framer-motion";

type CourseType = "careerpath" | "skillpath" | "course" | "hackathon";

const TYPE_MAP: Record<
  CourseType,
  { base: string; label: string; verb: "enrolled" | "registered" }
> = {
  careerpath: { base: "/careerpath", label: "Career Path", verb: "enrolled" },
  skillpath: { base: "/skillpath", label: "Skill Path", verb: "enrolled" },
  course: { base: "/courses", label: "Course", verb: "enrolled" }, // change to "/course" if your route is singular
  hackathon: { base: "/hackathons", label: "Hackathon", verb: "registered" },
};

function normalizeCourseType(raw: string | null): CourseType {
  const s = (raw ?? "").toLowerCase().trim();
  const singular = s.endsWith("s") ? s.slice(0, -1) : s; // accepts "hackathons" → "hackathon"
  if (singular in TYPE_MAP) return singular as CourseType;
  return "skillpath"; // default
}

export default function CheckoutSuccess() {
  const sp = useSearchParams();

  const type = normalizeCourseType(sp.get("course"));
  const conf = TYPE_MAP[type];

  const slug = (sp.get("slug") ?? "").trim();
  const detailUrl = slug ? `${conf.base}/${encodeURIComponent(slug)}` : conf.base;
  const catalogUrl = conf.base;

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold">You’re {conf.verb}!</h1>

      <p className="mt-2 text-gray-600">
        To proceed, please <a href="/auth/signin"><b>log in</b></a> to your account and complete the payment. We’ve recorded your {conf.verb === "registered" ? "registration" : "enrollment"} for the{" "}
        {conf.label}.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href={detailUrl}
          className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700"
        >
          Go to {conf.label}
        </Link>

        <Link
          href={catalogUrl}
          className="inline-block rounded-xl border px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          Explore more
        </Link>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        If the page doesn’t open, copy this link:{" "}
        <span className="font-mono break-all">{detailUrl}</span>
      </p>
    </div>
  );
}
