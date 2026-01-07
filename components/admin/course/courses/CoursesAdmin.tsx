/* eslint-disable @next/next/no-img-element */
// components/admin/courses/CoursesAdmin.tsx
"use client";


import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
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
  BookOpen,
  Images,
  Upload as UploadIcon,
  PlusCircle,
  MinusCircle,
  Pencil,
  FileText,
} from "lucide-react";


/* =========================
   Types
========================= */
interface SyllabusSection {
  title: string;
  items?: string[];
}


interface Course {
  _id: string;
  title: string;
  cover: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced" | string;
  slug?: string;
  href?: string;
  category: string;
  subCategory: string;
  rating?: number;
  students?: number;
  desc?: string;
  perks?: string[];
  syllabus?: SyllabusSection[];
}


type ToastState =
  | { show: false }
  | { show: true; type: "success" | "error" | "info"; msg: string };


interface CourseFormState {
  title: string;
  cover: string;
  duration: string;
  level: string;
  category: string;
  subCategory: string;
  rating: string;
  students: string;
  desc: string;
  perks: string;
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
  tone?: "gray" | "orange" | "green" | "amber" | "blue";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700",
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
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
   Tiny Uploader (URL + Local Upload)
========================= */


type UploadResponse = {
  url?: string;
  error?: string;
};


function UrlOrUpload({
  value,
  onChange,
  required,
  placeholder,
  buttonLabel = "Upload",
}: {
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  placeholder?: string;
  buttonLabel?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);


  async function handleFile(file: File) {
    setUploading(true);
    setErr(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });


      const ct = res.headers.get("content-type") || "";
      const isJson = ct.toLowerCase().includes("application/json");


      let dataJson: UploadResponse | null = null;
      let dataText = "";


      if (isJson) {
        dataJson = (await res.json().catch(() => null)) as UploadResponse | null;
      } else {
        dataText = await res.text();
      }


      if (!res.ok || !isJson || !dataJson) {
        let msg: string | undefined;
        if (dataJson && typeof dataJson.error === "string") {
          msg = dataJson.error;
        } else if (dataText) {
          msg = dataText.slice(0, 200);
        }
        throw new Error(msg || `Upload failed (${res.status})`);
      }


      if (!dataJson.url) throw new Error("Upload did not return a URL");
      onChange(String(dataJson.url));
    } catch (e: unknown) {
      if (e instanceof Error) setErr(e.message);
      else setErr("Upload failed");
    } finally {
      setUploading(false);
    }
  }


  return (
    <div className="flex gap-2">
      <input
        required={required}
        className={cx(
          "w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500",
          uploading && "opacity-70"
        )}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <label
        className={cx(
          "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer",
          uploading && "opacity-60 pointer-events-none"
        )}
      >
        <UploadIcon size={16} />
        {uploading ? "Uploading…" : buttonLabel}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
      </label>
      {err && <span className="text-xs text-red-600 self-center">{err}</span>}
    </div>
  );
}


