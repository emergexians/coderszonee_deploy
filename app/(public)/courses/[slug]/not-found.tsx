// app/(public)/courses/[slug]/not-found.tsx
import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <main
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 text-center"
      aria-live="polite"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
        <Search className="h-8 w-8 text-gray-600 dark:text-gray-300" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Course not found
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        The course you’re looking for doesn’t exist or may have been moved.
      </p>

      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/courses"
          className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700"
        >
          Browse Courses
        </Link>
        <Link
          href="/"
          className="inline-block rounded-xl border px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
