// app/admin/courses/page.tsx
"use client";
import dynamic from "next/dynamic";

const CoursesAdmin = dynamic(() => import("@/components/admin/course/career/CareerPathsAdmin"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border bg-white p-6">
      <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
      <div className="h-10 w-full bg-gray-100 rounded mb-3 animate-pulse" />
      <div className="h-64 w-full bg-gray-100 rounded animate-pulse" />
    </div>
  ),
});

export default function AdminCoursesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Career Paths</h1>
        <p className="text-sm text-gray-600">Add, list, and manage courses.</p>
      </header>
      <CoursesAdmin />
    </div>
  );
}
