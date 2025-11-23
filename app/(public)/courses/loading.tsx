// app/(public)/courses/loading.tsx
export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="h-8 w-64 bg-gray-200 rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    </main>
  );
}
