// app/instructor/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  CircleUserRound,
  Home,
  Search,
  Settings,
  Users,
  Star,
  ArrowUpRight,
  Sun,
  Moon,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Instructor Panel 2.0 — refreshed UI/UX (dark mode, responsive, animated)
 * Drop at: app/instructor/page.tsx
 * TailwindCSS required. All data mocked; wire to APIs later.
 */

/* =========================
   Types
========================= */
type Theme = "light" | "dark";
type Filter = "all" | "due" | "graded";
type TaskStatus = "due" | "open" | "graded";
type TaskType = "grading" | "review";

type StatCard = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tone: string;
};

type CourseItem = {
  code: string;
  title: string;
  section: string;
  enrollment: number;
  progress: number; // %
};

type Task = {
  id: string;
  course: string;
  title: string;
  due: string; // ISO date
  type: TaskType;
  status: TaskStatus;
};

type MessageItem = {
  id: string;
  from: string;
  course: string;
  snippet: string;
  at: string; // ISO datetime
};

export default function InstructorPanel() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("__theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("__theme", theme);
    } catch {
      // ignore storage errors (private mode etc.)
    }
  }, [theme]);

  const me = useMemo(
    () => ({
      name: "Dr. Meera Nair",
      id: "INS-1024",
      dept: "Computer Science",
      term: "Semester 5",
    }),
    []
  );

  const stats = useMemo<StatCard[]>(
    () => [
      {
        label: "Active Courses",
        value: 3,
        icon: <BookOpen className="h-5 w-5" />,
        tone: "from-indigo-500 to-violet-500",
      },
      {
        label: "Students",
        value: 128,
        icon: <Users className="h-5 w-5" />,
        tone: "from-emerald-500 to-teal-500",
      },
      {
        label: "To Grade",
        value: 12,
        icon: <FileText className="h-5 w-5" />,
        tone: "from-orange-500 to-rose-500",
      },
      {
        label: "Avg Rating",
        value: "4.7",
        icon: <Star className="h-5 w-5" />,
        tone: "from-cyan-500 to-sky-500",
      },
    ],
    []
  );

  const courses = useMemo<CourseItem[]>(
    () => [
      {
        code: "CS501",
        title: "Distributed Systems",
        section: "A",
        enrollment: 42,
        progress: 68,
      },
      {
        code: "CS523",
        title: "Machine Learning",
        section: "B",
        enrollment: 51,
        progress: 54,
      },
      {
        code: "CS561",
        title: "Cloud Computing",
        section: "C",
        enrollment: 35,
        progress: 31,
      },
    ],
    []
  );

  // ✅ wrapped in useMemo so it's stable and won't trigger exhaustive-deps warning
  const tasks = useMemo<readonly Task[]>(
    () =>
      [
        {
          id: "T1",
          course: "CS523",
          title: "Quiz #2 Grading",
          due: "2025-09-04",
          type: "grading",
          status: "due",
        },
        {
          id: "T2",
          course: "CS501",
          title: "Lab #3 Assessment",
          due: "2025-09-03",
          type: "grading",
          status: "due",
        },
        {
          id: "T3",
          course: "CS561",
          title: "Project Proposal Review",
          due: "2025-09-12",
          type: "review",
          status: "open",
        },
        {
          id: "T4",
          course: "CS501",
          title: "Assignment #1",
          due: "2025-08-26",
          type: "grading",
          status: "graded",
        },
      ] as const,
    []
  );

  const messages = useMemo<MessageItem[]>(
    () => [
      {
        id: "M1",
        from: "Aarav Sharma",
        course: "CS523",
        snippet: "Could you clarify the loss function…",
        at: "2025-08-29T10:12:00Z",
      },
      {
        id: "M2",
        from: "Priya Gupta",
        course: "CS501",
        snippet: "Absent for lab, request for…",
        at: "2025-08-28T14:05:00Z",
      },
    ],
    []
  );

  const filteredTasks = useMemo(() => {
    const term = q.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesQ =
        !term ||
        `${t.title} ${t.course}`.toLowerCase().includes(term);

      const matchesF =
        filter === "all"
          ? true
          : filter === "graded"
          ? t.status === "graded"
          : t.status !== "graded";

      return matchesQ && matchesF;
    });
  }, [q, filter, tasks]);

  const openTask = openId
    ? tasks.find((x) => x.id === openId) ?? null
    : null;

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-50">
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-cyan-500" />

      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/70 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <button
            className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Home"
          >
            <Home className="h-5 w-5" />
          </button>
          <div className="font-semibold">Instructor Panel</div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tasks or courses"
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
              <span className="hidden sm:inline">{me.name}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 grid xl:grid-cols-[300px,1fr] gap-6">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{me.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{me.id}</div>
                <div className="text-sm text-gray-600 mt-2 dark:text-gray-400">
                  {me.dept}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {me.term}
                </div>
              </div>
              <span className="rounded-lg bg-gradient-to-r from-orange-500 to-fuchsia-500 px-2.5 py-1 text-xs text-white">
                Faculty
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-fuchsia-500"
                style={{ width: "64%" }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">64% term progress</div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm font-medium">Today</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span>CS523 Lecture</span>
                <span className="text-xs text-gray-500">10:00</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Office Hours</span>
                <span className="text-xs text-gray-500">14:00</span>
              </li>
              <li className="flex items-center justify-between">
                <span>CS501 Lab</span>
                <span className="text-xs text-gray-500">16:30</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm font-medium">Recent Messages</div>
            <ul className="mt-3 space-y-2 text-sm">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{m.from}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(m.at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{m.course}</div>
                  <div className="text-sm mt-1 line-clamp-1">{m.snippet}</div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="space-y-6">
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

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Courses</h2>
              <button className="inline-flex items-center gap-1 text-sm text-orange-600 hover:underline">
                Manage <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((c) => (
                <motion.div
                  key={c.code}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-gray-200 p-4 hover:shadow transition dark:border-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {c.code} • Sec {c.section}
                    </div>
                    <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {c.enrollment}
                    </span>
                  </div>
                  <div className="mt-1 font-medium line-clamp-2">
                    {c.title}
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {c.progress}% completed
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Grading & Tasks</h2>
              <div className="flex flex-wrap items-center gap-2">
                <FilterPill
                  text="All"
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                />
                <FilterPill
                  text="Due"
                  active={filter === "due"}
                  onClick={() => setFilter("due")}
                />
                <FilterPill
                  text="Graded"
                  active={filter === "graded"}
                  onClick={() => setFilter("graded")}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:hidden">
              {filteredTasks.length === 0 ? (
                <EmptyState label="No tasks match your filters." />
              ) : (
                filteredTasks.map((t) => (
                  <motion.div
                    key={t.id}
                    whileHover={{ y: -1 }}
                    className="rounded-xl border border-gray-200 p-3 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{t.title}</div>
                      <StatusBadge s={t.status} />
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {t.course} • Due {formatDate(t.due)}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <FileText className="h-4 w-4" /> {t.type}
                      </span>
                      <button
                        onClick={() => setOpenId(t.id)}
                        className="rounded-lg border px-2.5 py-1 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      >
                        Open
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="mt-2 overflow-x-auto hidden sm:block">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800/60">
                  <tr>
                    <Th>Course</Th>
                    <Th>Title</Th>
                    <Th>Due</Th>
                    <Th>Status</Th>
                    <Th>Type</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        <EmptyState label="No tasks match your filters." />
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      >
                        <Td>{t.course}</Td>
                        <Td>
                          <div className="font-medium">{t.title}</div>
                          <div className="text-xs text-gray-500">{t.id}</div>
                        </Td>
                        <Td>{formatDate(t.due)}</Td>
                        <Td>
                          <StatusBadge s={t.status} />
                        </Td>
                        <Td className="capitalize">{t.type}</Td>
                        <Td className="text-right">
                          <button
                            onClick={() => setOpenId(t.id)}
                            className="rounded-lg border px-2.5 py-1.5 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                          >
                            Open
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

      <AnimatePresence>
        {openTask ? (
          <TaskModal
            key="modal"
            task={openTask}
            onClose={() => setOpenId(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ------------- components ------------- */

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

function StatusBadge({ s }: { s: TaskStatus }) {
  const tone =
    s === "graded"
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
      : s === "due"
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
      : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
  const label = s === "graded" ? "Graded" : s === "due" ? "Due" : "Open";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${tone}`}
    >
      {label}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
      <CheckCircle2 className="h-6 w-6 text-gray-400" />
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}

function TaskModal({ task, onClose }: { task: Task; onClose: () => void }) {
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
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/10 dark:bg-gray-900 dark:ring-white/10"
          role="dialog"
          aria-modal
          aria-label={task.title}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">{task.course}</div>
              <h3 className="text-lg font-semibold mt-0.5">{task.title}</h3>
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
              <div className="font-medium">{formatDate(task.due)}</div>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
              <div className="text-gray-500">Status</div>
              <div className="font-medium capitalize">{task.status}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Notes</div>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Review submissions on the LMS. Apply rubric consistently and
              publish grades by the due date.
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
