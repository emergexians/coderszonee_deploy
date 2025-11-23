"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Star, User, Clock, GraduationCap } from "lucide-react";

/* Category & Sub-Category map (keep in sync with admin) */
const CATEGORY_MAP: Record<string, string[]> = {
  "Web Development": ["HTML & CSS", "JavaScript", "React / Next.js", "Node.js", "Full-Stack"],
  "Data Science": ["Python", "Pandas", "Machine Learning", "Deep Learning", "Statistics"],
  "AI & ML": ["NLP", "Computer Vision", "Generative AI", "Reinforcement Learning"],
  Business: ["Marketing", "Finance", "Entrepreneurship", "Product Management"],
  Design: ["UI/UX", "Graphic Design", "Figma", "3D & Motion"],
};
const CATEGORY_LIST = Object.keys(CATEGORY_MAP);
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;

type Course = {
  _id: string;
  title: string;
  cover?: string;
  duration?: string;
  level?: string;
  href?: string;
  slug?: string;
  category?: string;
  subCategory?: string;
  rating?: number;
  students?: number;
  desc?: string;
};

// fallback slugify (matches server logic closely)
function slugify(raw: string) {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function CoursesClient() {
  const [category, setCategory] = useState<string>("All");
  const [subCategory, setSubCategory] = useState<string>("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const limit = 18;

  // Debounce
  const qRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (qRef.current) clearTimeout(qRef.current);
    qRef.current = setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => {
      if (qRef.current) clearTimeout(qRef.current);
    };
  }, [q]);

  const subOptions = useMemo(() => (category !== "All" ? CATEGORY_MAP[category] : []), [category]);

  useEffect(() => {
    if (category === "All") setSubCategory("");
    else if (subCategory && !subOptions.includes(subCategory)) setSubCategory("");
  }, [category, subOptions, subCategory]);

  const [items, setItems] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  function buildUrl() {
    const sp = new URLSearchParams();
    if (category !== "All") sp.set("category", category);
    if (subCategory) sp.set("subCategory", subCategory);
    if (level !== "All") sp.set("level", level);
    if (debouncedQ) sp.set("q", debouncedQ);
    sp.set("page", String(page));
    sp.set("limit", String(limit));
    return `/api/course/courses?${sp.toString()}`;
  }

  useEffect(() => {
    let on = true;
    setLoading(true);
    setErr(null);
    fetch(buildUrl(), { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Failed with ${r.status}`);
        }
        return r.json();
      })
      .then((data) => {
        if (!on) return;
        setItems(Array.isArray(data?.items) ? data.items : data?.data ?? []);
        setTotal(Number(data?.total) || 0);
      })
      .catch((e) => {
        if (!on) return;
        console.error(e);
        setItems([]);
        setTotal(0);
        setErr("Failed to load courses");
      })
      .finally(() => on && setLoading(false));
    return () => {
      on = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subCategory, level, debouncedQ, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">All Courses</h1>
          <p className="mt-1 text-gray-500">Learn by doing: curated, project-based lessons across stacks.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses…"
            className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            aria-label="Search courses"
          />
        </div>
      </div>

      {/* Filters Tabs (Levels) + Category selectors */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => {
              setLevel(lvl);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              level === lvl ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            aria-pressed={level === lvl}
          >
            {lvl}
          </button>
        ))}

        <select
          className="ml-2 rounded-lg border px-3 py-2 text-sm border-gray-300"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All Categories</option>
          {CATEGORY_LIST.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border px-3 py-2 text-sm border-gray-300 disabled:opacity-60"
          disabled={category === "All"}
          value={subCategory}
          onChange={(e) => {
            setSubCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Sub-Categories</option>
          {subOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : err ? (
        <p className="text-sm text-red-600">{err}</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500">No courses found for this filter.</p>
      ) : (
        <motion.div
          className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
        >
          {items.map((c) => {
            const href = c.href || (c.slug ? `/courses/${c.slug}` : `/courses/${slugify(c.title || "")}`);

            return (
              <motion.div
                key={c._id}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                className="h-full"
              >
                <Link
                  href={href}
                  className="group block h-full rounded-2xl border border-gray-200 bg-white p-0 shadow-sm transition hover:shadow-lg overflow-hidden"
                >
                  {/* IMAGE (top) */}
                  <div className="relative w-full overflow-hidden rounded-t-xl aspect-[16/9] bg-gray-50">
                    {c.cover ? (
                      // Next/Image requires width/height OR fill; using fill + parent relative
                      <Image src={c.cover} alt={c.title} fill className="object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">No image</div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 flex flex-col h-full">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{c.title}</h3>

                    {/* Description (visible, clamped) */}
                    {c.desc ? (
                      <p className="mt-2 text-sm text-gray-700 line-clamp-3">{c.desc}</p>
                    ) : null}

                    {/* Category / subCategory */}
                    <p className="mt-2 text-xs text-gray-500">
                      {c.category}
                      {c.subCategory ? <span className="mx-1">•</span> : null}
                      {c.subCategory}
                    </p>

                    {/* Single-line metadata row (duration • level • rating • students) */}
                    <div className="mt-auto flex items-center gap-4 text-sm text-gray-500">
                      {/* Use flex and separators */}
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        {c.duration && (
                          <>
                            <Clock className="h-4 w-4" />
                            <span>{c.duration}</span>
                          </>
                        )}
                      </div>

                      {c.level && (
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <GraduationCap className="h-4 w-4" />
                          <span>{c.level}</span>
                        </div>
                      )}

                      {(c.rating ?? 0) > 0 && (
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{(c.rating as number).toFixed(1)}</span>
                        </div>
                      )}

                      {(c.students ?? 0) > 0 && (
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <User className="h-4 w-4" />
                          <span>{(c.students as number).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="inline-block h-4 w-4" />
          </button>
          <span className="text-sm">Page {page} / {totalPages}</span>
          <button
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="inline-block h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
