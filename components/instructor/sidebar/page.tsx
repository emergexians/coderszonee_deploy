/* eslint-disable @next/next/no-img-element */
// components/admin/PathsAdmin.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Loader2,
  X,
  Trash2,
  ExternalLink,
  Star,
  UserRound,
  Clock,
  GraduationCap,
  Images,
  CheckCircle2,
  Layers3,
  BookOpen,
  Tag,
} from "lucide-react";

/* =========================
   Types
========================= */
interface SyllabusSection {
  title: string;
  items?: string[];
}

interface SkillPath {
  _id: string;
  name: string;
  duration: string;
  desc: string;
  img: string;
  href: string;
  skills?: string[];
  rating?: number;
  students?: number;
  level: "Beginner" | "Intermediate" | "Advanced" | string;
  perks?: string[];
  syllabus?: SyllabusSection[];
  slug?: string;
}

interface CareerPath {
  _id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | string;
  duration: string;
  img: string;
  href: string;
  desc: string;
  skills?: string[];
  rating?: number;
  students?: number;
  perks?: string[];
  syllabus?: SyllabusSection[];
  slug?: string;
}

interface Course {
  _id: string;
  title: string;
  cover: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced" | string;
  href: string;
  category: string;
  subCategory: string;
  rating?: number;
  students?: number;
  desc?: string;
  perks?: string[];
  syllabus?: SyllabusSection[];
  slug?: string;
}

type Tab = "skills" | "careers" | "courses";

type ToastState =
  | { show: false }
  | { show: true; type: "success" | "error" | "info"; msg: string };

interface PathFormState {
  name: string;
  href: string;
  img: string;
  desc: string;
  duration: string;
  skills: string;
  rating: string;
  students: string;
  level: string;
  perks: string;
  syllabus: string;
}

interface CourseFormState {
  title: string;
  cover: string;
  duration: string;
  level: string;
  href: string;
  category: string;
  subCategory: string;
  rating: string;
  students: string;
  desc: string;
  perks: string;
  syllabus: string;
}

/* =========================
   Constants
========================= */
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

const CATEGORY_MAP: Record<string, string[]> = {
  "Web Development": [
    "HTML & CSS",
    "JavaScript",
    "React / Next.js",
    "Node.js",
    "Full-Stack",
  ],
  "Data Science": [
    "Python",
    "Pandas",
    "Machine Learning",
    "Deep Learning",
    "Statistics",
  ],
  "AI & ML": ["NLP", "Computer Vision", "Generative AI", "Reinforcement Learning"],
  Business: ["Marketing", "Finance", "Entrepreneurship", "Product Management"],
  Design: ["UI/UX", "Graphic Design", "Figma", "3D & Motion"],
};
const CATEGORY_LIST = Object.keys(CATEGORY_MAP);

/* =========================
   UI helpers
========================= */
function cx(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(" ");
}

function Pill({
  tone = "gray",
  children,
}: {
  tone?: "gray" | "orange" | "green" | "amber" | "blue" | "purple";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700",
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <span className={cx("px-2.5 py-1 rounded-full text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-20 rounded-md bg-gray-200" />
          <div className="h-3 w-40 rounded bg-gray-200" />
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="h-3 w-16 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-6 w-24 rounded-full bg-gray-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-3 w-12 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-3 w-12 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-8 w-24 rounded bg-gray-200" />
      </td>
    </tr>
  );
}

/* =========================
   Modal
========================= */
function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 12 }}
            className={cx(
              "relative w-full max-h-[85vh] overflow-auto rounded-2xl bg-white p-6 shadow-xl",
              wide ? "max-w-3xl" : "max-w-lg"
            )}
          >
            <div className="flex items-center justify-between gap-4 sticky top-0 bg-white pb-4">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================
   Fetch helpers
========================= */
async function safeJson<T>(res: Response, fallback: T): Promise<T> {
  try {
    if (!res) return fallback;
    if (res.status === 204) return fallback;
    const ct = res.headers.get("content-type") || "";
    if (!ct.toLowerCase().includes("application/json")) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function getList<T = unknown>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await safeJson<unknown>(res, {});
    let items: unknown = json;

    if (!Array.isArray(items) && typeof items === "object" && items !== null) {
      const obj = items as { data?: unknown; items?: unknown };
      items = obj.data ?? obj.items ?? [];
    }

    return Array.isArray(items) ? (items as T[]) : [];
  } catch {
    return [];
  }
}

