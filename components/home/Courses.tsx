"use client";

import { motion } from "framer-motion";
import { BookOpen, Layers, Briefcase } from "lucide-react";

const items = [
  {
    title: "Courses",
    desc: "Focused learning modules on specific technologies and skills to help you master fundamentals quickly.",
    icon: <BookOpen className="w-10 h-10 text-orange-500" />,
    link: "/courses",
  },
  {
    title: "Skill Paths",
    desc: "Step-by-step guided learning paths designed to build strong technical skills across multiple tools.",
    icon: <Layers className="w-10 h-10 text-cyan-500" />,
    link: "/skillpath",
  },
  {
    title: "Career Paths",
    desc: "Structured programs combining courses, projects, and mentorship to make you job-ready in tech careers.",
    icon: <Briefcase className="w-10 h-10 text-purple-500" />,
    link: "/careerpath",
  },
];

export default function Courses() {
  return (
    <section
      id="courses"
      className="relative min-h-[60vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-20 py-20 bg-white overflow-hidden"
    >
      {/* Background Glow */}
      <motion.div
        className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-orange-200/40 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-200/40 rounded-full blur-3xl"
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="max-w-6xl text-center relative z-10">
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 text-gray-900"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Explore Our <span className="text-orange-500">Programs</span>
        </motion.h2>

        <motion.p
          className="text-gray-700 text-sm sm:text-lg md:text-xl leading-relaxed mb-12 max-w-3xl mx-auto px-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Whether you want to take a short course, follow a structured skill path,
          or commit to a career transformation — we’ve got you covered
        </motion.p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <motion.a
              href={item.link}
              key={i}
              className="flex flex-col items-center justify-start text-center p-6 rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-xl hover:border-orange-400 transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 * i, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{item.desc}</p>
              <span className="mt-4 text-orange-500 font-semibold">Learn More →</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
