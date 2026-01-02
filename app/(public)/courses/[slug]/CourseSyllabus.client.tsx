
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronDown, BookOpen, CheckCircle2 } from "lucide-react";

type SyllabusSection = {
  title?: string;
  items?: string[];
};

type Props = {
  syllabus: SyllabusSection[];
};

export default function CourseSyllabus({ syllabus }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    contentRefs.current.forEach((el, i) => {
      if (!el) return;

      if (i === openIndex) {
        gsap.to(el, {
          height: "auto",
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      } else {
        gsap.to(el, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        });
      }
    });
  }, [openIndex]);

  if (!Array.isArray(syllabus) || syllabus.length === 0) {
    return (
      <section id="syllabus">
        <h2 className="text-2xl font-semibold mb-4">Syllabus</h2>
        <p className="text-gray-500">Syllabus will be published soon.</p>
      </section>
    );
  }

  return (
    <section id="syllabus" className="w-full">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold">Course Syllabus</h2>
      </div>

      {/* Accordion */}
      <div className="space-y-4">
        {syllabus.map((section, i) => {
          const isOpen = openIndex === i;

          return (
            <div
              key={`${section.title}-${i}`}
              className="rounded-2xl border bg-orange-500 shadow-sm overflow-hidden"
            >
              {/* Header */}
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-900">
                    {section.title || `Section ${i + 1}`}
                  </span>
                </div>

                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Content */}
              <div
                ref={(el) => (contentRefs.current[i] = el)}
                className="px-5 overflow-hidden h-0 opacity-0 bg-gradient-to-r from-orange-100 to-orange-200"
              >
                <ul className="py-4 space-y-3 text-sm text-gray-600 ">
                  {(section.items || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 ">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