/* =========================
   Parse helpers (form → payload)
========================= */
function parseCommaList(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseSyllabusJSON(input: string): SyllabusSection[] | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed)) return undefined;

    const clean: SyllabusSection[] = [];

    for (const raw of parsed) {
      if (!raw || typeof raw !== "object") continue;
      const sec = raw as { title?: unknown; items?: unknown };

      const title = typeof sec.title === "string" ? sec.title.trim() : "";
      if (!title) continue;

      let items: string[] | undefined;
      if (Array.isArray(sec.items)) {
        const mapped = sec.items.map((x) => String(x).trim()).filter(Boolean);
        if (mapped.length) items = mapped;
      }

      clean.push({ title, ...(items ? { items } : {}) });
    }

    return clean.length ? clean : undefined;
  } catch {
    return undefined;
  }
}

/* =========================
   Small utils
========================= */
function tailSlugFromHref(href?: string) {
  if (!href) return "";
  const parts = href
    .split("?")[0]
    .split("#")[0]
    .split("/")
    .filter(Boolean);
  return parts[parts.length - 1] || "";
}

function buildCheckoutUrl(
  type: "skill" | "career" | "course",
  href?: string,
  slug?: string
) {
  const s = (slug || tailSlugFromHref(href)).trim();
  const qType =
    type === "skill" ? "skillpath" : type === "career" ? "careerpath" : "course";
  return `/checkout?course=${qType}&slug=${encodeURIComponent(s)}`;
}

