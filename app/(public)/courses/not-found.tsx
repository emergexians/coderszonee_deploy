// app/(public)/courses/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Course not found</h1>
      <p className="mt-2 text-gray-600">The course you’re looking for doesn’t exist or was removed.</p>
      <Link href="/courses" className="mt-6 inline-block rounded-xl bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">
        Back to all courses
      </Link>
    </main>
  );
}