/* =========================
   Syllabus Builder
========================= */
function SyllabusBuilder({
  value,
  onChange,
  required,
}: {
  value: SyllabusSection[];
  onChange: (next: SyllabusSection[]) => void;
  required?: boolean;
}) {
  function addSection() {
    onChange([...value, { title: "", items: [""] }]);
  }
  function removeSection(i: number) {
    const n = value.slice();
    n.splice(i, 1);
    onChange(n);
  }
  function setSectionTitle(i: number, title: string) {
    const n = value.slice();
    n[i] = { ...n[i], title };
    onChange(n);
  }
  function addItem(i: number) {
    const n = value.slice();
    const items = n[i].items ? n[i].items!.slice() : [];
    items.push("");
    n[i].items = items;
    onChange(n);
  }
  function setItem(i: number, j: number, text: string) {
    const n = value.slice();
    const items = n[i].items ? n[i].items!.slice() : [];
    items[j] = text;
    n[i].items = items;
    onChange(n);
  }
  function removeItem(i: number, j: number) {
    const n = value.slice();
    const items = (n[i].items || []).slice();
    items.splice(j, 1);
    n[i].items = items;
    onChange(n);
  }


  const hasAtLeastOne = value.length > 0 && value[0].title.trim() !== "";


  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Build sections & topics visually {required && <span className="text-red-500">*</span>}
        </div>
        <button
          type="button"
          onClick={addSection}
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
        >
          <PlusCircle size={16} /> Add section
        </button>
      </div>


      {value.length === 0 && (
        <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-500">
          No sections yet. Click “Add section”.
        </div>
      )}


      <div className="space-y-4">
        {value.map((sec, i) => (
          <div key={i} className="rounded-xl border p-3">
            <div className="flex items-center gap-2">
              <input
                required={required && i === 0}
                placeholder={`Section ${i + 1} title`}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                value={sec.title}
                onChange={(e) => setSectionTitle(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeSection(i)}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-red-50 hover:text-red-600"
              >
                <MinusCircle size={16} /> Remove
              </button>
            </div>


            <div className="mt-3 space-y-2">
              {(sec.items || []).map((it, j) => (
                <div key={j} className="flex items-center gap-2">
                  <input
                    placeholder={`Topic ${j + 1}`}
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                    value={it}
                    onChange={(e) => setItem(i, j, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i, j)}
                    className="rounded-lg border px-2 py-2 text-sm hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove topic"
                  >
                    <MinusCircle size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem(i)}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                <PlusCircle size={14} /> Add topic
              </button>
            </div>
          </div>
        ))}
      </div>


      {required && !hasAtLeastOne && (
        <p className="text-xs text-red-600">Please add at least one section with a title.</p>
      )}
    </div>
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
   Parse helpers
========================= */
function parseCommaList(input: string): string[] {
  return input.split(",").map((s) => s.trim()).filter(Boolean);
}


/* =========================
   Main Component (Courses only)
========================= */
export default function CoursesAdmin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);


  const [toast, setToast] = useState<ToastState>({ show: false });
  const [q, setQ] = useState("");


  // Create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);


  // Edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);


  // Delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(
    null
  );


  const defaultCategory = CATEGORY_LIST[0];
  const defaultSub = CATEGORY_MAP[defaultCategory][0];


  // Created course ID (for redirect after creation)
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);




  const [formCourse, setFormCourse] = useState<CourseFormState>({
    title: "",
    cover: "",
    duration: "",
    level: "Beginner",
    category: defaultCategory,
    subCategory: defaultSub,
    rating: "",
    students: "",
    desc: "",
    perks: "",
  });
  const [syllabusCourse, setSyllabusCourse] = useState<SyllabusSection[]>([]);


  const subOptions = useMemo(
    () => CATEGORY_MAP[formCourse.category] ?? [],
    [formCourse.category]
  );


  // keep subCategory valid if category changes
  useEffect(() => {
    if (!subOptions.includes(formCourse.subCategory)) {
      setFormCourse((f) => ({
        ...f,
        subCategory: subOptions[0] || "",
      }));
    }
  }, [subOptions, formCourse.subCategory]);


useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      const list = await getList<Course>("/api/course/courses");
      if (mounted) setCourses(list);
    } catch (e) {
      console.error(e);
      showToast("Failed to load courses", "error");
    } finally {
      if (mounted) setLoading(false);
    }
  })();
  return () => {
    mounted = false;
  };
}, []); // ✅ no disable needed


  const query = q.trim().toLowerCase();
  const filteredCourses = useMemo(() => {
    if (!query) return courses;
    return courses.filter((c) =>
      [c.title, c.level, c.category, c.subCategory].some((v) =>
        v?.toLowerCase().includes(query)
      )
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
    setFormCourse({
      title: "",
      cover: "",
      duration: "",
      level: "Beginner",
      category: defaultCategory,
      subCategory: CATEGORY_MAP[defaultCategory][0],
      rating: "",
      students: "",
      desc: "",
      perks: "",
    });
    setSyllabusCourse([]);
  }


  function askDelete(id: string, title: string) {
    setDeleteTarget({ id, title });
    setConfirmOpen(true);
  }


  async function confirmDelete() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    try {
      const res = await fetch(`/api/course/courses/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Delete failed");
      setCourses((p) => p.filter((x) => x._id !== id));
      showToast("Course deleted", "success");
    } catch (e) {
      console.error(e);
      showToast("Delete failed", "error");
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  }


  /* ========= Create ========= */
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (creating) return;


    const f = formCourse;
    if (
      !f.title ||
      !f.cover ||
      !f.duration ||
      !f.level ||
      !f.category ||
      !f.subCategory ||
      !f.desc
    ) {
      showToast("Please fill all required fields", "error");
      return;
    }


    const syl = syllabusCourse
      .filter((s) => s.title.trim())
      .map((s) => ({
        title: s.title.trim(),
        ...(s.items?.length
          ? { items: s.items.filter(Boolean).map((x) => x.trim()) }
          : {}),
      }));


    setCreating(true);
    const payload = {
      title: f.title.trim(),
      cover: f.cover.trim(),
      duration: f.duration.trim(),
      level: f.level,
      category: f.category,
      subCategory: f.subCategory,
      rating: f.rating !== "" ? Number(f.rating) : undefined,
      students: f.students !== "" ? Number(f.students) : undefined,
      desc: f.desc.trim(),
      perks: f.perks ? parseCommaList(f.perks) : undefined,
      syllabus: syl.length ? syl : undefined,
    };


    try {
      const res = await fetch("/api/course/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


      const data = await safeJson<
        (Course & { error?: unknown; message?: unknown }) | {
          error?: unknown;
          message?: unknown;
        } | null
      >(res, null);


      if (!res.ok || !data || !(data as Course)._id) {
        const maybeErr = data as { error?: unknown; message?: unknown } | null;
        let msg = "Create failed";
        if (maybeErr && typeof maybeErr.error === "string") msg = maybeErr.error;
        else if (maybeErr && typeof maybeErr.message === "string")
          msg = maybeErr.message;
        throw new Error(msg);
      }


      const created = data as Course;
      if (created._id) setCourses((p) => [created, ...p]);
      else setCourses(await getList<Course>("/api/course/courses"));


      setCreatedCourseId(created._id); // 🔥 important


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


  /* ========= Edit ========= */
  async function startEdit(id: string) {
    setEditingId(id);
    setOpenEdit(true);
    setEditLoading(true);
    try {
      const res = await fetch(`/api/course/courses/${id}`, {
        cache: "no-store",
      });
      const doc = await safeJson<Course | null>(res, null);
      if (!res.ok || !doc?._id) throw new Error("Failed to load course");


      setFormCourse({
        title: doc.title || "",
        cover: doc.cover || "",
        duration: doc.duration || "",
        level: doc.level || "Beginner",
        category: doc.category || defaultCategory,
        subCategory:
          doc.subCategory ||
          CATEGORY_MAP[doc.category || defaultCategory]?.[0] ||
          defaultSub,
        rating: doc.rating != null ? String(doc.rating) : "",
        students: doc.students != null ? String(doc.students) : "",
        desc: doc.desc || "",
        perks: Array.isArray(doc.perks) ? doc.perks.join(", ") : "",
      });
      setSyllabusCourse(Array.isArray(doc.syllabus) ? doc.syllabus : []);
    } catch (e) {
      console.error(e);
      showToast("Failed to load course", "error");
      setOpenEdit(false);
      setEditingId(null);
    } finally {
      setEditLoading(false);
    }
  }


  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (editing || !editingId) return;


    const f = formCourse;
    if (
      !f.title ||
      !f.cover ||
      !f.duration ||
      !f.level ||
      !f.category ||
      !f.subCategory ||
      !f.desc
    ) {
      showToast("Please fill all required fields", "error");
      return;
    }


    const syl = syllabusCourse
      .filter((s) => s.title.trim())
      .map((s) => ({
        title: s.title.trim(),
        ...(s.items?.length
          ? { items: s.items.filter(Boolean).map((x) => x.trim()) }
          : {}),
      }));


    setEditing(true);
    const payload = {
      title: f.title.trim(),
      cover: f.cover.trim(),
      duration: f.duration.trim(),
      level: f.level,
      category: f.category,
      subCategory: f.subCategory,
      rating: f.rating !== "" ? Number(f.rating) : undefined,
      students: f.students !== "" ? Number(f.students) : undefined,
      desc: f.desc.trim(),
      perks: f.perks ? parseCommaList(f.perks) : undefined,
      syllabus: syl.length ? syl : undefined,
    };


    try {
      const res = await fetch(`/api/course/courses/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


      const data = await safeJson<
        (Course & { error?: unknown; message?: unknown }) | {
          error?: unknown;
          message?: unknown;
        } | null
      >(res, null);


      if (!res.ok || !data || !(data as Course)._id) {
        const maybeErr = data as { error?: unknown; message?: unknown } | null;
        let msg = "Update failed";
        if (maybeErr && typeof maybeErr.error === "string") msg = maybeErr.error;
        else if (maybeErr && typeof maybeErr.message === "string")
          msg = maybeErr.message;
        throw new Error(msg);
      }


      const updated = data as Course;


      setCourses((prev) =>
        prev.map((c) => (c._id === updated._id ? { ...c, ...updated } : c))
      );
      showToast("Course updated", "success");
      setOpenEdit(false);
      setEditingId(null);
      resetForms();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Server error";
      showToast(msg, "error");
    } finally {
      setEditing(false);
    }
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


  function RowCourse({ c }: { c: Course }) {
    const link = c.href || (c.slug ? `/courses/${c.slug}` : "#");
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
              <a
                href={link}
                target="_blank"
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-orange-600 hover:underline"
                rel="noreferrer"
              >
                Open <ExternalLink size={14} />
              </a>
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
          <Pill
            tone={
              c.level === "Advanced"
                ? "amber"
                : c.level === "Intermediate"
                ? "blue"
                : "green"
            }
          >
            {c.level}
          </Pill>
        </td>
        <td className="px-4 py-4">
          <div className="inline-flex items-center gap-1 text-sm text-gray-700">
            <Clock size={16} /> {c.duration}
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => startEdit(c._id)}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              <Pencil size={16} /> Edit
            </button>
            <a
              href={`/admin/course/courses/${c._id}/landing`}
              className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm text-orange-700 hover:bg-orange-100"
            >
              <FileText size={16} /> Landing
            </a>
            <button
              onClick={() => askDelete(c._id, c.title)}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </td>
      </tr>
    );
  }


  const livePreview =
    (formCourse.cover &&
      (formCourse.cover.startsWith("/") || formCourse.cover.startsWith("http"))) ||
    false;
  const perksPreview = parseCommaList(formCourse.perks).slice(0, 3);


  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Toolbar */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="sticky top-0 z-10 -mx-6 px-6 py-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 font-semibold">
              <BookOpen size={18} /> Courses
            </div>


            <div className="flex-1" />


            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search courses…"
                className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none focus:border-orange-500"
              />
            </div>


            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetForms();
                  setOpenCreate(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700"
              >
                <Plus size={16} /> Add Course
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-6">
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
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      {EmptyState("No courses yet. Click “Add Course”.")}
                    </td>
                  </tr>
                ) : (
                  filteredCourses
                    .slice()
                    .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
                    .map((c) => <RowCourse key={c._id} c={c} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
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
        title="Add Course"
        wide
      >
        <CourseForm
          formCourse={formCourse}
          setFormCourse={setFormCourse}
          syllabusCourse={syllabusCourse}
          setSyllabusCourse={setSyllabusCourse}
          subOptions={subOptions}
          livePreview={livePreview}
          perksPreview={perksPreview}
          submitting={creating}
          onCancel={() => {
            resetForms();
            setOpenCreate(false);
          }}
          onSubmit={handleCreate}
        />
        {createdCourseId && (
  <div className="mt-6 border-t pt-4 flex justify-end">
    <button
      type="button"
      onClick={() => {
        window.location.href = `/admin/course/courses/${createdCourseId}/landing`;
      }}
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
    >
      ➕ Add Landing Page
    </button>
  </div>
)}


      </Modal>


     {/* Edit Modal */}
<Modal
  open={openEdit}
  onClose={() => {
    setOpenEdit(false);
    setEditingId(null);
    resetForms();
  }}
  title="Edit Course"
  wide
>
  {editLoading ? (
    <div className="flex items-center justify-center py-12 text-sm text-gray-600">
      <Loader2 className="mr-2 animate-spin" size={16} /> Loading…
    </div>
  ) : (
    <>
      <CourseForm
        formCourse={formCourse}
        setFormCourse={setFormCourse}
        syllabusCourse={syllabusCourse}
        setSyllabusCourse={setSyllabusCourse}
        subOptions={subOptions}
        livePreview={livePreview}
        perksPreview={perksPreview}
        submitting={editing}
        onCancel={() => {
          setOpenEdit(false);
          setEditingId(null);
          resetForms();
        }}
        onSubmit={handleUpdate}
        isEdit
      />


      {editingId && (
  <div className="mt-6 border-t pt-4 flex justify-end">
    <button
      type="button"
      onClick={() =>
        window.location.href = `/admin/course/courses/${editingId}/landing`
      }
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
    >
      ✏️ Edit Landing Page
    </button>
  </div>
)}


    </>
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
            <span className="font-semibold">{deleteTarget?.title}</span>? This action
            cannot be undone.
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


/* =========================
   Course Form (shared)
========================= */
function CourseForm({
  formCourse,
  setFormCourse,
  syllabusCourse,
  setSyllabusCourse,
  subOptions,
  livePreview,
  perksPreview,
  submitting,
  onCancel,
  onSubmit,
  isEdit = false,
}: {
  formCourse: CourseFormState;
  setFormCourse: Dispatch<SetStateAction<CourseFormState>>;
  syllabusCourse: SyllabusSection[];
  setSyllabusCourse: (next: SyllabusSection[]) => void;
  subOptions: string[];
  livePreview: boolean;
  perksPreview: string[];
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Title" required>
        <input
          required
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
          value={formCourse.title}
          onChange={(e) =>
            setFormCourse((f) => ({
              ...f,
              title: e.target.value,
            }))
          }
        />
      </Field>


      <Field label="Duration" required hint="e.g., 7h or 6 weeks">
        <input
          required
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
          value={formCourse.duration}
          onChange={(e) =>
            setFormCourse((f) => ({
              ...f,
              duration: e.target.value,
            }))
          }
        />
      </Field>


      <Field label="Cover (URL or Upload)" required>
        <UrlOrUpload
          required
          value={formCourse.cover}
          onChange={(url) =>
            setFormCourse((f) => ({
              ...f,
              cover: url,
            }))
          }
          placeholder="click to upload or enter image URL"
          buttonLabel="Upload cover"
        />
      </Field>


      <Field label="Level" required>
        <select
          required
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 bg-white"
          value={formCourse.level}
          onChange={(e) =>
            setFormCourse((f) => ({
              ...f,
              level: e.target.value,
            }))
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
          required
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 bg-white"
          value={formCourse.category}
          onChange={(e) => {
            const newCat = e.target.value;
            const firstSub = CATEGORY_MAP[newCat]?.[0] ?? "";
            setFormCourse((f) => ({
              ...f,
              category: newCat,
              subCategory: firstSub,
            }));
          }}
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
          required
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 bg-white"
          value={formCourse.subCategory}
          onChange={(e) =>
            setFormCourse((f) => ({
              ...f,
              subCategory: e.target.value,
            }))
          }
        >
          {subOptions.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </Field>


      <Field label="Rating">
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
          value={formCourse.rating}
          onChange={(e) =>
            setFormCourse((f) => ({
              ...f,
              rating: e.target.value,
            }))
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
            setFormCourse((f) => ({
              ...f,
              students: e.target.value,
            }))
          }
        />
      </Field>


      {/* Description */}
      <div className="md:col-span-2">
        <Field label="Description" required>
          <textarea
            required
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 min-h-[100px]"
            value={formCourse.desc}
            onChange={(e) =>
              setFormCourse((f) => ({
                ...f,
                desc: e.target.value,
              }))
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
              setFormCourse((f) => ({
                ...f,
                perks: e.target.value,
              }))
            }
          />
        </Field>
      </div>


      {/* Syllabus Builder */}
      <div className="md:col-span-2">
        <Field
          label="Syllabus"
          required
          hint="Add sections and topics. At least one section title is required."
        >
          <SyllabusBuilder
            value={syllabusCourse}
            onChange={setSyllabusCourse}
            required
          />
        </Field>
      </div>


      {/* Live Previews */}
      <div className="md:col-span-2">
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <div className="text-sm font-medium mb-2">Image Preview</div>
            <div className="aspect-[16/9] rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden">
              {livePreview ? (
                <img
                  src={formCourse.cover}
                  className="h-full w-full object-cover"
                  alt="preview"
                />
              ) : (
                <div className="text-gray-400 text-sm flex items-center gap-2">
                  <Images size={18} /> Enter URL or upload
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
                    livePreview
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
                    {!!formCourse.rating && (
                      <span className="inline-flex items-center gap-1">
                        <Star size={14} className="text-yellow-500" />{" "}
                        {formCourse.rating}
                      </span>
                    )}
                    {!!formCourse.students && (
                      <span className="inline-flex items-center gap-1">
                        <UserRound size={14} /> {formCourse.students}
                      </span>
                    )}
                    {syllabusCourse?.length ? (
                      <Pill tone="green">
                        {syllabusCourse.length} sections
                      </Pill>
                    ) : null}
                  </div>


                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {formCourse.desc || "Short description…"}
                  </p>


                  {perksPreview.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {perksPreview.map((perk, i) => (
                        <span
                          key={`perk-${i}`}
                          className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-2.5 py-1 text-xs"
                        >
                          • {perk}
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
          onClick={onCancel}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : isEdit ? (
            <Pencil size={16} />
          ) : (
            <Plus size={16} />
          )}
          {isEdit ? "Save changes" : "Create"}
        </button>




      </div>
    </form>
  );
}


/* =========================
   Modal (scrollable + body-lock + Esc)
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
  // body scroll lock + Esc handler
  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);


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
              "relative w-full max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl",
              wide ? "max-w-3xl" : "max-w-lg"
            )}
          >
            <div className="flex items-center justify-between gap-4 sticky top-0 bg-white pb-4 z-10">
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



