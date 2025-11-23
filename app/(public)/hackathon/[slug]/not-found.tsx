// app/hackathons/[slug]/not-found.tsx
import Link from "next/link";
import { ArrowLeft, OctagonAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <OctagonAlert className="h-7 w-7 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold">Hackathon not found</h1>
      <p className="mt-2 text-sm text-gray-600">
        We couldn’t find the hackathon you’re looking for. It may have been unpublished or the link is incorrect.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/hackathons"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hackathons
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