/* =========================
   Main Component
========================= */
export default function PathsAdmin() {
  const [tab, setTab] = useState<Tab>("skills");

  // Data
  const [skills, setSkills] = useState<SkillPath[]>([]);
  const [careers, setCareers] = useState<CareerPath[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast
  const [toast, setToast] = useState<ToastState>({ show: false });

  // Search
  const [q, setQ] = useState("");

  // Create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Delete modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "skill" | "career" | "course";
    id: string;
    name: string;
  } | null>(null);

  // Forms (paths share form; courses have their own)
  const [formPath, setFormPath] = useState<PathFormState>({
    name: "",
    href: "",
    img: "",
    desc: "",
    duration: "",
    skills: "",
    rating: "",
    students: "",
    level: "Beginner",
    perks: "",
    syllabus: "",
  });

  const defaultCategory = CATEGORY_LIST[0];
  const defaultSub = CATEGORY_MAP[defaultCategory][0];

  const [formCourse, setFormCourse] = useState<CourseFormState>({
    title: "",
    cover: "",
    duration: "",
    level: "Beginner",
    href: "",
    category: defaultCategory,
    subCategory: defaultSub,
    rating: "",
    students: "",
    desc: "",
    perks: "",
    syllabus: "",
  });

  // Derived sub-options for course category
  const subOptions = useMemo(
    () => CATEGORY_MAP[formCourse.category] ?? [],
    [formCourse.category]
  );

  useEffect(() => {
    if (!subOptions.includes(formCourse.subCategory)) {
      setFormCourse((f) => ({ ...f, subCategory: subOptions[0] || "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subOptions]);

  // Initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [skillsData, careersData, coursesData] = await Promise.all([
          getList<SkillPath>("/api/skillpaths"),
          getList<CareerPath>("/api/careerpaths"),
          getList<Course>("/api/courses"),
        ]);
        if (!mounted) return;
        setSkills(skillsData);
        setCareers(careersData);
        setCourses(coursesData);
      } catch (e) {
        console.error(e);
        showToast("Failed to load data", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const query = q.trim().toLowerCase();

  const filteredSkills = useMemo(() => {
    if (!query) return skills;
    return skills.filter((s) =>
      [
        s.name,
        s.level,
        s.desc,
        s.skills?.join(","),
        s.perks?.join(","),
        s.syllabus?.map((sec) => sec.title).join(","),
      ].some((v) => v?.toLowerCase().includes(query))
    );
  }, [skills, query]);

  const filteredCareers = useMemo(() => {
    if (!query) return careers;
    return careers.filter((c) =>
      [
        c.name,
        c.level,
        c.desc,
        c.skills?.join(","),
        c.perks?.join(","),
        c.syllabus?.map((sec) => sec.title).join(","),
      ].some((v) => v?.toLowerCase().includes(query))
    );
  }, [careers, query]);

  const filteredCourses = useMemo(() => {
    if (!query) return courses;
    return courses.filter((c) =>
      [
        c.title,
        c.level,
        c.category,
        c.subCategory,
        c.desc,
        (c.perks || []).join(","),
        (c.syllabus || []).map((s) => s.title).join(","),
      ].some((v) => v?.toLowerCase().includes(query))
    );
  }, [courses, query]);

  function showToast(
    msg: string,
    type: Extract<ToastState, { show: true }>["type"] = "success"
  ) {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast({ show: false }), 2500);
  }

  function resetForms() {
    setFormPath({
      name: "",
      href: "",
      img: "",
      desc: "",
      duration: "",
      skills: "",
      rating: "",
      students: "",
      level: "Beginner",
      perks: "",
      syllabus: "",
    });
    setFormCourse({
      title: "",
      cover: "",
      duration: "",
      level: "Beginner",
      href: "",
      category: defaultCategory,
      subCategory: CATEGORY_MAP[defaultCategory][0],
      rating: "",
      students: "",
      desc: "",
      perks: "",
      syllabus: "",
    });
  }

  function askDelete(type: "skill" | "career" | "course", id: string, name: string) {
    setDeleteTarget({ type, id, name });
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    try {
      const res = await fetch(
        `/api/${
          type === "skill" ? "skillpaths" : type === "career" ? "careerpaths" : "courses"
        }/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok && res.status !== 204) throw new Error("Delete failed");
      if (type === "skill") setSkills((p) => p.filter((x) => x._id !== id));
      else if (type === "career") setCareers((p) => p.filter((x) => x._id !== id));
      else setCourses((p) => p.filter((x) => x._id !== id));
      showToast(
        `${type.charAt(0).toUpperCase() + type.slice(1)} deleted`,
        "success"
      );
    } catch (e) {
      console.error(e);
      showToast("Delete failed", "error");
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    // Paths create
    if (tab === "skills" || tab === "careers") {
      const f = formPath;
      if (!f.name || !f.href || !f.img || !f.desc || !f.duration) {
        showToast("Please fill all required fields", "error");
        return;
      }
      setCreating(true);

      const payload = {
        name: f.name.trim(),
        href: f.href.trim(),
        img: f.img.trim(),
        desc: f.desc.trim(),
        duration: f.duration.trim(),
        level: f.level,
        skills: f.skills ? parseCommaList(f.skills) : [],
        rating: f.rating !== "" ? Number(f.rating) : undefined,
        students: f.students !== "" ? Number(f.students) : undefined,
        perks: f.perks ? parseCommaList(f.perks) : undefined,
        syllabus: parseSyllabusJSON(f.syllabus),
      };

      const url = tab === "skills" ? "/api/skillpaths" : "/api/careerpaths";

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          let msg = "Create failed";
          if (errBody && typeof errBody === "object") {
            const obj = errBody as { error?: unknown; message?: unknown };
            if (typeof obj.error === "string") msg = obj.error;
            else if (typeof obj.message === "string") msg = obj.message;
          }
          throw new Error(msg);
        }

        const json = await safeJson<unknown>(res, null);
        let created: unknown = json;

        if (created && typeof created === "object") {
          const obj = created as { created?: unknown; data?: unknown };
          created = obj.created ?? obj.data ?? created;
        }

        const docUnknown = Array.isArray(created) ? created[0] : created;

        if (docUnknown && typeof docUnknown === "object" && "_id" in docUnknown) {
          if (tab === "skills") {
            setSkills((p) => [docUnknown as SkillPath, ...p]);
          } else {
            setCareers((p) => [docUnknown as CareerPath, ...p]);
          }
        } else {
          const list = await getList<SkillPath | CareerPath>(url);
          if (tab === "skills") setSkills(list as SkillPath[]);
          else setCareers(list as CareerPath[]);
        }

        showToast(
          `${tab === "skills" ? "Skill Path" : "Career Path"} added`,
          "success"
        );
        setOpenCreate(false);
        resetForms();
      } catch (err: unknown) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Server error";
        showToast(msg, "error");
      } finally {
        setCreating(false);
      }
      return;
    }

    // Courses create
    if (tab === "courses") {
      const f = formCourse;
      if (
        !f.title ||
        !f.cover ||
        !f.duration ||
        !f.href ||
        !f.category ||
        !f.subCategory
      ) {
        showToast("Please fill all required fields", "error");
        return;
      }
      setCreating(true);

      const payload = {
        title: f.title.trim(),
        cover: f.cover.trim(),
        duration: f.duration.trim(),
        level: f.level,
        href: f.href.trim(),
        category: f.category,
        subCategory: f.subCategory,
        rating: f.rating !== "" ? Number(f.rating) : undefined,
        students: f.students !== "" ? Number(f.students) : undefined,
        desc: f.desc.trim() || undefined,
        perks: f.perks ? parseCommaList(f.perks) : undefined,
        syllabus: parseSyllabusJSON(f.syllabus),
      };

      try {
        const res = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          let msg = "Create failed";
          if (errBody && typeof errBody === "object") {
            const obj = errBody as { error?: unknown; message?: unknown };
            if (typeof obj.error === "string") msg = obj.error;
            else if (typeof obj.message === "string") msg = obj.message;
          }
          throw new Error(msg);
        }

        const created = await safeJson<Course | null>(res, null);
        if (created && created._id) {
          setCourses((p) => [created, ...p]);
        } else {
          const list = await getList<Course>("/api/courses");
          setCourses(list);
        }

        showToast("Course added", "success");
        setOpenCreate(false);
        resetForms();
      } catch (err: unknown) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Server error";
        showToast(msg, "error");
      } finally {
        setCreating(false);
      }
    }
  }

  /* =========================
     UI Blocks
  ========================= */
  function Toolbar() {
    return (
      <div className="sticky top-0 z-10 -mx-6 px-6 py-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex rounded-xl border bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setTab("skills")}
              className={cx(
                "px-4 py-2 text-sm font-medium flex items-center gap-2",
                tab === "skills" ? "bg-orange-600 text-white" : "hover:bg-gray-50"
              )}
            >
              <GraduationCap size={16} /> Skills
            </button>
            <button
              onClick={() => setTab("careers")}
              className={cx(
                "px-4 py-2 text-sm font-medium flex items-center gap-2",
                tab === "careers" ? "bg-orange-600 text-white" : "hover:bg-gray-50"
              )}
            >
              <Layers3 size={16} />
              Careers
            </button>
            <button
              onClick={() => setTab("courses")}
              className={cx(
                "px-4 py-2 text-sm font-medium flex items-center gap-2",
                tab === "courses" ? "bg-orange-600 text-white" : "hover:bg-gray-50"
              )}
            >
              <BookOpen size={16} />
              Courses
            </button>
          </div>

          <div className="flex-1" />

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                tab === "skills"
                  ? "Search skill paths…"
                  : tab === "careers"
                  ? "Search career paths…"
                  : "Search courses…"
              }
              className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenCreate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700"
            >
              <Plus size={16} /> Add{" "}
              {tab === "skills"
                ? "Skill Path"
                : tab === "careers"
                ? "Career Path"
                : "Course"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function EmptyState(text: string) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Images className="text-gray-400" size={20} />
        </div>
        {text}
      </div>
    );
  }

  function RowPath({
    item,
    type,
  }: {
    item: SkillPath | CareerPath;
    type: "skill" | "career";
  }) {
    const rating = (item.rating ?? 0).toFixed(1);
    const students = (item.students ?? 0).toLocaleString();
    type LevelTone = "green" | "blue" | "amber";
    const levelTone: LevelTone =
      item.level === "Advanced"
        ? "amber"
        : item.level === "Intermediate"
        ? "blue"
        : "green";

    const perks = item.perks ?? [];
    const syllabus = item.syllabus ?? [];

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <img
              src={item.img || "/assets/images/thumbnails/ai.png"}
              alt={item.name}
              className="h-12 w-20 rounded-md object-cover border"
            />
            <div className="min-w-0">
              <div className="truncate font-medium">{item.name}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs">
                <a
                  href={item.href}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-orange-600 hover:underline"
                  rel="noreferrer"
                >
                  Open <ExternalLink size={14} />
                </a>
                <span className="text-gray-300">•</span>
                <a
                  href={buildCheckoutUrl(type, item.href, item.slug)}
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  Enroll now
                </a>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {perks.slice(0, 2).map((p, i) => (
                  <Pill key={`${item._id}-perk-${i}`} tone="gray">
                    {p}
                  </Pill>
                ))}
                {syllabus.length > 0 && (
                  <Pill tone="orange">{syllabus.length} sections</Pill>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="inline-flex items-center gap-1 text-sm text-gray-700">
            <Clock size={16} /> {item.duration}
          </div>
        </td>
        <td className="px-4 py-4">
          <Pill tone={levelTone}>{item.level || "Beginner"}</Pill>
        </td>
        <td className="px-4 py-4">
          <div className="inline-flex items-center gap-1 text-sm text-gray-700">
            <UserRound size={16} /> {students}
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="inline-flex items-center gap-1 text-sm text-gray-700">
            <Star size={16} className="text-yellow-500" /> {rating}
          </div>
        </td>
        <td className="px-4 py-4">
          <button
            onClick={() => askDelete(type, item._id, item.name)}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} /> Delete
          </button>
        </td>
      </tr>
    );
  }

  function RowCourse({ c }: { c: Course }) {
    type LevelTone = "green" | "blue" | "amber";
    const levelTone: LevelTone =
      c.level === "Advanced"
        ? "amber"
        : c.level === "Intermediate"
        ? "blue"
        : "green";

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <img
              src={c.cover || "/assets/images/thumbnails/ai.png"}
              alt={c.title}
              className="h-12 w-20 rounded-md object-cover border"
            />
            <div className="min-w-0">
              <div className="truncate font-medium">{c.title}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs">
                <a
                  href={c.href}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-orange-600 hover:underline"
                  rel="noreferrer"
                >
                  Open <ExternalLink size={14} />
                </a>
                <span className="text-gray-300">•</span>
                <a
                  href={buildCheckoutUrl("course", c.href, c.slug)}
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  Enroll now
                </a>
              </div>

              {/* Badges preview */}
              <div className="mt-1 flex flex-wrap gap-1">
                {c.category && (
                  <Pill tone="blue">
                    <span className="inline-flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" /> {c.category}
                    </span>
                  </Pill>
                )}
                {c.subCategory && <Pill tone="purple">{c.subCategory}</Pill>}
                {Array.isArray(c.perks) &&
                  c.perks.slice(0, 1).map((p, i) => (
                    <Pill key={`${c._id}-perk-${i}`} tone="gray">
                      {p}
                    </Pill>
                  ))}
                {Array.isArray(c.syllabus) && c.syllabus.length > 0 && (
                  <Pill tone="orange">{c.syllabus.length} sections</Pill>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="text-sm text-gray-700">{c.category}</div>
        </td>
        <td className="px-4 py-4">
          <div className="text-sm text-gray-700">{c.subCategory}</div>
        </td>
        <td className="px-4 py-4">
          <Pill tone={levelTone}>{c.level}</Pill>
        </td>
        <td className="px-4 py-4">
          <div className="inline-flex items-center gap-1 text-sm text-gray-700">
            <Clock size={16} /> {c.duration}
          </div>
        </td>
        <td className="px-4 py-4">
          <button
            onClick={() => askDelete("course", c._id, c.title)}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} /> Delete
          </button>
        </td>
      </tr>
    );
  }

  function TableCard() {
    if (tab === "courses") {
      const data = filteredCourses;
      return (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[34%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Course</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Sub-Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Level</th>
                  <th className="px-4 py-3 text-left font-semibold">Duration</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      {EmptyState("No courses yet. Click “Add” to create one.")}
                    </td>
                  </tr>
                ) : (
                  data
                    .slice()
                    .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
                    .map((c) => <RowCourse key={c._id} c={c} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Paths table
    const data = tab === "skills" ? filteredSkills : filteredCareers;
    return (
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[40%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Path</th>
                <th className="px-4 py-3 text-left font-semibold">Duration</th>
                <th className="px-4 py-3 text-left font-semibold">Level</th>
                <th className="px-4 py-3 text-left font-semibold">Students</th>
                <th className="px-4 py-3 text-left font-semibold">Rating</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    {EmptyState(
                      tab === "skills"
                        ? "No skill paths yet. Click “Add” to create one."
                        : "No career paths yet. Click “Add” to create one."
                    )}
                  </td>
                </tr>
              ) : (
                data
                  .slice()
                  .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
                  .map((item) => (
                    <RowPath
                      key={item._id}
                      item={item}
                      type={tab === "skills" ? "skill" : "career"}
                    />
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Live previews (data only – used inside JSX)
  const perksPreviewPath = parseCommaList(formPath.perks).slice(0, 3);
  const syllabusPreviewPath = parseSyllabusJSON(formPath.syllabus);

  const perksPreviewCourse = parseCommaList(formCourse.perks).slice(0, 3);
  const syllabusPreviewCourse = parseSyllabusJSON(formCourse.syllabus);

  /* =========================
     Render
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Toolbar */}
      <div className="mx-auto max-w-7xl px-6">
        <Toolbar />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <TableCard />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={cx(
              "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-2 text-sm shadow-lg text-white",
              toast.type === "success" && "bg-green-600",
              toast.type === "error" && "bg-red-600",
              toast.type === "info" && "bg-gray-800"
            )}
          >
            {"msg" in toast ? toast.msg : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <Modal
        open={openCreate}
        onClose={() => {
          setOpenCreate(false);
          resetForms();
        }}
        title={
          tab === "skills"
            ? "Add Skill Path"
            : tab === "careers"
            ? "Add Career Path"
            : "Add Course"
        }
        wide
      >
        {/* Paths Form */}
        {(tab === "skills" || tab === "careers") && (
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Field label="Name" required>
              <input
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                value={formPath.name}
                onChange={(e) =>
                  setFormPath((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </Field>

            <Field
              label="Page Link (href)"
              required
              hint="e.g., /skillpath/react or /careerpath/fullstack"
            >
              <input
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                value={formPath.href}
                onChange={(e) =>
                  setFormPath((f) => ({ ...f, href: e.target.value }))
                }
                required
              />
            </Field>

            <Field
              label="Image URL / Public Path"
              required
              hint="For local: /assets/images/thumbnails/ai.png"
            >
              <input
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                value={formPath.img}
                onChange={(e) =>
                  setFormPath((f) => ({ ...f, img: e.target.value }))
                }
                required
              />
            </Field>

            <Field label="Duration" required hint="e.g., 6 weeks, 24 hrs">
              <input
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                value={formPath.duration}
                onChange={(e) =>
                  setFormPath((f) => ({ ...f, duration: e.target.value }))
                }
                required
              />
            </Field>

            <Field label="Level">
              <select
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 bg-white"
                value={formPath.level}
                onChange={(e) =>
                  setFormPath((f) => ({ ...f, level: e.target.value }))
                }
              >
                {LEVELS.map((lv) => (
                  <option key={lv} value={lv}>
                    {lv}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Skills (comma separated)"
              hint="e.g., React, TypeScript, MongoDB"
            >
              <input
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                value={formPath.skills}
                onChange={(e) =>
                  setFormPath((f) => ({ ...f, skills: e.target.value }))
                }
              />
            </Field>

            <Field label="Rating">
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                value={formPath.rating}
                onChange={(e) =>
                  setFormPath((f) => ({ ...f, rating: e.target.value }))
                }
              />
            </Field>

            <Field label="Students">
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                value={formPath.students}
                onChange={(e) =>
                  setFormPath((f) => ({ ...f, students: e.target.value }))
                }
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Description" required>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 min-h-[100px]"
                  value={formPath.desc}
                  onChange={(e) =>
                    setFormPath((f) => ({ ...f, desc: e.target.value }))
                  }
                  required
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field
                label={`What you'll get (comma separated)`}
                hint='Example: "Structured lessons, Quizzes & checkpoints, Certificate of completion, Community support"'
              >
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                  value={formPath.perks}
                  onChange={(e) =>
                    setFormPath((f) => ({ ...f, perks: e.target.value }))
                  }
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field
                label="Syllabus (JSON)"
                hint='Example: [{"title":"Getting Started","items":["Intro","Setup"]},{"title":"React Basics","items":["JSX","Props","State"]}]'
              >
                <textarea
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 min-h-[120px] font-mono text-xs"
                  value={formPath.syllabus}
                  onChange={(e) =>
                    setFormPath((f) => ({ ...f, syllabus: e.target.value }))
                  }
                  placeholder='[{"title":"Module 1","items":["Topic A","Topic B"]},{"title":"Module 2"}]'
                />
              </Field>
            </div>

            {/* Live Preview */}
            <div className="md:col-span-2">
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <div className="text-sm font-medium mb-2">Image Preview</div>
                  <div className="aspect-[16/9] rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden">
                    {formPath.img &&
                    (formPath.img.startsWith("/") ||
                      formPath.img.startsWith("http")) ? (
                      <img
                        src={formPath.img}
                        className="h-full w-full object-cover"
                        alt="preview"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm flex items-center gap-2">
                        <Images size={18} /> Enter a valid URL or /public path
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="text-sm font-medium mb-2">Card Preview</div>
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          formPath.img &&
                          (formPath.img.startsWith("/") ||
                            formPath.img.startsWith("http"))
                            ? formPath.img
                            : "/assets/images/thumbnails/ai.png"
                        }
                        className="h-14 w-24 rounded-md object-cover border"
                        alt=""
                      />
                      <div className="min-w-0">
                        <div className="font-semibold truncate">
                          {formPath.name || "Untitled path"}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={14} /> {formPath.duration || "—"}
                          </span>
                          <Pill tone="orange">{formPath.level}</Pill>
                          {!!formPath.rating && (
                            <span className="inline-flex items-center gap-1">
                              <Star
                                size={14}
                                className="text-yellow-500"
                              />{" "}
                              {formPath.rating}
                            </span>
                          )}
                          {!!formPath.students && (
                            <span className="inline-flex items-center gap-1">
                              <UserRound size={14} /> {formPath.students}
                            </span>
                          )}
                          {syllabusPreviewPath?.length ? (
                            <Pill tone="green">
                              {syllabusPreviewPath.length} sections
                            </Pill>
                          ) : null}
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {formPath.desc || "Short description…"}
                        </p>

                        {perksPreviewPath.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {perksPreviewPath.map((perk, i) => (
                              <span
                                key={`perk-${i}`}
                                className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-2.5 py-1 text-xs"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> {perk}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForms();
                  setOpenCreate(false);
                }}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {creating ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Plus size={16} />
                )}
                Create
              </button>
            </div>
          </form>
        )}

        {/* Courses Form */}
        {tab === "courses" && (
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Field label="Title" required>
              <input
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                value={formCourse.title}
                onChange={(e) =>
                  setFormCourse((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </Field>

            <Field label="Duration" required hint="e.g., 7h or 6 weeks">
              <input
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                value={formCourse.duration}
                onChange={(e) =>
                  setFormCourse((f) => ({ ...f, duration: e.target.value }))
                }
                required
              />
            </Field>

            <Field label="Cover (URL or /public path)" required>
              <input
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                value={formCourse.cover}
                onChange={(e) =>
                  setFormCourse((f) => ({ ...f, cover: e.target.value }))
                }
                placeholder="/assets/covers/react.png"
                required
              />
            </Field>

            <Field label="Level">
              <select
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 bg-white"
                value={formCourse.level}
                onChange={(e) =>
                  setFormCourse((f) => ({ ...f, level: e.target.value }))
                }
              >
                {LEVELS.map((lv) => (
                  <option key={lv} value={lv}>
                    {lv}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Category" required>
              <select
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 bg-white"
                value={formCourse.category}
                onChange={(e) =>
                  setFormCourse((f) => ({
                    ...f,
                    category: e.target.value,
                    subCategory: CATEGORY_MAP[e.target.value]?.[0] ?? "",
                  }))
                }
                required
              >
                {CATEGORY_LIST.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Sub-Category" required>
              <select
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 bg-white"
                value={formCourse.subCategory}
                onChange={(e) =>
                  setFormCourse((f) => ({ ...f, subCategory: e.target.value }))
                }
                required
              >
                {subOptions.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Course Link (href)" required>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                  value={formCourse.href}
                  onChange={(e) =>
                    setFormCourse((f) => ({ ...f, href: e.target.value }))
                  }
                  placeholder="/courses/react-101"
                  required
                />
              </Field>
            </div>

            <Field label="Rating">
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                value={formCourse.rating}
                onChange={(e) =>
                  setFormCourse((f) => ({ ...f, rating: e.target.value }))
                }
              />
            </Field>

            <Field label="Students">
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                value={formCourse.students}
                onChange={(e) =>
                  setFormCourse((f) => ({ ...f, students: e.target.value }))
                }
              />
            </Field>

            {/* Description */}
            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 min-h-[100px]"
                  value={formCourse.desc}
                  onChange={(e) =>
                    setFormCourse((f) => ({ ...f, desc: e.target.value }))
                  }
                />
              </Field>
            </div>

            {/* Perks */}
            <div className="md:col-span-2">
              <Field
                label={`What you'll get (comma separated)`}
                hint='Example: "Hands-on projects, Quizzes, Certificate of completion, Community support"'
              >
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                  value={formCourse.perks}
                  onChange={(e) =>
                    setFormCourse((f) => ({ ...f, perks: e.target.value }))
                  }
                />
              </Field>
            </div>

            {/* Syllabus JSON */}
            <div className="md:col-span-2">
              <Field
                label="Syllabus (JSON)"
                hint='Example: [{"title":"Module 1","items":["Intro","Setup"]},{"title":"Module 2","items":["Topic A","Topic B"]}]'
              >
                <textarea
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 min-h-[120px] font-mono text-xs"
                  value={formCourse.syllabus}
                  onChange={(e) =>
                    setFormCourse((f) => ({ ...f, syllabus: e.target.value }))
                  }
                  placeholder='[{"title":"Module 1","items":["Topic A","Topic B"]},{"title":"Module 2"}]'
                />
              </Field>
            </div>

            {/* Live Previews */}
            <div className="md:col-span-2">
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <div className="text-sm font-medium mb-2">Image Preview</div>
                  <div className="aspect-[16/9] rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden">
                    {formCourse.cover &&
                    (formCourse.cover.startsWith("/") ||
                      formCourse.cover.startsWith("http")) ? (
                      <img
                        src={formCourse.cover}
                        className="h-full w-full object-cover"
                        alt="preview"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm flex items-center gap-2">
                        <Images size={18} /> Enter a valid URL or /public path
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="text-sm font-medium mb-2">Card Preview</div>
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          formCourse.cover &&
                          (formCourse.cover.startsWith("/") ||
                            formCourse.cover.startsWith("http"))
                            ? formCourse.cover
                            : "/assets/images/thumbnails/ai.png"
                        }
                        className="h-14 w-24 rounded-md object-cover border"
                        alt=""
                      />
                      <div className="min-w-0">
                        <div className="font-semibold truncate">
                          {formCourse.title || "Untitled course"}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={14} /> {formCourse.duration || "—"}
                          </span>
                          <Pill tone="orange">{formCourse.level}</Pill>
                          {formCourse.category && (
                            <Pill tone="blue">
                              <span className="inline-flex items-center gap-1">
                                <Tag className="h-3.5 w-3.5" />{" "}
                                {formCourse.category}
                              </span>
                            </Pill>
                          )}
                          {formCourse.subCategory && (
                            <Pill tone="purple">
                              {formCourse.subCategory}
                            </Pill>
                          )}
                          {!!formCourse.rating && (
                            <span className="inline-flex items-center gap-1">
                              <Star
                                size={14}
                                className="text-yellow-500"
                              />{" "}
                              {formCourse.rating}
                            </span>
                          )}
                          {!!formCourse.students && (
                            <span className="inline-flex items-center gap-1">
                              <UserRound size={14} /> {formCourse.students}
                            </span>
                          )}
                          {syllabusPreviewCourse?.length ? (
                            <Pill tone="green">
                              {syllabusPreviewCourse.length} sections
                            </Pill>
                          ) : null}
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {formCourse.desc || "Short description…"}
                        </p>

                        {perksPreviewCourse.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {perksPreviewCourse.map((perk, i) => (
                              <span
                                key={`perk-${i}`}
                                className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-2.5 py-1 text-xs"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> {perk}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForms();
                  setOpenCreate(false);
                }}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {creating ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Plus size={16} />
                )}
                Create
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{deleteTarget?.name}</span>? This
            action cannot be undone.
          </p>
        </div>
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            onClick={() => setConfirmOpen(false)}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
