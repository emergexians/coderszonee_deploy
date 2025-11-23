// app/admin/paths/page.tsx
"use client";
import dynamic from "next/dynamic";

const PathsAdmin = dynamic(() => import("@/components/admin/PathsAdmin"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border bg-white p-6">
      <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
      <div className="h-10 w-full bg-gray-100 rounded mb-3 animate-pulse" />
      <div className="h-64 w-full bg-gray-100 rounded animate-pulse" />
    </div>
  ),
});

export default function AdminPathsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Skills, Career and Courses</h1>
        <p className="text-sm text-gray-600">Create, list, and delete paths/courses.</p>
      </header>
      <PathsAdmin />
    </div>
  );
}
