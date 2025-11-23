// app/auth/signup/page.tsx
"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Github,
  ChevronRight,
  ShieldCheck,
  ChevronLeft,
  Rocket,
  Shield,
  GraduationCap,
  UserCog,
} from "lucide-react";
import { motion } from "framer-motion";

type Role = "admin" | "instructor" | "student";

export default function SignUpPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [role, setRole] = useState<Role>("student");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function setField<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // simple password strength (0..4)
  const passStrength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const getDashboardPath = (r: Role) => {
    switch (r) {
      case "admin":
        return "/admin"; // or /admin/dashboard if you add it
      case "instructor":
        return "/instructor/dashboard";   // change when you build instructor area
      case "student":
      default:
        return "/student/dashboard";
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!agree) return setErr("Please agree to the Terms & Privacy.");
    if (form.password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role,
        }),
      });

      // Try JSON either way (error or success)
      const data = await res.json().catch(() => null as any);

      if (!res.ok) {
        const msg = data?.error || data?.message || "Sign up failed";
        throw new Error(msg);
      }

      // Prefer role returned by API (authoritative), fall back to selected role
      const apiRole: Role =
        (data?.user?.role as Role | undefined) || role || "student";

      router.push(getDashboardPath(apiRole));
    } catch (e: any) {
      setErr(e.message || "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  }

  function onPasswordKeyUp(e: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(e.getModifierState?.("CapsLock") || false);
  }

  return (
    <div className="min-h-screen w-full bg-white text-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-black/10">
        {/* LEFT: Form (developer-focused) */}
        <div className="bg-white p-6 sm:p-10">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs text-black/70">
              <ShieldCheck size={14} /> Secure • No spam
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-black/60 mt-1">
              Join challenges, courses, paths & projects tailored for coders.
            </p>
          </div>

          {/* Role Selector */}
          <fieldset className="mb-5">
            <legend className="block text-sm font-medium mb-2">Choose your role</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RoleCard
                role="student"
                title="Student"
                desc="Learn & track progress"
                selected={role === "student"}
                onSelect={() => setRole("student")}
                Icon={GraduationCap}
              />
              <RoleCard
                role="instructor"
                title="Instructor"
                desc="Create courses & assess"
                selected={role === "instructor"}
                onSelect={() => setRole("instructor")}
                Icon={UserCog}
              />
              <RoleCard
                role="admin"
                title="Admin"
                desc="Manage platform & users"
                selected={role === "admin"}
                onSelect={() => setRole("admin")}
                Icon={Shield}
              />
            </div>
            <p className="mt-2 text-[12px] text-black/60">
              You can change role later if your permissions allow it.
            </p>
          </fieldset>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-black/40" />
                <input
                  className="w-full rounded-xl border border-black/15 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-black/40" />
                <input
                  type="email"
                  className="w-full rounded-xl border border-black/15 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@domain.dev"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium mb-1">Password</label>
                <span className="text-[11px] text-black/50">Use 8+ chars with a mix of symbols</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-black/40" />
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full rounded-xl border border-black/15 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  onKeyUp={onPasswordKeyUp}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-2.5 p-1 text-black/50 hover:text-black/80"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    passStrength <= 1
                      ? "bg-red-500 w-1/4"
                      : passStrength === 2
                      ? "bg-orange-500 w-2/4"
                      : passStrength === 3
                      ? "bg-orange-600 w-3/4"
                      : "bg-green-600 w-full"
                  }`}
                  aria-hidden
                />
              </div>
              {capsLock && <p className="mt-2 text-xs text-orange-600">Caps Lock is ON</p>}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium mb-1">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-black/40" />
                <input
                  type={showConfirm ? "text" : "password"}
                  className="w-full rounded-xl border border-black/15 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  value={form.confirm}
                  onChange={(e) => setField("confirm", e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-2.5 p-1 text-black/50 hover:text-black/80"
                  aria-label={showConfirm ? "Hide confirm" : "Show confirm"}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="h-4 w-4 rounded border-black/30 text-orange-600 focus:ring-orange-500"
              />
              I agree to the{" "}
              <Link className="text-orange-600 hover:text-orange-700" href="/legal/terms">
                Terms
              </Link>{" "}
              &{" "}
              <Link className="text-orange-600 hover:text-orange-700" href="/legal/privacy">
                Privacy
              </Link>
              .
            </label>

            {/* Error */}
            {err && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {err}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />}
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-black/10" />
            <span className="text-xs text-black/50">Or continue with</span>
            <div className="h-px flex-1 bg-black/10" />
          </div>

          {/* Social (dev-first) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="h-10 px-4 inline-flex items-center gap-2 rounded-full border border-black/15 hover:bg-black/5"
              aria-label="Continue with GitHub"
            >
              <Github size={18} /> GitHub
            </button>
            <button
              type="button"
              className="h-10 px-4 inline-flex items-center gap-2 rounded-full border border-black/15 hover:bg-black/5"
              aria-label="Continue with Google"
            >
              <span className="grid place-items-center h-4 w-4 rounded-full font-bold text-[11px] bg-orange-500 text-white">
                G
              </span>{" "}
              Google
            </button>
          </div>

          {/* Sign in hint */}
          <p className="mt-6 text-sm text-black/70">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-semibold text-orange-600 hover:text-orange-700">
              Sign In
            </Link>
          </p>
        </div>

        {/* RIGHT: Orange dev panel with animated "terminal" + chips */}
        <div className="relative hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white">
          {/* Decorative glow/blobs */}
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute -top-10 -right-12 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute bottom-6 left-8 h-36 w-36 rounded-full bg-black/30 blur-xl" />
          </div>

          {/* Brand + tagline */}
          <div className="relative">
            <div className="flex items-center gap-2 text-sm font-semibold opacity-95">
              <div className="h-7 w-7 rounded-lg bg-white/15 grid place-items-center ring-1 ring-white/30">
                <ChevronLeft size={16} />
              </div>
              <span>
                <Link href="/">Back to Home</Link>
              </span>
            </div>

            <h2 className="mt-8 text-3xl font-extrabold tracking-tight">
              Build. Ship. Learn faster.
            </h2>
            <p className="mt-2 text-white/90 max-w-sm leading-relaxed">
              Hands-on paths, real projects, courses and mentor reviews for modern stacks.
            </p>
          </div>

          {/* Terminal Card (animated) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 24, delay: 0.05 }}
            className="relative mt-6 rounded-2xl overflow-hidden ring-1 ring-white/25 bg-black/30 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-black/30">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-white/70">dev@coderszonee:~</span>
            </div>
            <div className="px-4 py-3 text-[12.5px] leading-6 font-mono">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <span className="text-orange-300">$</span> npm i @coderszonee/cli
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                <span className="text-green-300">✔</span> installed in 2.1s
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                <span className="text-orange-300">$</span> coderszonee init nextjs
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}>
                <span className="text-green-300">✔</span> project scaffolded — open{" "}
                <span className="underline">/learn</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Tech chips + stats */}
          <div className="relative mt-6 flex flex-wrap items-center gap-2">
            {["JavaScript", "TypeScript", "React", "Next.js", "Node", "SQL"].map((t) => (
              <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/15 ring-1 ring-white/25">
                {t}
              </span>
            ))}
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-extrabold">3k+</div>
              <div className="text-xs text-white/80">active dev learners</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold">120+</div>
              <div className="text-xs text-white/80">hands-on projects</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold">40+</div>
              <div className="text-xs text-white/80">career paths</div>
            </div>
          </div>

          {/* CTA to sign in (alt path) */}
          <div className="relative">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold border border-white/70 hover:bg-white hover:text-black transition"
            >
              Already have an account? Sign in <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small role card component ---------- */
function RoleCard({
  role,
  title,
  desc,
  selected,
  onSelect,
  Icon,
}: {
  role: Role;
  title: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
  Icon: React.ElementType<{ size?: number; className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-2xl border p-3 transition w-full
        ${selected ? "border-orange-500 ring-2 ring-orange-200 bg-orange-50" : "border-black/15 hover:bg-black/5"}
      `}
      aria-pressed={selected}
      aria-label={`Select ${title} role`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-9 w-9 grid place-items-center rounded-xl ${
            selected ? "bg-orange-500 text-white" : "bg-black/10 text-black"
          }`}
        >
          <Icon size={18} />
        </span>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-black/60">{desc}</div>
        </div>
      </div>
    </button>
  );
}
