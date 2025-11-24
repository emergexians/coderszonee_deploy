// components/admin/courses/career/CareerPathsAdmin.tsx
"use client";

import Image from "next/image";
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
  Layers3,
  Images,
  Upload as UploadIcon,
  PlusCircle,
  MinusCircle,
  Pencil,
} from "lucide-react";

/* =========================
   Types
========================= */
interface SyllabusSection {
  title: string;
  items?: string[];
}

interface CareerPath {
  _id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | string;
  duration: string;
  img: string;
  href?: string; // virtual
  slug?: string; // fallback link building
  desc: string;
  skills?: string[];
  rating?: number;
  students?: number;
  perks?: string[];
  syllabus?: SyllabusSection[];
}

type ToastState =
  | { show: false }
  | { show: true; type: "success" | "error" | "info"; msg: string };

interface CareerPathFormState {
  name: string;
  img: string;
  desc: string;
  duration: string;
  skills: string;
  rating: string;
  students: string;
  level: string;
  perks: string;
}

/* =========================
   Constants
========================= */
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

// Built-in fallback image (fixes 404 on /assets/images/thumbnails/ai.png)
const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='94'>
      <rect width='100%' height='100%' fill='#f3f4f6'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            fill='#9ca3af' font-family='system-ui,Segoe UI,Roboto,Ubuntu,sans-serif' font-size='12'>
        No image
      </text>
    </svg>`
  );

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
    <span
      className={cx("px-2.5 py-1 rounded-full text-xs font-medium", tones[tone])}
    >
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

      const res = await fetch("/api/upload/careerpaths", {
        method: "POST",
        body,
      });

      const ct = res.headers.get("content-type") || "";
      const isJson = ct.toLowerCase().includes("application/json");

      let dataJson: UploadResponse | null = null;
      let dataText = "";

      if (isJson) {
        dataJson = (await res
          .json()
          .catch(() => null)) as UploadResponse | null;
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

      if (!dataJson.url) {
        throw new Error("Upload did not return a URL");
      }

      onChange(String(dataJson.url));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr("Upload failed");
      }
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
    const next = value.slice();
    next.splice(i, 1);
    onChange(next);
  }
  function setSectionTitle(i: number, title: string) {
    const next = value.slice();
    next[i] = { ...next[i], title };
    onChange(next);
  }
  function addItem(i: number) {
    const next = value.slice();
    const items = next[i].items ? next[i].items.slice() : [];
    items.push("");
    next[i].items = items;
    onChange(next);
  }
  function setItem(i: number, j: number, text: string) {
    const next = value.slice();
    const items = next[i].items ? next[i].items.slice() : [];
    items[j] = text;
    next[i].items = items;
    onChange(next);
  }
  function removeItem(i: number, j: number) {
    const next = value.slice();
    const items = (next[i].items || []).slice();
    items.splice(j, 1);
    next[i].items = items;
    onChange(next);
  }

  const hasAtLeastOne = value.length > 0 && value[0].title.trim() !== "";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Build sections & topics visually{" "}
          {required && <span className="text-red-500">*</span>}
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
        <p className="text-xs text-red-600">
          Please add at least one section with a title.
        </p>
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
   Shared Form (Create/Edit)
========================= */
function CareerPathForm({
  formPath,
  setFormPath,
  syllabusPath,
  setSyllabusPath,
  submitting,
  onCancel,
  onSubmit,
  isEdit = false,
}: {
  formPath: CareerPathFormState;
  setFormPath: Dispatch<SetStateAction<CareerPathFormState>>;
  syllabusPath: SyllabusSection[];
  setSyllabusPath: (next: SyllabusSection[]) => void;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
}) {
  const livePreview =
    (formPath.img &&
      (formPath.img.startsWith("/") || formPath.img.startsWith("http"))) ||
    false;
  const perksPreview = parseCommaList(formPath.perks).slice(0, 3);

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Name" required>
        <input
          required
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
          value={formPath.name}
          onChange={(e) =>
            setFormPath((f) => ({
              ...f,
              name: e.target.value,
            }))
          }
        />
      </Field>

      <Field
        label="Image (URL or Upload)"
        required
        hint="Click to upload or enter image URL"
      >
        <UrlOrUpload
          required
          value={formPath.img}
          onChange={(url) =>
            setFormPath((f) => ({
              ...f,
              img: url,
            }))
          }
          placeholder="click to upload or enter image URL"
          buttonLabel="Upload image"
        />
      </Field>

      <Field label="Duration" required hint="e.g., 6 weeks, 24 hrs">
        <input
          required
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
          value={formPath.duration}
          onChange={(e) =>
            setFormPath((f) => ({
              ...f,
              duration: e.target.value,
            }))
          }
        />
      </Field>

      <Field label="Level" required>
        <select
          required
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 bg-white"
          value={formPath.level}
          onChange={(e) =>
            setFormPath((f) => ({
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

      <Field
        label="Skills (comma separated)"
        hint="e.g., React, TypeScript, PostgreSQL"
      >
        <input
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
          value={formPath.skills}
          onChange={(e) =>
            setFormPath((f) => ({
              ...f,
              skills: e.target.value,
            }))
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
            setFormPath((f) => ({
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
          value={formPath.students}
          onChange={(e) =>
            setFormPath((f) => ({
              ...f,
              students: e.target.value,
            }))
          }
        />
      </Field>

      <div className="md:col-span-2">
        <Field label="Description" required>
          <textarea
            required
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 min-h-[100px]"
            value={formPath.desc}
            onChange={(e) =>
              setFormPath((f) => ({
                ...f,
                desc: e.target.value,
              }))
            }
          />
        </Field>
      </div>

      <div className="md:col-span-2">
        <Field
          label={`What you'll get (comma separated)`}
          hint='Example: "Structured lessons, Quizzes, Certificate of completion, Community support"'
        >
          <input
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
            value={formPath.perks}
            onChange={(e) =>
              setFormPath((f) => ({
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
            value={syllabusPath}
            onChange={setSyllabusPath}
            required
          />
        </Field>
      </div>

      {/* Live Previews */}
      <div className="md:col-span-2">
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <div className="text-sm font-medium mb-2">Image Preview</div>
            <div className="relative aspect-[16/9] rounded-xl border bg-gray-50 overflow-hidden">
              <Image
                src={livePreview ? formPath.img : FALLBACK_IMG}
                alt="preview"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                unoptimized
                className="object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-sm font-medium mb-2">Card Preview</div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md border">
                  <Image
                    src={livePreview ? formPath.img : FALLBACK_IMG}
                    alt=""
                    fill
                    sizes="96px"
                    unoptimized
                    className="object-cover"
                  />
                </div>
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
                        <Star size={14} className="text-yellow-500" />{" "}
                        {formPath.rating}
                      </span>
                    )}
                    {!!formPath.students && (
                      <span className="inline-flex items-center gap-1">
                        <UserRound size={14} /> {formPath.students}
                      </span>
                    )}
                    {syllabusPath?.length ? (
                      <Pill tone="green">{syllabusPath.length} sections</Pill>
                    ) : null}
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {formPath.desc || "Short description…"}
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
   Main Component (Career Paths)
========================= */
export default function CareerPathsAdmin() {
  const [careers, setCareers] = useState<CareerPath[]>([]);
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
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [formPath, setFormPath] = useState<CareerPathFormState>({
    name: "",
    img: "",
    desc: "",
    duration: "",
    skills: "",
    rating: "",
    students: "",
    level: "Beginner",
    perks: "",
  });
  const [syllabusPath, setSyllabusPath] = useState<SyllabusSection[]>([]);

  // Toast helper
  function showToast(
    msg: string,
    type: Extract<ToastState, { show: true }>["type"] = "success"
  ) {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast({ show: false }), 2500);
  }

  // Initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const careersData = await getList<CareerPath>(
          "/api/course/careerpaths"
        );
        if (mounted) setCareers(careersData);
      } catch (e) {
        console.error(e);
        showToast("Failed to load career paths", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const query = q.trim().toLowerCase();
  const filteredCareers = useMemo(() => {
    if (!query) return careers;
    return careers.filter((c) =>
      [
        c.name,
        c.level,
        c.skills?.join(","),
        c.perks?.join(","),
        c.syllabus?.map((sec) => sec.title).join(","),
      ].some((v) => v?.toLowerCase().includes(query))
    );
  }, [careers, query]);

  function resetForms() {
    setFormPath({
      name: "",
      img: "",
      desc: "",
      duration: "",
      skills: "",
      rating: "",
      students: "",
      level: "Beginner",
      perks: "",
    });
    setSyllabusPath([]);
  }

  function askDelete(id: string, name: string) {
    setDeleteTarget({ id, name });
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    try {
      const res = await fetch(`/api/course/careerpaths/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error("Delete failed");
      setCareers((p) => p.filter((x) => x._id !== id));
      showToast("Career Path deleted", "success");
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

    const f = formPath;
    if (!f.name || !f.img || !f.desc || !f.duration) {
      showToast("Please fill all required fields", "error");
      return;
    }
    const syl = syllabusPath
      .filter((s) => s.title.trim())
      .map((s) => ({
        title: s.title.trim(),
        ...(s.items?.length
          ? { items: s.items.filter(Boolean).map((x) => x.trim()) }
          : {}),
      }));

    setCreating(true);

    const payload = {
      name: f.name.trim(),
      img: f.img.trim(),
      desc: f.desc.trim(),
      duration: f.duration.trim(),
      level: f.level,
      skills: f.skills ? parseCommaList(f.skills) : [],
      rating: f.rating !== "" ? Number(f.rating) : undefined,
      students: f.students !== "" ? Number(f.students) : undefined,
      perks: f.perks ? parseCommaList(f.perks) : undefined,
      syllabus: syl.length ? syl : undefined,
    };

    try {
      const res = await fetch("/api/course/careerpaths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = (await res
          .json()
          .catch(() => ({}))) as { error?: unknown; message?: unknown };

        let msg = "Create failed";
        if (typeof j.error === "string") msg = j.error;
        else if (typeof j.message === "string") msg = j.message;
        throw new Error(msg);
      }

      const created = await safeJson<CareerPath | null>(res, null);
      if (created?._id) setCareers((p) => [created, ...p]);
      else setCareers(await getList<CareerPath>("/api/course/careerpaths"));

      showToast("Career Path added", "success");
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
      const res = await fetch(`/api/course/careerpaths/${id}`, {
        cache: "no-store",
      });
      const doc = await safeJson<CareerPath | null>(res, null);
      if (!res.ok || !doc?._id) {
        throw new Error("Failed to load career path");
      }

      setFormPath({
        name: doc.name || "",
        img: doc.img || "",
        desc: doc.desc || "",
        duration: doc.duration || "",
        skills: Array.isArray(doc.skills) ? doc.skills.join(", ") : "",
        rating: doc.rating != null ? String(doc.rating) : "",
        students: doc.students != null ? String(doc.students) : "",
        level: doc.level || "Beginner",
        perks: Array.isArray(doc.perks) ? doc.perks.join(", ") : "",
      });
      setSyllabusPath(Array.isArray(doc.syllabus) ? doc.syllabus : []);
    } catch (e) {
      console.error(e);
      showToast("Failed to load career path", "error");
      setOpenEdit(false);
      setEditingId(null);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (editing || !editingId) return;

    const f = formPath;
    if (!f.name || !f.img || !f.desc || !f.duration) {
      showToast("Please fill all required fields", "error");
      return;
    }
    const syl = syllabusPath
      .filter((s) => s.title.trim())
      .map((s) => ({
        title: s.title.trim(),
        ...(s.items?.length
          ? { items: s.items.filter(Boolean).map((x) => x.trim()) }
          : {}),
      }));

    setEditing(true);

    const payload = {
      name: f.name.trim(),
      img: f.img.trim(),
      desc: f.desc.trim(),
      duration: f.duration.trim(),
      level: f.level,
      skills: f.skills ? parseCommaList(f.skills) : [],
      rating: f.rating !== "" ? Number(f.rating) : undefined,
      students: f.students !== "" ? Number(f.students) : undefined,
      perks: f.perks ? parseCommaList(f.perks) : undefined,
      syllabus: syl.length ? syl : undefined,
    };

    try {
      const res = await fetch(`/api/course/careerpaths/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await safeJson<{ error?: unknown; message?: unknown }>(
          res,
          {}
        );
        let msg = "Update failed";
        if (typeof j.error === "string") msg = j.error;
        else if (typeof j.message === "string") msg = j.message;
        throw new Error(msg);
      }

      const updated = await safeJson<CareerPath | null>(res, null);
      if (!updated?._id) {
        throw new Error("Update failed");
      }

      setCareers((prev) =>
        prev.map((c) => (c._id === updated._id ? { ...c, ...updated } : c))
      );
      showToast("Career Path updated", "success");
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

  function RowCareer({ item }: { item: CareerPath }) {
    const rating = (item.rating ?? 0).toFixed(1);
    const students = (item.students ?? 0).toLocaleString();
    const levelTone: "amber" | "blue" | "green" =
      item.level === "Advanced"
        ? "amber"
        : item.level === "Intermediate"
        ? "blue"
        : "green";
    const linkHref =
      item.href || (item.slug ? `/course/careerpaths/${item.slug}` : undefined);

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border">
              <Image
                src={item.img || FALLBACK_IMG}
                alt={item.name}
                fill
                sizes="80px"
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium">{item.name}</div>
              {linkHref ? (
                <a
                  href={linkHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 text-xs text-orange-600 hover:underline"
                >
                  Open <ExternalLink size={14} />
                </a>
              ) : null}
              <div className="mt-1 flex flex-wrap gap-1">
                {Array.isArray(item.perks) &&
                  item.perks.slice(0, 2).map((p, i) => (
                    <Pill key={`${item._id}-perk-${i}`} tone="gray">
                      {p}
                    </Pill>
                  ))}
                {Array.isArray(item.syllabus) && item.syllabus.length > 0 && (
                  <Pill tone="orange">{item.syllabus.length} sections</Pill>
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => startEdit(item._id)}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              <Pencil size={16} /> Edit
            </button>
            <button
              onClick={() => askDelete(item._id, item.name)}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Toolbar */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="sticky top-0 z-10 -mx-6 px-6 py-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 font-semibold">
              <Layers3 size={18} /> Career Paths
            </div>

            <div className="flex-1" />

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search career paths…"
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
                <Plus size={16} /> Add Career Path
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
                ) : filteredCareers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="py-12 text-center text-sm text-gray-500">
                        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Images className="text-gray-400" size={20} />
                        </div>
                        No career paths yet. Click “Add Career Path”.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCareers
                    .slice()
                    .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
                    .map((item) => <RowCareer key={item._id} item={item} />)
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
        title="Add Career Path"
        wide
      >
        <CareerPathForm
          formPath={formPath}
          setFormPath={setFormPath}
          syllabusPath={syllabusPath}
          setSyllabusPath={setSyllabusPath}
          submitting={creating}
          onCancel={() => {
            resetForms();
            setOpenCreate(false);
          }}
          onSubmit={handleCreate}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setEditingId(null);
          resetForms();
        }}
        title="Edit Career Path"
        wide
      >
        {editLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-600">
            <Loader2 className="mr-2 animate-spin" size={16} /> Loading…
          </div>
        ) : (
          <CareerPathForm
            formPath={formPath}
            setFormPath={setFormPath}
            syllabusPath={syllabusPath}
            setSyllabusPath={setSyllabusPath}
            submitting={editing}
            onCancel={() => {
              setOpenEdit(false);
              setEditingId(null);
              resetForms();
            }}
            onSubmit={handleUpdate}
            isEdit
          />
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
              "relative w-full max-h-[85vh] overflow-auto rounded-2xl bg-white p-6 shadow-xl",
              wide ? "max-w-3xl" : "max-w-lg"
            )}
          >
            <div className="sticky top-0 flex items-center justify-between gap-4 bg-white pb-4">
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
