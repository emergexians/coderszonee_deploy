"use client";

import { useMemo, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PagerProps = {
  total: number;
  page: number;
  perPage: number;
};

export default function ContactsPagination({ total, page, perPage }: PagerProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  // Derived values (clamped)
  const totalPages = Math.max(1, Math.ceil(Math.max(0, total) / Math.max(1, perPage)));
  const safePage = Math.min(Math.max(1, page || 1), totalPages);

  const start = total === 0 ? 0 : (safePage - 1) * perPage + 1;
  const end = Math.min(total, safePage * perPage);

  const makeUrl = useCallback(
    (next: Partial<{ page: number; limit: number }>) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (typeof next.page === "number" && Number.isFinite(next.page)) {
        params.set("page", String(Math.max(1, Math.min(totalPages, next.page))));
      }
      if (typeof next.limit === "number" && Number.isFinite(next.limit)) {
        const limit = Math.max(1, next.limit);
        params.set("limit", String(limit));
        // reset to first page on limit change
        params.set("page", "1");
      }
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams, totalPages]
  );

  const goTo = useCallback(
    (p: number) => {
      router.push(makeUrl({ page: p }), { scroll: false });
    },
    [makeUrl, router]
  );

  const setLimit = useCallback(
    (l: number) => {
      router.push(makeUrl({ limit: l }), { scroll: false });
    },
    [makeUrl, router]
  );

  // Build compact pager with ellipses
  const pages: (number | "…")[] = useMemo(() => {
    const arr: (number | "…")[] = [];
    const neighbors = 1;
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - safePage) <= neighbors) {
        arr.push(p);
      } else if (arr[arr.length - 1] !== "…") {
        arr.push("…");
      }
    }
    return arr;
  }, [safePage, totalPages]);

  const nothingToPaginate = total <= 0 || totalPages <= 1;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3">
      <div className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span> of{" "}
        <span className="font-medium">{total}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="rows-per-page" className="text-sm text-gray-600">
            Rows per page
          </label>
          <select
            id="rows-per-page"
            aria-label="Rows per page"
            className="rounded-lg border bg-white px-2 py-1 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            value={perPage}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={total === 0}
          >
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            type="button"
            onClick={() => goTo(Math.max(1, safePage - 1))}
            disabled={safePage <= 1 || nothingToPaginate}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
            aria-label="Previous page"
          >
            Prev
          </button>

          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`e-${i}`} className="px-2 text-gray-400 select-none">
                …
              </span>
            ) : (
              <button
                type="button"
                key={p}
                onClick={() => goTo(p)}
                aria-current={p === safePage ? "page" : undefined}
                className={[
                  "px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-200",
                  p === safePage
                    ? "bg-orange-600 text-white border-orange-600"
                    : "hover:bg-gray-50",
                ].join(" ")}
                disabled={nothingToPaginate}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => goTo(Math.min(totalPages, safePage + 1))}
            disabled={safePage >= totalPages || nothingToPaginate}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
}
