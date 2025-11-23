// app/admin/page.tsx
import Link from "next/link";
import {
  Users2,
  BookOpen,
  Layers3,
  ArrowRight,
  Plus,
  ShieldCheck,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnyDoc = {
  _id?: string;
  title?: string;
  name?: string;
  href?: string;
  category?: string;
  subCategory?: string;
  createdAt?: string;
};

async function safeJson<T = any>(res: Response, fallback: T): Promise<T> {
  try {
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (!ct.includes("application/json")) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

function extractCount(payload: any): number | null {
  if (payload == null) return null;
  // Accepted shapes:
  // 1) { count: number }
  if (typeof payload.count === "number") return payload.count;
  // 2) number
  if (typeof payload === "number") return payload;
  // 3) { data: { count: number } }
  if (payload?.data && typeof payload.data.count === "number") return payload.data.count;
  // 4) { total: number }
  if (typeof payload.total === "number") return payload.total;
  // 5) { items: [...] }
  if (Array.isArray(payload.items)) return payload.items.length;
  // 6) array
  if (Array.isArray(payload)) return payload.length;
  return null;
}

async function getList(url: string): Promise<AnyDoc[]> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await safeJson<any>(res, []);
    if (Array.isArray(json)) return json as AnyDoc[];
    const arr = json?.data ?? json?.items;
    return Array.isArray(arr) ? (arr as AnyDoc[]) : [];
  } catch {
    return [];
  }
}

/** Prefer `/count` but accept many shapes and gracefully fallback to a list length */
async function getCount(primaryUrl: string, fallbackListUrl: string, listFallbackValue?: number) {
  try {
    const res = await fetch(primaryUrl, { cache: "no-store" });
    if (res.ok) {
      const json = await safeJson<any>(res, null);
      const c = extractCount(json);
      if (typeof c === "number" && c >= 0) return c;
    }
  } catch {
    /* ignore */
  }
  // If we already have the list length, use it first
  if (typeof listFallbackValue === "number") return listFallbackValue;
  // Otherwise, fetch the list and count
  const items = await getList(fallbackListUrl);
  return items.length || 0;
}

function recent(items: AnyDoc[], n = 5) {
  return items
    .slice()
    .sort((a, b) => {
      const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bd - ad;
    })
    .slice(0, n);
}

function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
}) {
  const Icon = icon;
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-white p-5 hover:shadow-sm transition flex items-center justify-between"
    >
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gray-100 p-3">
          <Icon className="h-6 w-6 text-gray-700" />
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400" />
      </div>
    </Link>
  );
}

function Row({
  title,
  meta,
  href,
}: {
  title: string;
  meta?: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3 hover:bg-gray-50">
      <div className="min-w-0">
        <div className="truncate font-medium">{title}</div>
        {meta && <div className="mt-0.5 text-xs text-gray-500">{meta}</div>}
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:underline"
        >
          Open <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="text-xs text-gray-400">—</span>
      )}
    </div>
  );
}

export default async function AdminDashboard() {
  // Load base lists for "Recent" sections (and as count fallbacks)
  const [users, courses, skillPaths, careerPaths] = await Promise.all([
    getList("/api/users"),
    getList("/api/courses"),
    getList("/api/skillpaths"),
    getList("/api/careerpaths"),
  ]);

  const [usersCount, coursesCount, skillCount, careerCount] = await Promise.all([
    getCount("/api/users/count", "/api/users", users.length).catch((e: any) => {
      console.error("User count error:", e);
      return 0;
    }),
    getCount("/api/courses/count", "/api/courses", courses.length).catch((e: any) => {
      console.error("Course count error:", e);
      return 0;
    }),
    getCount("/api/skillpaths/count", "/api/skillpaths", skillPaths.length).catch((e: any) => {
      console.error("SkillPath count error:", e);
      return 0;
    }),
    getCount("/api/careerpaths/count", "/api/careerpaths", careerPaths.length).catch((e: any) => {
      console.error("CareerPath count error:", e);
      return 0;
    }),
  ]);

  console.log({ usersCount, coursesCount, skillCount, careerCount });
  const recentCourses = recent(courses, 5);
  const recentPaths = recent([...skillPaths, ...careerPaths], 5); 

  // Optional system status
  let healthOk = false;
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    healthOk = res.ok;
  } catch {
    healthOk = false;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">
            Manage users, courses, and learning paths.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/paths"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            New Path / Course
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            <Sparkles className="h-4 w-4" />
            Invite Users
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={usersCount} icon={Users2} href="/admin/users" />
        <StatCard label="Courses" value={coursesCount} icon={BookOpen} href="/admin/courses" />
        <StatCard
          label="Skill Paths"
          value={skillCount}
          icon={Layers3}
          href="/admin/paths?tab=skills"
        />
        <StatCard
          label="Career Paths"
          value={careerCount}
          icon={Layers3}
          href="/admin/paths?tab=careers"
        />
      </div>

      {/* System Status */}
      <div className="rounded-2xl border bg-white p-5 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">System Status</div>
          <div className="mt-1 text-2xl font-semibold">
            {healthOk ? "Healthy" : "Unknown"}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-3 ${healthOk ? "bg-green-100" : "bg-gray-100"}`}>
            <ShieldCheck className={`h-6 w-6 ${healthOk ? "text-green-700" : "text-gray-700"}`} />
          </div>
          <RefreshCcw className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Quick Links */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Quick links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: "/admin/users", title: "Users", desc: "View and manage users" },
            { href: "/admin/paths", title: "Courses/Skill/Career", desc: "Create and manage" },
            { href: "/admin/contacts", title: "Contacts", desc: "View messages from contact page" },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-2xl border bg-white p-5 hover:shadow-sm transition"
            >
              <div className="font-semibold">{c.title}</div>
              <p className="mt-1 text-sm text-gray-600">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent items */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent Courses</h3>
            <Link href="/admin/courses" className="text-sm text-orange-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentCourses.length ? (
              recentCourses.map((c) => (
                <Row
                  key={c._id || c.href || Math.random()}
                  title={c.title || "Untitled course"}
                  meta={[c.category, c.subCategory].filter(Boolean).join(" · ")}
                  href={typeof c.href === "string" ? c.href : undefined}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No courses found.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent Skill/Career Paths</h3>
            <Link href="/admin/paths" className="text-sm text-orange-600 hover:underline">
              Manage
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentPaths.length ? (
              recentPaths.map((p) => (
                <Row
                  key={p._id || p.href || Math.random()}
                  title={p.title || p.name || "Untitled path"}
                  meta={p.href || ""}
                  href={typeof p.href === "string" ? p.href : undefined}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No paths found.</p>
            )}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="rounded-2xl border bg-white p-5">
        <h3 className="font-semibold">Tips</h3>
        <ul className="mt-3 list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>
            Use <span className="font-medium">/admin/paths</span> to add Skill Paths, Career Paths, or Courses
            (includes upload & syllabus builder).
          </li>
          <li>
            Put images under <code className="bg-gray-50 px-1 rounded">/public</code> or upload via the built-in uploader
            for safe, optimized rendering.
          </li>
          <li>Keep categories consistent for better discovery and filtering.</li>
        </ul>
      </section>
    </div>
  );
}
