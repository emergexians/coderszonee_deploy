// app/student/courses/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { BadgeIndianRupee, Check, ExternalLink, Sparkles } from "lucide-react";

/* =========================
   Types
========================= */

type EnrollmentStatus = "pending" | "active" | "failed" | "paid" | string;
type CourseType = "careerpath" | "skillpath" | string;

type EnrollmentMeta = Record<string, unknown>;

export type Enrollment = {
  _id: string;
  userEmail: string;
  courseType: CourseType;
  courseSlug: string;
  status?: EnrollmentStatus;
  amount?: number; // may be paise or rupees
  currency?: string;
  meta?: EnrollmentMeta;
  createdAt?: string;
  updatedAt?: string;
};

type MeResponse = {
  email?: string | null;
  name?: string | null;
  urn?: string | null;
  meta?: unknown;
};

/** create-order response */
type CreateOrderResponse = {
  orderId?: string;
  amount?: number;
  currency?: string;
  key?: string;
  paymentId?: string;
};

/** verify response */
type VerifyResponse =
  | { success: true; paymentId?: string }
  | { success: false; error?: string };

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailure = {
  error?: {
    description?: string;
    reason?: string;
    code?: string;
    source?: string;
    step?: string;
    metadata?: unknown;
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccess) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: {
    email?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  close?: () => void;
  on: (event: "payment.failed", handler: (resp: RazorpayFailure) => void) => void;
};

type WindowWithRazorpay = Window & {
  Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
};

/* =========================
   Utils
========================= */

/**
 * Top-level formatAmount so EnrollmentCard (top-level) can call it.
 * Heuristic: treat integers >= 1000 as paise (e.g. 10000 -> ₹100.00).
 */
function formatAmount(amount?: number, currency?: string) {
  if (amount == null) return "—";
  const isProbablyPaise = Number.isInteger(amount) && Math.abs(amount) >= 1000;
  const value = isProbablyPaise ? amount / 100 : amount;
  const cur = (currency || "INR").toUpperCase();
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: cur,
    }).format(value);
  } catch {
    return `${cur} ${value}`;
  }
}

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "Unknown error";
  }
}

/* =========================
   Page
========================= */

