"use client";

import { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import type { KeenSliderInstance, KeenSliderPlugin } from "keen-slider";
import { motion } from "framer-motion";
import { Star, Users, Clock, GraduationCap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import "keen-slider/keen-slider.min.css";

/* =========================
   Autoplay Plugin (typed properly)
========================= */
function AutoplayPlugin(ms = 3000): KeenSliderPlugin {
  return (slider: KeenSliderInstance) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let mouseOver = false;
    let paused = false;
    let isActive = true;

    function clearNextTimeout() {
      if (timeout) clearTimeout(timeout);
      timeout = null;
    }

    function nextTimeout() {
      clearNextTimeout();
      if (mouseOver || paused || !isActive) return;

      timeout = setTimeout(() => {
        slider.next();
      }, ms);
    }

    slider.on("created", () => {
      isActive = true;

      slider.container.addEventListener("mouseover", () => {
        mouseOver = true;
        clearNextTimeout();
      });

      slider.container.addEventListener("mouseout", () => {
        mouseOver = false;
        nextTimeout();
      });

      // Pause autoplay on click
      slider.container.addEventListener("click", () => {
        paused = true;
        clearNextTimeout();
        setTimeout(() => {
          paused = false;
          nextTimeout();
        }, ms * 3);
      });

      nextTimeout();
    });

    slider.on("destroyed", () => {
      isActive = false;
      clearNextTimeout();
    });

    slider.on("dragStarted", clearNextTimeout);
    slider.on("animationEnded", nextTimeout);
    slider.on("updated", nextTimeout);
  };
}

type SkillPath = {
  id: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  title: string;
  desc: string;
  duration: string;
  rating: number;
  students: number;
  img: string;
  href: string;
};

const skillPaths: SkillPath[] = [
  {
    id: "beginner",
    level: "Beginner",
    title: "Frontend Developer Essentials (2025)",
    desc: "A project-driven curriculum to launch your career as a frontend developer.",
    duration: "06 Months",
    rating: 4.8,
    students: 87,
    img: "/assets/thumbnails/frontend.jpg",
    href: "/skillpath/frontend-developer-essentials-2025",
  },
  {
    id: "intermediate",
    level: "Intermediate",
    title: "Data Science Foundations (2025)",
    desc: "A complete hands-on program in Python-based Data Science.",
    duration: "08 Months",
    rating: 4.8,
    students: 96,
    img: "/assets/thumbnails/datascience.jpg",
    href: "/skillpath/data-science-foundations-2025",
  },
  {
    id: "advanced",
    level: "Advanced",
    title: "Mobile App Dev with Flutter (2025)",
    desc: "Learn Dart, Flutter widgets, Firebase, and ship apps to Play Store/App Store.",
    duration: "07 Months",
    rating: 4.9,
    students: 85,
    img: "/assets/thumbnails/flutter.jpg",
    href: "/skillpath/mobile-app-dev-with-flutter-2025",
  },
];

export default function SkillPaths() {
  const [filter, setFilter] = useState<
    "All" | "Beginner" | "Intermediate" | "Advanced"
  >("All");

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      drag: true,
      renderMode: "performance",
      slides: { perView: 1.05, spacing: 12 },
      breakpoints: {
        "(min-width: 640px)": {
          slides: { perView: 2, spacing: 16 },
        },
        "(min-width: 1024px)": {
          slides: { perView: 3, spacing: 24 },
        },
      },
    },
    [AutoplayPlugin(3000)]
  );

  // ✅ Refresh KeenSlider when filter changes
  useEffect(() => {
    slider.current?.update();
  }, [filter, slider]);

  const filtered =
    filter === "All"
      ? skillPaths
      : skillPaths.filter((s) => s.level === filter);

  return (
    <section
      id="skillpaths"
      className="relative min-h-[80vh] px-3 sm:px-6 lg:px-20 py-16 sm:py-20 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12">
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0 text-center sm:text-left"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Explore <span className="text-[#00b8db]">Skill Paths</span>
          </motion.h2>

          {/* Filters */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3">
            {(["All", "Beginner", "Intermediate", "Advanced"] as const).map(
              (lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilter(lvl)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-semibold transition ${
                    filter === lvl
                      ? "bg-[#00b8db] text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {lvl}
                </button>
              )
            )}
          </div>
        </div>

        {/* Carousel */}
        <div ref={sliderRef} className="keen-slider">
          {filtered.map((path, i) => (
            <div key={path.id} id={path.id} className="keen-slider__slide">
              <motion.div
                className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 * i, duration: 0.6 }}
              >
                {/* Image */}
                <div className="relative h-40 sm:h-44 w-full">
                  <Image
                    src={path.img}
                    alt={path.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    priority={i === 0}
                  />
                  <span className="absolute top-2 right-2 bg-[#00b8db] text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                    Skill
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex flex-col flex-grow">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    {path.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 flex-grow">
                    {path.desc}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] sm:text-xs text-gray-500 mt-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />{" "}
                      {path.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
                      {path.students} Students
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
                      {path.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-5 w-5" />
                      {path.level}
                    </span>
                  </div>

                  {/* CTA */}
                  <Link
                    href={path.href}
                    className="mt-4 sm:mt-5 inline-block w-full text-center bg-[#00b8db] hover:bg-orange-500 text-white font-semibold py-2 sm:py-2.5 rounded-lg text-sm sm:text-base transition"
                  >
                    View Details →
                  </Link>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-8 sm:mt-12">
          <Link
            href="/skillpath"
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-[#00b8db] hover:bg-orange-500 text-white font-semibold shadow transition text-sm sm:text-base"
          >
            View All Skill Paths →
          </Link>
        </div>
      </div>
    </section>
  );
}
