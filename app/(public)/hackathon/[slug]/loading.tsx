// app/hackathons/[slug]/loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative h-64 w-full overflow-hidden rounded-2xl md:h-80 bg-gray-200" />
        <div className="flex flex-col justify-between">
          <div>
            <div className="h-8 w-2/3 rounded bg-gray-200" />
            <div className="mt-3 h-4 w-5/6 rounded bg-gray-200" />
            <div className="mt-1 h-4 w-3/5 rounded bg-gray-200" />
            <div className="mt-5 space-y-3">
              <div className="h-4 w-2/5 rounded bg-gray-200" />
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-1/4 rounded bg-gray-200" />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <div className="h-10 w-36 rounded-xl bg-gray-200" />
            <div className="h-10 w-32 rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Details skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-4">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
              <div className="h-4 w-4/6 rounded bg-gray-200" />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4">
            <div className="h-5 w-28 rounded bg-gray-200" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 w-full rounded bg-gray-200" />
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-white p-4">
            <div className="h-5 w-24 rounded bg-gray-200" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-3/4 rounded bg-gray-200" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <div className="h-5 w-24 rounded bg-gray-200" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 w-2/3 rounded bg-gray-200" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
