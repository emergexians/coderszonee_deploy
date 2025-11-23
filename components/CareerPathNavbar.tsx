"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Clock,
  GraduationCap,
  Star,
  Users,
  Flame,
  Zap,
} from "lucide-react";

const careerPaths = [
  {
    name: "Full-Stack Developer",
    href: "/careerpath/full-stack-developer-modern-web-dev-2025",
    img: "/uploads/careerpaths/career-1756833892028-fullstack.jpg",
    desc: "A project-driven curriculum to launch your career as a frontend developer.",
    duration: "06 Months",
    rating: 4.8,
    students: 89,
    level: "Beginner",
  },
  {
    name: "Data Science Foundations (2025)",
    href: "/careerpath/data-science-foundations-2025",
    img: "/assets/thumbnails/datascience.jpg",
    desc: "A complete hands-on program in Python-based Data Science.",
    duration: "08 Months",
    rating: 4.8,
    students: 96,
    level: "Intermediate",
  },
  {
    name: "Mobile App Dev with Flutter (2025)",
    href: "/careerpath/mobile-app-dev-with-flutter-2025",
    img: "/assets/thumbnails/flutter.jpg",
    desc: "Learn Dart, Flutter widgets, Firebase, and ship apps to Play Store/App Store.",
    duration: "07 months",
    rating: 4.9,
    students: 85,
    level: "Intermediate",
  },
  {
    name: "JavaScript Essentials",
    href: "/paths/javascript",
    img: "/assets/thumbnails/javascript.png",
    desc: "Grasp the core concepts of JavaScript to strengthen your foundation.",
    duration: "20 days",
    rating: 4.6,
    students: 5000,
  },
];

// Badge logic
function getBadge(path: { rating: number; students: number }) {
  if (path.rating >= 4.8) {
    return { label: "🔥 Trending", color: "bg-red-500" };
  }
  if (path.students >= 15000) {
    return { label: "⚡ Limited Seats", color: "bg-yellow-500" };
  }
  return { label: "⭐ Popular", color: "bg-blue-500" };
}

export default function CareerPathNavbar() {
  const previewPaths = careerPaths.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-x-0 top-full bg-white dark:bg-gray-900 shadow-2xl border-t z-40"
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Grid responsive */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {previewPaths.map((path) => {
            const badge = getBadge(path);
            return (
              <div
                key={path.name}
                className="group rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative h-48 w-full">
                  <Image
                    src={path.img}
                    alt={path.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {badge && (
                    <span
                      className={`absolute top-3 left-3 ${badge.color} text-white text-xs font-semibold px-3 py-1 rounded-md shadow-md`}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-orange-500">
                    {path.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {path.desc}
                  </p>

                  {/* ✅ Stats in one responsive line */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600 dark:text-gray-300 mt-2">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {path.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {path.students.toLocaleString()} Students
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {path.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-5 w-5" />
                      {path.level}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto pt-4">
                    <a
                      href={path.href}
                      className="block w-full text-center bg-blue-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-md shadow-md transition"
                    >
                      Start Learning →
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="mt-8 text-center">
          <a
            href="/careerpath"
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-md shadow-lg transition transform hover:scale-105"
          >
            View All Career Paths →
          </a>
        </div>
      </div>
    </motion.div>
  );
}
