// app/about/page.tsx
"use client";

import Link from "next/link";
import { MotionConfig, motion, type Variants } from "framer-motion";

const fade: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const stats = [
  { label: "Learners", value: "25k+" },
  { label: "Courses & Paths", value: "120+" },
  { label: "Mentors", value: "300+" },
  { label: "Hackathons", value: "40+" },
];

const pillars = [
  {
    title: "Paths that lead somewhere",
    text: "Structured routes from zero to job-ready, with no fluff.",
  },
  {
    title: "Build real projects",
    text: "Portfolio work you can show, not just theory.",
  },
  {
    title: "Mentor & peer feedback",
    text: "Tight review loops to improve fast.",
  },
  {
    title: "Community challenges",
    text: "Hackathons and squads to stay consistent.",
  },
];

const timeline = [
  {
    year: "2022",
    title: "Started with project kits",
    text: "We shipped practical templates to help learners build their first portfolio pieces.",
  },
  {
    year: "2023",
    title: "Learning paths launched",
    text: "Courses turned into curated paths designed around real roles.",
  },
  {
    year: "2024",
    title: "Mentors & hackathons",
    text: "Feedback and competitions made learning more social and effective.",
  },
  {
    year: "Today",
    title: "Career-ready ecosystem",
    text: "Courses, skillpaths, careerpaths, and challenges all in one place.",
  },
];

const faqs = [
  {
    q: "Who is this for?",
    a: "Anyone learning tech skills — beginners, career switchers, and pros upskilling.",
  },
  {
    q: "Do you offer certificates?",
    a: "Yes, but we focus more on portfolio outcomes than paper badges.",
  },
  {
    q: "How do mentors help?",
    a: "Mentors review projects, unblock you, and give industry-grade feedback.",
  },
];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-md">
      <div className="text-2xl font-extrabold tracking-tight text-black">
        {value}
      </div>
      <div className="mt-1 text-sm text-black/70">{label}</div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-black/10 bg-white p-5 shadow-sm open:border-orange-400">
      <summary className="cursor-pointer list-none text-base font-semibold text-black flex items-center justify-between">
        {q}
        <span className="ml-3 text-orange-500 transition group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-black/70">{a}</p>
    </details>
  );
}

export default function AboutPage() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen bg-white text-black">
        {/* HERO (clean, premium) */}
        <section className="border-b border-black/10">
          <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <motion.div initial="hidden" animate="visible" variants={stagger}>
                <motion.p
                  variants={fade}
                  className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700 ring-1 ring-orange-200"
                >
                  About us
                </motion.p>

                <motion.h1
                  variants={fade}
                  className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl"
                >
                  Practical learning.
                  <br />
                  <span className="text-orange-600">Real career outcomes.</span>
                </motion.h1>

                <motion.p
                  variants={fade}
                  className="mt-4 text-lg leading-relaxed text-black/70"
                >
                  We help learners go from “I’m studying” to “I can build this”
                  through guided paths, projects, and feedback.
                </motion.p>

                <motion.div variants={fade} className="mt-6 flex gap-3">
                  <Link
                    href="/courses"
                    className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black/90"
                  >
                    Explore Courses
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-md"
                  >
                    Contact
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right side: framed feature mock / image placeholder */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fade}
                className="relative"
              >
                <div className="rounded-3xl border border-black/10 bg-white p-3 shadow-sm">
                  <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-white p-6">
                    <div className="grid grid-cols-2 gap-4">
                      {stats.map((s) => (
                        <StatCard key={s.label} {...s} />
                      ))}
                    </div>
                    <div className="mt-5 rounded-xl bg-black p-4 text-sm font-semibold text-white">
                      Build → Get feedback → Improve → Get hired.
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* PILLARS */}
        <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fade}
              className="text-2xl md:text-3xl font-bold tracking-tight"
            >
              What makes EdTech different
            </motion.h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {pillars.map((p, i) => (
                <motion.div
                  key={p.title}
                  variants={fade}
                  className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-md"
                >
                  <div className="h-2 w-10 rounded-full bg-orange-500" />
                  <h3 className="mt-3 font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-black/70">{p.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* STORY / TIMELINE */}
        <section className="bg-orange-50/50 border-y border-black/10">
          <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fade}
              className="text-2xl md:text-3xl font-bold tracking-tight"
            >
              Our story
            </motion.h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {timeline.map((t, i) => (
                <motion.div
                  key={t.year}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={fade}
                  className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                      {t.year}
                    </span>
                    <span className="text-xs font-semibold text-orange-600">
                      milestone
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{t.title}</h3>
                  <p className="mt-2 text-sm text-black/70">{t.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fade}
            className="text-2xl md:text-3xl font-bold tracking-tight"
          >
            Quick answers
          </motion.h2>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {faqs.map((f) => (
              <FAQItem key={f.q} {...f} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-black/10">
          <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fade}
              className="rounded-3xl bg-black p-8 text-white shadow-sm md:flex md:items-center md:justify-between"
            >
              <div>
                <h3 className="text-2xl font-bold">
                  Ready to start learning?
                </h3>
                <p className="mt-1 text-white/80">
                  Pick a path and build something real this week.
                </p>
              </div>
              <div className="mt-5 flex gap-3 md:mt-0">
                <Link
                  href="/courses"
                  className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-orange-400"
                >
                  Get Started
                </Link>
                <Link
                  href="/hackathon"
                  className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10"
                >
                  Join Hackathon
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </MotionConfig>
  );
}