export default function MyEnrollmentsPage() {
  const [loading, setLoading] = useState(true);
  const [meEmail, setMeEmail] = useState<string | null>(null);
  const [rows, setRows] = useState<Enrollment[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load current student's email (optional)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/student/me", {
          headers: { accept: "application/json" },
        });
        if (!r.ok) return;

        const me = (await r.json()) as MeResponse;
        if (me?.email) setMeEmail(String(me.email).trim().toLowerCase());
      } catch (e) {
        console.warn("Failed to fetch /api/student/me", e);
      }
    })();
  }, []);

  // Load enrollments
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch("/api/enrollments", {
          headers: { accept: "application/json" },
        });
        if (!r.ok) throw new Error(`GET /api/enrollments -> ${r.status}`);

        const payload = (await r.json()) as { data?: unknown } | Enrollment[];
        const data: Enrollment[] = Array.isArray((payload as any)?.data)
          ? ((payload as { data: Enrollment[] }).data)
          : Array.isArray(payload)
          ? (payload as Enrollment[])
          : [];

        const filtered = meEmail
          ? data.filter(
              (en) => String(en.userEmail).toLowerCase() === meEmail
            )
          : data;

        if (mountedRef.current) setRows(filtered);
      } catch (e: unknown) {
        if (mountedRef.current) {
          setError(getErrorMessage(e) || "Failed to load enrollments");
          setRows([]);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();
  }, [meEmail]);

  const viewUrl = (row: Enrollment) => {
    const slug = encodeURIComponent(row.courseSlug);
    if (row.courseType === "careerpath") return `/careerpath/${slug}`;
    if (row.courseType === "skillpath") return `/skillpath/${slug}`;
    return `/course/${slug}`;
  };

  // Razorpay script loader (idempotent)
  async function loadRazorpayScript(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const w = window as WindowWithRazorpay;
    if (w.Razorpay) return true;

    const existing = document.getElementById("razorpay-sdk");
    if (existing) {
      return new Promise((resolve) => {
        if ((window as WindowWithRazorpay).Razorpay) return resolve(true);
        existing.addEventListener("load", () =>
          resolve(Boolean((window as WindowWithRazorpay).Razorpay))
        );
        existing.addEventListener("error", () => resolve(false));
      });
    }

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handlePay(row: Enrollment) {
    if (isProcessing) return;
    setIsProcessing(row._id);

    let rzpInstance: RazorpayInstance | null = null;

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: row._id, email: row.userEmail }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => null);
        throw new Error(
          `Failed to start payment (${res.status}) ${t ? "- " + t : ""}`
        );
      }

      const data = (await res.json()) as CreateOrderResponse;
      const { orderId, amount, currency, key, paymentId } = data;

      if (!orderId || !key || typeof amount !== "number")
        throw new Error("Invalid payment init response from server");

      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Failed to load Razorpay SDK");

      const options: RazorpayOptions = {
        key,
        amount,
        currency: (currency || "INR").toUpperCase(),
        name: "Coderszonee",
        description: "Course enrollment payment",
        order_id: orderId,
        handler: async (response: RazorpaySuccess) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId,
                enrollmentId: row._id,
              }),
            });

            if (!verifyRes.ok) {
              const txt = await verifyRes.text().catch(() => null);
              throw new Error(
                `Verification endpoint error (${verifyRes.status}) ${txt ?? ""}`
              );
            }

            const vr = (await verifyRes.json()) as VerifyResponse;

            if (vr.success) {
              setRows((prev) =>
                prev.map((r) =>
                  r._id === row._id ? { ...r, status: "active" } : r
                )
              );
              alert(
                "Payment successful — you can now open the course timeline from the card."
              );
            } else {
              setRows((prev) =>
                prev.map((r) =>
                  r._id === row._id ? { ...r, status: "failed" } : r
                )
              );
              alert("Payment verification failed: " + (vr.error || "unknown"));
            }
          } catch (err: unknown) {
            console.error("verify error", err);
            alert("Error verifying payment: " + getErrorMessage(err));
            setRows((prev) =>
              prev.map((r) =>
                r._id === row._id ? { ...r, status: "failed" } : r
              )
            );
          } finally {
            setIsProcessing(null);
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(null),
        },
        prefill: {
          email: row.userEmail || "",
        },
        notes: { enrollmentId: row._id },
        theme: { color: "#FF6B00" },
      };

      const RazorpayCtor = (window as WindowWithRazorpay).Razorpay;
      if (!RazorpayCtor) throw new Error("Razorpay constructor missing");

      rzpInstance = new RazorpayCtor(options);

      rzpInstance.on("payment.failed", (resp: RazorpayFailure) => {
        console.error("payment.failed", resp);
        try {
          const msg =
            resp?.error?.description ||
            resp?.error?.reason ||
            "Unknown reason";
          alert("Payment failed: " + msg);
          setRows((prev) =>
            prev.map((r) =>
              r._id === row._id ? { ...r, status: "failed" } : r
            )
          );
        } finally {
          setIsProcessing(null);
        }
      });

      rzpInstance.open();
    } catch (e: unknown) {
      console.error("handlePay error", e);
      alert(getErrorMessage(e) || "Payment initiation failed");
      setIsProcessing(null);
      setRows((prev) =>
        prev.map((r) =>
          r._id === row._id ? { ...r, status: "failed" } : r
        )
      );
      try {
        if (rzpInstance?.close) rzpInstance.close();
      } catch {
        // ignore close errors
      }
    }
  }

  return (
    <main
      className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
      style={{ paddingLeft: "var(--sidebar-width,0)" }}
    >
      <div className="h-4 lg:h-6" />
      <div className="mx-auto max-w-7xl p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
              <Sparkles className="h-4 w-4" /> <span>My Enrollments</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
              Courses you enrolled
            </h1>
          </div>
          <Link
            href="/student/courses/explore"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800"
          >
            Browse Courses
          </Link>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-44 rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-800 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm dark:border-red-900 dark:bg-neutral-800">
              <h3 className="text-base font-semibold text-red-700">Error</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">
                {error}
              </p>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
              <h3 className="text-base font-semibold">No enrollments yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">
                You haven’t enrolled in any course. Browse the catalog and start
                learning.
              </p>
              <div className="mt-4">
                <Link
                  href="/student/courses/explore"
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => (
                <EnrollmentCard
                  key={row._id}
                  row={row}
                  viewUrl={viewUrl(row)}
                  onPay={() => handlePay(row)}
                  paying={isProcessing === row._id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function EnrollmentCard({
  row,
  viewUrl,
  onPay,
  paying,
}: {
  row: Enrollment;
  viewUrl: string;
  onPay: () => void;
  paying?: boolean;
}) {
  const isActive = row.status === "active" || row.status === "paid";
  const amountText = formatAmount(row.amount, row.currency);
  const timelineUrl = `/skillpaths/${encodeURIComponent(
    row.courseSlug
  )}/timeline`;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-800">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            {row.courseType}
          </div>
          <div className="mt-1 text-base font-semibold">
            {row.courseSlug}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Status: {row.status ?? "—"}
          </div>
        </div>
        <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-700 dark:bg-neutral-700/40 dark:text-neutral-200">
          {amountText}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link
            href={viewUrl}
            className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline"
          >
            View <ExternalLink className="h-4 w-4" />
          </Link>

          {isActive && (
            <a
              href={timelineUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-100"
              aria-label={`Open timeline for ${row.courseSlug}`}
            >
              Open Timeline
            </a>
          )}
        </div>

        {isActive ? (
          <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
            <Check className="h-4 w-4" /> Paid
          </span>
        ) : (
          <button
            onClick={onPay}
            disabled={paying}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-white shadow ${
              paying
                ? "bg-neutral-400"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            <BadgeIndianRupee className="h-4 w-4" />{" "}
            {paying ? "Processing..." : "Pay Now"}
          </button>
        )}
      </div>
    </div>
  );
}
