"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Loader2,
  Trash2,
  ExternalLink,
  Calendar,
  MapPin,
  IndianRupee,
  Pencil,
  X,
} from "lucide-react";

type Hackathon = {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  cover?: string;
  desc?: string;
  startAt: string; // ISO
  endAt: string; // ISO
  locationType?: "online" | "offline" | "hybrid";
  locationName?: string;
  prizePool?: string;
  registrationUrl?: string;
  organizers?: string[];
  sponsors?: string[];
  rules?: string[];
  eligibility?: string[];
  tracks?: string[];
  judges?: string[];
  mentors?: string[];
  schedule?: { time: string; title: string }[];
  published?: boolean;
  createdAt?: string;
};

type HackathonForm = {
  title: string;
  slug: string;
  tagline: string;
  cover: string;
  desc: string;
  startAt: string;
  endAt: string;
  locationType: "online" | "offline" | "hybrid";
  locationName: string;
  prizePool: string;
  registrationUrl: string;
  organizers: string;
  sponsors: string;
  rules: string;
  eligibility: string;
  tracks: string;
  judges: string;
  mentors: string;
  schedule: { time: string; title: string }[];
  published: boolean;
};

async function safeJson<T>(res: Response, fallback: T): Promise<T> {
  try {
    const ct = res.headers.get("content-type") || "";
    if (!ct.toLowerCase().includes("application/json")) return fallback as T;
    return (await res.json()) as T;
  } catch {
    return fallback as T;
  }
}

