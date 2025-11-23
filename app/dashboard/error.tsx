"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-gray-600">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-lg border hover:bg-gray-50"
      >
        Try again
      </button>
    </div>
  );
}
