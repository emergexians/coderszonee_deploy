"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  MinusCircle,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

/* =========================
   Types
========================= */

type TechStack = {
  name: string;
  description: string;
  projects: string[];
};

type Audience = {
  title: string;
  description: string;
};

type Tool = {
  image: string;
  alt?: string;
};

type Offering = {
  text: string;
};

interface LandingPageForm {
  courseId: string;
  title: string;
  subtitle: string;
  offerings: Offering[];
  techStacks: TechStack[];
  audience: Audience[];
  tools: Tool[];
  published: boolean;
}

interface LandingPageData {
  _id: string;
  courseId: string;
  title: string;
  subtitle: string;
  offerings: Offering[];
  techStacks: TechStack[];
  audience: Audience[];
  tools: Tool[];
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface LandingPagesAdminProps {
  courseId: string;
  initialData?: LandingPageData | null;
}

/* =========================
   Helpers
========================= */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function emptyForm(courseId: string = ""): LandingPageForm {
  return {
    courseId,
    title: "",
    subtitle: "",
    offerings: [],
    techStacks: [],
    audience: [],
    tools: [],
    published: false,
  };
}



/* =========================
   Main Component
========================= */

export default function LandingPagesAdmin({
  courseId,
  initialData,
}: LandingPagesAdminProps) {
  const router = useRouter();
  const [form, setForm] = useState<LandingPageForm>(emptyForm(courseId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [courseExists, setCourseExists] = useState<boolean>(true);

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setForm({
        courseId: initialData.courseId,
        title: initialData.title,
        subtitle: initialData.subtitle,
        offerings: initialData.offerings || [],
        techStacks: initialData.techStacks || [],
        audience: initialData.audience || [],
        tools: initialData.tools || [],
        published: initialData.published,
      });
    } else {
      setForm(emptyForm(courseId));
    }
  }, [initialData, courseId]);

  // Validate course exists
  useEffect(() => {
    async function checkCourse() {
      try {
        const res = await fetch(`/api/course/courses/${courseId}`);
        if (!res.ok) {
          setCourseExists(false);
          setError("Course not found. Please create the course first.");
        }
      } catch (err) {
        console.error("Error checking course:", err);
        setCourseExists(false);
        setError("Unable to verify course existence.");
      }
    }
    if (courseId) {
      checkCourse();
    }
  }, [courseId]);

  /* ========= Helpers ========= */

  function update<K extends keyof LandingPageForm>(
    key: K,
    value: LandingPageForm[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /* ========= Submit ========= */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !courseExists) return;

    setError(null);
    setSuccess(null);

    // Validation
    if (!form.courseId || !form.title || !form.subtitle) {
      setError("Course ID, Title, and Subtitle are required fields.");
      return;
    }

    if (form.offerings.length === 0) {
      setError("Please add at least one offering.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        offerings: form.offerings.filter(o => o.text.trim() !== ""),
        techStacks: form.techStacks.filter(ts => ts.name.trim() !== ""),
        audience: form.audience.filter(a => a.title.trim() !== ""),
        tools: form.tools.filter(t => t.image.trim() !== ""),
      };

      const res = await fetch("/api/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save landing page");
      }

      setSuccess(
        `Landing page saved successfully! ${form.published ? "(Published)" : "(Draft)"}`
      );
      
      // Refresh the page data
      router.refresh();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setError(
        err instanceof Error ? err.message : "Error saving landing page"
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     Render
  ========================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto p-6 space-y-10 bg-white rounded-2xl shadow"
    >
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">
          {initialData ? "Edit" : "Create"} Course Landing Page
        </h1>
        
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <XCircle className="text-red-600 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <MinusCircle size={16} />
            </button>
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Success</p>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </motion.div>
        )}

