"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function UsersPagination({
  total,
  page,
  perPage,
}: {
  total: number;
  page: number;
  perPage: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(total, page * perPage);

  const makeUrl = useMemo(
    () => (next: Partial<{ page: number; limit: number }>) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (typeof next.page === "number") params.set("page", String(next.page));
      if (typeof next.limit === "number") {
        params.set("limit", String(next.limit));
        params.set("page", "1"); // reset to first page on size change
      }
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams]
  );

  function goTo(p: number) {
    router.push(makeUrl({ page: p }), { scroll: false });
  }

  function setLimit(lim: number) {
    router.push(makeUrl({ limit: lim }), { scroll: false });
  }

  if (total <= perPage && page === 1) {
    // Small lists: still show the range + size select so admin can expand
  }

  // Build compact page list (1 … neighbors … last)
  const pages: (number | "ellipsis")[] = [];
  const add = (n: number) => pages.push(n);
  const addEllipsis = () => {
    if (pages[pages.length - 1] !== "ellipsis") pages.push("ellipsis");
  };

  const neighbors = 1; // how many pages around current
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= neighbors) {
      add(p);
    } else if (p < page && pages[pages.length - 1] !== "ellipsis") {
      addEllipsis();
    } else if (p > page) {
      if (pages[pages.length - 1] !== "ellipsis") addEllipsis();
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3">
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span>{" "}
        of <span className="font-medium">{total}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Page size */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page</span>
          <select
            className="rounded-lg border bg-white px-2 py-1 text-sm outline-none focus:border-orange-500"
            value={perPage}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Pager */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => goTo(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Prev
          </button>

          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`e-${i}`} className="px-2 text-gray-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={[
                  "px-3 py-1.5 rounded-lg border text-sm",
                  p === page ? "bg-orange-600 text-white border-orange-600" : "hover:bg-gray-50",
                ].join(" ")}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goTo(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
