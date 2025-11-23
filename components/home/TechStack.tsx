"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Database,
  Server,
  Box,
  Layers,
  Cpu,
  Cloud,
  Terminal,
} from "lucide-react";

const techs = [
  { name: "React / Next.js", icon: <Code2 className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" /> },
  { name: "TailwindCSS", icon: <Layers className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-500" /> },
  { name: "Node.js", icon: <Server className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" /> },
  { name: "MongoDB", icon: <Database className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" /> },
  { name: "TypeScript", icon: <Terminal className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" /> },
  { name: "Firebase", icon: <Cloud className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" /> },
  { name: "Docker", icon: <Box className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" /> },
  { name: "AI / ML", icon: <Cpu className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" /> },
];

export default function TechStack() {
  return (
    <section
      id="tech"
      className="relative min-h-[60vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-20 py-16 sm:py-20 bg-gray-50 overflow-hidden"
    >
      {/* Background glows */}
      <motion.div
        className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-orange-200/40 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-200/40 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="max-w-6xl text-center relative z-10">
        <motion.h2
          className="text-2xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 text-gray-900"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Our <span className="text-orange-500">Tech Stack</span>
        </motion.h2>

        <motion.p
          className="text-gray-700 text-sm sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-12 max-w-3xl mx-auto px-3 break-words text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          We use a modern collection of tools & frameworks to<br />deliver{" "}
          <span className="text-orange-500 font-semibold break-normal">scalable</span>,{" "}
          <span className="text-orange-500 font-semibold break-normal">performant</span>, and{" "}
          <span className="text-orange-500 font-semibold break-normal">future-ready</span>{" "} <br />
          solutions for our students and partners.
        </motion.p>

        {/* 🔥 Two-Row Scrolling Marquee */}
        <div className="space-y-6 sm:space-y-10">
          {/* Row 1 (Left → Right) */}
          <div className="relative w-full overflow-hidden group">
            <motion.div
              className="flex gap-4 sm:gap-6 md:gap-8 whitespace-nowrap"
              animate={{ x: ["-100%", "0%"] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              whileHover={{ animationPlayState: "paused" }}
            >
              {techs.concat(techs).map((tech, i) => (
                <div
                  key={`row1-${i}`}
                  className="flex flex-col items-center justify-center min-w-[120px] sm:min-w-[160px] md:min-w-[180px] h-28 sm:h-36 md:h-40 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg hover:border-orange-400 transition"
                >
                  {tech.icon}
                  <span className="text-xs sm:text-sm font-medium text-gray-700 mt-2">
                    {tech.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Row 2 (Right → Left) */}
          <div className="relative w-full overflow-hidden group">
            <motion.div
              className="flex gap-4 sm:gap-6 md:gap-8 whitespace-nowrap"
              animate={{ x: ["0%", "-100%"] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              whileHover={{ animationPlayState: "paused" }}
            >
              {techs.concat(techs).map((tech, i) => (
                <div
                  key={`row2-${i}`}
                  className="flex flex-col items-center justify-center min-w-[120px] sm:min-w-[160px] md:min-w-[180px] h-28 sm:h-36 md:h-40 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg hover:border-orange-400 transition"
                >
                  {tech.icon}
                  <span className="text-xs sm:text-sm font-medium text-gray-700 mt-2">
                    {tech.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
