import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] grid place-items-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <p className="text-sm font-semibold text-orange-600">404 error</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Page not found
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sorry, we couldn’t find the page you’re looking for.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-orange-600"
          >
            Go home
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 font-medium hover:bg-gray-50 dark:hover:bg-white/5"
          >
            Browse courses
          </Link>
          <Link
            href="/skillpath"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 font-medium hover:bg-gray-50 dark:hover:bg白/5"
          >
            Explore skill paths
          </Link>
        </div>
      </div>
    </main>
  );
}
