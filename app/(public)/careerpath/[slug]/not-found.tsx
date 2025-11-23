// app/(public)/careerpath/[slug]/not-found.tsx
import Link from "next/link";
import { GraduationCap, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
        <GraduationCap className="h-10 w-10" />
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Career path not found
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Sorry, we couldn’t find the career path you’re looking for. It may have been
        removed or doesn’t exist.
      </p>

      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/careerpath"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <GraduationCap className="h-4 w-4" />
          Browse Career Paths
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/10"
        >
          <Home className="h-4 w-4" />
          Back Home
        </Link>
      </div>
    </div>
  );
}
