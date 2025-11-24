// components/public/ContactForm.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import {
  Loader2,
  Mail,
  User,
  MessageSquare,
  Tag,
  Building2,
  Phone,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const REASONS = [
  { value: "support", label: "Support" },
  { value: "partnership", label: "Partnership" },
  { value: "hiring", label: "Hiring" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
] as const;

type Form = {
  name: string;
  email: string;
  phone: string;
  company: string;
  reason: (typeof REASONS)[number]["value"];
  subject: string;
  message: string;
  newsletter: boolean;
  consent: boolean;
  website: string; // honeypot
};

type ResultState = null | { ok: boolean; msg: string };

// What /api/contacts might return.
// Flexible but typed → no `any`.
type ContactApiResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
};

const MAX = 2000;

async function safeJson<T>(res: Response, fallback: T): Promise<T> {
  try {
    if (res.status === 204) return fallback;
    const ct = res.headers.get("content-type") || "";
    if (!ct.toLowerCase().includes("application/json")) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export default function ContactForm() {
  const [form, setForm] = useState<Form>({
    name: "",
    email: "",
    phone: "",
    company: "",
    reason: "other",
    subject: "",
    message: "",
    newsletter: true,
    consent: false,
    website: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState>(null);
  const [shake, setShake] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const left = useMemo(
    () => Math.max(0, MAX - form.message.length),
    [form.message]
  );

  function set<K extends keyof Form>(key: K, val: Form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function validate(): string | null {
    if (!form.name.trim()) return "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      return "Please enter a valid email.";
    if (form.message.trim().length < 10) return "Message is too short.";
    if (!form.consent) return "Please accept the privacy consent.";
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const err = validate();
    if (err) {
      setResult({ ok: false, msg: err });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(form),
        signal: abortRef.current.signal,
        cache: "no-store",
      });

      const data = await safeJson<ContactApiResponse>(res, {});

      if (!res.ok) {
        const msg = data.error || data.message || `Error ${res.status}`;
        setResult({ ok: false, msg });
      } else {
        setResult({ ok: true, msg: "Thanks! We’ve received your message." });
        setForm({
          name: "",
          email: "",
          phone: "",
          company: "",
          reason: "other",
          subject: "",
          message: "",
          newsletter: true,
          consent: false,
          website: "",
        });
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setResult({ ok: false, msg: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  return (
    <motion.form
      onSubmit={onSubmit}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      className={`relative space-y-4 ${
        shake ? "motion-safe:animate-[shake_0.5s]" : ""
      }`}
      aria-busy={submitting}
      noValidate
    >
      {/* subtle gradient ring */}
      <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-orange-500/20 via-fuchsia-500/20 to-cyan-500/20 blur opacity-0 group-hover:opacity-100 transition" />

      {/* Name + Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *" icon={<User className="h-5 w-5" />}>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your name"
            className="field-input"
            disabled={submitting}
            name="name"
            autoComplete="name"
          />
        </Field>
        <Field label="Email *" icon={<Mail className="h-5 w-5" />}>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            className="field-input"
            disabled={submitting}
            name="email"
            autoComplete="email"
          />
        </Field>
      </div>

      {/* Phone + Company */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" icon={<Phone className="h-5 w-5" />}>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+91 …"
            className="field-input"
            disabled={submitting}
            name="phone"
            autoComplete="tel"
            inputMode="tel"
          />
        </Field>
        <Field label="Company" icon={<Building2 className="h-5 w-5" />}>
          <input
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Company / Organization"
            className="field-input"
            disabled={submitting}
            name="company"
            autoComplete="organization"
          />
        </Field>
      </div>

      {/* Reason */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Reason" icon={<Sparkles className="h-5 w-5" />}>
          <select
            value={form.reason}
            onChange={(e) =>
              set("reason", e.target.value as Form["reason"])
            }
            className="field-input bg-white"
            disabled={submitting}
            name="reason"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Subject" icon={<Tag className="h-5 w-5" />}>
          <input
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            placeholder="How can we help?"
            className="field-input"
            disabled={submitting}
            name="subject"
          />
        </Field>
      </div>

      {/* Message */}
      <Field label="Message *" icon={<MessageSquare className="h-5 w-5" />}>
        <textarea
          required
          maxLength={MAX}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Write your message…"
          className="field-input min-h-[140px]"
          disabled={submitting}
          name="message"
        />
        <div
          className={`mt-1 text-xs ${
            left < 100 ? "text-amber-600" : "text-gray-500"
          }`}
        >
          {left} characters left
        </div>
      </Field>

      {/* Honeypot */}
      <input
        tabIndex={-1}
        autoComplete="off"
        value={form.website}
        onChange={(e) => set("website", e.target.value)}
        className="hidden"
        name="website"
      />

      {/* Toggles */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.newsletter}
            onChange={(e) => set("newsletter", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            disabled={submitting}
            name="newsletter"
          />
          Subscribe to updates
        </label>

        <label className="inline-flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            disabled={submitting}
            name="consent"
            required
          />
          <span>
            I agree to the processing of my information as described in the{" "}
            <Link href="/privacy" className="text-orange-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
      </div>

      {/* Submit + Result */}
      <div className="pt-2 flex items-center gap-3">
        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 via-fuchsia-600 to-cyan-600 px-5 py-2.5 text-white font-medium shadow-lg shadow-orange-600/20 hover:shadow-fuchsia-600/20 disabled:opacity-60"
          aria-live="polite"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send message
        </motion.button>

        <AnimatePresence>
          {result && (
            <motion.span
              key="res"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={result.ok ? "text-green-700" : "text-red-700"}
            >
              {result.msg}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Success pop */}
      <AnimatePresence>
        {result?.ok && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              className="rounded-2xl bg-white/80 backdrop-blur px-5 py-3 shadow ring-1 ring-green-500/30"
            >
              <div className="flex items-center gap-2 text-green-700">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  className="shrink-0"
                >
                  <path
                    fill="currentColor"
                    d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm-1.1-7.1l6-6-1.4-1.4-4.6 4.59-2.1-2.1-1.4 1.41 3.5 3.5Z"
                  />
                </svg>
                Message sent!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* keyframes for shake */}
      <style jsx global>{`
        @keyframes shake {
          10%,
          90% {
            transform: translateX(-1px);
          }
          20%,
          80% {
            transform: translateX(2px);
          }
          30%,
          50%,
          70% {
            transform: translateX(-4px);
          }
          40%,
          60% {
            transform: translateX(4px);
          }
        }
      `}</style>
    </motion.form>
  );
}

/* ---------- little helper components ---------- */

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 group">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        {icon ? (
          <span className="absolute left-3 top-2.5 text-gray-400">
            {icon}
          </span>
        ) : null}
        {children}
        <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl ring-1 ring-gray-200 transition group-focus-within:ring-orange-400/50" />
      </div>
    </div>
  );
}
