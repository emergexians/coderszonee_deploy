// app/(public)/courses/page.tsx
import type { Metadata } from "next";
import CoursesClient from "./CoursesClient";

type SP = Record<string, string | string[] | undefined>;

function pick(sp: SP, key: string): string | undefined {
  const v = sp?.[key];
  return Array.isArray(v) ? v[0] : v || undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SP;
}): Promise<Metadata> {
  const q = pick(searchParams, "q");
  const category = pick(searchParams, "category");
  const subCategory = pick(searchParams, "subCategory");
  const level = pick(searchParams, "level");

  const filters = [category, subCategory, level].filter(Boolean) as string[];

  let title = "All Courses — Coderszonee";
  if (q) {
    title = `Courses matching “${q}” — EDTECH`;
  } else if (filters.length) {
    title = `${filters.join(" · ")} Courses — EDTECH`;
  }

  let description = "Browse all courses across paths and technologies.";
  if (q) {
    description = `Browse courses matching “${q}”${
      category ? ` in ${category}` : ""
    }. Learn at your level with hands-on projects.`;
  } else if (filters.length) {
    description = `Explore ${filters.join(
      " • "
    )} courses. Find the right fit for your goals.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function CoursesPage() {
  return <CoursesClient />;
}
