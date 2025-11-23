"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

type RoleFilter = "all" | "student" | "instructor" | "admin";

export default function UsersToolbar({
  initialQ = "",
  initialRole = "all",
}: {
  initialQ?: string;
  initialRole?: RoleFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQ);
  const [role, setRole] = useState<RoleFilter>(initialRole);

  // Build next URL with params
  const makeUrl = useMemo(
    () => (nextQ: string, nextRole: RoleFilter) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      const trimmed = nextQ.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");

      if (nextRole && nextRole !== "all") params.set("role", nextRole);
      else params.delete("role");

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  // Debounce search
  useEffect(() => {
    const handle = setTimeout(() => {
      router.push(makeUrl(q, role), { scroll: false });
    }, 400);
    return () => clearTimeout(handle);
  }, [q, role, router, makeUrl]);

  function reset() {
    setQ("");
    setRole("all");
    router.push(pathname, { scroll: false });
  }

  const RoleButton = ({ value, label }: { value: RoleFilter; label: string }) => {
    const active = role === value;
    return (
      <button
        type="button"
        onClick={() => setRole(value)}
        className={[
          "px-3 py-1.5 rounded-xl text-sm border",
          active
            ? "bg-orange-600 text-white border-orange-600"
            : "bg-white hover:bg-gray-50 border-gray-200",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or email…"
          className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none focus:border-orange-500"
        />
      </div>

      {/* Role filter */}
      <div className="flex items-center gap-2">
        <RoleButton value="all" label="All" />
        <RoleButton value="student" label="Student" />
        <RoleButton value="instructor" label="Instructor" />
        <RoleButton value="admin" label="Admin" />
        <button
          type="button"
          onClick={reset}
          className="ml-1 px-3 py-1.5 rounded-xl text-sm border border-gray-200 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