function parseCommaList(v: string) {
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function slugify(input: string) {
  return input
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export default function HackathonsAdmin() {
  const [list, setList] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "upcoming" | "ongoing" | "past">(
    "all"
  );

  // Modal state
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm: HackathonForm = {
    title: "",
    slug: "",
    tagline: "",
    cover: "",
    desc: "",
    startAt: "",
    endAt: "",
    locationType: "online",
    locationName: "",
    prizePool: "",
    registrationUrl: "",
    organizers: "",
    sponsors: "",
    rules: "",
    eligibility: "",
    tracks: "",
    judges: "",
    mentors: "",
    schedule: [],
    published: true,
  };

  const [form, setForm] = useState<HackathonForm>(emptyForm);

  // Load hackathons
  useEffect(() => {
    (async () => {
      try {
        const url = new URL("/api/hackathons", window.location.origin);
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = await safeJson<Hackathon[]>(res, []);
        setList(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (form.title && !editingId && !form.slug) {
      setForm((prev) => ({ ...prev, slug: slugify(form.title) }));
    }
  }, [form.title, editingId, form.slug]);

  // Filtered hackathons
  const filtered = useMemo(() => {
    const now = Date.now();
    return list.filter((h) => {
      const matchQ =
        !q ||
        [h.title, h.tagline, h.desc].some((x) =>
          x?.toLowerCase().includes(q.toLowerCase())
        );
      if (!matchQ) return false;
      if (status === "all") return true;
      const start = new Date(h.startAt).getTime();
      const end = new Date(h.endAt).getTime();
      if (status === "upcoming") return start > now;
      if (status === "ongoing") return start <= now && end >= now;
      if (status === "past") return end < now;
      return true;
    });
  }, [list, q, status]);

  // Build payload
  function buildPayload() {
    return {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      tagline: form.tagline.trim() || undefined,
      cover: form.cover.trim() || undefined,
      desc: form.desc.trim() || undefined,
      startAt: new Date(form.startAt),
      endAt: new Date(form.endAt),
      locationType: form.locationType,
      locationName: form.locationName.trim() || undefined,
      prizePool: form.prizePool.trim() || undefined,
      registrationUrl: form.registrationUrl.trim() || undefined,
      organizers: parseCommaList(form.organizers),
      sponsors: parseCommaList(form.sponsors),
      rules: parseCommaList(form.rules),
      eligibility: parseCommaList(form.eligibility),
      tracks: parseCommaList(form.tracks),
      judges: parseCommaList(form.judges),
      mentors: parseCommaList(form.mentors),
      schedule: form.schedule.filter((s) => s.time && s.title),
      published: form.published,
    };
  }

  // Create
  async function createHackathon(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.startAt || !form.endAt) return;
    setCreating(true);

    try {
      const res = await fetch("/api/hackathons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error("Create failed");
      const created = await safeJson<Hackathon | null>(res, null);
      if (created) setList((p) => [created, ...p]);
      setOpen(false);
      setForm(emptyForm);
    } catch (e) {
      console.error(e);
      alert("Create failed");
    } finally {
      setCreating(false);
    }
  }

  // Update
  async function updateHackathon(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setCreating(true);

    try {
      const res = await fetch(`/api/hackathons/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await safeJson<Hackathon | null>(res, null);
      if (updated) {
        setList((p) => p.map((x) => (x._id === editingId ? updated : x)));
      }
      setOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (e) {
      console.error(e);
      alert("Update failed");
    } finally {
      setCreating(false);
    }
  }

  // Delete
  async function remove(id: string) {
    if (!confirm("Delete this hackathon?")) return;
    const res = await fetch(`/api/hackathons/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setList((p) => p.filter((x) => x._id !== id));
    } else {
      alert("Delete failed");
    }
  }

  // Start edit
  function startEdit(h: Hackathon) {
    setEditingId(h._id);
    setForm({
      title: h.title,
      slug: h.slug,
      tagline: h.tagline || "",
      cover: h.cover || "",
      desc: h.desc || "",
      startAt: new Date(h.startAt).toISOString().slice(0, 16),
      endAt: new Date(h.endAt).toISOString().slice(0, 16),
      locationType: h.locationType || "online",
      locationName: h.locationName || "",
      prizePool: h.prizePool || "",
      registrationUrl: h.registrationUrl || "",
      organizers: (h.organizers || []).join(", "),
      sponsors: (h.sponsors || []).join(", "),
      rules: (h.rules || []).join(", "),
      eligibility: (h.eligibility || []).join(", "),
      tracks: (h.tracks || []).join(", "),
      judges: (h.judges || []).join(", "),
      mentors: (h.mentors || []).join(", "),
      schedule: h.schedule || [],
      published: h.published ?? true,
    });
    setOpen(true);
  }

  // Multi-field keys
  type MultiField =
    | "organizers"
    | "sponsors"
    | "rules"
    | "eligibility"
    | "tracks"
    | "judges"
    | "mentors";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search hackathons…"
              className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none focus:border-orange-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "all" | "upcoming" | "ongoing" | "past")
            }
            className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
          >
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="past">Past</option>
          </select>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          <Plus size={16} /> Add Hackathon
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Hackathon</th>
              <th className="px-4 py-3 text-left font-semibold">Dates</th>
              <th className="px-4 py-3 text-left font-semibold">Location</th>
              <th className="px-4 py-3 text-left font-semibold">Prize</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No hackathons found.
                </td>
              </tr>
            )}
            {filtered.map((h) => (
              <tr key={h._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={h.cover || "/assets/hackathons/default.png"}
                      alt={h.title}
                      width={80}
                      height={48}
                      className="h-12 w-20 rounded-md object-cover border"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{h.title}</div>
                      <a
                        href={`/hackathon/${h.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-orange-600 hover:underline"
                      >
                        Open <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1 text-sm text-gray-700">
                    <Calendar size={16} />
                    {new Date(h.startAt).toLocaleDateString()} –{" "}
                    {new Date(h.endAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1 text-sm text-gray-700">
                    <MapPin size={16} />
                    {h.locationType || "online"}
                    {h.locationName ? ` · ${h.locationName}` : ""}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1 text-sm text-gray-700">
                    <IndianRupee size={16} />
                    {h.prizePool || "—"}
                  </div>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => startEdit(h)}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Pencil size={16} />Edit
                  </button>
                  <button
                    onClick={() => remove(h._id)}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit Hackathon" : "Add Hackathon"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={editingId ? updateHackathon : createHackathon}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Title */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Title *</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Slug</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                  placeholder="ai-hack-2025"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tagline</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                  value={form.tagline}
                  onChange={(e) =>
                    setForm({ ...form, tagline: e.target.value })
                  }
                />
              </div>

              {/* Cover */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">
                  Cover (URL or /public path)
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                  placeholder="/assets/hackathons/cover.png"
                  value={form.cover}
                  onChange={(e) => setForm({ ...form, cover: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 min-h-[100px]"
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                />
              </div>

              {/* Dates */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Start *</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                  value={form.startAt}
                  onChange={(e) =>
                    setForm({ ...form, startAt: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">End *</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                  value={form.endAt}
                  onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Location Type</label>
                <select
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500 bg-white"
                  value={form.locationType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      locationType: e.target.value as
                        | "online"
                        | "offline"
                        | "hybrid",
                    })
                  }
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Location Name</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                  placeholder="Dwarka, Delhi"
                  value={form.locationName}
                  onChange={(e) =>
                    setForm({ ...form, locationName: e.target.value })
                  }
                />
              </div>

              {/* Prize / Registration */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Prize Pool</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                  placeholder="₹2,00,000"
                  value={form.prizePool}
                  onChange={(e) =>
                    setForm({ ...form, prizePool: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Registration URL</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                  placeholder="https://…"
                  value={form.registrationUrl}
                  onChange={(e) =>
                    setForm({ ...form, registrationUrl: e.target.value })
                  }
                />
              </div>

              {/* Multi-fields */}
              {(
                [
                  ["Organizers (comma)", "organizers"],
                  ["Sponsors (comma)", "sponsors"],
                  ["Rules (comma)", "rules"],
                  ["Eligibility (comma)", "eligibility"],
                  ["Tracks (comma)", "tracks"],
                  ["Judges (comma)", "judges"],
                  ["Mentors (comma)", "mentors"],
                ] as [string, MultiField][]
              ).map(([label, key]) => (
                <div key={key} className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium">{label}</label>
                  <input
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                </div>
              ))}

              {/* Schedule */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Schedule</label>
                <div className="space-y-2">
                  {form.schedule.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="time"
                        className="w-32 rounded-lg border px-2 py-1 text-sm"
                        value={item.time}
                        onChange={(e) => {
                          const newSched = [...form.schedule];
                          newSched[idx].time = e.target.value;
                          setForm({ ...form, schedule: newSched });
                        }}
                      />
                      <input
                        className="flex-1 rounded-lg border px-2 py-1 text-sm"
                        placeholder="Event title"
                        value={item.title}
                        onChange={(e) => {
                          const newSched = [...form.schedule];
                          newSched[idx].title = e.target.value;
                          setForm({ ...form, schedule: newSched });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            schedule: form.schedule.filter((_, i) => i !== idx),
                          })
                        }
                        className="rounded-lg p-1 hover:bg-red-50 text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        schedule: [...form.schedule, { time: "", title: "" }],
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
