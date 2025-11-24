// app/student/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Clock4,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Search,
  Settings,
  Sun,
  Moon,
  ArrowUpRight,
  Trophy,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem("__theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore storage errors
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

type AssignmentStatus = "due" | "open" | "completed";

type Assignment = {
  id: string;
  course: string;
  title: string;
  due: string;
  status: AssignmentStatus;
  weight: number;
};

/**
 * Student Panel 2.0 — refreshed UI/UX
 * Drop at: app/student/page.tsx
 */
export default function StudentPanel() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "due" | "completed">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("__theme", theme);
    } catch {}
  }, [theme]);

  const student = useMemo(
    () => ({
      name: "Aarav Sharma",
      id: "STU-2025-0142",
      program: "B.Tech • Computer Science",
      term: "Semester 5",
    }),
    []
  );

  const stats = useMemo(
    () => [
      {
        label: "GPA",
        value: "8.7",
        icon: <Trophy className="h-5 w-5" />,
        tone: "from-emerald-500 to-teal-500",
      },
      {
        label: "Credits",
        value: "82/160",
        icon: <GraduationCap className="h-5 w-5" />,
        tone: "from-indigo-500 to-violet-500",
      },
      {
        label: "Attendance",
        value: "92%",
        icon: <CalendarDays className="h-5 w-5" />,
        tone: "from-orange-500 to-rose-500",
      },
      {
        label: "Due",
        value: "3",
        icon: <FileText className="h-5 w-5" />,
        tone: "from-cyan-500 to-sky-500",
      },
    ],
    []
  );

  const courses = useMemo(
    () => [
      {
        code: "CS501",
        title: "Distributed Systems",
        faculty: "Prof. Meera Nair",
        progress: 78,
      },
      {
        code: "CS523",
        title: "Machine Learning",
        faculty: "Dr. R. Banerjee",
        progress: 64,
      },
      {
        code: "CS545",
        title: "Compiler Design",
        faculty: "Prof. K. Reddy",
        progress: 51,
      },
      {
        code: "CS561",
        title: "Cloud Computing",
        faculty: "Dr. A. Mahajan",
        progress: 37,
      },
    ],
    []
  );

  // ✅ memoized so useMemo deps don't change each render
  const assignments = useMemo<readonly Assignment[]>(
    () =>
      [
        {
          id: "A1",
          course: "CS523",
          title: "Logistic Regression from scratch",
          due: "2025-09-05",
          status: "due",
          weight: 10,
        },
        {
          id: "A2",
          course: "CS501",
          title: "Raft paper summary",
          due: "2025-09-03",
          status: "due",
          weight: 5,
        },
        {
          id: "A3",
          course: "CS545",
          title: "CFG to PDA conversion",
          due: "2025-09-18",
          status: "open",
          weight: 8,
        },
        {
          id: "A4",
          course: "CS561",
          title: "Kubernetes deployment YAML",
          due: "2025-08-25",
          status: "completed",
          weight: 5,
        },
      ] as const,
    []
  );

  const filteredAssignments = useMemo(() => {
    const term = q.trim().toLowerCase();
    return assignments.filter((a) => {
      const matchesQ =
        !term || `${a.title} ${a.course}`.toLowerCase().includes(term);
      const matchesF =
        filter === "all"
          ? true
          : filter === "due"
          ? a.status !== "completed"
          : a.status === "completed";
      return matchesQ && matchesF;
    });
  }, [q, filter, assignments]);

  const openAssignment = openId
    ? assignments.find((x) => x.id === openId) ?? null
    : null;

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-50">
      {/* Ribbon */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-cyan-500" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/70 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <button
            className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Home"
          >
            <Home className="h-5 w-5" />
          </button>
          <div className="font-semibold">LMS</div>
          <div className="rounded-lg px-3 py-1.5 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
            Student Panel
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search assignments or courses"
                className="w-72 rounded-xl border border-gray-200 bg-white/80 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 dark:bg-gray-900/60 dark:border-gray-800"
              />
            </div>
            <button
              className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={() =>
                setTheme((t) => (t === "light" ? "dark" : "light"))
              }
              className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1" />
            <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
              <CircleUserRound className="h-5 w-5" />
              <span className="hidden sm:inline">{student.name}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 grid xl:grid-cols-[300px,1fr] gap-6">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{student.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {student.id}
                </div>
                <div className="text-sm text-gray-600 mt-2 dark:text-gray-400">
                  {student.program}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {student.term}
                </div>
              </div>
              <span className="rounded-lg bg-gradient-to-r from-orange-500 to-fuchsia-500 px-2.5 py-1 text-xs text-white">
                Active
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-fuchsia-500"
                style={{ width: "72%" }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              72% term completed
            </div>
          </div>

          <nav className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <NavItem icon={<BookOpen className="h-4 w-4" />} text="Courses" active />
            <NavItem icon={<FileText className="h-4 w-4" />} text="Assignments" />
            <NavItem icon={<CalendarDays className="h-4 w-4" />} text="Timetable" />
            <NavItem icon={<Clock4 className="h-4 w-4" />} text="Attendance" />
            <NavItem icon={<Settings className="h-4 w-4" />} text="Settings" />
            <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
            <NavItem icon={<LogOut className="h-4 w-4" />} text="Sign out" danger />
          </nav>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm font-medium">Upcoming</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span>CS523 Quiz #2</span>
                <span className="text-xs text-gray-500">Sep 2</span>
              </li>
              <li className="flex items-center justify-between">
                <span>CS501 Lab</span>
                <span className="text-xs text-gray-500">Sep 4</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Hackathon Meetup</span>
                <span className="text-xs text-gray-500">Sep 7</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main column */}
        <section className="space-y-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s) => (
              <motion.div
                key={s.label}
                whileHover={{ y: -2 }}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {s.label}
                  </div>
                  <div
                    className={`rounded-lg p-2 text-white bg-gradient-to-r ${s.tone}`}
                  >
                    {s.icon}
                  </div>
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">
                  {s.value}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Courses */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Courses</h2>
              <button className="inline-flex items-center gap-1 text-sm text-orange-600 hover:underline">
                View all <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {courses.map((c) => (
                <motion.div
                  key={c.code}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-gray-200 p-4 hover:shadow transition dark:border-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">{c.code}</div>
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                      <Star className="h-3.5 w-3.5" /> Featured
                    </span>
                  </div>
                  <div className="mt-1 font-medium line-clamp-2">
                    {c.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 dark:text-gray-400">
                    {c.faculty}
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {c.progress}% complete
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Assignments */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Assignments</h2>
              <div className="flex flex-wrap items-center gap-2">
                <FilterPill text="All" active={filter === "all"} onClick={() => setFilter("all")} />
                <FilterPill text="Due" active={filter === "due"} onClick={() => setFilter("due")} />
                <FilterPill text="Completed" active={filter === "completed"} onClick={() => setFilter("completed")} />
              </div>
            </div>

            {/* Cards on mobile */}
            <div className="mt-4 grid gap-3 sm:hidden">
              {filteredAssignments.length === 0 ? (
                <EmptyState />
              ) : (
                filteredAssignments.map((a) => (
                  <motion.div
                    key={a.id}
                    whileHover={{ y: -1 }}
                    className="rounded-xl border border-gray-200 p-3 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{a.title}</div>
                      <StatusBadge s={a.status} />
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {a.course} • Due {formatDate(a.due)}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>Weight {a.weight}%</span>
                      <button
                        onClick={() => setOpenId(a.id)}
                        className="rounded-lg border px-2.5 py-1 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      >
                        View
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Table on >= sm */}
            <div className="mt-2 overflow-x-auto hidden sm:block">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800/60">
                  <tr>
                    <Th>Course</Th>
                    <Th>Title</Th>
                    <Th>Due</Th>
                    <Th>Status</Th>
                    <Th>Weight</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map((a) => (
                      <tr
                        key={a.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      >
                        <Td>{a.course}</Td>
                        <Td>
                          <div className="font-medium">{a.title}</div>
                          <div className="text-xs text-gray-500">{a.id}</div>
                        </Td>
                        <Td>{formatDate(a.due)}</Td>
                        <Td>
                          <StatusBadge s={a.status} />
                        </Td>
                        <Td>{a.weight}%</Td>
                        <Td className="text-right">
                          <button
                            onClick={() => setOpenId(a.id)}
                            className="rounded-lg border px-2.5 py-1.5 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                          >
                            View
                          </button>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {openAssignment ? (
          <AssignmentModal
            key="modal"
            assignment={openAssignment}
            onClose={() => setOpenId(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- components ---------------- */
function NavItem({
  icon,
  text,
  active,
  danger,
}: {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      className={`w-full text-left flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
        active
          ? "bg-gray-50 dark:bg-gray-800/60"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
      } ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
          : ""
      }`}
    >
      <span className="text-gray-500">{icon}</span>
      <span className="truncate">{text}</span>
    </button>
  );
}

function FilterPill({
  text,
  active,
  onClick,
}: {
  text: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? "bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/60 border-gray-200 dark:border-gray-800"
      }`}
    >
      {text}
    </button>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-4 py-2 text-left font-semibold ${className}`}>
      {children}
    </th>
  );
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}

function StatusBadge({ s }: { s: AssignmentStatus }) {
  const tone =
    s === "completed"
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
      : s === "due"
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
      : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
  const label =
    s === "completed" ? "Completed" : s === "due" ? "Due soon" : "Open";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${tone}`}
    >
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
      <CheckCircle2 className="h-6 w-6 text-gray-400" />
      <div className="text-sm text-gray-600 dark:text-gray-400">
        No items to show.
      </div>
    </div>
  );
}

function AssignmentModal({
  assignment,
  onClose,
}: {
  assignment: Assignment;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <motion.div
          initial={{ y: 8, scale: 0.98, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 8, scale: 0.98, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/10 dark:bg-gray-900 dark:ring-white/10"
          role="dialog"
          aria-modal="true"
          aria-label={assignment.title}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">{assignment.course}</div>
              <h3 className="text-lg font-semibold mt-0.5">
                {assignment.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
              <div className="text-gray-500">Due date</div>
              <div className="font-medium">{formatDate(assignment.due)}</div>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
              <div className="text-gray-500">Weight</div>
              <div className="font-medium">{assignment.weight}%</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Instructions
            </div>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Submit a PDF via the LMS. Include your Student ID on the first
              page. Late submissions up to 48 hours with 10% penalty.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              Close
            </button>
            <button className="rounded-lg bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-black dark:bg-white dark:text-gray-900">
              Open in LMS
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}
