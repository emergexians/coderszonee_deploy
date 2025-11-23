// app/admin/courses/page.tsx
"use client";
import dynamic from "next/dynamic";

const CoursesAdmin = dynamic(() => import("@/components/admin/course/courses/CoursesAdmin"), {
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
      <CoursesAdmin />
    </div>
  );
}
