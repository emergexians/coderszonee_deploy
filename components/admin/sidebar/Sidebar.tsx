"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import {
  LayoutDashboard,
  Users2,
  Route as RouteIcon,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Settings,
  ShieldCheck,
  MessagesSquare,
} from "lucide-react";

/* ------------------------------ utils ------------------------------ */
function cx(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(" ");
}

type IconType = React.ComponentType<{ size?: number; className?: string }>;

/* ------------------------------ items ------------------------------ */
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
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Manage",
    items: [
      { href: "/admin/users", label: "Users", icon: Users2 },
      { href: "/admin/hackathons", label: "Hackathons", icon: Calendar },
      {
        href: "#",
        label: "Create Courses",
        icon: RouteIcon,
        children: [
          { href: "/admin/course/courses", label: "Courses" },
          { href: "/admin/course/skill-path", label: "Skill Path" },
          { href: "/admin/course/career-path", label: "Career Path" },
        ],
      },
      { href: "/admin/contacts", label: "Contacts", icon: MessagesSquare },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/admin/settings", label: "General", icon: Settings },
      { href: "/admin/security", label: "Security", icon: ShieldCheck },
    ],
  },
];

/* ------------------------------ nav item ------------------------------ */
function NavItem({
  href,
  icon: Icon,
  label,
  collapsed,
  children,
}: Item & { collapsed: boolean }) {
  const pathname = usePathname();

  // auto expand if any child matches current path
  const isChildActive = children?.some((c) => pathname?.startsWith(c.href));
  const [open, setOpen] = useState(isChildActive || false);

  const active =
    pathname === href ||
    (href !== "/admin" && (pathname?.startsWith(href + "/") || pathname === href));

  if (children) {
    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={cx(
            "flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm transition-colors",
            isChildActive
              ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
          )}
        >
          {Icon && <Icon size={18} className="opacity-80" />}
          {!collapsed && <span className="truncate">{label}</span>}
          {!collapsed && (
            <ChevronRight
              size={16}
              className={`ml-auto transition-transform ${open ? "rotate-90" : ""}`}
            />
          )}
        </button>

        {open && !collapsed && (
          <div className="ml-6 mt-1 space-y-1">
            {children.map((child) => {
              const childActive = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cx(
                    "block rounded-lg px-3 py-1.5 text-sm",
                    childActive
                      ? "bg-orange-100 text-orange-600 font-medium"
                      : "hover:bg-gray-100 dark:hover:bg-white/5"
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

  return (
    <div className="relative group">
      <span
        aria-hidden
        className={cx(
          "absolute left-0 top-1.5 h-7 w-1 rounded-r-md bg-gradient-to-b from-orange-500 to-amber-400 transition-opacity",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        )}
      />
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cx(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
          active
            ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
        )}
        title={collapsed ? label : undefined}
      >
        {Icon && <Icon size={18} className={active ? "opacity-100" : "opacity-80"} />}
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    </div>
  );
}

/* ------------------------------ section header ------------------------------ */
function SectionHeader({ title, collapsed }: { title: string; collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <div className="mt-3 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {title}
    </div>
  );
}

/* ------------------------------ main sidebar ------------------------------ */
export default function Sidebar() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // persist collapse state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved) setCollapsed(saved === "1");
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("admin_sidebar_collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsed((v) => !v), []);
  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    } finally {
      router.replace("/auth/signin");
    }
  }, [router]);

  return (
    <aside
      className={cx(
        "sticky top-0 h-screen shrink-0 border-r bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-black/30 dark:border-white/10",
        "transition-[width] duration-200",
        collapsed ? "w-20" : "w-72"
      )}
      data-collapsed={collapsed}
    >
      {/* Header / Brand */}
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 font-bold text-white shadow-sm">
            CZ
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-wide">ADMIN</div>
              <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                CodersZonee
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className={cx(
            "rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-white/10",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent dark:via-white/20" />

      {/* Navigation */}
      <nav className="flex h-[calc(100vh-190px)] flex-col gap-1 overflow-y-auto px-3 py-3">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <SectionHeader title={section.title} collapsed={collapsed} />
            <div className="space-y-1">
              {section.items.map((it) => (
                <NavItem key={it.href} {...it} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="space-y-2 px-3 pb-4">
        <Link
          href="/"
          className={cx(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
            "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
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
            "border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-60",
            "dark:border-red-400 dark:text-red-300 dark:hover:bg-red-400/10"
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