        {/* Course Not Found Warning */}
        {!courseExists && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Warning</p>
              <p className="text-sm text-amber-700">
                Course not found. Please create the course first before adding a landing page.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ================= HERO ================= */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Hero Section</h2>

        <Field label="Course ID (reference)">
          <input
            className="input"
            value={form.courseId}
            onChange={(e) => update("courseId", e.target.value)}
          />
        </Field>

        <Field label="Title">
          <input
            className="input"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </Field>

        <Field label="Subtitle">
          <textarea
            className="input"
            value={form.subtitle}
            onChange={(e) => update("subtitle", e.target.value)}
          />
        </Field>

        <Field label="Offerings">
          <div className="space-y-2">
            {form.offerings.map((offering, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  className="input flex-1"
                  placeholder="e.g., 🚀 2–3x Salary Growth"
                  value={offering.text}
                  onChange={(e) => {
                    const next = [...form.offerings];
                    next[i] = { text: e.target.value };
                    update("offerings", next);
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "offerings",
                      form.offerings.filter((_, idx) => idx !== i)
                    )
                  }
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                update("offerings", [...form.offerings, { text: "" }])
              }
              className="btn-outline text-sm"
            >
              <Plus size={16} /> Add Offering
            </button>
          </div>
        </Field>
      </section>

      {/* ================= TECH STACK ================= */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Technology Stack</h2>

        {form.techStacks.map((stack, i) => (
          <div
            key={i}
            className="border rounded-xl p-4 space-y-3 relative"
          >
            <button
              type="button"
              className="absolute top-3 right-3 text-red-600"
              onClick={() =>
                update(
                  "techStacks",
                  form.techStacks.filter((_, idx) => idx !== i),
                )
              }
            >
              <Trash2 size={16} />
            </button>

            <input
              placeholder="Stack Name (Frontend / AI / Backend)"
              className="input"
              value={stack.name}
              onChange={(e) => {
                const next = [...form.techStacks];
                next[i].name = e.target.value;
                update("techStacks", next);
              }}
            />

            <textarea
              placeholder="Description"
              className="input"
              value={stack.description}
              onChange={(e) => {
                const next = [...form.techStacks];
                next[i].description = e.target.value;
                update("techStacks", next);
              }}
            />

            <input
              placeholder="Projects (comma separated)"
              className="input"
              onChange={(e) => {
                const next = [...form.techStacks];
                next[i].projects = e.target.value
                  .split(",")
                  .map((s) => s.trim());
                update("techStacks", next);
              }}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            update("techStacks", [
              ...form.techStacks,
              { name: "", description: "", projects: [] },
            ])
          }
          className="btn-outline"
        >
          <Plus size={16} /> Add Tech Stack
        </button>
      </section>

      {/* ================= AUDIENCE ================= */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Who Is This Course For</h2>

        {form.audience.map((aud, i) => (
          <div key={i} className="border p-4 rounded-xl space-y-2">
            <input
              className="input"
              placeholder="Audience Title"
              value={aud.title}
              onChange={(e) => {
                const next = [...form.audience];
                next[i].title = e.target.value;
                update("audience", next);
              }}
            />
            <textarea
              className="input"
              placeholder="Audience Description"
              value={aud.description}
              onChange={(e) => {
                const next = [...form.audience];
                next[i].description = e.target.value;
                update("audience", next);
              }}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            update("audience", [...form.audience, { title: "", description: "" }])
          }
          className="btn-outline"
        >
          <Plus size={16} /> Add Audience
        </button>
      </section>

      {/* ================= TOOLS ================= */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Tools & Platforms</h2>

        {form.tools.map((tool, i) => (
          <div key={i} className="flex gap-3 items-center">
            <input
              className="input"
              placeholder="Image URL"
              value={tool.image}
              onChange={(e) => {
                const next = [...form.tools];
                next[i].image = e.target.value;
                update("tools", next);
              }}
            />
            <button
              type="button"
              onClick={() =>
                update(
                  "tools",
                  form.tools.filter((_, idx) => idx !== i),
                )
              }
              className="text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => update("tools", [...form.tools, { image: "" }])}
          className="btn-outline"
        >
          <Plus size={16} /> Add Tool Logo
        </button>
      </section>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-between items-center">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update("published", e.target.checked)}
            disabled={saving || !courseExists}
            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
          />
          <span className={form.published ? "text-green-600" : "text-gray-600"}>
            {form.published ? "Published (Live)" : "Draft (Not visible to users)"}
          </span>
        </label>

        <div className="flex gap-3">
          {initialData && (
            <button
              type="button"
              onClick={() => router.push("/admin/course/courses")}
              className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Back to Courses
            </button>
          )}
          <button
            disabled={saving || !courseExists}
            type="submit"
            className="bg-orange-600 text-white px-6 py-2 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                {initialData ? "Update" : "Save"} Landing Page
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
