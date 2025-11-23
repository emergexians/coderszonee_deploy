// components/admin/ContactRow.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Eye, Trash2, Archive, ArchiveRestore, MailOpen, Mail } from "lucide-react";

export type ContactDTO = {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt?: string;
  phone?: string;
  company?: string;
  reason?: "support" | "partnership" | "hiring" | "feedback" | "other";
};

function StatusBadge({ s }: { s: ContactDTO["status"] }) {
  const tone =
    s === "archived"
      ? "bg-gray-100 text-gray-700"
      : s === "read"
      ? "bg-blue-50 text-blue-700"
      : "bg-green-50 text-green-700";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${tone}`}
      aria-label={`Status: ${s}`}
    >
      {s}
    </span>
  );
}

/** Portal helper: renders children into document.body (client-only) */
function BodyPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function ContactRow({ c }: { c: ContactDTO }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<null | "status" | "delete">(null);

  async function updateStatus(status: ContactDTO["status"]) {
    if (busy) return;
    setBusy("status");
    try {
      const res = await fetch(`/api/contacts/${c._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Update failed");
      }
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Update failed");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (busy) return;
    if (!confirm("Delete this message?")) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/contacts/${c._id}`, { method: "DELETE" });
      if (res.status !== 204 && !res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Delete failed");
      }
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {/* ✅ Only <tr> inside <tbody> */}
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3">
          <div className="font-medium truncate max-w-[18rem]" title={c.name}>
            {c.name}
          </div>
          <a
            className="text-xs text-orange-600 hover:underline break-all"
            href={`mailto:${c.email}`}
            title={c.email}
          >
            {c.email}
          </a>
        </td>

        <td className="px-4 py-3">
          <div className="truncate max-w-[16rem]" title={c.subject || "—"}>
            {c.subject || "—"}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-[16rem]">
            {c.reason || ""}
          </div>
        </td>

        <td className="px-4 py-3 max-w-[28rem] align-top">
          <div title={c.message} className="line-clamp-2 text-gray-700">
            {c.message}
          </div>
        </td>

        <td className="px-4 py-3">
          <StatusBadge s={c.status} />
        </td>

        <td className="px-4 py-3 whitespace-nowrap text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 hover:bg-gray-50"
              aria-label="View message"
            >
              <Eye size={16} />
            </button>

            {c.status !== "read" ? (
              <button
                disabled={busy === "status"}
                onClick={() => updateStatus("read")}
                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 hover:bg-gray-50 disabled:opacity-50"
              >
                <MailOpen size={16} /> 
              </button>
            ) : (
              <button
                disabled={busy === "status"}
                onClick={() => updateStatus("new")}
                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 hover:bg-gray-50 disabled:opacity-50"
              >
                <Mail size={16} /> Mark new
              </button>
            )}

            {c.status !== "archived" ? (
              <button
                disabled={busy === "status"}
                onClick={() => updateStatus("archived")}
                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 hover:bg-gray-50 disabled:opacity-50"
              >
                <Archive size={16} />
              </button>
            ) : (
              <button
                disabled={busy === "status"}
                onClick={() => updateStatus("read")}
                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 hover:bg-gray-50 disabled:opacity-50"
              >
                <ArchiveRestore size={16} /> Restore
              </button>
            )}

            <button
              disabled={busy === "delete"}
              onClick={remove}
              className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>

      {/* 🔒 Modal rendered to <body>, not inside <tbody> */}
      <BodyPortal>
        {open ? <ContactQuickView c={c} onClose={() => setOpen(false)} /> : null}
      </BodyPortal>
    </>
  );
}

/* ----------------------- Modal (portal content) ---------------------- */
function ContactQuickView({ c, onClose }: { c: ContactDTO; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Focus panel on open
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Prevent background scroll when open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-0 grid place-items-center p-4">
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={c.subject || "Message preview"}
          className="relative w-full max-w-xl max-h-[85vh] overflow-auto rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/10 outline-none"
        >
          <div className="flex items-center justify-between gap-4 sticky top-0 bg-white pb-2">
            <div>
              <div className="font-semibold truncate max-w-[28rem]">
                {c.subject || "Message"}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(c.createdAt || Date.now()).toLocaleString()}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-3 text-sm">
            <div className="break-words">
              <span className="font-medium">From: </span>
              {c.name} &lt;
              <a className="text-orange-600 hover:underline break-all" href={`mailto:${c.email}`}>
                {c.email}
              </a>
              &gt;
            </div>

            {c.company && (
              <div>
                <span className="font-medium">Company: </span>
                {c.company}
              </div>
            )}

            {c.phone && (
              <div className="break-words">
                <span className="font-medium">Phone: </span>
                {c.phone}
              </div>
            )}

            {c.reason && (
              <div>
                <span className="font-medium">Reason: </span>
                {c.reason}
              </div>
            )}

            <div className="rounded-xl border bg-gray-50 p-3 whitespace-pre-wrap break-words">
              {c.message}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
