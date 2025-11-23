"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Send,
  X,
  Settings,
  Sparkles,
  Wand2,
  Search,
  BookOpen,
  Trash2,
} from "lucide-react";

type Msg = { role: "assistant" | "user"; content: string };
type Action = "chat" | "summarize" | "skillpath" | "careerpath";

/* ---------- Small portal helper so the widget is outside any page layout ---------- */
function BodyPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const elRef = useRef<HTMLDivElement | null>(null);

  if (!elRef.current && typeof document !== "undefined") {
    elRef.current = document.createElement("div");
  }

  useEffect(() => {
    setMounted(true);
    const el = elRef.current!;
    document.body.appendChild(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  if (!mounted || !elRef.current) return null;
  return createPortal(children, elRef.current);
}

/* --------------------------------- Widget --------------------------------- */
export default function AssistantWidget() {
  // Hooks first
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [action, setAction] = useState<Action>("chat");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I’m your learning assistant. Ask me to find a course, create a skill path, or summarize something.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  // Mark client ready
  useEffect(() => setMounted(true), []);

  // Restore/persist open state
  useEffect(() => {
    try {
      const persisted = localStorage.getItem("assistant-open");
      if (persisted) setOpen(persisted === "true");
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("assistant-open", String(open));
    } catch {}
  }, [open]);

  // Alt + A to toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Autoscroll messages
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  function quickFill(text: string, act: Action = "chat") {
    setAction(act);
    setInput(text);
  }

  async function onSend(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          history: messages.slice(-8),
          action,
        }),
      });
      const data = await res.json();
      const answer = data?.answer || "Sorry, I couldn't generate a reply.";
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "⚠️ Network error. Please try again." },
      ]);
    }
  }

  function clearChat() {
    setMessages([
      {
        role: "assistant",
        content:
          "Cleared. How can I help next? Try the quick actions below to get started faster.",
      },
    ]);
    setAction("chat");
  }

  if (!mounted) return null;

  return (
    <BodyPortal>
      {/* Fixed only-icon trigger at RIGHT-CENTER */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed right-4 bottom-4
          z-[95] grid place-items-center rounded-full text-white
          bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-500
          shadow-[0_0_22px_rgba(168,85,247,0.65)]
          hover:shadow-[0_0_30px_rgba(56,189,248,0.75)]
          transition
          w-14 h-14 md:w-16 md:h-16
          before:content-[''] before:absolute before:inset-0 before:rounded-full before:blur-xl before:opacity-60
          before:bg-gradient-to-r before:from-fuchsia-500 before:via-violet-500 before:to-sky-400
        "
        aria-label="Open assistant"
      >
        <Bot className="relative" size={28} />
      </button>

      {/* Dim background */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,10,0.9),rgba(0,0,0,0.4))] backdrop-blur-[2px] z-[96]"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Panel (mobile: full-screen bottom sheet; desktop: right sheet) */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="panel"
            initial={{
              y:
                typeof window !== "undefined" && window.innerWidth < 768
                  ? 40
                  : 0,
              opacity: 0.9,
              x:
                typeof window !== "undefined" && window.innerWidth >= 768
                  ? 420
                  : 0,
            }}
            animate={{ y: 0, x: 0, opacity: 1 }}
            exit={{
              y:
                typeof window !== "undefined" && window.innerWidth < 768
                  ? 40
                  : 0,
              opacity: 0.9,
              x:
                typeof window !== "undefined" && window.innerWidth >= 768
                  ? 420
                  : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="
              fixed z-[97] flex flex-col
              w-[100vw] h-[92vh] bottom-0 left-0 rounded-t-2xl
              md:top-0 md:right-0 md:left-auto md:bottom-auto md:h-screen md:w-[92vw] md:max-w-[420px] md:rounded-none
            "
            role="dialog"
            aria-modal="true"
            aria-label="Assistant"
          >
            {/* Neon halo behind panel */}
            <div className="absolute inset-0 -z-10 bg-[conic-gradient(at_top_right,theme(colors.fuchsia.600),theme(colors.violet.500),theme(colors.sky.400),theme(colors.fuchsia.600))] opacity-70 blur-xl" />

            <div className="h-full bg-gray-900/90 text-gray-100 backdrop-blur-xl border-t md:border-l border-white/10 shadow-[0_0_30px_rgba(56,189,248,0.3),inset_0_0_20px_rgba(168,85,247,0.12)] ring-1 ring-white/10 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 w-8 grid place-items-center rounded-full bg-white/10">
                    <Bot className="text-sky-300" size={18} />
                    <span className="absolute -right-0 -top-0 h-2 w-2 rounded-full bg-fuchsia-400 animate-ping" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold bg-gradient-to-r from-sky-300 via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">
                      Assistant
                    </div>
                    <div className="text-[11px] text-gray-400">Alt + A to toggle</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={clearChat}
                    className="rounded-lg p-2 hover:bg-white/10"
                    title="Clear conversation"
                    aria-label="Clear conversation"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => alert("Add settings UI here")}
                    className="rounded-lg p-2 hover:bg-white/10"
                    title="Settings"
                    aria-label="Settings"
                  >
                    <Settings size={18} />
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-2 hover:bg-white/10"
                    title="Close"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    {m.role === "user" ? (
                      <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-[0_0_18px_rgba(168,85,247,0.5)]">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                      </div>
                    ) : (
                      <div className="max-w-[85%] rounded-2xl p-[1px] bg-gradient-to-r from-sky-400 via-violet-500 to-fuchsia-500 shadow-[0_0_18px_rgba(56,189,248,0.35)]">
                        <div className="rounded-2xl bg-gray-900/80 px-3 py-2">
                          <p className="text-sm leading-relaxed text-gray-100 whitespace-pre-wrap">
                            {m.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => quickFill("Summarize this page", "summarize")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10"
                  >
                    <Sparkles size={14} /> Summarize
                  </button>
                  <button
                    onClick={() => quickFill("Find me a React beginner course", "chat")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10"
                  >
                    <Search size={14} /> Find course
                  </button>
                  <button
                    onClick={() => quickFill("Create a 6-week Skill Path for Python", "skillpath")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10"
                  >
                    <Wand2 size={14} /> Make skill path
                  </button>
                  <button
                    onClick={() => quickFill("Recommend a career path for data science", "careerpath")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10"
                  >
                    <BookOpen size={14} /> Career path
                  </button>
                </div>
              </div>

              {/* Composer */}
              <form onSubmit={onSend} className="border-t border-white/10 p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything…"
                    className="
                      flex-1 rounded-xl border border-white/10 bg-gray-900/60 px-3 py-2 text-sm outline-none
                      focus:ring-2 focus:ring-fuchsia-500/50
                      shadow-[0_0_0_rgba(0,0,0,0)]
                      focus:shadow-[0_0_20px_rgba(168,85,247,0.35)]
                      text-gray-100 placeholder:text-gray-400
                    "
                  />
                  <button
                    type="submit"
                    className="
                      inline-flex items-center gap-2 rounded-xl
                      bg-gradient-to-r from-sky-500 to-fuchsia-500
                      px-3 py-2 text-white text-sm font-medium
                      shadow-[0_0_18px_rgba(56,189,248,0.45)]
                      hover:shadow-[0_0_24px_rgba(168,85,247,0.5)]
                      transition
                    "
                  >
                    <Send size={16} /> Send
                  </button>
                </div>
              </form>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </BodyPortal>
  );
}
