"use client";

import { motion } from "framer-motion";
import { Code, Database, Brain, Briefcase, Palette } from "lucide-react";

const categories = [
  { title: "Web Development", icon: <Code className="w-5 h-5 text-orange-500" />, sub: ["HTML & CSS", "JavaScript", "React / Next.js", "Node.js", "Full-Stack"] },
  { title: "Data Science",     icon: <Database className="w-5 h-5 text-blue-500" />,  sub: ["Python", "Pandas", "Machine Learning", "Deep Learning", "Statistics"] },
  { title: "AI & ML",          icon: <Brain className="w-5 h-5 text-purple-500" />,   sub: ["NLP", "Computer Vision", "Generative AI", "Reinforcement Learning"] },
  { title: "Business",         icon: <Briefcase className="w-5 h-5 text-green-500" />, sub: ["Marketing", "Finance", "Entrepreneurship", "Product Management"] },
  { title: "Design",           icon: <Palette className="w-5 h-5 text-pink-500" />,    sub: ["UI/UX", "Graphic Design", "Figma", "3D & Motion"] },
];

export default function CourseNavbar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      // ✅ anchor to the trigger container's bottom; no more scroll gap
      className="
        absolute left-1/2 -translate-x-1/2 top-full
        w-screen max-w-[100vw]
        bg-white dark:bg-gray-900
        shadow-2xl border-t border-gray-200 dark:border-gray-800
        z-[60]
      "
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 px-10 py-8">
        {categories.map((cat) => (
          <div key={cat.title} className="space-y-3 group hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center gap-2 border-b pb-2">
              {cat.icon}
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base group-hover:text-orange-500 transition">
                {cat.title}
              </h4>
            </div>
            <ul className="space-y-2 text-sm">
              {cat.sub.map((s) => (
                <li key={s}>
                  <a
                    href={`/courses?category=${encodeURIComponent(s)}`}
                    className="block text-gray-600 dark:text-gray-300 hover:text-orange-500 hover:pl-1 transition"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
