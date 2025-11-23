"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Search, Clock, GraduationCap, Star, Users } from "lucide-react";

interface CareerPath {
  _id: string;
  name: string;
  duration: string;
  desc: string;
  img: string;
  href: string;
  skills?: string[];
  rating?: number;
  students?: number;
  level: "Beginner" | "Intermediate" | "Advanced" | string;
}

export default function CareerPathPage() {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await fetch("/api/course/careerpaths", { cache: "no-store" });
        const json = await res.json();
        // API returns { data: CareerPath[], ... }
        const items = Array.isArray(json) ? json : json?.data;
        setCareerPaths(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error("Error fetching career paths:", err);
        setCareerPaths([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPaths();
  }, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(careerPaths)) return [];
    return careerPaths.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || p.level === filter;
      return matchesSearch && matchesFilter;
    });
  }, [careerPaths, search, filter]);

  if (loading) {
    // Let your route-level loading.tsx handle skeletons
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Explore Career Paths
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Pick a career track and follow a structured roadmap to get job-ready.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search careers..."
            className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-black/30 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-3">
        {["All", "Beginner", "Intermediate", "Advanced"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              filter === lvl
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No career paths found.
        </p>
      ) : (
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
        >
          {filtered.map((path) => (
            <motion.a
              href={path.href}
              key={path._id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-lg dark:border-gray-800 dark:bg-black/30"
            >
              {/* Thumbnail */}
              <div className="relative mb-4 h-40 w-full overflow-hidden rounded-xl">
                <Image
                  src={path.img}
                  alt={path.name}
                  fill
                  className="object-cover transition group-hover:scale-105"
                />
              </div>

              {/* Title */}
              <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
                {path.name}
              </h2>

              {/* Description */}
              <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {path.desc}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {path.duration}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" /> {path.level}
                </span>
                {typeof path.rating === "number" && path.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" /> {path.rating}
                  </span>
                )}
                {typeof path.students === "number" && path.students > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {path.students.toLocaleString()}
                  </span>
                )}
              </div>
            </motion.a>
          ))}
        </motion.div>
      )}
    </div>
  );
}
