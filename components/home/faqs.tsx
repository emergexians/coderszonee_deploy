"use client";

import { useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What courses do you offer?",
    answer:
      "We offer a wide range of courses including web development, data science, cloud computing, AI/ML, and more.",
  },
  {
    question: "Are the courses beginner friendly?",
    answer:
      "Yes! We have courses for beginners, intermediate learners, and advanced professionals.",
  },
  {
    question: "Do you provide certificates?",
    answer:
      "Yes, upon successful completion of a course, learners receive a verified certificate.",
  },
  {
    question: "Can I access the courses on mobile?",
    answer:
      "Absolutely. Our platform is fully responsive and works seamlessly on all devices.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const handleKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      toggleFAQ(index);
    }
  };

  // Always provide the same keys ("open"/"closed" or "open"/"collapsed")
  // so Framer doesn't warn when reduced motion is enabled.
  const chevronVariant = {
    open: reduceMotion ? {} : { rotate: 180 },
    closed: reduceMotion ? {} : { rotate: 0 },
  };

  const contentVariant = {
    open: reduceMotion
      ? { height: "auto", opacity: 1 }
      : { height: "auto", opacity: 1, transition: { duration: 0.28 } },
    collapsed: reduceMotion
      ? { height: 0, opacity: 0 }
      : { height: 0, opacity: 0, transition: { duration: 0.22 } },
  };

  return (
    <section className="relative w-full bg-gradient-to-r from-orange-50 via-white to-orange-50 text-gray-900 py-20 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-12 px-4">
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Frequently <span className="text-[#f97316]">Asked Questions</span>
        </motion.h2>
        <p className="mt-3 text-gray-600 text-lg max-w-2xl mx-auto">
          Find answers to the most common questions from learners
        </p>
      </div>

      {/* FAQ List */}
      <div className="max-w-3xl mx-auto px-6 space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const contentId = `faq-content-${index}`;
          const buttonId = `faq-button-${index}`;

          return (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 shadow-sm rounded-xl border overflow-hidden transition-transform hover:-translate-y-0.5 ${
                isOpen ? "ring-2 ring-orange-100" : "hover:shadow-md"
              } border-orange-100`}
            >
              <button
                id={buttonId}
                type="button"
                aria-controls={contentId}
                aria-expanded={isOpen}
                onClick={() => toggleFAQ(index)}
                onKeyDown={(e) => handleKey(e, index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 rounded-xl"
              >
                <span className="font-medium text-gray-800 dark:text-gray-100 text-sm md:text-base">
                  {faq.question}
                </span>

                <motion.span
                  className="ml-4 flex-shrink-0 text-orange-600"
                  initial={false}
                  animate={isOpen ? "open" : "closed"}
                  variants={chevronVariant}
                  aria-hidden="true"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.span>
              </button>

              <AnimatePresence initial={false} mode="wait">
                {isOpen && (
                  <motion.div
                    key={`content-${index}`}
                    id={contentId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={contentVariant}
                    className="px-5 pb-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed"
                    style={{ overflow: "hidden" }}
                  >
                    <div className="pt-1">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Decorative accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 top-8 w-36 h-36 rounded-full opacity-20 blur-3xl bg-gradient-to-br from-orange-300 to-orange-500"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-12 bottom-10 w-28 h-28 rounded-full opacity-12 blur-2xl bg-gradient-to-br from-orange-200 to-orange-400"
      />
    </section>
  );
}
