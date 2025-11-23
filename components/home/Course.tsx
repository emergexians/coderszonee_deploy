"use client";

import { motion } from "framer-motion";
import { Code2, Database, Brain, Briefcase, Palette } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

type CourseCategory = {
  title: string;
  color: string;
  icon: React.ReactNode;
  items: { name: string; href: string }[];
};

const courseCategories: CourseCategory[] = [
  {
    title: "Web Development",
    color: "#f97316", // orange
    icon: <Code2 className="h-6 w-6" />,
    items: [
      { name: "HTML & CSS", href: "/courses/html-css" },
      { name: "JavaScript", href: "/courses/javascript" },
      { name: "React / Next.js", href: "/courses/react-next" },
      { name: "Node.js", href: "/courses/nodejs" },
      { name: "Full-Stack", href: "/courses/fullstack" },
    ],
  },
  {
    title: "Data Science",
    color: "#00b8db", // cyan
    icon: <Database className="h-6 w-6" />,
    items: [
      { name: "Python", href: "/courses/python" },
      { name: "Pandas", href: "/courses/pandas" },
      { name: "Machine Learning", href: "/courses/machine-learning" },
      { name: "Deep Learning", href: "/courses/deep-learning" },
      { name: "Statistics", href: "/courses/statistics" },
    ],
  },
  {
    title: "AI & ML",
    color: "#9333ea", // purple
    icon: <Brain className="h-6 w-6" />,
    items: [
      { name: "NLP", href: "/courses/nlp" },
      { name: "Computer Vision", href: "/courses/computer-vision" },
      { name: "Generative AI", href: "/courses/generative-ai" },
      { name: "Reinforcement Learning", href: "/courses/reinforcement" },
    ],
  },
  {
    title: "Business",
    color: "#16a34a", // green
    icon: <Briefcase className="h-6 w-6" />,
    items: [
      { name: "Marketing", href: "/courses/marketing" },
      { name: "Finance", href: "/courses/finance" },
      { name: "Entrepreneurship", href: "/courses/entrepreneurship" },
      { name: "Product Management", href: "/courses/product-management" },
    ],
  },
  {
    title: "Design",
    color: "#e11d48", // pink
    icon: <Palette className="h-6 w-6" />,
    items: [
      { name: "UI/UX", href: "/courses/ui-ux" },
      { name: "Graphic Design", href: "/courses/graphic-design" },
      { name: "Figma", href: "/courses/figma" },
      { name: "3D & Motion", href: "/courses/3d-motion" },
    ],
  },
];

export default function Courses() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="courses"
      className="relative px-4 sm:px-6 lg:px-20 py-16 sm:py-20 bg-gray-50 overflow-hidden"
    >
      {/* 🔥 Multicolored Background Glows */}
      <motion.div
        className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-orange-400/30 rounded-full blur-3xl -z-10"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-400/30 rounded-full blur-3xl -z-10"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-56 sm:w-80 h-56 sm:h-80 bg-purple-500/30 rounded-full blur-3xl -z-10"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Our <span className="text-[#f97316]">Courses</span>
        </motion.h2>

        {/* Desktop Grid */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courseCategories.map((cat, i) => (
            <motion.div
              key={i}
              className="group bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg border border-white/40 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition transform"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.6 }}
            >
              {/* Header with gradient */}
              <div
                className="flex items-center gap-3 px-6 py-4 font-bold text-lg"
                style={{
                  background: `linear-gradient(to right, ${cat.color}20, white)`,
                  color: cat.color,
                }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  {cat.icon}
                </div>
                {cat.title}
              </div>

              {/* List */}
              <ul className="px-6 py-4 space-y-2 text-gray-700 text-sm sm:text-base">
                {cat.items.map((item, j) => (
                  <li key={j}>
                    <Link
                      href={item.href}
                      className="hover:text-[#f97316] transition"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Mobile Accordion */}
        <div className="sm:hidden space-y-4">
          {courseCategories.map((cat, i) => (
            <div
              key={i}
              className="bg-white/60 backdrop-blur-lg rounded-xl shadow-md border border-white/40 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex justify-between items-center px-4 py-3 font-semibold text-gray-900"
                style={{ color: cat.color }}
              >
                <span className="flex items-center gap-2">
                  {cat.icon} {cat.title}
                </span>
                <span>{openIndex === i ? "−" : "+"}</span>
              </button>
              {openIndex === i && (
                <ul className="px-4 pb-3 space-y-2 text-gray-700 text-sm">
                  {cat.items.map((item, j) => (
                    <li key={j}>
                      <Link
                        href={item.href}
                        className="hover:text-[#f97316] transition"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
