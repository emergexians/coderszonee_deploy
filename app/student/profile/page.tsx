"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

// ---- Theme helpers (match your orange dashboard) ----
const brand = {
  ring: "focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]",
  btnSolid: "bg-[#111827] hover:opacity-95 text-white",
  btnGhost: "bg-white hover:bg-gray-50 text-gray-800 border",
  chip: "bg-[#fff3e9] text-[#a3470b] border border-[#ffd8b8]",
  title: "text-3xl sm:text-4xl font-bold text-gray-900",
  card: "rounded-2xl border border-gray-200 bg-white shadow-sm",
};

type Profile = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  branch: string;
  graduationYear: string;
  portfolio: string;
  bio: string;
  gender: "Male" | "Female" | "Other" | "";
  skills: string[];
  avatarDataUrl?: string | null; // for server load
};

const initialProfile: Profile = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  branch: "",
  graduationYear: "",
  portfolio: "",
  bio: "",
  gender: "",
  skills: [],
  avatarDataUrl: null,
};

// ---- Error helper (removes any in catch) ----
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Save failed";
  }
}

// ---------- AvatarUploader ----------
function AvatarUploader({
  value,
  onChange,
}: {
  value: File | null;
  onChange: (file: File | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div className="flex items-start gap-4">
      <div className="relative w-28 h-28 rounded-2xl border bg-white shadow-sm overflow-hidden">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Profile preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400 text-sm">
            No photo
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            className={`px-3 py-2 rounded-xl ${brand.btnSolid} text-sm`}
            onClick={() => inputRef.current?.click()}
          >
            Upload photo
          </button>
          {value && (
            <button
              type="button"
              className={`px-3 py-2 rounded-xl ${brand.btnGhost} text-sm`}
              onClick={() => onChange(null)}
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">PNG, JPG, or WEBP — max 2MB.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const ok =
              /image\/(png|jpe?g|webp)/i.test(file.type) &&
              file.size <= 2 * 1024 * 1024;
            if (!ok) return alert("Please upload a PNG/JPG/WEBP ≤ 2MB.");
            onChange(file);
          }}
        />
      </div>
    </div>
  );
}

function FieldWrap({
  children,
  label,
  required,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function Input({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ${brand.ring}`}
    />
  );
}

function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ${brand.ring}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function TextArea({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ${brand.ring}`}
    />
  );
}

function SkillsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const s = input.trim();
    if (!s || value.includes(s)) return;
    onChange([...value, s]);
    setInput("");
  };
  return (
    <div>
      <div
        className={`flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-2 ${brand.ring}`}
      >
        {value.map((s) => (
          <span
            key={s}
            className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full ${brand.chip}`}
          >
            {s}
            <button
              type="button"
              aria-label={`Remove ${s}`}
              className="text-[#a3470b]/70 hover:text-[#a3470b]"
              onClick={() => onChange(value.filter((x) => x !== s))}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
            if (e.key === "Backspace" && !input && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          placeholder="Type a skill and press Enter"
          className="flex-1 min-w-[160px] border-0 outline-none px-2 py-1 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className={`rounded-lg px-3 py-1.5 text-xs ${brand.btnSolid}`}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function PreviewCard({
  profile,
  avatarUrl,
}: {
  profile: Profile;
  avatarUrl: string | null;
}) {
  const initials = useMemo(() => {
    const parts = profile.fullName.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
  }, [profile.fullName]);

  const img = avatarUrl || profile.avatarDataUrl || null;

  return (
    <div className={`${brand.card} p-6`}>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 grid place-items-center text-gray-500 text-xl font-semibold">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {profile.fullName || "Student Name"}
          </h3>
          <p className="text-sm text-gray-600">
            {profile.branch || "Branch"} • {profile.graduationYear || "Year"}
          </p>
          <p className="text-sm text-gray-600">{profile.city || "City"}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p>
          <span className="text-gray-500">Email:</span>{" "}
          {profile.email || "—"}
        </p>
        <p>
          <span className="text-gray-500">Phone:</span>{" "}
          {profile.phone || "—"}
        </p>
        <p className="break-words">
          <span className="text-gray-500">Portfolio:</span>{" "}
          {profile.portfolio ? (
            <a
              href={profile.portfolio}
              target="_blank"
              rel="noreferrer"
              className="text-gray-900 underline"
            >
              {profile.portfolio}
            </a>
          ) : (
            "—"
          )}
        </p>
        <p className="text-gray-700 whitespace-pre-wrap">
          {profile.bio || "Short bio will appear here."}
        </p>
        {!!profile.skills.length && (
          <div className="flex flex-wrap gap-2 pt-2">
            {profile.skills.map((s) => (
              <span
                key={s}
                className={`px-2.5 py-1 text-xs rounded-full ${brand.chip}`}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Helper to convert File -> data URL (BROWSER SAFE) ----
function fileToDataUrl(f: File | null): Promise<string | null> {
  if (!f) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () =>
      reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(f);
  });
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Profile>({ ...initialProfile });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] =
    useState<null | { type: "ok" | "err"; msg: string }>(null);

  const avatarUrl = useMemo(
    () => (avatar ? URL.createObjectURL(avatar) : null),
    [avatar]
  );
  useEffect(
    () => () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    },
    [avatarUrl]
  );

  const update = <K extends keyof Profile>(key: K, val: Profile[K]) =>
    setProfile((p) => ({ ...p, [key]: val }));

  // Prefill from server when email is present (e.g., pulled from session or typed)
  useEffect(() => {
    if (!profile.email) return;
    const controller = new AbortController();
    (async () => {
      try {
        const r = await fetch(
          `/api/student/profile?email=${encodeURIComponent(profile.email)}`,
          { signal: controller.signal }
        );
        const j = await r.json();
        if (j?.data) setProfile((p) => ({ ...p, ...j.data }));
      } catch {
        // ignore prefill errors
      }
    })();
    return () => controller.abort();
  }, [profile.email]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const avatarDataUrl = await fileToDataUrl(avatar);
      const r = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, avatarDataUrl }),
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Failed to save");
      setStatus({ type: "ok", msg: "Profile saved." });
      if (avatarDataUrl) setProfile((p) => ({ ...p, avatarDataUrl }));
    } catch (err: unknown) {
      setStatus({
        type: "err",
        msg: getErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  };

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, i) => String(now - 1 + i));
  }, []);

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className={brand.title}>Student Profile</h1>
          <p className="text-gray-600">
            Upload your photo and fill out your details.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: Form */}
          <form onSubmit={onSubmit} className={`${brand.card} p-6 space-y-6`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Profile Photo</h2>
              {status && (
                <span
                  className={`text-sm px-2.5 py-1 rounded-full ${
                    status.type === "ok"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {status.msg}
                </span>
              )}
            </div>

            <AvatarUploader value={avatar} onChange={setAvatar} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldWrap label="Full Name" required>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(v) => update("fullName", v)}
                  placeholder="e.g., Aashish Kumar"
                  required
                />
              </FieldWrap>
              <FieldWrap label="Email" required>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(v) => update("email", v)}
                  placeholder="you@example.com"
                  required
                />
              </FieldWrap>
              <FieldWrap label="Phone">
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(v) => update("phone", v)}
                  placeholder="98185xxxxx"
                />
              </FieldWrap>
              <FieldWrap label="City">
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(v) => update("city", v)}
                  placeholder="New Delhi"
                />
              </FieldWrap>
              <FieldWrap label="Branch / Major">
                <Input
                  id="branch"
                  value={profile.branch}
                  onChange={(v) => update("branch", v)}
                  placeholder="CSE, ECE, etc."
                />
              </FieldWrap>
              <FieldWrap label="Graduation Year">
                <Select
                  id="graduationYear"
                  value={profile.graduationYear}
                  onChange={(v) => update("graduationYear", v)}
                  options={years.map((y) => ({ label: y, value: y }))}
                  placeholder="Select year"
                />
              </FieldWrap>
              <FieldWrap label="Portfolio / LinkedIn URL">
                <Input
                  id="portfolio"
                  type="url"
                  value={profile.portfolio}
                  onChange={(v) => update("portfolio", v)}
                  placeholder="https://…"
                />
              </FieldWrap>
              <FieldWrap label="Gender">
                <Select
                  id="gender"
                  value={profile.gender}
                  onChange={(v) => update("gender", v as Profile["gender"])}
                  options={[
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                    { label: "Other", value: "Other" },
                  ]}
                  placeholder="Select gender"
                />
              </FieldWrap>
            </div>

            <FieldWrap label="Short Bio">
              <TextArea
                id="bio"
                value={profile.bio}
                onChange={(v) => update("bio", v)}
                placeholder="Tell us about your interests, experience, and goals."
              />
            </FieldWrap>

            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </span>
              <SkillsInput
                value={profile.skills}
                onChange={(skills) => update("skills", skills)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 rounded-xl text-sm ${brand.btnSolid} disabled:opacity-60`}
              >
                {saving ? "Saving…" : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfile({ ...initialProfile, email: profile.email });
                  setAvatar(null);
                }}
                className={`px-4 py-2 rounded-xl text-sm ${brand.btnGhost}`}
              >
                Reset
              </button>
            </div>
          </form>

          {/* Right: Live Preview */}
          <div className="sticky top-6">
            <h2 className="text-lg font-medium mb-3">Live Preview</h2>
            <PreviewCard profile={profile} avatarUrl={avatarUrl} />
          </div>
        </div>
      </div>
    </main>
  );
}
