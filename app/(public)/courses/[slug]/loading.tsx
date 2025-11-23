// app/(public)/courses/[slug]/loading.tsx
export default function Loading() {
  const shimmer =
    "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent dark:before:via-white/10 motion-reduce:before:animate-none";

  return (
    <div
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading course…</span>

      <div className="grid gap-6 md:grid-cols-2">
        <div
          className={`relative h-64 w-full rounded-2xl bg-gray-200 dark:bg-gray-800 ${shimmer}`}
        />
        <div className="space-y-3">
          <div
            className={`h-8 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-800 ${shimmer}`}
          />
          <div
            className={`h-4 w-full rounded bg-gray-200 dark:bg-gray-800 ${shimmer}`}
          />
          <div
            className={`h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800 ${shimmer}`}
          />
          <div className="mt-4 flex gap-3">
            <div
              className={`h-10 w-36 rounded-xl bg-gray-200 dark:bg-gray-800 ${shimmer}`}
            />
            <div
              className={`h-10 w-28 rounded-xl bg-gray-200 dark:bg-gray-800 ${shimmer}`}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          <div
            className={`h-6 w-40 rounded bg-gray-200 dark:bg-gray-800 ${shimmer}`}
          />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`h-24 w-full rounded-xl bg-gray-200 dark:bg-gray-800 ${shimmer}`}
            />
          ))}
        </div>
        <div className="md:col-span-1 space-y-3">
          <div
            className={`h-6 w-48 rounded bg-gray-200 dark:bg-gray-800 ${shimmer}`}
          />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-5 w-full rounded bg-gray-200 dark:bg-gray-800 ${shimmer}`}
            />
          ))}
          <div
            className={`h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-800 ${shimmer}`}
          />
        </div>
      </div>
    </div>
  );
}
