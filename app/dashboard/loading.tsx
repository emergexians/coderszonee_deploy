// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-36 bg-gray-200 rounded-2xl" />
        <div className="h-36 bg-gray-200 rounded-2xl" />
        <div className="h-36 bg-gray-200 rounded-2xl" />
      </div>
      <div className="h-5 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 bg-gray-200 rounded-2xl" />
        <div className="h-28 bg-gray-200 rounded-2xl" />
        <div className="h-28 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}
