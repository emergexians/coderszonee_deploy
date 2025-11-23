// app/auth/signin/page.tsx
"use client";

import { useState, type KeyboardEvent, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
  ChevronLeft,
  ChevronRight,
  Shield,
  GraduationCap,
  UserCog,
} from "lucide-react";
import { motion } from "framer-motion";

type Role = "admin" | "instructor" | "student";

type SignInResponse = {
  user?: {
    role?: string;
  };
  role?: string;
  error?: string;
  message?: string;
};

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [showPass, setShowPass] = useState(false);
  const [keep, setKeep] = useState(true);
  const [capsLock, setCapsLock] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const getDashboardPath = (r: Role) => {
    switch (r) {
      case "admin":
        return "/admin";
      case "instructor":
        return "/instructor/dashboard";
      case "student":
      default:
        return "/student/dashboard";
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Extra fields (keep/role) are fine; server can ignore them
        body: JSON.stringify({ email, password, keep, role }),
      });

      let j: SignInResponse | null = null;
      try {
        j = (await res.json()) as SignInResponse;
      } catch {
        j = null;
      }

      if (!res.ok) {
        const msg =
          j?.error ||
          j?.message ||
          "Sign in failed";
        throw new Error(msg);
      }

      const rawRole =
        j?.user?.role ?? j?.role ?? role;

      const apiRole: Role =
        rawRole === "admin" || rawRole === "instructor" || rawRole === "student"
          ? rawRole
          : "student";

      router.push(getDashboardPath(apiRole));
    } catch (e) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr("Sign in failed");
      }
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
        {/* LEFT: Orange developer panel */}
        <div className="relative hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white">
          {/* Decorative glow/blobs */}
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute -top-10 -left-12 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute bottom-6 right-8 h-36 w-36 rounded-full bg-black/30 blur-xl" />
          </div>

          {/* Brand + tagline */}
          <div className="relative">
            <div className="flex items-center gap-2 text-sm font-semibold opacity-95">
              <div className="h-7 w-7 rounded-lg bg-white/15 grid place-items-center ring-1 ring-white/30">
                <ChevronLeft size={16} />
              </div>
              <span>
                <Link href="/">Back to home</Link>
              </span>
            </div>

            <h2 className="mt-8 text-3xl font-extrabold tracking-tight">
              Welcome back, developer.
            </h2>
            <p className="mt-2 text-white/90 max-w-sm leading-relaxed">
              Pick up where you left off — courses, projects, paths, and peer
              reviews await.
            </p>
          </div>

          {/* Terminal Card (animated) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 24,
              delay: 0.05,
            }}
            className="relative mt-6 rounded-2xl overflow-hidden ring-1 ring-white/25 bg-black/30 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-black/30">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-white/70">
                dev@coderszonee:~/learn
              </span>
            </div>
            <div className="px-4 py-3 text-[12.5px] leading-6 font-mono">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-orange-300">$</span> git pull origin main
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <span className="text-green-300">✔</span> up to date — jump back
                into <span className="underline">Next.js Path</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Tech chips + CTA */}
          <div className="relative mt-6 flex flex-wrap items-center gap-2">
            {["React", "Next.js", "Node", "SQL", "DevOps"].map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1 rounded-full bg-white/15 ring-1 ring-white/25"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="relative">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold border border-white/70 hover:bg-white hover:text-black transition"
            >
              New here? Create account <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* RIGHT: Sign-in form */}
        <div className="bg-white p-6 sm:p-10">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sign in
            </h1>
            <p className="text-sm text-black/60 mt-1">
              Use your email and password to continue
            </p>
          </div>

          {/* Role Selector */}
          <fieldset className="mb-5">
            <legend className="block text-sm font-medium mb-2">
              Sign in as
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RoleCard
                title="Student"
                desc="Learn & track progress"
                selected={role === "student"}
                onSelect={() => setRole("student")}
                iconBg="bg-orange-500"
                Icon={GraduationCap}
              />
              <RoleCard
                title="Instructor"
                desc="Teach & assess"
                selected={role === "instructor"}
                onSelect={() => setRole("instructor")}
                iconBg="bg-orange-500"
                Icon={UserCog}
              />
              <RoleCard
                title="Admin"
                desc="Manage platform"
                selected={role === "admin"}
                onSelect={() => setRole("admin")}
                iconBg="bg-orange-500"
                Icon={Shield}
              />
            </div>
            <p className="mt-2 text-[12px] text-black/60">
              If your account has a different role, we’ll use that
              automatically.
            </p>
          </fieldset>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-black/40" />
                <input
                  type="email"
                  className="w-full rounded-xl border border-black/15 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@domain.dev"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-black/40" />
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full rounded-xl border border-black/15 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={onPasswordKeyUp}
                  required
                  autoComplete="current-password"
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
              {capsLock && (
                <p className="mt-2 text-xs text-orange-600">Caps Lock is ON</p>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={keep}
                  onChange={(e) => setKeep(e.target.checked)}
                  className="h-4 w-4 rounded border-black/30 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-black/80">Keep me logged in</span>
              </label>

              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Forgot Password?
              </Link>
            </div>

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
              {submitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : null}
              Sign In
            </button>
          </form>

          {/* Sign up hint */}
          <p className="mt-6 text-sm text-black/70">
            New here?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-orange-600 hover:text-orange-700"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small reusable role card ---------- */
function RoleCard({
  title,
  desc,
  selected,
  onSelect,
  Icon,
  iconBg = "bg-black/10",
}: {
  title: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
  Icon: ComponentType<{ size?: number; className?: string }>;
  iconBg?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-2xl border p-3 transition w-full
        ${
          selected
            ? "border-orange-500 ring-2 ring-orange-200 bg-orange-50"
            : "border-black/15 hover:bg-black/5"
        }
      `}
      aria-pressed={selected}
      aria-label={`Select ${title} role`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-9 w-9 grid place-items-center rounded-xl ${
            selected ? "bg-orange-500 text-white" : iconBg + " text-black"
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
