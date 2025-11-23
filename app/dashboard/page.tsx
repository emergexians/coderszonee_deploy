// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

function ProgressCircle({ value }: { value: number }) {
  // value: 0..100
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg viewBox="0 0 100 100" className="w-20 h-20">
      <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="10" className="stroke-gray-200" />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        strokeWidth="10"
        className="stroke-indigo-600"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="55" textAnchor="middle" className="fill-gray-900 text-sm font-semibold">
        {Math.round(value)}%
      </text>
    </svg>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // You can redirect if not logged in, but typically middleware should guard this route.
  // If you prefer server redirect here:
  // if (!user) redirect("/auth/signin");

  // Mock data — replace with real queries later
  const enrolled = [
    { id: "react-101", title: "React & Next.js Fundamentals", progress: 42 },
    { id: "ds-201", title: "Python for Data Science", progress: 68 },
    { id: "ui-150", title: "UI/UX with Figma", progress: 15 },
  ];

  const quickLinks = [
    { label: "Career Paths", href: "/careerpath" },
    { label: "Skill Paths", href: "/skillpath" },
    { label: "Continue Learning", href: `/course/${enrolled[0].id}` },
    { label: "Profile", href: "/settings" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back{user ? `, ${user.name}` : ""}</h1>
          <p className="text-gray-600">Here’s a snapshot of your learning this week.</p>
        </div>
        <Link
          href="/auth/logout" // if you expose a POST UI, keep an action; otherwise a button that calls /api/auth/logout
          className="hidden sm:inline-flex px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Logout
        </Link>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border p-5 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Weekly Streak</h3>
            <span className="text-xs text-gray-500">This week</span>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <ProgressCircle value={80} />
            <div>
              <p className="text-3xl font-bold">5 days</p>
              <p className="text-gray-500 text-sm">Keep it up!</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-5 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Hours Learned</h3>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          <p className="mt-4 text-3xl font-bold">6.2h</p>
          <p className="text-gray-500 text-sm">+1.4h vs prev week</p>
        </div>

        <div className="rounded-2xl border p-5 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Certificates</h3>
            <span className="text-xs text-gray-500">All time</span>
          </div>
          <p className="mt-4 text-3xl font-bold">2</p>
          <p className="text-gray-500 text-sm">Next one at 100%</p>
        </div>
      </section>

      {/* Enrolled courses */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Continue learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {enrolled.map((c) => (
            <Link
              key={c.id}
              href={`/course/${c.id}`}
              className="rounded-2xl border p-4 bg-white hover:shadow-sm transition"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <ProgressCircle value={c.progress} />
                </div>
                <div>
                  <h3 className="font-medium">{c.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{c.progress}% complete</p>
                  <span className="inline-block mt-3 text-sm px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                    Resume
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Quick links</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
