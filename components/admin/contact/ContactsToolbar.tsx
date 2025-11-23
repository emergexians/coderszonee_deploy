"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

type Status = "all" | "new" | "read" | "archived";

export default function ContactsToolbar({
  initialQ = "",
  initialStatus = "all",
}: {
  initialQ?: string;
  initialStatus?: Status;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  // local state
  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [isComposing, setIsComposing] = useState(false); // IME safety
  const debounceRef = useRef<number | null>(null);

  // Build URL for next state
  const makeUrl = useCallback(
    (nextQ: string, nextStatus: Status) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      const trimmed = nextQ.trim().slice(0, 200); // cap length
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");

      if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
      else params.delete("status");

      // reset paging on new query/filter
      params.delete("page");

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  // Current URL (for deduping pushes)
  const currentUrl = useMemo(() => {
    const qs = searchParams?.toString() || "";
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  // Debounced navigation on q/status change
  useEffect(() => {
    // avoid navigating while composing IME characters
    if (isComposing) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const nextUrl = makeUrl(q, status);
      if (nextUrl !== currentUrl) {
        router.push(nextUrl, { scroll: false });
      }
    }, 350);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q, status, isComposing, makeUrl, router, currentUrl]);

  // Sync local state if user navigates with back/forward
  useEffect(() => {
    const urlQ = (searchParams?.get("q") || "").trim();
    const urlStatus = (searchParams?.get("status") || "all").toLowerCase() as Status;
    // Only update if different (prevents cursor jumps while typing)
    if (urlQ !== q) setQ(urlQ);
    if (urlStatus !== status) setStatus(["all", "new", "read", "archived"].includes(urlStatus) ? urlStatus : "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // intentionally not depending on q/status to allow external sync

  // Handlers
  const onEnterSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !isComposing) {
        const nextUrl = makeUrl(q, status);
        if (nextUrl !== currentUrl) {
          router.push(nextUrl, { scroll: false });
        }
      }
    },
    [q, status, isComposing, makeUrl, router, currentUrl]
  );

  const clearSearch = useCallback(() => {
    setQ("");
    // push immediately to clear results
    const nextUrl = makeUrl("", status);
    if (nextUrl !== currentUrl) router.push(nextUrl, { scroll: false });
  }, [makeUrl, status, currentUrl, router]);

  const Chip = ({ v, label }: { v: Status; label: string }) => {
    const active = status === v;
    return (
      <button
        type="button"
        onClick={() => setStatus(v)}
        className={[
          "px-3 py-1.5 rounded-xl text-sm border transition focus:outline-none focus:ring-2 focus:ring-orange-300",
          active ? "bg-orange-600 text-white border-orange-600" : "bg-white hover:bg-gray-50 border-gray-200",
        ].join(" ")}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:w-96">
        <label htmlFor="contacts-search" className="sr-only">
          Search contacts
        </label>
        <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          id="contacts-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onEnterSubmit}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="Search name, email, subject, message…"
          className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          aria-label="Search contacts"
        />
        {q && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
            aria-label="Clear search"
            title="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Chip v="all" label="All" />
        <Chip v="new" label="New" />
        <Chip v="read" label="Read" />
        <Chip v="archived" label="Archived" />
      </div>
    </div>
  );
}
