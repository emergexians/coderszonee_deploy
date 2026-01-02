"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Clock,
  GraduationCap,
  Star,
  Users,
  Tag,
} from "lucide-react";

type CourseHeroProps = {
  course: {
    title?: string;
    desc?: string;
    cover?: string;
    duration?: string;
    level?: string;
    rating?: number;
    students?: number;
    category?: string;
    subCategory?: string;
    slug?: string;
  };
};

export default function CourseHero({ course }: CourseHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.from(containerRef.current.children, {
      opacity: 0,
      y: 40,
      duration: 2,
      ease: "power3.out",
      stagger: 0.5,
    });
  }, []);

  const checkoutSlug = course.slug;

  return (
    <div ref={containerRef} className="grid gap-6 md:grid-cols-2">
      {/* Image */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
        <Image
          src={course.cover || "/assets/thumbnails/ai.png"}
          alt={course.title || "Course cover"}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="mt-2 text-gray-600">{course.desc}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            {course.duration && (
              <span className="flex items-center gap-2">
                <Clock size={18} /> {course.duration}
              </span>
            )}
            {course.level && (
              <span className="flex items-center gap-2">
                <GraduationCap size={18} /> {course.level}
              </span>
            )}
            {course.rating && (
              <span className="flex items-center gap-2">
                <Star size={18} className="text-yellow-500" />
                {course.rating.toFixed(1)}
              </span>
            )}
            {course.students && (
              <span className="flex items-center gap-2">
                <Users size={18} /> {course.students.toLocaleString()}
              </span>
            )}
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {course.category && (
              <span className="badge-blue">
                <Tag size={14} /> {course.category}
              </span>
            )}
            {course.subCategory && (
              <span className="badge-purple">
                <Tag size={14} /> {course.subCategory}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <a
            href="#syllabus"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700"
          >
            View syllabus
          </a>

          <a
            href={`/checkout?course=course&slug=${checkoutSlug}`}
            className="rounded-xl border px-5 py-2.5 font-medium hover:bg-gray-50"
          >
            Enroll now
          </a>
        </div>
      </div>
    </div>
  );
}
