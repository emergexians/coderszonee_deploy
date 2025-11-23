// app/(public)/skillpath/SkillPathClient.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Clock, GraduationCap, Star, Users } from "lucide-react";

export type SyllabusSection = { title: string; items?: string[] };

export interface SkillPathItem {
  _id: string;
  slug?: string;
  name: string;
  desc?: string;
  img?: string;
  href?: string;
  duration?: string;
  level?: "Beginner" | "Intermediate" | "Advanced" | string;
  rating?: number;
  students?: number;
  skills?: string[];
  perks?: string[];
  syllabus?: SyllabusSection[];
}

type Props = { initialItems: SkillPathItem[] };

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
type LevelFilter = (typeof LEVELS)[number];

function normalizeLevel(lvl?: string): "Beginner" | "Intermediate" | "Advanced" | string {
  if (!lvl) return "";
  const s = String(lvl).trim().toLowerCase();
  if (s.startsWith("beg")) return "Beginner";
  if (s.startsWith("int")) return "Intermediate";
  if (s.startsWith("adv")) return "Advanced";
  return lvl;
}

function cardHref(p: SkillPathItem) {
  if (p.href) return p.href;
  if (p.slug) return `/skillpath/${encodeURIComponent(p.slug)}`;
  return `/skillpath/${encodeURIComponent((p.name || "path").toLowerCase().replace(/\s+/g, "-"))}`;
}

export default function SkillPathClient({ initialItems }: Props) {
  const [items] = useState<SkillPathItem[]>(Array.isArray(initialItems) ? initialItems : []);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LevelFilter>("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items || []).filter((p) => {
      const name = p.name?.toLowerCase() ?? "";
      const desc = p.desc?.toLowerCase() ?? "";
      const skills = (p.skills ?? []).map((s) => s.toLowerCase());
      const matchesSearch = !q || name.includes(q) || desc.includes(q) || skills.some((s) => s.includes(q));
      const lvlNorm = normalizeLevel(p.level);
      const matchesFilter = filter === "All" || lvlNorm === filter;
      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Explore Skill Paths</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Choose a path to master coding skills step by step.</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search paths…"
            className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-black/30 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search skill paths"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-3">
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              filter === lvl
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
            aria-pressed={filter === lvl}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No skill paths found.</p>
      ) : (
        <motion.div
          className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        >
          {filtered.map((p) => (
            <motion.div
              key={p._id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className="h-full"
            >
              <Link
                href={cardHref(p)}
                className="group block h-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-lg dark:border-gray-800 dark:bg-black/30"
              >
                <div className="flex h-full flex-col">
                  {/* Thumbnail (fixed ratio keeps all equal) */}
                  <div className="relative w-full overflow-hidden rounded-xl aspect-[16/9]">
                    <Image
                      src={p.img || "/assets/thumbnails/ai.png"}
                      alt={p.name}
                      fill
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover transition group-hover:scale-105"
                      priority={false}
                    />
                  </div>

                  {/* Title (reserve space for 2 lines) */}
                  <h2 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 min-h-[3rem]">
                    {p.name}
                  </h2>

                  {/* Description (reserve space for 2 lines) */}
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[3.25rem]">
                    {p.desc || "Learn by building — practical, project-based path."}
                  </p>

                  {/* Meta pinned to bottom so all cards match */}
                  <div className="mt-auto flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    {p.duration && (
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-4 w-4" /> {p.duration}
                      </span>
                    )}
                    {p.level && (
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <GraduationCap className="h-4 w-4" /> {normalizeLevel(p.level)}
                      </span>
                    )}
                    {typeof p.rating === "number" && p.rating > 0 && (
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Star className="h-4 w-4 text-yellow-500" /> {p.rating.toFixed(1)}
                      </span>
                    )}
                    {typeof p.students === "number" && p.students > 0 && (
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Users className="h-4 w-4" /> {p.students.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
