"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Rocket, ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";
import TypingTerminal from "./TypingTerminal";

// Independent CountUp component
function CountUpStat({
  value,
  label,
  format,
  delay = 0,
}: {
  value: number;
  label: string;
  format: (v: number) => string;
  delay?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = Math.ceil(value / 100);
    const duration = 2000;
    const stepTime = duration / 100;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        start = value;
        clearInterval(timer);
      }
      setCount(start);
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
    >
      <span className="text-2xl sm:text-3xl font-bold text-orange-500">
        {format(count)}
      </span>
      <p className="text-sm sm:text-base text-gray-300">{label}</p>
    </motion.div>
  );
}

export default function HeroPage() {
  const [particles, setParticles] = useState<
    { x: number; y: number; opacity: number; scale: number; duration: number }[]
  >([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 25 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      opacity: Math.random(),
      scale: Math.random() * 1.5,
      duration: 2 + Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  const stats = [
    {
      value: 1500,
      label: "Aspirants Mentored",
      format: (v: number) => `${(v / 1000).toFixed(1)} K+`,
    },
    {
      value: 100,
      label: "Cohorts Delivered",
      format: (v: number) => `${v}+`,
    },
    {
      value: 20,
      label: "Industry Mentors",
      format: (v: number) => `${v}+`,
    },
  ];

  return (
    <section className="relative flex flex-col justify-center min-h-screen bg-black text-white overflow-hidden">
      {/* Background Gradient Animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-purple-900/30"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Floating Particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-orange-500/70 rounded-full"
          initial={{ x: p.x, y: p.y, opacity: p.opacity, scale: p.scale }}
          animate={{ y: [p.y, p.y - 80], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Hero Content */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 px-6 lg:px-20">
        {/* Left Content */}
        <div className="text-center lg:text-left">
          <motion.h1
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Be Career-Ready <br />
            <span className="relative inline-flex items-center gap-3 text-orange-400">
              <span className="relative">
                And Get Job
                <motion.span
                  className="absolute left-0 -bottom-1 w-full h-1 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </span>
              <Briefcase className="w-8 h-8 text-orange-400" />
            </span>
            <br />
            <span className="text-white">Don’t Just Upskill</span>
          </motion.h1>

          <motion.p
            className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="text-orange-500 font-semibold">With Top Mentorship</span>{" "}
            in Tech, Marketing & Data Science — Designed & delivered by{" "}
            <span className="text-orange-400 font-semibold">industry leaders</span>.
          </motion.p>

          <motion.div
            className="mt-8 sm:mt-10 flex flex-wrap gap-4 sm:gap-6 justify-center lg:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link
              href="/courses"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold shadow-lg transition"
            >
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5" /> Start Now
            </Link>

            <Link
              href="/about"
              className="flex items-center gap-2 border border-white/40 hover:border-orange-500 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition"
            >
              Learn More <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </motion.div>
        </div>

        {/* Right Content → Typing Terminal */}
        <TypingTerminal />
      </div>

      {/* Stats Section */}
      <div className="mt-12 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center relative z-10 px-6 lg:px-20">
        {stats.map((stat, i) => (
          <CountUpStat
            key={i}
            value={stat.value}
            label={stat.label}
            format={stat.format}
            delay={0.2 * i}
          />
        ))}
      </div>
    </section>
  );
}
