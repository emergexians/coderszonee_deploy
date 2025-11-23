"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { BookOpen, Check, Clock, Filter, GraduationCap, Layers, Loader2, Search, Star, Tag } from "lucide-react";

type CatCourse = {
  id: string; title: string; description: string; level: string; durationHours: number; rating: number; students: number; category: string; tags?: string[]; thumbnail?: string; isNew?: boolean;
};

export default function ExploreCoursesPage() {
  const [all, setAll] = useState<CatCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [lvl, setLvl] = useState("All");
  const [sort, setSort] = useState("new");
  const [enrolling, startEnroll] = useTransition();
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/courses", { headers: { accept: "application/json" } });
        if (r.ok) setAll(await r.json()); else setAll(mockCourses());
      } catch { setAll(mockCourses()); }
      finally { setLoading(false); }
    })();
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(all.map((c) => c.category)))], [all]);
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const filtered = useMemo(() => {
    let arr = all.slice();
    const s = q.trim().toLowerCase();
    if (s) arr = arr.filter((c) => [c.title, c.description, c.category, ...(c.tags || [])].join(" ").toLowerCase().includes(s));
    if (cat !== "All") arr = arr.filter((c) => c.category === cat);
    if (lvl !== "All") arr = arr.filter((c) => c.level === lvl);
    if (sort === "new") arr.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    if (sort === "popular") arr.sort((a, b) => b.students - a.students);
    if (sort === "rating") arr.sort((a, b) => b.rating - a.rating);
    if (sort === "duration") arr.sort((a, b) => a.durationHours - b.durationHours);
    return arr;
  }, [all, q, cat, lvl, sort]);

  function enroll(id: string) {
    if (enrolledIds.has(id)) return;
    startEnroll(async () => {
      setEnrolledIds((p) => new Set(p).add(id));
      try {
        await fetch("/api/student/enroll", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
      } catch {
        setEnrolledIds((p) => { const n = new Set(p); n.delete(id); return n; });
        alert("Failed to enroll");
      }
    });
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100" style={{ paddingLeft: "var(--sidebar-width, 0)" }}>
      <div className="h-4 lg:h-6" />
      <div className="mx-auto max-w-7xl p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500"><Layers className="h-4 w-4" /> <span>Courses</span></div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Explore and Enroll</h1>
          </div>
          <Link href="/student/courses" className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800">My Courses</Link>
        </div>

        {/* Toolbar (same as before) */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <label className="sr-only" htmlFor="q">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, tag or category..." className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-orange-500 dark:border-neutral-800 dark:bg-neutral-800" />
            </div>
          </div>
          <div className="sm:col-span-3">
            <div className="relative">
              <Tag className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="w-full appearance-none rounded-lg border border-neutral-200 bg-white pl-9 pr-8 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-orange-500 dark:border-neutral-800 dark:bg-neutral-800">{categories.map((c) => (<option key={c}>{c}</option>))}</select>
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <select value={lvl} onChange={(e) => setLvl(e.target.value)} className="w-full appearance-none rounded-lg border border-neutral-200 bg-white pl-9 pr-8 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-orange-500 dark:border-neutral-800 dark:bg-neutral-800">{levels.map((l) => (<option key={l}>{l}</option>))}</select>
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full appearance-none rounded-lg border border-neutral-200 bg-white pl-9 pr-8 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-orange-500 dark:border-neutral-800 dark:bg-neutral-800">
                <option value="new">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="duration">Shortest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results (catalog cards) */}
        <div className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-44 rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-800 animate-pulse" />))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <CatalogCard key={c.id} c={c} isEnrolled={enrolledIds.has(c.id)} enrolling={enrolling} onEnroll={() => enroll(c.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function CatalogCard({ c, isEnrolled, enrolling, onEnroll }: { c: CatCourse; isEnrolled: boolean; enrolling: boolean; onEnroll: () => void }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-800">
      <div className="relative h-32 w-full bg-neutral-100 dark:bg-neutral-900">
        {c.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.thumbnail} alt="thumbnail" className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-neutral-400"><BookOpen className="h-8 w-8" /></div>
        )}
        {c.isNew && <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">New</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">{c.title}</h3>
          <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 dark:bg-neutral-700/40 dark:text-neutral-200">{c.level}</span>
        </div>
        <p className="text-xs text-neutral-500 line-clamp-2">{c.description}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-neutral-600 dark:text-neutral-300">
          <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {c.rating.toFixed(1)}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {c.durationHours}h</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {c.students.toLocaleString()} students</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs font-medium text-orange-600">{c.category}</span>
          <div className="flex items-center gap-2">
            <Link href={`/student/courses/${c.id}`} className="text-xs font-semibold text-neutral-700 underline/50 hover:underline dark:text-neutral-200">Details</Link>
            <button disabled={isEnrolled || enrolling} onClick={onEnroll} className="inline-flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-60">
              {isEnrolled ? <Check className="h-4 w-4" /> : enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEnrolled ? "Enrolled" : "Enroll"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function mockCourses(): CatCourse[] {
  return [
    { id: "react-ts", title: "React + TypeScript: Build Production UIs", description: "Strong typing, hooks, patterns, and performance.", level: "Intermediate", durationHours: 14, rating: 4.8, students: 12850, category: "Web", tags: ["react", "typescript", "frontend"], isNew: true, thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1600&auto=format&fit=crop" },
    { id: "ml-found", title: "Intro to Machine Learning", description: "Supervised/Unsupervised basics with projects.", level: "Beginner", durationHours: 20, rating: 4.6, students: 22100, category: "Data", tags: ["python", "ml", "sklearn"], isNew: true, thumbnail: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1600&auto=format&fit=crop" },
    { id: "system-design", title: "System Design for Interviews", description: "Scalable architectures with case studies.", level: "Advanced", durationHours: 10, rating: 4.8, students: 31000, category: "System Design", tags: ["design", "scalability", "interview"], isNew: true, thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop" },
  ];
}
