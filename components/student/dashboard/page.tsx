"use client";

import React from "react";
import { CheckCircle2, Clock, Calendar, BookOpen, UserPlus } from "lucide-react";

/**
 * Student dashboard UI — white / black / orange theme
 * Drop into app/student/dashboard/page.tsx
 *
 * Visual-first: replace the sample data fetch with your real APIs as needed.
 */

type User = { name?: string; urn?: string | null } | null;

export default function DashboardPage() {
  // If you later fetch real user data, reintroduce setUser + useEffect.
  const user: User = { name: "AASHISH KUMAR", urn: "STD/2025/SBCQK" };

  // sample content — replace with real fetches
  const stats = {
    coursesEnrolled: 6,
    badges: 3,
    progressPercent: 64,
    upcoming: 2,
  };

  const ongoing = {
    title: "React Mastery",
    progress: 42,
    module: "Module 4 of 8 — State & Context",
  };

  const recommended = [
    { id: "r1", title: "React Mastery", level: "Intermediate", hours: "18h" },
    { id: "r2", title: "Node.js Best Practices", level: "Beginner", hours: "8h" },
    { id: "r3", title: "Data Structures", level: "Advanced", hours: "24h" },
  ];

  const recent = [
    { id: 1, text: "Completed Quiz — React Hooks", time: "2h ago" },
    { id: 2, text: "Submitted assignment — Node API", time: "1 day ago" },
    { id: 3, text: "Earned badge — JS Fundamentals", time: "3 days ago" },
  ];

  return (
    <div className="min-h-screen bg-white text-black px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name || "Student"} <span className="inline-block">👋</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-sm">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#f97316">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                </svg>
                Student Dashboard
              </span>
              <span className="px-3 py-1 rounded border border-black/10 text-xs bg-white">
                URN: <span className="font-semibold ml-1">{user?.urn ?? "No URN"}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:opacity-95">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                <path d="M13 2L3 7l10 5 10-5-10-5z" />
              </svg>
              Quick Start
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-black/10">
              <Calendar className="h-4 w-4" />
              Calendar
            </button>
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* left column (stats) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border-2 border-black/90 rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-600">Courses enrolled</div>
                  <div className="text-2xl font-bold mt-2">{stats.coursesEnrolled}</div>
                </div>
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">Badges</div>
              <div className="mt-2 flex items-center gap-3">
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-black text-white text-sm">
                  <CheckCircle2 className="w-4 h-4" /> {stats.badges}
                </div>
                <div className="text-sm text-gray-600">
                  Level: <span className="font-medium ml-1">Bronze</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-black/90 rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-600">Overall progress</div>
                  <div className="text-xl font-semibold mt-2">{stats.progressPercent}%</div>
                </div>
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#f97316">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  </svg>
                </div>
              </div>

              <div className="mt-4 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 bg-[#f97316]"
                  style={{ width: `${stats.progressPercent}%` }}
                />
              </div>

              <div className="mt-3 text-xs text-gray-600">
                Next milestone: Complete &quot;React Mastery&quot; — 36% left
              </div>
            </div>

            <div className="border-2 border-black/90 rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                  <div className="text-2xl font-bold mt-2">{stats.upcoming}</div>
                </div>
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                Assignments & quizzes due in next 7 days
              </div>
            </div>
          </div>

          {/* middle column (main cards) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-2 border-black/90 rounded-2xl p-6 flex items-start justify-between">
              <div style={{ flex: 1 }}>
                <div className="text-sm text-gray-600">Ongoing course</div>
                <h2 className="text-xl font-bold mt-1">{ongoing.title}</h2>
                <div className="text-sm text-gray-600 mt-2">{ongoing.module}</div>
              </div>

              <div className="w-36 text-right">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-2xl font-bold mt-2">{ongoing.progress}%</div>
                <div className="mt-4 flex flex-col gap-2">
                  <button className="px-4 py-2 rounded-lg bg-[#f97316] text-white">
                    Continue
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-black/10">
                    Syllabus
                  </button>
                </div>
              </div>
            </div>

            <div className="border-2 border-black/90 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Recommended</div>
                  <h3 className="text-lg font-semibold mt-1">Courses for you</h3>
                </div>
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                  <UserPlus className="w-6 h-6" />
                </div>
              </div>

              <ul className="mt-4 space-y-3">
                {recommended.map((r) => (
                  <li key={r.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-gray-600">
                        {r.level} • {r.hours}
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-md border">View</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* big CTA */}
            <div className="border-2 border-black/90 rounded-2xl p-4">
              <div>
                <h4 className="text-lg font-semibold">Need help with a course?</h4>
                <div className="text-sm text-gray-600 mt-1">
                  Connect with tutors or join study groups to stay on track.
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <button className="px-5 py-3 rounded-lg bg-[#f97316] text-white">
                  Find tutors
                </button>
                <button className="px-5 py-3 rounded-lg border border-black/10">
                  Join study group
                </button>
              </div>
            </div>
          </div>

          {/* right column (recent activity) */}
          <div className="lg:col-span-3">
            <div className="border-2 border-black/90 rounded-2xl p-6 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold">Recent activity</h3>

                <ul className="mt-4 space-y-4">
                  {recent.map((r) => (
                    <li key={r.id} className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-100 grid place-items-center">
                        <CheckCircle2 className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{r.text}</div>
                        <div className="text-xs text-gray-400 mt-1">{r.time}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <button className="w-full px-4 py-3 rounded-lg border border-black/10">
                  View all activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
