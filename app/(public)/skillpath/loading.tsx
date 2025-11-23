// app/(public)/skillpath/loading.tsx
export default function Loading() {
  const shimmer =
    "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent dark:before:via-white/10 motion-reduce:before:animate-none";

  return (
    <div
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading skill paths…</span>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className={`h-8 w-56 rounded-lg bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
          <div className={`h-4 w-80 rounded bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
        </div>

        {/* Search + quick filter pill */}
        <div className="flex w-full gap-3 sm:w-auto">
          <div className={`h-10 w-full sm:w-64 rounded-xl bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
          <div className={`h-10 w-28 rounded-xl bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
        </div>
      </div>

      {/* Tabs / chips */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`chip-${i}`}
            className={`h-9 w-24 rounded-full bg-gray-200 dark:bg-gray-800 ${shimmer}`}
          />
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`card-${idx}`}
            className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-black/30"
          >
            <div className={`mb-4 h-40 w-full rounded-xl bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
            <div className={`mb-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
            <div className="space-y-2">
              <div className={`h-4 w-full rounded bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
              <div className={`h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className={`h-5 w-20 rounded bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
              <div className={`h-5 w-16 rounded bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
              <div className={`h-5 w-24 rounded bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
            </div>
            <div className="mt-5 flex items-center gap-3">
              <div className={`h-10 w-28 rounded-xl bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
              <div className={`h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="mt-8 flex items-center justify-between">
        <div className={`h-9 w-24 rounded-lg bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`page-${i}`}
              className={`h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-800 ${shimmer}`}
            />
          ))}
        </div>
        <div className={`h-9 w-24 rounded-lg bg-gray-200 dark:bg-gray-800 ${shimmer}`} />
      </div>
    </div>
  );
}
