// app/hackathons/loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="h-9 w-48 rounded bg-gray-200 animate-pulse" />

      {/* Ongoing */}
      <section className="space-y-3">
        <div className="h-6 w-32 rounded bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={`ongoing-${i}`}
              className="rounded-2xl bg-white overflow-hidden animate-pulse"
            >
              <div className="h-40 w-full bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-3 w-5/6 bg-gray-200 rounded" />
                <div className="h-3 w-1/3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming */}
      <section className="space-y-3">
        <div className="h-6 w-32 bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={`upcoming-${i}`}
              className="rounded-2xl bg-white overflow-hidden animate-pulse"
            >
              <div className="h-40 w-full bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-3 w-5/6 bg-gray-200 rounded" />
                <div className="h-3 w-1/3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Past */}
      <section className="space-y-3">
        <div className="h-6 w-20 bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={`past-${i}`}
              className="rounded-2xl bg-white overflow-hidden animate-pulse"
            >
              <div className="h-40 w-full bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-3 w-5/6 bg-gray-200 rounded" />
                <div className="h-3 w-1/3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
