"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users2,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  Book,
  Laptop,
  Gift,
  Calendar,
  Settings,
  ShieldCheck,
  MessagesSquare,
  DollarSign,
  UserPlus,
} from "lucide-react";

/* ------------------------------ utils ------------------------------ */
function cx(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(" ");
}

type IconType = React.ComponentType<{ size?: number; className?: string }>;

/* ------------------------------ nav items ------------------------------ */
type Item = {
  href: string;
  label: string;
  icon?: IconType;
  children?: { href: string; label: string }[];
};
type Section = { title: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    title: "Overview",
    items: [
      { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/student/profile", label: "Profile", icon: Users2 },
    ],
  },
  {
    title: "Courses",
    items: [
      { href: "/student/course", label: "Enrolled Courses", icon: BookOpen },
      { href: "/student/explore", label: "New Course", icon: Book },
    ],
  },
  {
    title: "Community",
    items: [
      { href: "/student/hackathons", label: "Hackathons", icon: Laptop },
      { href: "/student/refer", label: "Refer & Earn", icon: DollarSign },
      { href: "/student/resources", label: "Free Resources", icon: Gift },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/student/settings", label: "Account", icon: Settings },
      { href: "/student/security", label: "Security", icon: ShieldCheck },
    ],
  },
];

/* ------------------------------ NavItem (fixed active logic) ------------------------------ */
function NavItem({
  href,
  icon: Icon,
  label,
  collapsed,
  children,
}: Item & { collapsed: boolean }) {
  const pathnameRaw = usePathname() || "";
  // strip query/hash
  const pathname = pathnameRaw.split("?")[0].split("#")[0];

  // helper to determine if a candidate href is active for current pathname
  const isHrefActive = (candidate: string) =>
    pathname === candidate || pathname.startsWith(candidate + "/");

  // child active detection: any child exact/startsWith match
  const isChildActive = Boolean(children && children.some((c) => isHrefActive(c.href)));

  // treat '#' or empty as non-navigable parent, so it won't be active by href
  const hrefIsNavigable = Boolean(href && href !== "#");

  // parent is active if its href matches OR any child is active
  const isActive = (hrefIsNavigable && isHrefActive(href)) || isChildActive;

  // open state: if a child is active, auto-open the parent
  const [open, setOpen] = useState<boolean>(isChildActive);

  // sync open state when pathname/child-active changes
  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  // Render parent with children (collapsible)
  if (children && children.length > 0) {
    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cx(
            "flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm transition-colors",
            isChildActive
              ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm"
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          {Icon && <Icon size={18} className="opacity-80" />}
          {!collapsed && <span className="truncate">{label}</span>}
          {!collapsed && (
            <ChevronRight size={16} className={`ml-auto transition-transform ${open ? "rotate-90" : ""}`} />
          )}
        </button>

        {open && !collapsed && (
          <div className="ml-6 mt-1 space-y-1">
            {children.map((child) => {
              const childActive = isHrefActive(child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cx(
                    "block rounded-lg px-3 py-1.5 text-sm",
                    childActive ? "bg-orange-100 text-orange-600 font-medium" : "hover:bg-gray-100"
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // single (no children) nav item
  return (
    <div className="relative group">
      <span
        aria-hidden
        className={cx(
          "absolute left-0 top-1.5 h-7 w-1 rounded-r-md bg-gradient-to-b from-orange-500 to-amber-400 transition-opacity",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        )}
      />
      <Link
        href={href || "#"}
        aria-current={isActive ? "page" : undefined}
        className={cx(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
          isActive ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"
        )}
        title={collapsed ? label : undefined}
      >
        {Icon && <Icon size={18} className={isActive ? "opacity-100" : "opacity-80"} />}
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    </div>
  );
}

/* ------------------------------ SectionHeader ------------------------------ */
function SectionHeader({ title, collapsed }: { title: string; collapsed: boolean }) {
  if (collapsed) return null;
  return <div className="mt-3 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{title}</div>;
}

/* ------------------------------ Sidebar component (export) ------------------------------ */
export default function Sidebar() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // user info
  const [username, setUsername] = useState<string | null>(null);
  const [urn, setUrn] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(true);

  // persist collapse state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("student_sidebar_collapsed");
      if (saved) setCollapsed(saved === "1");
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("student_sidebar_collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsed((v) => !v), []);

  // fetch current user info (name + urn)
  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      setUserLoading(true);
      try {
        const res = await fetch("/api/student/me", { credentials: "include", headers: { accept: "application/json" } });
        if (!mounted) return;
        if (!res.ok) {
          setUsername(null);
          setUrn(null);
          return;
        }
        const data = await res.json();

        const maybeName =
          data?.name ||
          data?.user?.name ||
          (data?.meta && data.meta.profile && (data.meta.profile.fullName || data.meta.profile.name)) ||
          null;

        const maybeUrn =
          data?.urn ||
          data?.user?.urn ||
          (data?.meta && data.meta.profile && data.meta.profile.urn) ||
          data?.meta?.urn ||
          null;

        setUsername(maybeName);
        setUrn(maybeUrn);
      } catch (err) {
        console.error("Failed to load user for sidebar:", err);
        setUsername(null);
        setUrn(null);
      } finally {
        if (mounted) setUserLoading(false);
      }
    }
    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    } finally {
      router.replace("/auth/signin");
    }
  }, [router]);

  // avatar initial
  const avatarInitial = useMemo(() => {
    if (!username) return "CZ";
    return String(username).trim().charAt(0).toUpperCase();
  }, [username]);

  return (
    <aside
      className={cx(
        "sticky top-0 h-screen shrink-0 border-r bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        "transition-[width] duration-200",
        collapsed ? "w-20" : "w-72"
      )}
      data-collapsed={collapsed}
      aria-label="Student sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 font-bold text-white shadow-sm text-sm flex-shrink-0"
            title={username ?? "CodersZonee"}
          >
            {avatarInitial}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              {userLoading ? (
                <div className="flex flex-col gap-1">
                  <div className="h-4 w-36 rounded bg-gray-100 animate-pulse" />
                  <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
                </div>
              ) : username ? (
                <>
                  <div className="truncate text-sm font-semibold tracking-wide">{username}</div>
                  <div className="truncate text-xs text-gray-500">{urn ?? "No URN"}</div>
                </>
              ) : (
                <>
                  <div className="truncate text-sm font-semibold tracking-wide">Student</div>
                  <div className="truncate text-xs text-gray-500">CodersZonee</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* toggle */}
        <button
          onClick={toggle}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className={cx("rounded-lg p-2 transition hover:bg-gray-100", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      {/* navigation */}
      <nav className="flex h-[calc(100vh-220px)] flex-col gap-1 overflow-y-auto px-3 py-3" aria-label="Main navigation">
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-2">
            <SectionHeader title={section.title} collapsed={collapsed} />
            <div className="space-y-1">
              {section.items.map((it) => (
                <NavItem key={it.href} {...it} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* footer */}
      <div className="space-y-2 px-3 pb-4">
        <Link
          href="/"
          className={cx(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
            "text-gray-700 hover:bg-gray-100"
          )}
          title={collapsed ? "Back to site" : undefined}
        >
          <Home size={18} className="opacity-80" />
          {!collapsed && <span>Back to site</span>}
        </Link>

        <button
          onClick={handleLogout}
          disabled={loading}
          className={cx(
            "flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
            "border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-60"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
