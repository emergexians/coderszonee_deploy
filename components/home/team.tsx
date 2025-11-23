"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const AUTO_INTERVAL = 5000;

const teamMembers = [
  {
    name: "Aarav Sharma",
    role: "Full Stack Developer",
    thumb: "/assets/images/mentor/a2.jpg",
    bigImage: "/assets/images/mentor/a1.jpg",
    description:
      "Passionate about building web apps, guiding learners on full stack paths.",
    splash: { color: "bg-blue-400/30", position: "top-20 -left-20" },
  },
  {
    name: "Priya Verma",
    role: "Data Scientist",
    thumb: "/assets/images/mentor/b1.jpg",
    bigImage: "/assets/images/mentor/b2.jpg",
    description:
      "Expert in AI/ML, helps students explore data science career journeys.",
    splash: { color: "bg-green-400/30", position: "bottom-10 right-10" },
  },
  {
    name: "Rohan Iyer",
    role: "Frontend Mentor",
    thumb: "/assets/images/mentor/e2.jpg",
    bigImage: "/assets/images/mentor/e1.jpg",
    description:
      "Specializes in React and UI/UX, guiding beginners on frontend skill paths.",
    splash: { color: "bg-purple-400/30", position: "bottom-40 left-1/2" },
  },
  {
    name: "Sneha Nair",
    role: "Cloud Architect",
    thumb: "/assets/images/mentor/d2.jpg",
    bigImage: "/assets/images/mentor/d1.jpg",
    description:
      "Cloud specialist mentoring students on AWS, Azure and DevOps pathways.",
    splash: { color: "bg-pink-400/30", position: "top-32 right-32" },
  },
  {
    name: "Kunal Mehta",
    role: "Cybersecurity Expert",
    thumb: "/assets/images/mentor/f2.jpg",
    bigImage: "/assets/images/mentor/f1.jpg",
    description:
      "Guides learners in ethical hacking and security career growth tracks.",
    splash: { color: "bg-cyan-400/30", position: "bottom-28 left-28" },
  },
  {
    name: "Ananya Gupta",
    role: "AI/ML Engineer",
    thumb: "/assets/images/mentor/c2.jpg",
    bigImage: "/assets/images/mentor/c1.jpg",
    description:
      "Focused on AI projects, supporting students in machine learning paths.",
    splash: { color: "bg-orange-400/30", position: "top-10 right-1/4" },
  },
];

export default function TeamSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = teamMembers[selectedIndex];

  const carouselRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Auto switch
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % teamMembers.length);
    }, AUTO_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Drag constraints
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });
  useEffect(() => {
    function updateConstraints() {
      if (carouselRef.current && innerRef.current) {
        const containerWidth = carouselRef.current.offsetWidth;
        const contentWidth = innerRef.current.scrollWidth;
        const maxDrag = containerWidth - contentWidth;
        setConstraints({ left: maxDrag < 0 ? maxDrag : 0, right: 0 });
      }
    }
    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, []);

  return (
    <section className="relative w-full bg-gradient-to-r from-indigo-50 via-white to-indigo-100 text-gray-900 pt-20 pb-0 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-12 relative z-10">
                    <motion.h2
                      className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-12"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                    >
                      Most <span className="text-[#f97316]">Experienced Mentors
      </span>
                    </motion.h2>
        <p className="mt-2 text-gray-600 text-lg">
          Meet the brilliant minds behind our success
        </p>
      </div>

      {/* Background Splash */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.name + "-splash"}
          className={`absolute ${selected.splash.position} w-96 h-96 ${selected.splash.color} rounded-full blur-3xl`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: [1, 1.15, 1] }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </AnimatePresence>

      <div className="relative max-w-6xl mx-auto px-6 z-10">
        {/* Main Profile */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.name}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-3xl font-bold">{selected.name}</h3>
              <p className="mt-2 text-lg text-indigo-600">{selected.role}</p>
              <p className="mt-6 text-gray-700 leading-relaxed">
                {selected.description}
              </p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={selected.bigImage}
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={selected.bigImage}
                alt={selected.name}
                width={400}
                height={400}
                priority
                className="rounded-xl shadow-xl object-cover relative z-10"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thumbnails */}
        <div className="mt-12 relative z-10">
          {/* Desktop → Centered */}
          <div className="hidden md:flex justify-center gap-6">
            {teamMembers.map((member, index) => (
              <button
                key={member.name}
                onClick={() => setSelectedIndex(index)}
                className={`flex flex-col items-center ${
                  selectedIndex === index
                    ? "opacity-100 scale-110"
                    : "opacity-60 hover:opacity-80"
                } transition`}
              >
                <Image
                  src={member.thumb}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="rounded-full shadow-md border-2 border-transparent hover:border-indigo-400 transition"
                />
                <span className="mt-2 text-sm font-medium">{member.name}</span>
              </button>
            ))}
          </div>

          {/* Mobile → Draggable */}
          <div ref={carouselRef} className="md:hidden overflow-hidden">
            <motion.div
              ref={innerRef}
              className="flex gap-6 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={constraints}
            >
              {teamMembers.map((member, index) => (
                <button
                  key={member.name}
                  onClick={() => setSelectedIndex(index)}
                  className={`flex flex-col items-center flex-shrink-0 ${
                    selectedIndex === index
                      ? "opacity-100 scale-110"
                      : "opacity-60 hover:opacity-80"
                  } transition`}
                >
                  <Image
                    src={member.thumb}
                    alt={member.name}
                    width={80}
                    height={80}
                    className="rounded-full shadow-md border-2 border-transparent hover:border-indigo-400 transition"
                  />
                  <span className="mt-2 text-sm font-medium">
                    {member.name}
                  </span>
                </button>
              ))}
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 w-full max-w-lg mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              key={selectedIndex}
              className="h-full bg-indigo-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: AUTO_INTERVAL / 1000, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
